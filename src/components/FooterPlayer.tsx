import { Box, Stack, Typography, IconButton } from "@mui/material";
import PlayArrow from "@mui/icons-material/PlayArrow";
import PauseRounded from "@mui/icons-material/PauseRounded";
import Replay10RoundedIcon from "@mui/icons-material/Replay10Rounded";
import Forward10RoundedIcon from "@mui/icons-material/Forward10Rounded";
import * as Tone from "tone";
import { MusicState } from "./providers/GlobalStateProvider";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import VolumeOffRoundedIcon from "@mui/icons-material/VolumeOffRounded";
import AudioProgress from "./AudioProgress";

type Props = {
  songInfo: MusicState;
  loading: boolean;
  voiceId: string;
  playPlayer: any;
  isTonePlaying: boolean;
  isMuted: boolean;
  pausePlayer: any;
  switchMute: any;
};

const FooterPlayer = ({
  songInfo,
  loading,
  voiceId,
  isTonePlaying,
  playPlayer,
  pausePlayer,
  switchMute,
  isMuted,
}: Props) => {
  return (
    <Box display={"flex"} justifyContent="center">
      <Box
        position={"absolute"}
        width={{ xs: "calc(100% - 16px)", md: "950px" }}
        bottom={0}
        py={1}
        px={4}
        display="flex"
        gap={4}
        alignItems="center"
        sx={{ bgcolor: "rgb(20, 20, 20)" }}
      >
        <img
          src={songInfo.songImg}
          alt=""
          width={40}
          height={40}
          style={{ borderRadius: "50%", objectFit: "cover" }}
        />
        <Stack width={"100%"}>
          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent="space-between"
            gap={2}
          >
            <Typography variant="caption">
              {songInfo.voices.filter((v) => v.id === voiceId).at(0)?.name}
            </Typography>
            <AudioProgress
              isTonePlaying={isTonePlaying}
              duration={songInfo.duration}
            />
          </Box>
          <Box display={"flex"} alignItems={"center"}>
            <Typography>{songInfo.songName}</Typography>
            <Box display={"flex"} alignItems={"center"} ml="auto" gap={4}>
              <Box display={"flex"} alignItems={"center"}>
                <IconButton
                  size="small"
                  disabled={loading}
                  onClick={() => {
                    Tone.Transport.seconds -= 10;
                    if (!isTonePlaying) playPlayer();
                  }}
                >
                  <Replay10RoundedIcon />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={loading}
                  onClick={async () => {
                    if (isTonePlaying) {
                      pausePlayer();
                    } else {
                      playPlayer();
                    }
                  }}
                >
                  {isTonePlaying ? <PauseRounded /> : <PlayArrow />}
                </IconButton>
                <IconButton
                  size="small"
                  disabled={loading}
                  onClick={() => {
                    Tone.Transport.seconds += 10;
                    if (!isTonePlaying) playPlayer();
                  }}
                >
                  <Forward10RoundedIcon />
                </IconButton>
              </Box>
              <Box display={"flex"} alignItems={"center"} onClick={switchMute}>
                <IconButton size="small">
                  {isMuted ? <VolumeOffRoundedIcon /> : <VolumeUpRoundedIcon />}
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default FooterPlayer;