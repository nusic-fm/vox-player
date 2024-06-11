import { useAnimation } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { calculatePositions, nameToSlug } from "./helpers";
import { useTonejs } from "./hooks/useToneService";
import Marbles from "./Marbles";
import SectionsFalling from "./Tiles";
import "./index.css";

export const voices = [
  "Spongebob",
  "Eric Cartman",
  "Plankton",
  "Gawr Gura",
  "Dua Lipa",
  "Trevor_GTA V",
  "The Weeknd",
];

const coverDocId = "ByE2N5MsLcSYpUR8s6a3";
const bpm = 98;
const duration = 210.6;

const TilesMarblesGame = () => {
  const controls = useAnimation();
  const ballRef = useRef<{ [id: string]: any }>({});
  const [initialObj, setInitialObj] = useState(() => {
    const obj: { [key: string]: { x: number; y: number } } = {};
    const positions = calculatePositions(
      window.innerWidth,
      window.innerHeight,
      voices.length
    );
    voices.map((v, i) => {
      obj[v] = positions[i];
    });
    return obj;
  });
  const [mouseDownId, setMouseDownId] = useState<string>("");
  const [start, setStart] = useState(false);
  const [tilesVoiceObj, setTilesVoiceObj] = useState<{
    [sectionId: string]: string;
  }>({});
  const [finalOverId, setFinalOverId] = useState<string | null>(null);
  const {
    playAudio,
    isTonePlaying,
    downloadAudioFiles,
    playAudioFromDownloadObj,
    playVoice,
  } = useTonejs();
  const downloadStartedRef = useRef(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!downloadStartedRef.current) {
      downloadStartedRef.current = true;
      (async () => {
        setIsDownloading(true);
        await downloadAudioFiles([
          `https://voxaudio.nusic.fm/covers/${coverDocId}/instrumental.mp3`,
          ...voices.map(
            (v) =>
              `https://voxaudio.nusic.fm/covers/${coverDocId}/${nameToSlug(
                v
              )}.mp3`
          ),
        ]);
        setIsDownloading(false);
      })();
    }
  }, []);

  //   useEffect(() => {
  //     if (finalOverId) {
  //       debugger;
  //       const instrumental = `https://voxaudio.nusic.fm/covers/${coverDocId}/instrumental.mp3`;
  //       const vocals = `https://voxaudio.nusic.fm/covers/${coverDocId}/${nameToSlug(
  //         finalOverId
  //       )}.mp3`;

  //       playAudio(instrumental, vocals, bpm, duration, false);
  //     }
  //   }, [finalOverId]);
  const changeVoice = (voiceName: string, delay: number, _duration: number) => {
    const instrumental = `https://voxaudio.nusic.fm/covers/${coverDocId}/instrumental.mp3`;
    const vocals = `https://voxaudio.nusic.fm/covers/${coverDocId}/${nameToSlug(
      voiceName
    )}.mp3`;
    playAudio(instrumental, vocals, bpm, duration, false, delay, _duration);
  };

  const startInstrumental = async (): Promise<{
    instrPlayerRef: any;
    playerRef: any;
  }> => {
    const instrumental = `https://voxaudio.nusic.fm/covers/${coverDocId}/instrumental.mp3`;
    // onlyInstrument(instrumental, 140);
    console.log("Play Audio");
    const { instrPlayerRef, playerRef } = await playAudio(
      instrumental,
      `https://voxaudio.nusic.fm/covers/${coverDocId}/${nameToSlug(
        voices[0]
      )}.mp3`,
      bpm,
      duration,
      true
    );
    return { instrPlayerRef, playerRef };
  };
  //   useEffect(() => {
  //     if (start) {
  //       const coverDocId = "f0pmE4twBXnJmVrJzh18";
  //       const instrumental = `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers%2F${coverDocId}%2Finstrumental.mp3?alt=media`;
  //       // onlyInstrument(instrumental, 140);
  //       console.log("Play Audio");
  //       playAudio(
  //         instrumental,
  //         "https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers%2Ff0pmE4twBXnJmVrJzh18%2Ftrevor_gta-v.mp3?alt=media",
  //         97,
  //         91.32,
  //         true
  //       );
  //     }
  //   }, [start]);

  const onMouseDown = (id: string) => {
    setMouseDownId((prevId) => {
      if (prevId) {
        return prevId;
      }
      return id;
    });
  };

  return (
    <>
      <SectionsFalling
        mouseDownId={mouseDownId}
        controls={controls}
        initialObj={initialObj}
        ballRef={ballRef}
        setMouseDownId={setMouseDownId}
        voices={voices}
        startState={[start, setStart]}
        finalOverIdState={[finalOverId, setFinalOverId]}
        startInstrumental={async () => {
          return playAudioFromDownloadObj(coverDocId, voices, bpm);
        }}
        tilesVoiceObjState={[tilesVoiceObj, setTilesVoiceObj]}
        changeVoice={playVoice}
        isDownloading={isDownloading}
        // muteVocals={() => {
        //   if (playerRef.current) playerRef.current.mute = true;
        // }}
      />
      {start && (
        <Marbles
          ballRef={ballRef}
          controls={controls}
          initialObj={initialObj}
          mouseDownId={mouseDownId}
          onMouseDown={onMouseDown}
          voices={voices}
          finalOverId={finalOverId}
        />
      )}
    </>
  );
};
export default TilesMarblesGame;
