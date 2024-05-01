import { Box } from "@mui/material";
import { useState } from "react";

import { useTonejs } from "../../hooks/useToneService";
import { GlobalStateContext } from "../../main";
import FooterPlayer from "../FooterPlayer";

export type MusicState = {
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
  duration: number;
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
    switchMute,
    isMuted,
    increaseVocalsVolume,
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
    duration: 0,
  });

  const updateGlobalState = async (newState: MusicState) => {
    setSongId(newState.songId);
    setVoiceId(newState.voiceId || "");

    setSongInfo((prevState: MusicState) => ({
      ...prevState,
      ...newState,
    }));
    if (newState.coverVocalsUrl) {
      setLoading(true);
      await playAudio(
        newState.songInstrUrl,
        newState.coverVocalsUrl,
        newState.bpm,
        newState.duration,
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
      <Box sx={{ overflowY: "auto" }} height={songId ? "90vh" : "98vh"}>
        {children}
      </Box>
      {songId && (
        <FooterPlayer
          songInfo={songInfo}
          loading={loading}
          voiceId={voiceId}
          isTonePlaying={isTonePlaying}
          playPlayer={playPlayer}
          pausePlayer={pausePlayer}
          switchMute={switchMute}
          isMuted={isMuted}
          increaseVocalsVolume={increaseVocalsVolume}
        />
      )}
    </GlobalStateContext.Provider>
  );
};

export default GlobalStateProvider;
