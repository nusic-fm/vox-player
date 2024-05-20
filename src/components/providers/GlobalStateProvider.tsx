import { Box } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import { useTonejs } from "../../hooks/useToneService";
import { GlobalStateContext } from "../../main";
import { CoverV1 } from "../../services/db/coversV1.service";
import FooterPlayer from "../FooterPlayer";

export type MusicState = {
  songId: string;
  voiceId?: string;
  songImg: string;
  songName: string;
  songInstrUrl: string | "";
  coverVocalsUrl: string;
  fromStart: boolean;
  voices: {
    name: string;
    id: string;
  }[];
  bpm: number;
  duration: number;
  playlist?: { [x: string]: CoverV1 };
};

type Props = {};

const GlobalStateProvider = ({ children }: any) => {
  const [songId, setSongId] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [playlist, setPlaylist] = useState<{ [x: string]: CoverV1 }>();
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
  const [lastSongLoadTime, setLastSongLoadTime] = useState(0);

  const onPlayEndCallback = useCallback(async () => {
    if (playlist) {
      const keys = Object.keys(playlist);
      const currentIdx = keys.findIndex((k) => k === songId);
      let newSongId = keys[0];
      if (currentIdx < keys.length - 1) {
        const newIdx = currentIdx + 1;
        newSongId = keys[newIdx];
      }
      const _coverDoc = playlist[newSongId];
      if (!_coverDoc) return;
      const _voiceId = _coverDoc.voices[0].id;
      const _instrUrl = _coverDoc.stemsReady
        ? `https://voxaudio.nusic.fm/covers/${newSongId}/instrumental.mp3`
        : "";
      const _audioUrl = _coverDoc.stemsReady
        ? `https://voxaudio.nusic.fm/covers/${newSongId}/${_voiceId}.mp3`
        : _coverDoc.audioUrl;

      setSongId(newSongId);
      setVoiceId(playlist[newSongId].voices[0].id);
      setSongInfo({
        songImg:
          _coverDoc.voices.find((v) => v.id === _voiceId)?.imageUrl || "",
        songName: _coverDoc.title,
        songInstrUrl: _instrUrl,
        coverVocalsUrl: _audioUrl,
        fromStart: true,
        voices: _coverDoc.voices,
        songId: newSongId,
        bpm: _coverDoc.bpm,
        voiceId: _voiceId,
        duration: _coverDoc.duration,
      });
      // setLoading(true);
      // const startTime = Date.now();
      // await playAudio(
      //   _instrUrl,
      //   _audioUrl,
      //   _coverDoc.bpm,
      //   _coverDoc.duration,
      //   true
      // );
      // setLastSongLoadTime(Number(((Date.now() - startTime) / 1000).toFixed(1)));
      // setLoading(false);
    }
  }, [playlist, songId]);

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
  } = useTonejs(onPlayEndCallback);

  const updateGlobalState = async (newState: MusicState) => {
    setSongId(newState.songId);
    setVoiceId(newState.voiceId || "");
    if (newState.playlist) {
      setPlaylist(newState.playlist);
    }
    setSongInfo((prevState: MusicState) => ({
      ...prevState,
      ...newState,
    }));
  };

  useEffect(() => {
    if (songInfo.coverVocalsUrl) {
      (async () => {
        setLoading(true);
        const startTime = Date.now();
        await playAudio(
          songInfo.songInstrUrl,
          songInfo.coverVocalsUrl,
          songInfo.bpm,
          songInfo.duration,
          songInfo.fromStart
        );
        setLastSongLoadTime(
          Number(((Date.now() - startTime) / 1000).toFixed(1))
        );
        setLoading(false);
      })();
    }
  }, [songInfo]);

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
        lastSongLoadTime,
      }}
    >
      {/* <LoginModal /> */}
      <Box sx={{ overflowY: "auto" }} height={"100vh"} pb={10}>
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
