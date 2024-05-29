import {
  Box,
  Chip,
  Avatar,
  AvatarGroup,
  Button,
  Badge,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
  Stack,
} from "@mui/material";
import { CoverV1, VoiceV1Cover } from "../services/db/coversV1.service";
import { useEffect, useState } from "react";
import { User } from "../services/db/users.service";
import LikeDislikeGroup from "./LikeDislikeGroup";
import { getUserAvatar, sortArrBasedOnLikesObj } from "../helpers";
// import RecordVoiceOverRoundedIcon from "@mui/icons-material/RecordVoiceOverRounded";

type Props = {
  coverDoc: CoverV1;
  loading: boolean;
  voiceLoading: boolean;
  songId: string;
  id: string;
  voiceId: string;
  onVoiceChange: (id: string, voiceObj: VoiceV1Cover) => void;
  onPlay: (id: string, coverDoc: CoverV1, voiceId?: string) => void;
  setVoicesPopperEl: any;
  user?: User;
  setRevoxSongInfo: any;
  onRefreshUserObj: (uid: string) => void;
};

const VoiceChips = ({
  coverDoc,
  loading,
  voiceLoading,
  songId,
  id,
  voiceId,
  onVoiceChange,
  onPlay,
  setVoicesPopperEl,
  user,
  setRevoxSongInfo,
  onRefreshUserObj,
}: Props) => {
  const [chipVoice, setChipVoice] = useState<VoiceV1Cover>();
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (voiceId && id === songId) {
      setChipVoice(coverDoc.voices.find((v) => v.id === voiceId));
    } else {
      setChipVoice(coverDoc.voices[0]);
    }
  }, [voiceId]);

  if (isMobileView) {
    return (
      <Stack
        // display={"flex"}
        flexGrow={1}
        // alignItems="center"
        // justifyContent={"space-between"}
        // flexWrap="wrap"
      >
        {chipVoice && (
          <Box display={"flex"} gap={1} my={1} sx={{ overflowX: "auto" }}>
            {sortArrBasedOnLikesObj(coverDoc.voices, coverDoc.likes)
              // .filter(
              //   (v) =>
              //     v.id !== ((songId === id && voiceId) || coverDoc.voices[0].id)
              // )
              // .slice(0, 2)
              .map((v) => (
                <Chip
                  label={v.name}
                  key={v.name}
                  avatar={
                    <Avatar
                      src={
                        v.id === coverDoc.voices[0].id
                          ? coverDoc.metadata.channelThumbnail
                          : getUserAvatar(v.shareInfo.id, v.shareInfo.avatar)
                      }
                    />
                  }
                  variant={
                    songId === id && voiceId === v.id ? "outlined" : "filled"
                  }
                  color={songId === id && voiceId === v.id ? "info" : "default"}
                  clickable={!(songId === id && voiceId === v.id)}
                  onClick={() => {
                    if (songId === id && voiceId === v.id) return;
                    if (songId === id) {
                      onVoiceChange(v.id, coverDoc.voices[0]);
                    } else {
                      onPlay(id, coverDoc, v.id);
                    }
                    //   setVoice(v.id);
                  }}
                />
              ))}
          </Box>
        )}
        {songId === id && (
          <Box display={"flex"} gap={2} justifyContent="space-between">
            {user && (
              <LikeDislikeGroup
                user={user}
                coverId={id}
                voiceId={voiceId}
                likesCount={coverDoc.likes?.[voiceId] || 0}
                disLikesCount={coverDoc.disLikes?.[voiceId] || 0}
                onRefreshUserObj={onRefreshUserObj}
              />
            )}
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                if (!user?.uid) alert("Sign in to continue with Revox");
                else setRevoxSongInfo(coverDoc);
              }}
              disabled={!coverDoc.stemsReady}
            >
              Revox
            </Button>
          </Box>
        )}
      </Stack>
    );
  }
  return (
    <Stack
      // display={"flex"}
      flexGrow={1}
      // alignItems="center"
      // justifyContent={"space-between"}
      // flexWrap="wrap"
    >
      {chipVoice && (
        <Box display={"flex"} gap={1} flexWrap="wrap" my={1}>
          {sortArrBasedOnLikesObj(coverDoc.voices, coverDoc.likes).map((v) => (
            <Chip
              label={v.name}
              key={v.name}
              avatar={
                <Avatar
                  src={
                    v.id === coverDoc.voices[0].id
                      ? coverDoc.metadata.channelThumbnail
                      : getUserAvatar(v.shareInfo.id, v.shareInfo.avatar)
                  }
                />
              }
              variant={
                songId === id && voiceId === v.id ? "outlined" : "filled"
              }
              color={songId === id && voiceId === v.id ? "info" : "default"}
              clickable={!(songId === id && voiceId === v.id)}
              onClick={() => {
                if (songId === id && voiceId === v.id) return;
                if (songId === id) {
                  onVoiceChange(v.id, coverDoc.voices[0]);
                } else {
                  onPlay(id, coverDoc, v.id);
                }
                //   setVoice(v.id);
              }}
            />
          ))}
          {songId === id && (
            <Box display={"flex"} gap={2} justifyContent="end" ml="auto">
              {user && (
                <LikeDislikeGroup
                  user={user}
                  coverId={id}
                  voiceId={voiceId}
                  likesCount={coverDoc.likes?.[voiceId] || 0}
                  disLikesCount={coverDoc.disLikes?.[voiceId] || 0}
                  onRefreshUserObj={onRefreshUserObj}
                />
              )}
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  if (!user?.uid) alert("Sign in to continue with Revox");
                  else setRevoxSongInfo(coverDoc);
                }}
                disabled={!coverDoc.stemsReady}
              >
                Revox
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Stack>
  );
};

export default VoiceChips;
