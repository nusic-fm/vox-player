import {
  Avatar,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import axios from "axios";
import { createUserDoc, User } from "./services/db/users.service";
import Rows from "./components/Rows";

type Props = {};

const baseUrl = "https://discord.com/api/oauth2/authorize";
const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID as string;
const redirectUri = import.meta.env.VITE_REDIRECT_URL as string;
const localStorageAccessTokenKey = "nusic_discord_access_token";
const localStorageTokenTypeKey = "nusic_discord_token_type";

const responseType = "token";
const scope = "identify+email";

const VoxPlayer = (props: Props) => {
  const [user, setUser] = useState<User>();

  const fetchUser = async (
    _tokenType: string,
    _accessToken: string,
    isAlertOnFail: boolean = true
  ) => {
    const url = "https://discord.com/api/users/@me";
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `${_tokenType} ${_accessToken}` },
      });
      const { username, id, avatar, email } = response.data;
      const userDocDb = await createUserDoc(id, {
        name: username,
        uid: id,
        avatar,
        email,
      });
      if (userDocDb) {
        // https://cdn.discordapp.com/avatars/879400465861869638/5d69e3e90a6d07b3cd15e4cd4e8a1407.png
        setUser(userDocDb);
        window.history.replaceState(null, "", window.location.origin);
      }
    } catch (e) {
      if (isAlertOnFail) {
        // setShowAlertMessage("Please click Sign In to continue");
      }
    }
  };
  // const refreshUser = async () => {
  //   if (user?.uid) {
  //     const _user = await getUserById(user?.uid);
  //     setUser(_user);
  //   }
  // };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.pathname.slice(1));
    const _accessToken = searchParams.get("access_token");
    const _tokenType = searchParams.get("token_type");
    if (_accessToken && _tokenType) {
      window.localStorage.setItem(localStorageAccessTokenKey, _accessToken);
      window.localStorage.setItem(localStorageTokenTypeKey, _tokenType);
      fetchUser(_tokenType, _accessToken);
      // setTokenType(_tokenType);
      // setAccessToken(_accessToken);
    } else if (!user) {
      const _accessToken = window.localStorage.getItem(
        localStorageAccessTokenKey
      );
      const _tokenType = window.localStorage.getItem(localStorageTokenTypeKey);
      if (_accessToken && _tokenType) {
        fetchUser(_tokenType, _accessToken, false);
      }
    }
  }, []);
  // const fetchYoutubeVideoInfo = async (id: string) => {
  //   const vid = (artistsObj as any)[id]?.vid;
  //   if (vid) {
  //     const formData = new FormData();
  //     formData.append("vid", vid);
  //     const res = await axios.post(
  //       `${import.meta.env.VITE_AUDIO_ANALYSER_PY}/ytp-content`,
  //       formData
  //     );
  //     setSongInfoObj((songInfo) => ({
  //       ...songInfo,
  //       [id]: { title: res.data.title },
  //     }));
  //   }
  // };

  // useEffect(() => {
  //   if (songId && !songInfoObj[songId]) {
  //     fetchYoutubeVideoInfo(songId);
  //   }
  // }, [songId]);

  //   useEffect(() => {
  //     if (songId && voice) {
  //       const _instrUrl = `https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/vox_player%2F${songId}%2Fno_vocals.mp3?alt=media`;
  //       const _audioUrl = `https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/vox_player%2F${songId}%2F${voice}.mp3?alt=media`;
  //       playAudio(_instrUrl, _audioUrl);
  //     }
  //   }, [voice]);

  //   useEffect(() => {
  //     if (songId) {
  //       const _instrUrl = `https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/vox_player%2F${songId}%2Fno_vocals.mp3?alt=media`;
  //       //   const firstVoice = (artistsObj as any)[songId].voices[0].id;
  //       const _audioUrl = `https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/vox_player%2F${songId}%2Fvocals.mp3?alt=media`;
  //       playAudio(_instrUrl, _audioUrl, true);
  //       setVoice("");
  //     }
  //   }, [songId]);

  return (
    <Box display={"flex"} justifyContent="center">
      <Stack p={2} width={{ xs: "100vw", md: "950px" }}>
        <Box>
          <Box display="flex" justifyContent={"center"} mb={1}>
            <img src="/nusic_purple.png" width={155} alt="" />
          </Box>
          <Typography variant="body2" textAlign={"center"}>
            Streaming On Steroids
          </Typography>
        </Box>
        <Box my={2} display="flex" justifyContent={"center"}>
          {user ? (
            <Chip
              avatar={
                <Avatar
                  src={`https://cdn.discordapp.com/avatars/${user.uid}/${user.avatar}`}
                />
              }
              label={user.name}
            />
          ) : (
            <Button
              size="small"
              variant="contained"
              // onClick={onSignInWithFb}
              href={`${baseUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`}
              startIcon={<img src="/discord.png" alt="" width={"22px"} />}
            >
              Sign in
            </Button>
          )}
        </Box>
        <Divider />
        <Rows uid={user?.uid} />
      </Stack>
    </Box>
  );
};

export default VoxPlayer;
