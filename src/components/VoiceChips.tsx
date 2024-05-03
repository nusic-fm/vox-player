import {
  Box,
  Chip,
  Avatar,
  AvatarGroup,
  Button,
  Badge,
  IconButton,
  Tooltip,
} from "@mui/material";
import { CoverV1, VoiceV1Cover } from "../services/db/coversV1.service";
import { useEffect, useState } from "react";
import { User } from "../services/db/users.service";
import LikeDislikeGroup from "./LikeDislikeGroup";

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
}: Props) => {
  const [chipVoice, setChipVoice] = useState<VoiceV1Cover>();

  useEffect(() => {
    if (voiceId && id === songId) {
      setChipVoice(coverDoc.voices.find((v) => v.id === voiceId));
    } else {
      setChipVoice(coverDoc.voices[0]);
    }
  }, [voiceId]);

  return (
    <Box
      display={"flex"}
      flexGrow={1}
      alignItems="center"
      justifyContent={"space-between"}
    >
      {chipVoice && (
        <Badge
          anchorOrigin={{ horizontal: "right", vertical: "top" }}
          badgeContent={
            <Box display={"flex"} position="absolute" top={12.5} left={4}>
              <AvatarGroup
                total={coverDoc.voices.length - 1}
                component="a"
                renderSurplus={(surplus) => (
                  <IconButton
                    sx={{
                      fontSize: "0.8rem",
                      fontFamily: "inherit",
                    }}
                    onClick={(e) => {
                      setVoicesPopperEl({
                        anchorEl: e.currentTarget,
                        coverDoc,
                        id,
                      });
                    }}
                  >
                    +{surplus}
                  </IconButton>
                )}
                sx={{
                  // ml: 2,
                  ".MuiAvatar-colorDefault": {
                    height: 24,
                    width: 24,
                    color: "#fff",
                    fontSize: "0.8rem",
                    backgroundColor: "rgba(255, 255, 255, 0.16)",
                    ml: "-6px",
                  },
                }}
              >
                {coverDoc.voices
                  .filter(
                    (v) =>
                      v.id !==
                      ((songId === id && voiceId) || coverDoc.voices[0].id)
                  )
                  .slice(0, 2)
                  .map((v) => (
                    <Tooltip key={v.id} title={v.name} placement="top" arrow>
                      <Avatar
                        alt=""
                        src={v.imageUrl}
                        sx={{ width: 24, height: 24 }}
                        onClick={() => {
                          if (!voiceId || songId !== id)
                            onPlay(id, coverDoc, v.id);
                          else if (songId === id) onVoiceChange(v.id, v);
                        }}
                      />
                    </Tooltip>
                  ))}
              </AvatarGroup>
            </Box>
          }
        >
          <Chip
            avatar={
              <Avatar
                src={
                  voiceId && voiceId === coverDoc.voices[0].id
                    ? coverDoc.metadata.channelThumbnail
                    : chipVoice.imageUrl
                }
              />
            }
            disabled={loading || voiceLoading}
            label={chipVoice.name}
            variant={
              songId === id && voiceId === chipVoice.id ? "outlined" : "filled"
            }
            color={
              songId === id && voiceId === chipVoice.id ? "info" : "default"
            }
            clickable={!(songId === id && voiceId === chipVoice.id)}
            onClick={() => {
              if (songId === id && voiceId === chipVoice.id) return;
              if (songId === id) {
                onVoiceChange(chipVoice.id, coverDoc.voices[0]);
              } else {
                onPlay(id, coverDoc, chipVoice.id);
              }
              //   setVoice(v.id);
            }}
          />
        </Badge>
      )}
      {/* <Box display={"flex"} flexGrow={1} justifyContent="space-between"> */}
      {/* <AvatarGroup
          total={coverDoc.voices.length - 1}
          component="a"
          onClick={(e) => {
            setVoicesPopperEl({
              anchorEl: e.currentTarget,
              coverDoc,
              id,
            });
          }}
          sx={{
            // ml: 2,
            ".MuiAvatar-colorDefault": {
              height: 24,
              width: 24,
              color: "#fff",
              fontSize: "0.8rem",
              backgroundColor: "rgba(255, 255, 255, 0.16)",
              ml: "-6px",
            },
          }}
        >
          {coverDoc.voices
            .filter(
              (v) =>
                v.id !== ((songId === id && voiceId) || coverDoc.voices[0].id)
            )
            .slice(0, 2)
            .map((v) => (
              <Avatar alt="" src={v.imageUrl} sx={{ width: 24, height: 24 }} />
            ))}
        </AvatarGroup> */}
      {songId === id && (
        <Box display={"flex"} gap={2}>
          {user && (
            <LikeDislikeGroup
              user={user}
              coverId={id}
              voiceId={voiceId}
              likesCount={coverDoc.likes?.[voiceId] || 0}
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
      {/* </Box> */}
    </Box>
  );
};

export default VoiceChips;

{
  /* <Chip
        label={`+${coverDoc.voices.length - 1}`}
        sx={{ ml: 2 }}
        clickable
        onClick={(e) => {
          setVoicesPopperEl({
            anchorEl: e.currentTarget,
            coverDoc,
            id,
          });
        }}
      /> */
}
{
  /* <Avatar
                      sx={{
                        bgcolor: "rgba(255, 255, 255, 0.16)",
                        color: "#fff",
                        ml: 2,
                        width: 30,
                        height: 30,
                        fontSize: "0.8rem",
                      }}
                      component="a"
                    >
                      +{coverDoc.voices.length - 1}
                    </Avatar> */
}
{
  /* {songId === id && (
                      <Box
                        display={"flex"}
                        flexGrow={1}
                        justifyContent="space-between"
                      >
                        <Box
                          display={"flex"}
                          gap={2}
                          mx={2}
                          sx={{ overflowX: "auto" }}
                        >
                          {coverDoc.voices.slice(1).map((v, i) => (
                            <Chip
                              avatar={<Avatar src={v.imageUrl} />}
                              disabled={loading || voiceLoading}
                              key={v.name}
                              label={v.name}
                              variant={voiceId === v.id ? "outlined" : "filled"}
                              color={voiceId === v.id ? "info" : "default"}
                              clickable={!(songId === id && voiceId === v.id)}
                              onClick={() => {
                                if (songId === id && voiceId === v.id) return;
                                onVoiceChange(v.id, v);
                                //   setVoice(v.id);
                              }}
                            />
                          ))}
                        </Box>
                    )} */
}