import { Box, Stack, Typography, IconButton } from "@mui/material";
import { useState } from "react";
import PlayArrow from "@mui/icons-material/PlayArrow";
import PauseRounded from "@mui/icons-material/PauseRounded";
import Replay10RoundedIcon from "@mui/icons-material/Replay10Rounded";
import Forward10RoundedIcon from "@mui/icons-material/Forward10Rounded";
import * as Tone from "tone";
import { useTonejs } from "../../hooks/useToneService";
import { GlobalStateContext } from "../../main";

type MusicState = {
  songId: string;
  voiceId?: string;
  songImg: string;
  songName: string;
  songInstrUrl: string;
  coverVocalsUrl: string;
  fromStart: boolean;
  voices: {
    name: string;
    id: string;
  }[];
  bpm: number;
};

type Props = {};

const GlobalStateProvider = ({ children }: any) => {
  const {
    playAudio,
    initializeTone,
    isTonePlaying,
    stopPlayer,
    pausePlayer,
    playPlayer,
  } = useTonejs();
  const [songId, setSongId] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [songInfo, setSongInfo] = useState<MusicState>({
    songImg: "",
    songId: "",
    songName: "",
    songInstrUrl: "",
    coverVocalsUrl: "",
    fromStart: true,
    voices: [],
    bpm: 0,
  });

  const updateGlobalState = async (newState: MusicState) => {
    setSongId(newState.songId);
    setVoiceId(newState.voiceId || "");

    setSongInfo((prevState: MusicState) => ({
      ...prevState,
      ...newState,
    }));
    if (newState.songInstrUrl) {
      setLoading(true);
      await playAudio(
        newState.songInstrUrl,
        newState.coverVocalsUrl,
        newState.bpm,
        newState.fromStart
      );
      setLoading(false);
    }
  };

  return (
    <GlobalStateContext.Provider
      value={{
        songInfo,
        updateGlobalState,
        songId,
        initializeTone,
        isTonePlaying,
        stopPlayer,
        pausePlayer,
        playPlayer,
        voiceId,
        loading,
      }}
    >
      {/* <LoginModal /> */}
      <Box sx={{ overflowY: "auto" }} height="90vh">
        {children}
      </Box>
      <Box display={"flex"} justifyContent="center">
        {songInfo?.songId && (
          <Box
            position={"absolute"}
            width={{ xs: "calc(100% - 16px)", md: "950px" }}
            height={"8vh"}
            bottom={0}
            p={2}
            px={4}
            display="flex"
            gap={4}
            alignItems="center"
            sx={{ bgcolor: "rgb(20, 20, 20)" }}
          >
            <img
              src={`https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/syncledger%2F${songInfo.songImg}?alt=media`}
              alt=""
              width={40}
              style={{ borderRadius: "50%" }}
            />
            <Stack gap={1}>
              <Typography>{songInfo.songName}</Typography>
              <Typography variant="caption">
                {songInfo.voices.filter((v) => v.id === voiceId).at(0)?.name ||
                  "Original"}
              </Typography>
            </Stack>
            <Box alignItems={"center"}>
              <IconButton
                disabled={loading}
                onClick={() => {
                  Tone.Transport.seconds -= 10;
                  if (!isTonePlaying) playPlayer();
                }}
              >
                <Replay10RoundedIcon />
              </IconButton>
              <IconButton
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
                disabled={loading}
                onClick={() => {
                  Tone.Transport.seconds += 10;
                  if (!isTonePlaying) playPlayer();
                }}
              >
                <Forward10RoundedIcon />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>
    </GlobalStateContext.Provider>
  );
};

export default GlobalStateProvider;
