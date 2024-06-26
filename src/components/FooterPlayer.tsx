import {
  Box,
  Stack,
  Typography,
  IconButton,
  Slider,
  useMediaQuery,
  useTheme,
  Avatar,
  Button,
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
import { useEffect, useRef, useState } from "react";
import { getWidthByDuration, timeToSeconds } from "../helpers/audio";

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
  const sectionsBarRef = useRef<HTMLDivElement | null>(null);
  const [sectionsWidth, setSectionsWidth] = useState<number[]>([]);
  // const [copyPopEl, setCopyPopEl] = useState<null | HTMLButtonElement>(null);

  useEffect(() => {
    if (songInfo?.sections) {
      const differences = songInfo.sections.map(
        (s, i, arr) => (arr[i + 1]?.start || songInfo.duration) - s.start
      );
      const durations = getWidthByDuration(
        differences,
        sectionsBarRef.current?.offsetWidth || 500
      );
      setSectionsWidth(durations);
    }
  }, [songInfo]);

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
    <Box
      position={"absolute"}
      width={{ xs: "calc(100% - 20%)", md: "calc(80% - 10px)" }}
      left={"calc(20% + 5px)"}
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
      <Stack width={"100%"}>
        <Box display={"flex"} alignItems={"center"} gap={2} width="100%">
          <Typography variant="caption" color="#c3c3c3">
            {songInfo.voices.filter((v) => v.id === voiceId).at(0)?.name}
          </Typography>
          <Box width="100%">
            <AudioProgress
              loading={loading}
              isTonePlaying={isTonePlaying}
              duration={songInfo.duration}
            />
            <Box
              display={"flex"}
              alignItems="center"
              width={"100%"}
              ref={sectionsBarRef}
              position="relative"
            >
              {songInfo.sections?.map((section, i, arr) => (
                <Button
                  disabled={!sectionsWidth.length || loading}
                  key={section.start}
                  // p={0.85}
                  variant="contained"
                  color="info"
                  sx={{
                    mr: i === arr.length - 1 ? 0 : 0.5,
                    minWidth: 0,
                    display: sectionsWidth[i] > 1 ? "inherit" : "none",
                    width: sectionsWidth.length
                      ? sectionsWidth[i] + "px"
                      : "120px",
                    p: 0,
                    height: 10,
                    transition: "transform 0.3s ease",
                    ":hover": {
                      zIndex: 999,
                      transform: "scale(1.5)",
                      background: "#563FC8",
                    },
                  }}
                  onClick={() => {
                    const startInSecs = timeToSeconds(
                      Math.round(section.start || 0.1).toString()
                    );
                    if (!isTonePlaying)
                      Tone.Transport.start(undefined, startInSecs);
                    else Tone.Transport.seconds = startInSecs;
                  }}
                />
              ))}
            </Box>
          </Box>
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
            <Box display={"flex"} alignItems={"center"} gap={2}>
              <Stack justifyContent={"center"} height="100%" pt={1.5}>
                <Slider
                  defaultValue={parseFloat(
                    localStorage.getItem("nuvox_reverb") ||
                      getValue(remoteConfig, "reverb_default_value").asString()
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
  );
};

export default FooterPlayer;
