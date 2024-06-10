import { Stack, Button, TextField, Box } from "@mui/material";
import { AnimationControls, motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { createRandomNumber, nameToSlug } from "./helpers";
import * as Tone from "tone";
import { LoadingButton } from "@mui/lab";

type SectionsMeta = {
  start: number;
  duration: number;
};
const startOffset = 68;
const sectionsMeta = [
  { start: 0 + startOffset, duration: 3 },
  { start: 3 + startOffset, duration: 2 },
  { start: 5 + startOffset, duration: 4 },
  { start: 9 + startOffset, duration: 3 },
  { start: 12 + startOffset, duration: 2 },
  { start: 14 + startOffset, duration: 3 },
  { start: 17 + startOffset, duration: 2 },
  { start: 19 + startOffset, duration: 3 },
  { start: 22 + startOffset, duration: 2 },
  { start: 24 + startOffset, duration: 4 },
  { start: 28 + startOffset, duration: 3 },
  { start: 31 + startOffset, duration: 3 },
  { start: 34 + startOffset, duration: 2 },
  { start: 36 + startOffset, duration: 4 },
  { start: 40 + startOffset, duration: 3 },
  { start: 43 + startOffset, duration: 4 },
  { start: 47 + startOffset, duration: 3 },
  { start: 50 + startOffset, duration: 3 },
  { start: 53 + startOffset, duration: 2 },
  { start: 55 + startOffset, duration: 4 },
  { start: 59 + startOffset, duration: 3 },
];

const createLightColor = () => {
  return `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;
};

const createMultiplesOfNumber = (n: number, m: number) => {
  return new Array(n).fill(0).map((_, i) => i * m);
};
const findTheSection = (sectionsStart: number[], playTime: number) => {
  let i = 0;
  while (i < sectionsStart.length) {
    if (playTime < sectionsStart[i]) {
      return i;
    }
    i++;
  }
  return -1;
};

type Section = {
  id: number;
  start: number;
  height: number;
  duration: number;
  color: string;
  xPosition: number;
  negativeTop: number;
};

const getTileHeights = (
  sectionsMeta: SectionsMeta[],
  pxPerSecond: number,
  width: number,
  noOfTracks: number
): Section[] => {
  const heights = sectionsMeta.map((meta) => meta.duration * pxPerSecond);
  const widths = createMultiplesOfNumber(noOfTracks, width);
  const arr = sectionsMeta.map((meta, i) => ({
    id: i + 1,
    start: meta.start,
    height: heights[i],
    duration: meta.duration,
    color: createLightColor(),
    xPosition: widths[createRandomNumber(0, noOfTracks - 1)],
    negativeTop: i
      ? i === 1
        ? heights[i]
        : heights.slice(1, i + 1).reduce((a, b) => a + b)
      : 0,
  }));
  return arr;
};

// const sectionDurations = [2, 3, 2, 3, 4, 5, 6, 4, 2];

type Props = {
  mouseDownId: string;
  setMouseDownId: React.Dispatch<React.SetStateAction<string>>;
  setAngleOne: React.Dispatch<
    React.SetStateAction<{
      x: number;
      y: number;
    }>
  >;
  setAngleTwo: React.Dispatch<
    React.SetStateAction<{
      x: number;
      y: number;
    }>
  >;
  voices: string[];
  initialObj: { [key: string]: { x: number; y: number } };
  controls: AnimationControls;
  ballRef: React.MutableRefObject<{
    [id: string]: any;
  }>;
  startState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  finalOverIdState: [
    string | null,
    React.Dispatch<React.SetStateAction<string | null>>
  ];
  startInstrumental: () => Promise<{
    instrPlayerRef: any;
    playersRef: any;
  }>;
  tilesVoiceObjState: [
    {
      [key: string]: string;
    },
    React.Dispatch<
      React.SetStateAction<{
        [key: string]: string;
      }>
    >
  ];
  changeVoice: (voice: string, start: number, duration: number) => void;
  isDownloading: boolean;
};

const SectionsFalling = ({
  mouseDownId,
  setAngleOne,
  setAngleTwo,
  controls,
  initialObj,
  setMouseDownId,
  ballRef,
  startState,
  finalOverIdState,
  startInstrumental,
  tilesVoiceObjState,
  changeVoice,
  isDownloading,
}: Props) => {
  const [numberOfTracks, setNumberOfTracks] = useState(6);
  const [trackWidth, setTrackWidth] = useState(80);
  const [waitTimeInSeconds, setWaitTimeInSeconds] = useState(5);
  const [pxPerSecondSpeed, setPxPerSecondSpeed] = useState(100);
  const [playheadHeight, setPlayHeadHeight] = useState(600);
  const [sections, setSections] = useState<Section[]>([]);
  const [top, setTop] = useState(0);
  const [timerClock, setTimerClock] = useState(0);
  const [playTime, setPlayTime] = useState(0);
  const [throwObj, setThrowObj] = useState<{
    angle: number;
    divCenterX: number;
    divCenterY: number;
  }>({ angle: 0, divCenterX: 0, divCenterY: 0 });
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [start, setStart] = startState;
  const [playAreaId, setPlayAreaId] = useState<number>(1);
  const [finalOverId, setFinalOverId] = finalOverIdState;
  const [tilesVoiceObj, setTilesVoiceObj] = tilesVoiceObjState;
  // Quick reference to the playAreaId
  const playAreaIdRef = useRef<number>(1);

  const onStart = () => {
    setStart(true);
  };

  const onMouseUp = (event: MouseEvent) => {
    if (!mouseDownId) return;
    let _mouseDownId = mouseDownId;
    handleThrow(throwObj.angle, throwObj.divCenterX, throwObj.divCenterY);
    let intrvl: NodeJS.Timeout;
    const timer = setTimeout(() => {
      clearInterval(intrvl);
      controls.start({
        x: initialObj[mouseDownId].x,
        y: initialObj[mouseDownId].y,
        transition: { ease: "linear", duration: 0 },
        // opacity 0 to 1
        opacity: 1,
      });
      setMouseDownId("");
    }, 500);
    intrvl = setInterval(() => {
      if (isOverlapping(ballRef.current[mouseDownId], targetRef.current)) {
        // overIdRef.current = _mouseDownId;
        // controls.start({
        //   x: initialObj[_mouseDownId].x,
        //   y: initialObj[_mouseDownId].y,
        //   opacity: 0,
        // });
        clearTimeout(timer);
        clearInterval(intrvl);
        controls.set({ opacity: 0, transition: { duration: 0.5 } });
        setTilesVoiceObj((obj) => ({
          ...obj,
          [playAreaId.toString()]: _mouseDownId,
        }));
        setFinalOverId(_mouseDownId);
        changeVoice(
          _mouseDownId,
          sections[playAreaId - 1].start,
          sections[playAreaId - 1].duration
        );
        controls.start({
          x: initialObj[mouseDownId].x,
          y: initialObj[mouseDownId].y,
          transition: { ease: "linear", duration: 0 },
          // opacity 0 to 1
          opacity: 1,
        });
        setMouseDownId("");
      }
    }, 10);
  };
  const onMouseMove = (event: MouseEvent) => {
    if (mouseDownId) {
      event.preventDefault();
      event.stopPropagation();
      if (!ballRef.current[mouseDownId]) return;
      const divRect = (
        ballRef.current[mouseDownId] as any
      ).getBoundingClientRect();
      const divCenterX = divRect.left + divRect.width / 2;
      const divCenterY = divRect.top + divRect.height / 2;

      const mouseX = event.clientX;
      const mouseY = event.clientY;

      if (mouseY > divCenterY) {
        return;
      }

      const dx = mouseX - divCenterX;
      const dy = mouseY - divCenterY;

      const angle = Math.atan2(dy, dx);

      //   console.log("Angle (radians):", angle);
      //   console.log("Angle (degrees):", angle * (180 / Math.PI));

      // Projection distance (speed of the throw)
      const distance = 100;
      const distance2 = 200;

      // Next point coordinates
      const nextX = divCenterX + distance * Math.cos(angle);
      const nextY = divCenterY + distance * Math.sin(angle);
      setAngleOne({ x: nextX - 5, y: nextY - 5 });
      const next2X = divCenterX + distance2 * Math.cos(angle);
      const next2Y = divCenterY + distance2 * Math.sin(angle);
      setAngleTwo({ x: next2X - 5, y: next2Y - 5 });

      setThrowObj({
        angle,
        divCenterX,
        divCenterY,
      });
    }
  };

  useEffect(() => {
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [mouseDownId, throwObj, playAreaId]);
  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [mouseDownId]);

  useEffect(() => {
    if (start) {
      const _sections = getTileHeights(
        sectionsMeta,
        pxPerSecondSpeed,
        trackWidth,
        numberOfTracks
      );
      setSections(_sections);
      setTop(
        playheadHeight -
          _sections[0].height -
          pxPerSecondSpeed * waitTimeInSeconds
      );
      const ms = 100;
      const pxPerMs = pxPerSecondSpeed / 1000; // 0.04
      (async () => {
        const { instrPlayerRef } = await startInstrumental();
        instrPlayerRef.current.start(0);
        // voices.map((v) => playersRef.current[v].start(0));
        // voices.map((v) => playersRef.current[v].stop());
        Tone.Transport.start("+5", startOffset);

        const intrvl = setInterval(() => {
          setTop((prev) => prev + pxPerMs * ms);
          setTimerClock((timer) => timer + ms);
          setPlayTime(Tone.Transport.seconds);
        }, ms);
        const totlaDuration = _sections
          .map((s) => s.duration)
          .reduce((a, b) => a + b, 0);
        setTimeout(() => {
          clearInterval(intrvl);
        }, (totlaDuration + 5) * 1000);
      })();
    }
  }, [start]);

  const isOverlapping = (draggable: any, target: any) => {
    if (!draggable || !target) return;
    const draggableRect = draggable.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    return !(
      draggableRect.right < targetRect.left ||
      draggableRect.left > targetRect.right ||
      draggableRect.bottom < targetRect.top ||
      draggableRect.top > targetRect.bottom
    );
  };
  const handleThrow = (
    angle: number,
    divCenterX: number,
    divCenterY: number
  ) => {
    const distance = 2500; // pixels per secon

    const next2X = divCenterX + distance * Math.cos(angle);
    const next2Y = divCenterY + distance * Math.sin(angle);
    const duration = 0.6;
    controls.start({
      x: next2X - 30, // half of the size of the ball
      y: next2Y - 30,
      transition: { ease: "linear", duration },
    });
    // setTimeout(() => {
    //   controls.start({
    //     x: initialObj[mouseDownId].x,
    //     y: initialObj[mouseDownId].y,
    //     transition: { ease: "linear", duration: 0 },
    //   });
    //   setMouseDownId("");
    // }, duration * 1000);
  };

  useEffect(() => {
    if (timerClock) {
      const section = sections.find((s) => s.start > playTime);
      if (section) {
        if (tilesVoiceObj[section.id]) {
          const findOneWithoutVoice = sections.find(
            (s) => !tilesVoiceObj[s.id]
          );
          if (findOneWithoutVoice) {
            setPlayAreaId(findOneWithoutVoice.id);
          }
        } else {
          // if (
          //   !finalOverId &&
          //   playAreaIdRef.current !== sections[idx].id &&
          //   !tilesVoiceObj[sections[idx].id]
          // ) {
          //   console.log("No voice");
          //   // muteVocals();
          // }
          setPlayAreaId(section.id);
          // playAreaIdRef.current = sections[idx].id;
          setFinalOverId(null);
        }
      } else {
        setPlayAreaId(0);
      }
    }
  }, [timerClock]);

  return (
    <Box
      position={"absolute"}
      width="100vw"
      display={"flex"}
      justifyContent="center"
      sx={{ userSelect: "none" }}
      //   onMouseUp={(event) => {
      //     if (!mouseDownId) return;
      //     let _mouseDownId = mouseDownId;
      //     handleThrow(throwObj.angle, throwObj.divCenterX, throwObj.divCenterY);
      //     const intrvl = setInterval(() => {
      //       if (isOverlapping(event.target, targetRef.current)) {
      //         // overIdRef.current = _mouseDownId;
      //         // setFinalOverId(_mouseDownId);
      //         clearInterval(intrvl);
      //       }
      //     }, 10);
      //     setTimeout(() => {
      //       clearInterval(intrvl);
      //     }, 1000);
      //   }}
      // onMouseMove={(event: any) => {
      // if (mouseDownId) {
      //   if (!ballRef.current[mouseDownId]) return;
      //   const divRect = (
      //     ballRef.current[mouseDownId] as any
      //   ).getBoundingClientRect();
      //   const divCenterX = divRect.left + divRect.width / 2;
      //   const divCenterY = divRect.top + divRect.height / 2;
      //   const mouseX = event.clientX;
      //   const mouseY = event.clientY;
      //   if (mouseY > divCenterY) {
      //     return;
      //   }
      //   const dx = mouseX - divCenterX;
      //   const dy = mouseY - divCenterY;
      //   const angle = Math.atan2(dy, dx);
      //   //   console.log("Angle (radians):", angle);
      //   //   console.log("Angle (degrees):", angle * (180 / Math.PI));
      //   // Projection distance (speed of the throw)
      //   const distance = 100;
      //   const distance2 = 200;
      //   // Next point coordinates
      //   const nextX = divCenterX + distance * Math.cos(angle);
      //   const nextY = divCenterY + distance * Math.sin(angle);
      //   setAngleOne({ x: nextX - 5, y: nextY - 5 });
      //   const next2X = divCenterX + distance2 * Math.cos(angle);
      //   const next2Y = divCenterY + distance2 * Math.sin(angle);
      //   setAngleTwo({ x: next2X - 5, y: next2Y - 5 });
      //   setThrowObj({
      //     angle,
      //     divCenterX,
      //     divCenterY,
      //   });
      // }
      // }}
    >
      <Box
        position={"absolute"}
        top={0}
        left={0}
        zIndex={0}
        width={"100%"}
        height={"100%"}
        sx={{
          backgroundImage: "url(/bg1.png)",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(80px)",
          backgroundSize: "cover",
          opacity: 0.5,
        }}
      ></Box>
      <Box
        sx={{
          overflow: "hidden",
          boxShadow: "0 10px 20px -5px rgba(0,0,0,0.3)",
        }}
        position="relative"
        height={"100vh"}
        width={trackWidth * numberOfTracks}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: "url(/bg1.png)",
            backgroundPosition: "center",
            // backgroundRepeat: "no-repeat",
            // filter: "blur(80px)",
            backgroundSize: "cover",
            // opacity: 0.5,
          }}
        ></Box>
        {sections.map((section, i) => (
          <motion.div
            key={i}
            id={section.id.toString()}
            style={{
              height: section.height,
              width: trackWidth,
              backgroundColor:
                playAreaId === section.id ? "#8973F8" : `transparent`,
              border: "3px solid",
              position: "absolute",
              color: "white",
              borderRadius: "8px",
              backgroundImage: !!tilesVoiceObj[section.id]
                ? `url(https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/voice_models%2Favatars%2Fthumbs%2F${nameToSlug(
                    tilesVoiceObj[section.id]
                  )}_200x200?alt=media)`
                : "unset",
              backgroundPosition: "center",
              backgroundSize: "cover",
              // filter: finalOverId ? "blur(2px)" : "unset",
            }}
            animate={{
              x: section.xPosition,
              y: top - section.negativeTop,
            }}
          >
            {playAreaId === section.id && (
              <Box
                ref={targetRef}
                position={"absolute"}
                top={0}
                left={0}
                width={"100%"}
                height={"100%"}
                sx={{
                  boxShadow: "0 0 20 #8973F8",
                }}
              />
            )}
          </motion.div>
        ))}
        <Stack
          position={"absolute"}
          top={playheadHeight}
          width={trackWidth * numberOfTracks}
          height={"calc(100vh - 600px)"}
        >
          <LoadingButton
            loading={isDownloading}
            onClick={onStart}
            variant="contained"
            color="info"
            sx={{
              zIndex: 9,
              borderTop: "2px solid",
              borderBottom: "2px solid",
              borderRadius: 0,
            }}
          >
            {start
              ? `${(timerClock / 1000).toFixed(1)} - ${(
                  playTime - startOffset
                ).toFixed(1)}`
              : `start`}
          </LoadingButton>
          {!start && (
            <Stack
              alignItems={"center"}
              justifyContent="center"
              mt={2}
              zIndex={9}
              gap={1}
            >
              <TextField
                size="small"
                label="Number of Tracks"
                type={"number"}
                value={numberOfTracks}
                onChange={(e) => {
                  const no = parseInt(e.target.value);
                  if (no < 3 || no > 20) return;
                  setNumberOfTracks(no);
                }}
                color="secondary"
              />
              <TextField
                size="small"
                label="Track Width"
                type={"number"}
                value={trackWidth}
                onChange={(e) => setTrackWidth(parseInt(e.target.value))}
                color="secondary"
              />
            </Stack>
          )}
          <Box
            width={"100%"}
            height={"100%"}
            sx={{ background: "rgba(0,0,0,0.6)" }}
            position="absolute"
            top={0}
            left={0}
            zIndex={0}
          />
        </Stack>
      </Box>
    </Box>
  );
};
export default SectionsFalling;
