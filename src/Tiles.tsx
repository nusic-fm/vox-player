import { Stack, Button, TextField, Typography, Box } from "@mui/material";
import { AnimationControls, motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { createRandomNumber, nameToSlug } from "./helpers";
import * as Tone from "tone";

type SectionsMeta = {
  start: number;
  duration: number;
};
const sectionsMeta = [
  { start: 0, duration: 6.13 },
  { start: 6.13, duration: 12.36 - 6.13 },
  { start: 12.36, duration: 24.73 - 12.36 },
  { start: 24.73, duration: 37.09 - 24.73 },
  { start: 37.09, duration: 44.52 - 37.09 },
  { start: 44.52, duration: 51.95 - 44.52 },
  { start: 51.95, duration: 59.37 - 51.95 },
  { start: 59.37, duration: 66.79 - 59.37 },
  { start: 66.79, duration: 76.67 - 66.79 },
  { start: 76.67, duration: 86.57 - 66.79 },
  { start: 86.57, duration: 91.21 - 86.57 },
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
    if (playTime > sectionsStart[i] && playTime < sectionsStart[i + 1]) {
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
  startInstrumental: () => void;
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
}: Props) => {
  const [numberOfTracks, setNumberOfTracks] = useState(3);
  const [trackWidth, setTrackWidth] = useState(120);
  const [waitTimeInSeconds, setWaitTimeInSeconds] = useState(5);
  const [pxPerSecondSpeed, setPxPerSecondSpeed] = useState(100);
  const [playheadHeight, setPlayHeadHeight] = useState(600);
  const [sections, setSections] = useState<Section[]>([]);
  const [top, setTop] = useState(0);
  const [timer, setTimer] = useState(0);
  const [playTime, setPlayTime] = useState(0);
  const [throwObj, setThrowObj] = useState<{
    angle: number;
    divCenterX: number;
    divCenterY: number;
  }>({ angle: 0, divCenterX: 0, divCenterY: 0 });
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [start, setStart] = startState;
  const [playAreaId, setPlayAreaId] = useState<number | null>(1);
  const [finalOverId, setFinalOverId] = finalOverIdState;

  const onStart = () => {
    setStart(true);
  };
  const onMouseUp = (event: MouseEvent) => {
    if (!mouseDownId) return;
    let _mouseDownId = mouseDownId;
    handleThrow(throwObj.angle, throwObj.divCenterX, throwObj.divCenterY);
    const intrvl = setInterval(() => {
      if (isOverlapping(ballRef.current[mouseDownId], targetRef.current)) {
        // overIdRef.current = _mouseDownId;
        setFinalOverId(_mouseDownId);
        clearInterval(intrvl);
      }
    }, 10);
    setTimeout(() => {
      clearInterval(intrvl);
    }, 1000);
  };
  const onMouseMove = (event: MouseEvent) => {
    if (mouseDownId) {
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
  }, [mouseDownId, throwObj]);
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
      (async () => await startInstrumental())();
      const intrvl = setInterval(() => {
        setTop((prev) => prev + pxPerMs * ms);
        setTimer((timer) => timer + ms);
        setPlayTime(Tone.Transport.seconds);
      }, ms);
      const totlaDuration = _sections
        .map((s) => s.duration)
        .reduce((a, b) => a + b, 0);
      setTimeout(() => {
        clearInterval(intrvl);
      }, (totlaDuration + 5) * 1000);
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
      x: next2X - 40,
      y: next2Y - 40,
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
    if (playTime) {
      const sectionsStart = sections.map((s) => s.start);

      const idx = findTheSection(sectionsStart, playTime);
      //   const section = sections.filter(
      //     (s, i) =>
      //       s.start - 1 < Tone.Transport.seconds &&
      //       s.start + 2.5 > Tone.Transport.seconds
      //   )[0];
      if (idx) {
        // setShowPlayArea(!!section);
        setPlayAreaId(sections[idx].id);
      } else {
        setPlayAreaId(null);
      }
    }
    //     if (playTime) {
    //       const section = sections.filter(
    //         (s, i) => s.start + s.duration < playTime
    //       )[0];
    //       if (section) {
    //         // setShowPlayArea(!!section);
    //         setPlayAreaId(section.id);
    //       } else {
    //         setPlayAreaId(null);
    //       }
    //     }
  }, [playTime]);

  return (
    <Box
      position={"absolute"}
      width="100vw"
      display={"flex"}
      justifyContent="center"
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
      onMouseMove={(event: any) => {
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
      }}
    >
      <Box
        position={"absolute"}
        top={0}
        left={0}
        zIndex={0}
        width={"100%"}
        height={"100%"}
        sx={{
          backgroundImage: "url(/bg1.webp)",
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
            backgroundImage: "url(/bg1.webp)",
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
            style={{
              height: section.height,
              width: trackWidth,
              background: section.color,
              position: "absolute",
              color: "white",
              borderRadius: "4px",
              boxShadow: `rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px`,
              backgroundImage: finalOverId
                ? `url('/${nameToSlug(finalOverId)}.png')`
                : "unset",
              backgroundSize: "cover",
            }}
            animate={{
              x: section.xPosition,
              y: top - section.negativeTop,
            }}
            ref={(ref) => {
              if (ref && playAreaId === section.id) {
                targetRef.current = ref;
              }
            }}
          >
            {playAreaId === section.id && <Typography>Throw</Typography>}
          </motion.div>
        ))}
        <Stack
          position={"absolute"}
          top={playheadHeight}
          width={trackWidth * numberOfTracks}
          height={"calc(100vh - 600px)"}
        >
          {!start && (
            <Button onClick={onStart} variant="contained" sx={{ zIndex: 9 }}>
              Start
            </Button>
          )}
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
          (
          <Typography align="center" position={"absolute"} zIndex={9}>
            {parseFloat((timer / 1000).toFixed(1)).toFixed(1)} - {playTime}
          </Typography>
          )
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
