import axios from "axios";
import { useRef, useState } from "react";
import * as Tone from "tone";
import { ToneAudioBuffer } from "tone";

export const useTonejs = () => {
  // const [currentPlayer, setCurrentPlayer] = useState<Tone.Player | null>();
  const playerRef = useRef<Tone.Player | null>(null);
  const instrPlayerRef = useRef<Tone.Player | null>(null);
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

  const initializeTone = async () => {
    if (!isToneInitialized) {
      setIsToneInitialized(true);
      await Tone.start();
      console.log("context started");
      setEvents();
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
    // Tone.Transport.on("loopStart", (...args) => {
    //   console.log("Loop Started");
    //   console.log(args);
    //   console.log(Tone.Transport.seconds);
    // });
  };
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
    Tone.Transport.bpm.value = bpm;
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
      instrPlayerRef.current.disconnect();
      instrPlayerRef.current.disconnect();
    }
    if (playerRef.current) {
      playerRef.current.disconnect();
      playerRef.current.dispose();
    }
    // Load and play the new audio
    const responses = await Promise.all([
      axios.get(vocalsUrl, {
        headers: { Range: "bytes=0-120000" },
        responseType: "arraybuffer",
      }),
      axios.get(instrUrl, {
        headers: { Range: "bytes=0-120000" },
        responseType: "arraybuffer",
      }),
    ]);

    // new ToneBufferSource(responses[0].data);
    // new ToneBufferSource(responses[1].data);
    console.time("decode-audio");
    const audioContext = new AudioContext();
    const b1 = await audioContext.decodeAudioData(responses[0].data);
    const b2 = await audioContext.decodeAudioData(responses[1].data);
    console.timeEnd("decode-audio");
    const tempPlayer = new Tone.Player(b1).sync().toDestination();
    const tempInstrPlayer = new Tone.Player(b2).sync().toDestination();

    playerRef.current = tempPlayer;
    instrPlayerRef.current = tempInstrPlayer;
    // player.buffer = responses[0].data;
    // instrPlayer.buffer = responses[1].data;
    // setCurrentPlayer(player);
    await Tone.loaded();
    if (isMuted) playerRef.current.mute = true;
    if (isMuted && instrPlayerRef.current) instrPlayerRef.current.mute = true;
    // player.loop = true;
    // if (instrPlayerRef.current) instrPlayerRef.current.loop = true;
    // player.fadeIn = 0.3;
    // player.fadeOut = 0.3;
    console.log("Loop set for: ", duration);
    Tone.Transport.setLoopPoints(0, duration);
    Tone.Transport.loop = true;

    playerRef.current?.start();
    instrPlayerRef.current?.start();
    Tone.Transport.start();

    Promise.all([
      new Promise((res) => {
        const audioBuffer = new Tone.Buffer(vocalsUrl);
        audioBuffer.onload = (bf) => {
          res(bf);
        };
      }),
      new Promise((res) => {
        const audioBuffer = new Tone.Buffer(instrUrl);
        audioBuffer.onload = (bf) => {
          res(bf);
        };
      }),
    ]).then((fullAudioRespones: any) => {
      if (playerRef.current && instrPlayerRef.current) {
        playerRef.current.buffer = fullAudioRespones[0];
        instrPlayerRef.current.buffer = fullAudioRespones[1];
        playerRef.current.seek(Tone.Transport.seconds);
        instrPlayerRef.current.seek(Tone.Transport.seconds);
        console.log("Changed");
      }
    });
  };

  const switchAudio = async (url: string) => {
    await new Promise((res) => {
      const audioBuffer = new Tone.Buffer(url);
      audioBuffer.onload = (bf) => {
        // Audio is downloaded
        if (isTonePlaying) {
          if (playerRef.current) {
            changePlayerBuffer(bf, Tone.Transport.seconds);
          }
        } else if (playerRef.current) {
          playerRef.current.buffer = bf;
          Tone.Transport.start();
          playerRef.current.start();
        }
        res("");
      };
    });
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
  const increaseVocalsVolume = (db: number) => {
    if (playerRef.current) {
      playerRef.current.volume.value = db;
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
    increaseVocalsVolume,
    // changeInstrAudio,
  };
};
