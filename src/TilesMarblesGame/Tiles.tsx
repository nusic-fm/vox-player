import { Box, Typography } from "@mui/material";
import {
  animate,
  AnimationControls,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { createRandomNumber, formatDuration, nameToSlug } from "../helpers";
import * as Tone from "tone";
import { AngleDots } from "./Marbles";
import { SectionsWithDuration } from "./TilesMarblesGame";
import SportsScoreOutlinedIcon from "@mui/icons-material/SportsScoreOutlined";

const AnimateContent = ({
  newCount,
  total,
}: {
  newCount: number;
  total: number;
}) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, newCount);

    return () => controls.stop();
  }, [newCount]);

  return (
    <Typography display={"flex"}>
      <motion.div>{rounded}</motion.div>/{total}
    </Typography>
  );
};

const createLightColor = () => {
  return `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;
};

const createMultiplesOfNumber = (n: number, m: number) => {
  return new Array(n).fill(0).map((_, i) => i * m);
};
type SectionTile = {
  id: number;
  start: number;
  height: number;
  duration: number;
  color: string;
  xPosition: number;
  negativeTop: number;
};

const getTileHeights = (
  sectionsMeta: SectionsWithDuration[],
  pxPerSecond: number,
  width: number,
  noOfTracks: number
): SectionTile[] => {
  const heights = sectionsMeta.map((meta) => meta.duration * pxPerSecond);
  const positions = createMultiplesOfNumber(noOfTracks, width);
  let prevPosition: number = -1;
  const arr = sectionsMeta.map((meta, i) => {
    const newPositionIdx = createRandomNumber(0, noOfTracks - 1, prevPosition);
    let newPosition = positions[newPositionIdx];
    prevPosition = newPositionIdx;
    return {
      id: i + 1,
      start: meta.start,
      height: heights[i],
      duration: meta.duration,
      color: createLightColor(),
      xPosition:
        newPosition +
        (newPositionIdx === 0 || newPositionIdx === noOfTracks - 1 ? 5 : 0),
      negativeTop: i
        ? i === 1
          ? heights[i]
          : heights.slice(1, i + 1).reduce((a, b) => a + b)
        : 0,
    };
  });
  return arr;
};

// const sectionDurations = [2, 3, 2, 3, 4, 5, 6, 4, 2];

type Props = {
  mouseDownId: string;
  setMouseDownId: React.Dispatch<React.SetStateAction<string>>;
  voices: string[];
  initialObj: { [key: string]: { x: number; y: number } };
  controls: AnimationControls;
  ballRef: React.MutableRefObject<{
    [id: string]: any;
  }>;
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

  startOffset: number;
  sectionsWithDuration: SectionsWithDuration[];
  playheadHeight: number;
  trackWidth: number;
  numberOfTracks: number;
  isStarted: boolean;
  hitMode: 0 | 1;
};

const Tiles = ({
  mouseDownId,
  controls,
  initialObj,
  setMouseDownId,
  ballRef,
  finalOverIdState,
  startInstrumental,
  tilesVoiceObjState,
  changeVoice,
  startOffset,
  sectionsWithDuration,
  playheadHeight,
  trackWidth,
  numberOfTracks,
  isStarted,
  hitMode,
}: Props) => {
  const [waitTimeInSeconds, setWaitTimeInSeconds] = useState(5);
  const [pxPerSecondSpeed, setPxPerSecondSpeed] = useState(100);
  const [sections, setSections] = useState<SectionTile[]>([]);
  const [top, setTop] = useState(0);
  const [timerClock, setTimerClock] = useState(0);
  const [playTime, setPlayTime] = useState(0);
  const [throwObj, setThrowObj] = useState<{
    angle: number;
    divCenterX: number;
    divCenterY: number;
  }>({ angle: 0, divCenterX: 0, divCenterY: 0 });
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [playAreaId, setPlayAreaId] = useState<number>(1);
  const [finalOverId, setFinalOverId] = finalOverIdState;
  const [tilesVoiceObj, setTilesVoiceObj] = tilesVoiceObjState;
  // Quick reference to the playAreaId
  // const playAreaIdRef = useRef<number>(1);
  const [aimAngleObj, setAimAngleObj] = useState({
    top: { x: 0, y: 0 },
    middle: { x: 0, y: 0 },
    bottom: { x: 0, y: 0 },
  });
  const [currentHits, setCurrentHits] = useState(0);

  const onMouseUp = (event: MouseEvent | TouchEvent) => {
    if (!mouseDownId) return;
    setAimAngleObj({
      top: { x: 0, y: 0 },
      middle: { x: 0, y: 0 },
      bottom: { x: 0, y: 0 },
    });
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
      setAimAngleObj({
        top: { x: 0, y: 0 },
        middle: { x: 0, y: 0 },
        bottom: { x: 0, y: 0 },
      });
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
        setCurrentHits((prev) => prev + 1);
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
  const onMouseMove = (event: MouseEvent | TouchEvent) => {
    if (mouseDownId) {
      // event.preventDefault();
      event.stopPropagation();
      if (!ballRef.current[mouseDownId]) return;
      const divRect = (
        ballRef.current[mouseDownId] as any
      ).getBoundingClientRect();
      const divCenterX = divRect.left + divRect.width / 2;
      const divCenterY = divRect.top + divRect.height / 2;

      const mouseX =
        (event as MouseEvent).clientX ||
        (event as TouchEvent).touches[0].clientX;
      const mouseY =
        (event as MouseEvent).clientY ||
        (event as TouchEvent).touches[0].clientY;

      if (
        (hitMode === 0 && mouseY <= divCenterY) ||
        (hitMode === 1 && mouseY > divCenterY)
      ) {
        return;
      }

      const dx = hitMode === 0 ? divCenterX - mouseX : mouseX - divCenterX;
      const dy = hitMode === 0 ? divCenterY - mouseY : mouseY - divCenterY;
      const angle = Math.atan2(dy, dx);

      // Projection distance
      const distance = 50;
      const distance2 = 100;
      const distance3 = 150;

      // Next point coordinates
      const nextX = divCenterX + distance * Math.cos(angle);
      const nextY = divCenterY + distance * Math.sin(angle);
      const angleObj: any = {};
      angleObj.top = { x: nextX - 5, y: nextY - 5 };
      // setAngleOne({ x: nextX - 5, y: nextY - 5 });
      // Calculate angleTwo to be constrained within angleOne
      const next2X = mouseX + distance2 * Math.cos(angle);
      const next2Y = mouseY + distance2 * Math.sin(angle);
      if (next2Y > nextY - 10) {
        angleObj.middle = {
          x: divCenterX + (distance + 10) * Math.cos(angle) - 5,
          y: divCenterY + (distance + 10) * Math.sin(angle) - 5,
        };
        // setAngleTwo({
        //   x: divCenterX + (distance + 10) * Math.cos(angle) - 5,
        //   y: divCenterY + (distance + 10) * Math.sin(angle) - 5,
        // });
      } else {
        angleObj.middle = { x: next2X - 5, y: next2Y - 5 };
        // setAngleTwo({ x: next2X - 5, y: next2Y - 5 });
      }
      // Calculate angleTwo to be constrained within angleOne
      const next3X = mouseX + distance3 * Math.cos(angle);
      const next3Y = mouseY + distance3 * Math.sin(angle);
      if (next3Y > nextY - 20) {
        angleObj.bottom = {
          x: divCenterX + (distance + 20) * Math.cos(angle) - 5,
          y: divCenterY + (distance + 20) * Math.sin(angle) - 5,
        };
        // setAngleThree({
        //   x: divCenterX + (distance + 20) * Math.cos(angle) - 5,
        //   y: divCenterY + (distance + 20) * Math.sin(angle) - 5,
        // });
      } else {
        angleObj.bottom = { x: next3X - 5, y: next3Y - 5 };
        // setAngleThree({ x: next3X - 5, y: next3Y - 5 });
      }
      setAimAngleObj(angleObj);
      setThrowObj({
        angle,
        divCenterX,
        divCenterY,
      });
    }
  };
  useEffect(() => {
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchend", onMouseUp);
    return () => {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchend", onMouseUp);
    };
  }, [mouseDownId, throwObj, playAreaId]);
  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onMouseMove);
    };
  }, [mouseDownId]);

  useEffect(() => {
    if (isStarted) {
      const _sections = getTileHeights(
        sectionsWithDuration,
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
  }, [isStarted]);

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
      const section = sections.find((s) => playTime < s.start);
      if (section) {
        if (tilesVoiceObj[section.id]) {
          const findOneWithoutVoice = sections
            .slice(section.id)
            .find((s) => !tilesVoiceObj[s.id]);
          if (findOneWithoutVoice) {
            setPlayAreaId(findOneWithoutVoice.id);
          }
        } else if (playTime || Object.keys(tilesVoiceObj).length) {
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
      }
    }
  }, [timerClock]);

  return (
    <>
      {mouseDownId && <AngleDots x={aimAngleObj.top.x} y={aimAngleObj.top.y} />}
      {mouseDownId && (
        <AngleDots x={aimAngleObj.middle.x} y={aimAngleObj.middle.y} />
      )}
      {mouseDownId && (
        <AngleDots x={aimAngleObj.bottom.x} y={aimAngleObj.bottom.y} />
      )}
      <Box
        position={"absolute"}
        width="100vw"
        display={"flex"}
        justifyContent="center"
        sx={{ userSelect: "none" }}
      >
        <Box
          position={"absolute"}
          top={0}
          left={0}
          width="100%"
          display={"flex"}
          justifyContent="center"
          zIndex={9}
        >
          <Box
            width={trackWidth * numberOfTracks + 10}
            display="flex"
            bgcolor={"rgba(0,0,0,0.25)"}
            p={1}
          >
            <Typography sx={{ ml: "auto" }}>
              {playTime
                ? formatDuration(playTime)
                : (-(timerClock / 1000 - 5)).toFixed(0)}
            </Typography>
            <Box ml={"auto"} display="flex" alignItems={"center"}>
              <SportsScoreOutlinedIcon fontSize="small" />
              <AnimateContent newCount={currentHits} total={sections.length} />
            </Box>
          </Box>
        </Box>
        <Box
          position={"absolute"}
          top={0}
          left={0}
          zIndex={0}
          width={"100%"}
          height={"100%"}
          sx={{
            backgroundImage: "url(/bg.webp)",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "blur(80px)",
            backgroundSize: "cover",
            opacity: 0.5,
            overflow: "hidden",
          }}
        ></Box>
        <Box
          sx={{
            overflow: "hidden",
            boxShadow: "0 10px 20px -5px rgba(0,0,0,0.3)",
          }}
          position="relative"
          height={"100vh"}
          width={trackWidth * numberOfTracks + 10}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage: "url(/bg.webp)",
              backgroundPosition: "center",
              // backgroundRepeat: "no-repeat",
              // filter: "blur(80px)",
              backgroundSize: "cover",
              // opacity: 0.5,
            }}
          ></Box>
          {sections.map((section, i) => {
            let backgroundObj: any;
            if (tilesVoiceObj[section.id]) {
              // backgroundObj = {
              //   backgroundImage: `url(https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/voice_models%2Favatars%2Fthumbs%2F${nameToSlug(
              //     tilesVoiceObj[section.id]
              //   )}_200x200?alt=media)`,
              //   backgroundPosition: "center",
              //   backgroundSize: "cover",
              //   border: "3px solid",
              //   animation: "hitEffect 0.5s ease",
              // };
              backgroundObj = {};
            } else if (section.id === playAreaId) {
              backgroundObj = {
                background: "linear-gradient(45deg, #7355f4, #dcd0ff, #928dab)",
                boxShadow:
                  "0 4px 15px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.3)",
                // transition: "boxShadow 0.3s",1
                backgroundSize: "200% 200%",
                animation:
                  "gradient 3s ease infinite, glow 1s infinite alternate",
              };
            } else {
              backgroundObj = {
                backgroundColor: "transparent",
                border: "3px solid",
              };
            }

            return (
              <motion.div
                key={i}
                id={section.id.toString()}
                style={{
                  height: section.height,
                  width: trackWidth,
                  borderRadius: "25px",
                  // backgroundColor:
                  //   playAreaId === section.id ? "#8973F8" : `transparent`,

                  position: "absolute",
                  color: "white",
                  // backgroundImage: !!tilesVoiceObj[section.id]
                  //   ? `url(https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/voice_models%2Favatars%2Fthumbs%2F${nameToSlug(
                  //       tilesVoiceObj[section.id]
                  //     )}_200x200?alt=media)`
                  //   : "unset",
                  ...backgroundObj,
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
                {tilesVoiceObj[section.id] && (
                  <Box
                    ref={targetRef}
                    position={"absolute"}
                    top={0}
                    left={0}
                    width={"100%"}
                    height={"100%"}
                    style={{
                      borderRadius: "25px",
                      backgroundImage: `url(https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/voice_models%2Favatars%2Fthumbs%2F${nameToSlug(
                        tilesVoiceObj[section.id]
                      )}_200x200?alt=media)`,
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                      border: "3px solid",
                      animation: "hitEffect 0.5s ease",
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </Box>
      </Box>
    </>
  );
};
export default Tiles;
