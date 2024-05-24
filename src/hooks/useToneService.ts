import { getValue } from "firebase/remote-config";
import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { Reverb, ToneAudioBuffer } from "tone";
import setupIndexedDB, { useIndexedDBStore } from "use-indexeddb";
import { remoteConfig } from "../services/firebase.service";

// Database Configuration
const idbConfig = {
  databaseName: "nusic-covers",
  version: 1,
  stores: [
    {
      name: "covers",
      id: { keyPath: null },
      indices: [
        { name: "id", keyPath: "id", options: { unique: true } },
        { name: "data", keyPath: "data", options: { unique: true } },
      ],
    },
  ],
};

export const useTonejs = (onPlayEnd?: () => void) => {
  // const [currentPlayer, setCurrentPlayer] = useState<Tone.Player | null>();
  const playerRef = useRef<Tone.Player | null>(null);
  const instrPlayerRef = useRef<Tone.Player | null>(null);
  const reverbRef = useRef<Reverb>(
    new Reverb(
      parseFloat(
        localStorage.getItem("nuvox_reverb") ||
          getValue(remoteConfig, "reverb_default_value").asString()
      )
    ).toDestination()
  );
  // const startTimeRef = useRef(0);
  const scheduledNextTrackBf = useRef<Tone.ToneAudioBuffer | null>(null);

  const [isToneInitialized, setIsToneInitialized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTonePlaying, setIsTonePlaying] = useState(false);
  const [toneLoadingForSection, setToneLoadingForSection] = useState<
    string | null
  >(null);
  const [loop, setLoop] = useState(false);
  const onEndedCalledRef = useRef(false);
  const [isEnded, setIsEnded] = useState(false);
  const { add, getByID } = useIndexedDBStore("covers");

  const initializeTone = async () => {
    if (!isToneInitialized) {
      setIsToneInitialized(true);
      await Tone.start();
      console.log("context started");
      setEvents();
      try {
        await setupIndexedDB(idbConfig);
      } catch (e: any) {
        console.error(e.message);
      }
    }
  };

  const setEvents = () => {
    Tone.Transport.on("start", (...args) => {
      console.log("Tone Started");
      setIsTonePlaying(true);
    });
    Tone.Transport.on("stop", (...args) => {
      console.log("Tone Stopped");
      setIsTonePlaying(false);
    });
    Tone.Transport.on("pause", (...args) => {
      console.log("Tone Paused");
      setIsTonePlaying(false);
    });
    Tone.Transport.on("loopEnd", (...args) => {
      setIsEnded(true);
    });
  };
  useEffect(() => {
    if (isEnded) {
      if (!loop && onPlayEnd) {
        Tone.Transport.stop();
        onPlayEnd();
      }
    }
  }, [isEnded]);

  const changePlayerBuffer = (
    bf: ToneAudioBuffer,
    offsetPosition: Tone.Unit.Time
  ) => {
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current.buffer = bf;
      playerRef.current.start(undefined, offsetPosition);
      if (instrPlayerRef.current) instrPlayerRef.current.seek(offsetPosition);
    }
  };

  const playAudio = async (
    instrUrl: string,
    vocalsUrl: string,
    bpm: number,
    duration: number,
    changeInstr: boolean = false // Change the whole track
  ): Promise<void> => {
    if (bpm) Tone.Transport.bpm.value = bpm;
    else Tone.Transport.bpm.dispose();
    if (toneLoadingForSection) {
      scheduledNextTrackBf.current = null;
      setToneLoadingForSection(null);
      onEndedCalledRef.current = false;
    }
    if (playerRef.current && !changeInstr) {
      await switchAudio(vocalsUrl);
      return;
    }
    await initializeTone();
    if (Tone.Transport.seconds) Tone.Transport.stop();
    if (instrPlayerRef.current) {
      instrPlayerRef.current.stop();
      instrPlayerRef.current.dispose();
      instrPlayerRef.current = null;
    }
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current.dispose();
    }
    let vocalsInput: string | Tone.ToneAudioBuffer = vocalsUrl;
    const vocalsDataArray = await getByID(vocalsUrl);
    if (vocalsDataArray) {
      vocalsInput = Tone.Buffer.fromArray(vocalsDataArray as Float32Array);
      console.log("Vocals from IndexedDB");
    }
    // Load and play the new audio
    const player = new Tone.Player(vocalsInput).sync().toDestination();
    playerRef.current = player;
    playerRef.current.connect(reverbRef.current);
    let instrDataArray: null | Float32Array = null;
    if (instrUrl) {
      let instrInput: string | Tone.ToneAudioBuffer = instrUrl;
      instrDataArray = (await getByID(instrUrl)) as Float32Array;
      if (instrDataArray) {
        instrInput = Tone.Buffer.fromArray(instrDataArray);
        console.log("Instr from IndexedDB");
      }
      const instrPlayer = new Tone.Player(instrInput).sync().toDestination();
      instrPlayerRef.current = instrPlayer;
    }
    // setCurrentPlayer(player);
    await Tone.loaded();
    if (isMuted) player.mute = true;
    if (isMuted && instrPlayerRef.current) instrPlayerRef.current.mute = true;
    // player.loop = true;
    // if (instrPlayerRef.current) instrPlayerRef.current.loop = true;
    // player.fadeIn = 0.3;
    // player.fadeOut = 0.3;
    console.log("Loop set for: ", duration);
    Tone.Transport.setLoopPoints(0, duration);
    Tone.Transport.loop = true;

    playerRef.current?.start(0);
    instrPlayerRef.current?.start(0);
    Tone.Transport.start();
    setIsEnded(false);
    if (!vocalsDataArray) add(player.buffer.toArray(), vocalsUrl);
    if (!instrDataArray && instrPlayerRef.current)
      add(instrPlayerRef.current.buffer.toArray(), instrUrl);
  };

  const switchAudio = async (url: string) => {
    const audioArrayData = (await getByID(url)) as Float32Array;
    let buffer: null | Tone.ToneAudioBuffer = null;
    if (audioArrayData) {
      buffer = Tone.ToneAudioBuffer.fromArray(audioArrayData);
    } else {
      buffer = await new Promise((res) => {
        const audioBuffer = new Tone.Buffer(url);
        audioBuffer.onload = (bf) => {
          add(bf.toArray(), url);
          res(bf);
        };
      });
    }
    if (buffer) {
      // Audio is downloaded
      if (isTonePlaying) {
        if (playerRef.current) {
          changePlayerBuffer(buffer, Tone.Transport.seconds);
        }
      } else if (playerRef.current) {
        playerRef.current.buffer = buffer;
        // Tone.Transport.start();
        playerRef.current.start();
      }
    }
  };
  // const changeInstrAudio = async (url: string) => {
  //   await new Promise((res) => {
  //     const audioBuffer = new Tone.Buffer(url);
  //     audioBuffer.onload = (bf) => {
  //       // Audio is downloaded
  //       if (instrPlayerRef.current) {
  //         instrPlayerRef.current.buffer = bf;
  //         Tone.Transport.start();
  //         instrPlayerRef.current.start();
  //       } else {

  //       }
  //       res("");
  //     };
  //   });
  // };

  const switchLoop = () => {
    // if (currentPlayer) {
    // currentPlayer.loop = !loop;
    setLoop(!loop);
    // }
  };

  const switchMute = () => {
    if (isMuted) {
      unMutePlayer();
    } else {
      mutePlayer();
    }
  };

  const mutePlayer = () => {
    setIsMuted(true);
    if (playerRef.current) {
      playerRef.current.mute = true;
      // currentPlayer.stop(currentPlayer.now() + 0.1);
    }
    if (instrPlayerRef.current) instrPlayerRef.current.mute = true;
  };

  const unMutePlayer = () => {
    setIsMuted(false);
    if (playerRef.current) {
      playerRef.current.mute = false;
      // currentPlayer.stop(currentPlayer.now() + 0.1);
    }
    if (instrPlayerRef.current) instrPlayerRef.current.mute = false;
  };

  const pausePlayer = () => {
    Tone.Transport.pause();
  };
  const playPlayer = () => {
    Tone.Transport.start();
  };
  const stopPlayer = () => {
    Tone.Transport.stop();
  };
  const addReverb = (decay: number) => {
    if (playerRef.current) {
      reverbRef.current.decay = decay;
      // playerRef.current.volume.value = db;
    }
  };
  return {
    playAudio,
    mutePlayer,
    unMutePlayer,
    pausePlayer,
    playPlayer,
    stopPlayer,
    isTonePlaying,
    isMuted,
    toneLoadingForSection,
    switchLoop,
    loop,
    initializeTone,
    switchMute,
    addReverb,
    // changeInstrAudio,
  };
};
