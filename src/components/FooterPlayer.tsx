import {
  Box,
  Stack,
  Typography,
  IconButton,
  Slider,
  useMediaQuery,
  useTheme,
  Avatar,
} from "@mui/material";
import PlayArrow from "@mui/icons-material/PlayArrow";
import PauseRounded from "@mui/icons-material/PauseRounded";
import Replay10RoundedIcon from "@mui/icons-material/Replay10Rounded";
import Forward10RoundedIcon from "@mui/icons-material/Forward10Rounded";
import * as Tone from "tone";
import { MusicState } from "./providers/GlobalStateProvider";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import VolumeOffRoundedIcon from "@mui/icons-material/VolumeOffRounded";
import AudioProgress from "./AudioProgress";
import { getValue } from "firebase/remote-config";
import { remoteConfig } from "../services/firebase.service";
// import ShareIcon from "@mui/icons-material/Share";
// import { useState } from "react";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import RemoveCircleOutlineRoundedIcon from "@mui/icons-material/RemoveCircleOutlineRounded";
import { useState } from "react";

type Props = {
  songInfo: MusicState;
  loading: boolean;
  voiceId: string;
  playPlayer: any;
  isTonePlaying: boolean;
  isMuted: boolean;
  pausePlayer: any;
  switchMute: any;
  addReverb: (db: number) => void;
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
  addReverb,
}: Props) => {
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down("md"));
  const [reverbValue, setReverbValue] = useState<number | null>(null);
  // const [copyPopEl, setCopyPopEl] = useState<null | HTMLButtonElement>(null);

  if (isMobileView)
    return (
      <Box
        position={"absolute"}
        width="100%"
        bottom={0}
        p={1}
        display="flex"
        alignItems="center"
        sx={{ backgroundColor: "rgba(29, 33, 38, 1)" }}
        border="1px solid rgb(47, 51, 54)"
        zIndex={9999}
      >
        <Stack width={"100%"}>
          <Box display={"flex"} gap={1} alignItems="center">
            <Avatar
              src={`https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/${encodeURIComponent(
                "voice_models/avatars/thumbs/"
              )}${voiceId}_200x200?alt=media`}
              sx={{ width: 40, height: 45, borderRadius: "8px" }}
            >
              <img
                src={songInfo.songImg}
                alt=""
                width={40}
                height={45}
                style={{ borderRadius: "8px", objectFit: "cover" }}
              />
            </Avatar>
            {/* <img
              src={`https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/${encodeURIComponent(
                "voice_models/avatars/thumbs/"
              )}${voiceId}_200x200.webp?alt=media`}
              alt=""
              width={40}
              height={45}
              style={{
                borderRadius: "8px",
                objectFit: "cover",
              }}
            /> */}
            <Stack
              sx={{
                overflow: "hidden",
              }}
            >
              <Box
                display={"flex"}
                justifyContent="space-between"
                alignItems={"center"}
              >
                <Typography variant="caption" color="#c3c3c3">
                  {songInfo.voices.filter((v) => v.id === voiceId).at(0)?.name}
                </Typography>
                <Box display={"flex"} alignItems={"center"}>
                  <IconButton
                    sx={{ padding: 1 }}
                    onClick={() => {
                      if (reverbValue === 0) return;
                      let newReverbValue = (reverbValue || 1) - 1;
                      addReverb(newReverbValue);
                      setReverbValue(newReverbValue);
                    }}
                  >
                    <RemoveCircleOutlineRoundedIcon
                      sx={{ width: 12, height: 12 }}
                    />
                  </IconButton>
                  <Box display="flex" alignItems="center" gap={0.2}>
                    <img
                      src="/reverb.png"
                      width={18}
                      height={18}
                      style={{ opacity: reverbValue === 0 ? 0.5 : 1 }}
                    />
                    {reverbValue !== 0 && (
                      <Typography variant="caption" color="#c3c3c3">
                        {reverbValue === null ? 1 : reverbValue}
                      </Typography>
                    )}
                  </Box>
                  <IconButton
                    sx={{ padding: 1 }}
                    onClick={() => {
                      if (reverbValue === 8) return;
                      let newReverbValue =
                        (reverbValue === null ? 1 : reverbValue) + 1;
                      addReverb(newReverbValue);
                      setReverbValue(newReverbValue);
                    }}
                  >
                    <AddCircleOutlineRoundedIcon
                      sx={{ width: 12, height: 12 }}
                    />
                  </IconButton>
                </Box>
              </Box>
              <Typography
                textOverflow={"ellipsis"}
                overflow="hidden"
                whiteSpace={"nowrap"}
              >
                {songInfo.songName}
              </Typography>
            </Stack>
          </Box>
          <Box display={"flex"} alignItems={"center"} gap={2}>
            <AudioProgress
              loading={loading}
              isTonePlaying={isTonePlaying}
              duration={songInfo.duration}
            />
            <Box display={"flex"} alignItems={"center"}>
              {/* <IconButton
                size="small"
                disabled={loading}
                onClick={() => {
                  Tone.Transport.seconds -= 10;
                  if (!isTonePlaying) playPlayer();
                }}
              >
                <Replay10RoundedIcon />
              </IconButton> */}
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
              {/* <IconButton
                size="small"
                disabled={loading}
                onClick={() => {
                  Tone.Transport.seconds += 10;
                  if (!isTonePlaying) playPlayer();
                }}
              >
                <Forward10RoundedIcon />
              </IconButton> */}
            </Box>
            {/* <Box display={"flex"} alignItems={"center"}>
              <IconButton size="small" onClick={switchMute}>
                {isMuted ? <VolumeOffRoundedIcon /> : <VolumeUpRoundedIcon />}
              </IconButton>
              <Slider
                min={-10}
                max={10}
                defaultValue={0}
                step={1}
                onChange={(e, val) => {
                  console.log(val);
                  increaseVocalsVolume(val as number);
                }}
                sx={{ width: 100 }}
                color="secondary"
                size="small"
              />
            </Box> */}
          </Box>
        </Stack>
      </Box>
    );
  return (
    <Box display={"flex"} justifyContent="center">
      <Box
        position={"absolute"}
        width={{ xs: "calc(100% - 16px)", md: "950px" }}
        bottom={0}
        py={2}
        px={2}
        display="flex"
        gap={2}
        alignItems="center"
        sx={{ backgroundColor: "rgba(29, 33, 38, 1)" }}
        border="1px solid rgb(47, 51, 54)"
        zIndex={9999}
        borderRadius={"4px"}
      >
        <Avatar
          src={`https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/${encodeURIComponent(
            "voice_models/avatars/thumbs/"
          )}${voiceId}_200x200?alt=media`}
          sx={{ width: 40, height: 45, borderRadius: "8px" }}
        >
          <img
            src={songInfo.songImg}
            alt=""
            width={40}
            height={45}
            style={{ borderRadius: "8px", objectFit: "cover" }}
          />
        </Avatar>
        {/* <img
          src={songInfo.songImg}
          alt=""
          width={40}
          height={40}
          style={{ borderRadius: "50%", objectFit: "cover" }}
        /> */}
        <Stack width={"100%"}>
          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent="space-between"
            gap={2}
          >
            <Typography variant="caption" color="#c3c3c3">
              {songInfo.voices.filter((v) => v.id === voiceId).at(0)?.name}
            </Typography>
            <AudioProgress
              loading={loading}
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
              {/* <IconButton
                size="small"
                onClick={(e) => {
                  const input = `https://vox-player.netlify.app?coverId=${songInfo.songId}&voiceId=${voiceId}`;
                  navigator.clipboard.writeText(input);
                  setCopyPopEl(e.currentTarget);
                  setTimeout(() => setCopyPopEl(null), 500);
                }}
              >
                <ShareIcon fontSize="small" />
              </IconButton>
              <Popover
                open={!!copyPopEl}
                anchorEl={copyPopEl}
                onClose={() => setCopyPopEl(null)}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <Typography px={1} variant="caption">
                  Copied
                </Typography>
              </Popover> */}
              <Box display={"flex"} alignItems={"center"} gap={2}>
                <Stack justifyContent={"center"} height="100%" pt={1.5}>
                  <Slider
                    defaultValue={parseFloat(
                      localStorage.getItem("nuvox_reverb") ||
                        getValue(
                          remoteConfig,
                          "reverb_default_value"
                        ).asString()
                    )}
                    min={0}
                    marks
                    max={8}
                    step={1}
                    onChange={(e, val) => {
                      localStorage.setItem("nuvox_reverb", val.toString());
                      addReverb(val as number);
                    }}
                    sx={{ width: 100, pt: 0, pb: 0.8 }}
                    color="secondary"
                    size="small"
                  />
                  <Typography variant="caption" align="center">
                    Reverb
                  </Typography>
                </Stack>
                <IconButton size="small" onClick={switchMute}>
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
