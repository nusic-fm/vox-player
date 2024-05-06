import {
  Avatar,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import axios from "axios";
import { createUserDoc, getUserById, User } from "./services/db/users.service";
import Rows from "./components/Rows";
import Header from "./components/Header";
import { setUserId } from "firebase/analytics";

type Props = {};

const localStorageAccessTokenKey = "nusic_discord_access_token";
const localStorageTokenTypeKey = "nusic_discord_token_type";

const VoxPlayer = (props: Props) => {
  const [user, setUser] = useState<User>();
  const [tempUserId, setTempUserId] = useState<string>();

  const onUserChange = async (uid: string) => {
    const _user = await getUserById(uid);
    setUser(_user);
  };

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
        setTempUserId(userDocDb.uid);
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
    const searchParams = new URLSearchParams(location.hash.slice(1));
    const _accessToken = searchParams.get("access_token");
    const _tokenType = searchParams.get("token_type");
    if (_accessToken && _tokenType) {
      window.localStorage.setItem(localStorageAccessTokenKey, _accessToken);
      window.localStorage.setItem(localStorageTokenTypeKey, _tokenType);
      fetchUser(_tokenType, _accessToken);
      window.history.replaceState(null, "", window.location.origin);
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
            Post-Ironic Streaming
          </Typography>
        </Box>
        <Rows user={user} tempUserId={tempUserId} onUserChange={onUserChange} />
      </Stack>
    </Box>
  );
};

export default VoxPlayer;
