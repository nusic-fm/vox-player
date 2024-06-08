import { useAnimation } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useTonejs } from "./hooks/useToneService";
import Marbles from "./Marbles";
import SectionsFalling from "./Tiles";

const voices = [
  "cardi-b",
  "morgan-freeman",
  "franklin-clinton_gta-v",
  "trevor_gta-v",
  "eric-cartman",
];

const TilesMarblesGame = () => {
  const controls = useAnimation();
  const [angleOne, setAngleOne] = useState({ x: 0, y: 0 });
  const [angleTwo, setAngleTwo] = useState({ x: 0, y: 0 });
  const ballRef = useRef<{ [id: string]: any }>({});
  const [initialObj, setInitialObj] = useState(() => {
    const obj: { [key: string]: { x: number; y: number } } = {};
    voices.map((v, i) => {
      obj[v] = { x: 60 * (i + 1) + 600, y: 800 };
    });
    return obj;
  });
  const [mouseDownId, setMouseDownId] = useState<string>("");
  const [start, setStart] = useState(false);
  const [finalOverId, setFinalOverId] = useState<string | null>(null);
  const { playAudio, isTonePlaying } = useTonejs();

  useEffect(() => {
    if (finalOverId) {
      const coverDocId = "f0pmE4twBXnJmVrJzh18";
      const instrumental = `https://voxaudio.nusic.fm/covers/${coverDocId}/instrumental.mp3`;
      const vocals = `https://voxaudio.nusic.fm/covers/${coverDocId}/${finalOverId}.mp3`;

      playAudio(instrumental, vocals, 97, 91.32, false);
    }
  }, [finalOverId]);

  const startInstrumental = () => {
    const coverDocId = "f0pmE4twBXnJmVrJzh18";
    const instrumental = `https://voxaudio.nusic.fm/covers/${coverDocId}/instrumental.mp3`;
    // onlyInstrument(instrumental, 140);
    console.log("Play Audio");
    playAudio(
      instrumental,
      "https://voxaudio.nusic.fm/covers/f0pmE4twBXnJmVrJzh18/trevor_gta-v.mp3",
      97,
      91.32,
      true
    );
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

  return (
    <>
      <SectionsFalling
        mouseDownId={mouseDownId}
        setAngleOne={setAngleOne}
        controls={controls}
        initialObj={initialObj}
        ballRef={ballRef}
        setAngleTwo={setAngleTwo}
        setMouseDownId={setMouseDownId}
        voices={voices}
        startState={[start, setStart]}
        finalOverIdState={[finalOverId, setFinalOverId]}
        startInstrumental={startInstrumental}
      />
      {start && (
        <Marbles
          angleOne={angleOne}
          angleTwo={angleTwo}
          ballRef={ballRef}
          controls={controls}
          initialObj={initialObj}
          mouseDownId={mouseDownId}
          onMouseDown={(e, id) => setMouseDownId(id)}
          voices={voices}
        />
      )}
    </>
  );
};
export default TilesMarblesGame;
