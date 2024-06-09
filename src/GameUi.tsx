import {
  Button,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Box } from "@mui/system";
import {
  motion,
  PanInfo,
  useAnimation,
  useDragControls,
  useMotionValue,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { createRandomNumber, nameToSlug } from "./helpers";
import { useTonejs } from "./hooks/useToneService";
import theme from "./theme";
import * as Tone from "tone";
import Marbles from "./Marbles";

type Props = {};

const reverseAnArray = (arr: any[]) => {
  return arr.slice().reverse();
};
const sortArrayInRandomOrder = (arr: any[]) => {
  return arr.sort(() => Math.random() - 0.5);
};

const SectionBox = ({
  section,
  children,
  height,
  overId,
  fall,
}: {
  height: number;
  // y: any;
  overId: string | null;
  children: any;
  section: { name: string; start: number; duration: number; id: number };
  fall: boolean;
}) => {
  // y={-(section.duration * movingSpeed) + 400}
  const [y, setY] = useState(-(section.duration * movingSpeed));
  const [finalId, setFinalId] = useState<string | null>(null);

  useEffect(() => {
    if (fall) {
      // Go 400px in 4 seconds
      // const pxPerMs = 400 / 4000;
      // setInterval(() => {
      //   setY((prev) => prev + pxPerMs);
      // }, 4000);
      setY(-(section.duration * movingSpeed) + 600);
    }
  }, [fall]);

  useEffect(() => {
    if (overId) {
      setFinalId(overId);
    }
  }, [overId]);

  return (
    <motion.div
      className="box"
      style={{
        height,
        width: 100,
        background: "white",
        borderRadius: 10,
        backgroundImage: finalId
          ? `url('/${nameToSlug(finalId)}.png')`
          : "unset",
        backgroundSize: "cover",
        display: "flex",
        alignItems: "end",
        justifyContent: "center",
        zIndex: 1,
      }}
      initial={{
        y,
      }}
      animate={{
        y,
      }}
      // transition={{ ease: "linear", duration: 0.1, y: { duration: 0.1 } }}
      // Transition Y linearly
      transition={{ ease: "linear", duration: 6 }}
    >
      {children}
    </motion.div>
  );
};

const sections = [
  { name: "verse", start: 0, duration: 6.13, id: 1 },
  { name: "verse", start: 6.13, duration: 12.36 - 6.13, id: 2 },
  { name: "verse", start: 12.36, duration: 24.73 - 12.36, id: 3 },
  { name: "verse", start: 24.73, duration: 37.09 - 24.73, id: 4 },
  { name: "verse", start: 37.09, duration: 44.52 - 37.09, id: 5 },
  { name: "verse", start: 44.52, duration: 51.95 - 44.52, id: 6 },
  { name: "verse", start: 51.95, duration: 59.37 - 51.95, id: 7 },
  { name: "verse", start: 59.37, duration: 66.79 - 59.37, id: 8 },
  { name: "chorus", start: 66.79, duration: 76.67 - 66.79, id: 9 },
  { name: "chorus", start: 76.67, duration: 86.57 - 66.79, id: 10 },
  { name: "end", start: 86.57, duration: 91.21 - 86.57, id: 11 },
];

const movingSpeed = 20;
const ms = 100;
const pxPerMs = movingSpeed / 1000;

const Sections = ({
  overId,
  start,
  goalRef,
  isTonePlaying,
}: {
  overId: string | null;
  start: boolean;
  goalRef: any;
  isTonePlaying: boolean;
}) => {
  const isMobileView = useMediaQuery(theme.breakpoints.down("md"));
  const [sortedSections, setSortedSections] = useState(() =>
    sortArrayInRandomOrder(sections)
  );
  const [y, setY] = useState(() => {
    let newY = -sections.reduce(
      (acc, section) => acc + section.duration * movingSpeed,
      0
    );
    newY = newY + sections[0].duration * movingSpeed;
    return newY;
  });
  const [constY] = useState(() => {
    let newY = -sections.reduce(
      (acc, section) => acc + section.duration * movingSpeed,
      0
    );
    newY = newY + sections[0].duration * movingSpeed;
    return newY;
  });
  const [showPlayAreaName, setShowPlayAreaName] = useState<number | null>(1);

  const [playTime, setPlayTime] = useState(0);

  useEffect(() => {
    if (playTime) {
      const section = sections.filter(
        (s, i) =>
          s.start - 1 < Tone.Transport.seconds &&
          s.start + 2.5 > Tone.Transport.seconds
      )[0];
      if (section) {
        // setShowPlayArea(!!section);
        setShowPlayAreaName(section.id);
      } else {
        setShowPlayAreaName(null);
      }
    }
  }, [playTime]);

  useEffect(() => {
    if (isTonePlaying) {
      const intervalRef = setInterval(() => {
        setPlayTime(Tone.Transport.seconds);
      }, 50);
      return () => clearInterval(intervalRef);
    }
  }, [isTonePlaying]);

  useEffect(() => {
    if (start) {
      // setInterval(() => {
      //   // setY((prev) => prev + pxPerMs * ms);
      // }, ms);
    }
  }, [start]);

  return (
    <Box
      position={"absolute"}
      top={0}
      left={"50%"}
      sx={{ transform: "translateX(-50%)" }}
      mx={"auto"}
      height={"100%"}
      overflow={"hidden"}
      zIndex={99}
      display={"flex"}
      gap={1}
    >
      <Box
        position={"absolute"}
        top={"70%"}
        left={"50%"}
        sx={{ transform: "translate(-50%, -50%)" }}
      >
        <Typography>{playTime.toFixed(2)}</Typography>
      </Box>
      <Box
        position={"absolute"}
        top={600}
        left={"50%"}
        sx={{ transform: "translateX(-50%)", background: "green" }}
        padding={"2px"}
        width={"100%"}
      ></Box>
      <Box
        position={"absolute"}
        top={250}
        left={"50%"}
        sx={{ transform: "translateX(-50%)", background: "red" }}
        padding={"2px"}
        width={"100%"}
      ></Box>
      {sortedSections.map((section, index) => (
        <SectionBox
          key={index}
          height={section.duration * movingSpeed}
          fall={playTime > section.start && playTime < section.start + 4}
          overId={section.id === showPlayAreaName ? overId : null}
          section={section}
        >
          <Stack gap={0.5}>
            {/* <Typography color={"green"} variant="h5" align="center">
              {section.id}
            </Typography> */}
            {/* <Typography color={"red"}>{section.start}s</Typography> */}
            {/* <Typography color={"blue"}>
              D: {section.duration.toFixed(2)}s
            </Typography> */}
            {start && showPlayAreaName === section.id && (
              <Box display={"flex"} justifyContent={"center"}>
                <Box
                  ref={(r) => (goalRef.current = r)}
                  // width={isMobileView ? 200 : 150}
                  // width={350}
                  // height={isMobileView ? 100 : 100}
                  width={100}
                  height={80}
                  // border="1px solid #000"
                  // borderRadius={"12px"}
                  // position={"absolute"}
                  // top={"90%"}
                  // left={"50%"}
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  // boxShadow={"inset 0 0 14px 10px #dddddd"}
                  sx={{
                    // backgroundImage: overId ? `url('/${overId}.png')` : "unset",
                    // backgroundSize: "cover",
                    // transform: "translate(-50%, -50%)",
                    background: "rgba(0,0,0,0.2)",
                    borderTopLeftRadius: "12px",
                    borderTopRightRadius: "12px",
                  }}
                >
                  <Typography color={"#000"} variant="h6" align="center">
                    Throw at ME!
                  </Typography>
                </Box>
              </Box>
            )}
          </Stack>
        </SectionBox>
      ))}
    </Box>
  );
};
const voices = [
  "cardi-b",
  "morgan-freeman",
  "franklin-clinton_gta-v",
  "trevor_gta-v",
  "eric-cartman",
];
const GameUi = (props: Props) => {
  const [start, setStart] = useState(false);
  const constraintsRef = useRef(null);
  const targetRef = useRef(null);
  const [finalOverId, setFinalOverId] = useState<string | null>(null);
  const overIdRef = useRef<string | null>(null);
  const [dragId, setDragId] = useState<string>("");
  const { onlyInstrument, connectVocals, playAudio, isTonePlaying } =
    useTonejs();
  const controls = useAnimation();
  const [angleOne, setAngleOne] = useState({ x: 0, y: 0 });
  const [angleTwo, setAngleTwo] = useState({ x: 0, y: 0 });
  const ballRef = useRef<{ [id: string]: any }>({});
  const [throwObj, setThrowObj] = useState<{
    angle: number;
    divCenterX: number;
    divCenterY: number;
  }>({ angle: 0, divCenterX: 0, divCenterY: 0 });
  const [mouseDownId, setMouseDownId] = useState("");
  const [initialObj, setInitialObj] = useState(() => {
    const obj: { [key: string]: { x: number; y: number } } = {};
    voices.map((v, i) => {
      obj[v] = { x: 200 * (i + 1), y: 700 };
    });
    return obj;
  });

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

  useEffect(() => {
    if (finalOverId) {
      const coverDocId = "f0pmE4twBXnJmVrJzh18";
      const instrumental = `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers%2F${coverDocId}%2Finstrumental.mp3?alt=media`;
      const vocals = `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers%2F${coverDocId}%2F${finalOverId}.mp3?alt=media`;
      // connectVocals(vocals);
      // setShowPlayAreaName(null);
      playAudio(instrumental, vocals, 97, 91.32, false);
      // playAudio(instrumental, "", 140, 223);
      // connectVocals();
    }
  }, [finalOverId]);

  useEffect(() => {
    if (start) {
      const coverDocId = "f0pmE4twBXnJmVrJzh18";
      const instrumental = `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers%2F${coverDocId}%2Finstrumental.mp3?alt=media`;
      // onlyInstrument(instrumental, 140);
      console.log("Play Audio");
      playAudio(
        instrumental,
        "https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers%2Ff0pmE4twBXnJmVrJzh18%2Ftrevor_gta-v.mp3?alt=media",
        97,
        91.32,
        true
      );
    }
  }, [start]);
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
    // setAngleOne({ x: 0, y: 0 });
    // setAngleTwo({ x: 0, y: 0 });
    setTimeout(() => {
      controls.start({
        x: initialObj[mouseDownId].x,
        y: initialObj[mouseDownId].y,
        transition: { ease: "linear", duration: 0 },
      });
      setMouseDownId("");
    }, duration * 1000);
  };

  return (
    <Box
      onMouseUp={(event) => {
        if (!mouseDownId) return;
        let _mouseDownId = mouseDownId;
        handleThrow(throwObj.angle, throwObj.divCenterX, throwObj.divCenterY);
        const intrvl = setInterval(() => {
          if (isOverlapping(event.target, targetRef.current)) {
            overIdRef.current = _mouseDownId;
            setFinalOverId(_mouseDownId);
            clearInterval(intrvl);
          }
        }, 10);
        setTimeout(() => {
          clearInterval(intrvl);
        }, 1000);
      }}
      onMouseMove={(event: any) => {
        if (mouseDownId) {
          console.log(ballRef.current);
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

          console.log("Angle (radians):", angle);
          console.log("Angle (degrees):", angle * (180 / Math.PI));

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

          // Bouncing off the edge and coming back to the starting place
          // const parentRect = (
          //   constraintsRef.current as any
          // ).getBoundingClientRect();
          // const tanAngle = Math.tan(angle);
          // let edgeX: number;
          // let edgeY: number;
          // if (Math.abs(tanAngle) <= 1) {
          //   if (dx > 0) {
          //     edgeX = parentRect.right;
          //     edgeY = divCenterY + (parentRect.right - divCenterX) * tanAngle;
          //   } else {
          //     edgeX = parentRect.left;
          //     edgeY = divCenterY + (parentRect.left - divCenterX) * tanAngle;
          //   }
          // } else {
          //   if (dy > 0) {
          //     edgeY = parentRect.bottom;
          //     edgeX = divCenterX + (parentRect.bottom - divCenterY) / tanAngle;
          //   } else {
          //     edgeY = parentRect.top;
          //     edgeX = divCenterX + (parentRect.top - divCenterY) / tanAngle;
          //   }
          // }
          setThrowObj({
            angle,
            divCenterX,
            divCenterY,
          });
          // controls.start({
          //   x: next2X,
          //   y: next2Y,
          //   transition: { ease: "linear", duration: 1 },
          // });
        }
      }}
      height={"100vh"}
      width={"100vw"}
      sx={{
        backgroundColor: "#4158D0",
        backgroundImage:
          "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%);",
      }}
      position="relative"
      overflow={"hidden"}
    >
      {/* <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          boxSizing: "border-box",
          width: "100%",
          height: "100%",
          // margin: isMobileView ? "0px" : "100px",
          // width: isMobileView ? "100%" : "calc(100% - 200px)",
          // height: isMobileView ? "50%" : "50%",
          zIndex: 999999,
          // background: "rgba(0, 0, 0, 0.2)",
          // borderRadius: "8px",

          display: "flex",
          alignItems: "end",
          justifyContent: "center",
        }}
        ref={constraintsRef}
      >
        {[
          "cardi-b",
          "morgan-freeman",
          "franklin-clinton_gta-v",
          "trevor_gta-v",
          "eric-cartman",
        ].map((id, i) => (
          <motion.div
            key={id}
            initial={
              {
                // bottom: 0,
                // y: 200,
                // x: createRandomNumber(50, 1000),
              }
            }
            animate={{ opacity: overId === id ? 0 : 1 }}
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: `url('/${nameToSlug(id)}.png')`,
              backgroundSize: "cover",
            }}
            drag
            dragConstraints={constraintsRef}
            // onDrag={(e, info) => handleDrag(e, info, id)}
            dragElastic={0.1}
            // onDragStart={(event, info) => setDragId()}
            onDragEnd={(event, info) => {
              if (!start) return;
              // Retry and check overlapping for 2 seconds
              const intrvl = setInterval(() => {
                console.log(targetRef.current);
                if (isOverlapping(event.target, targetRef.current)) {
                  setOverId(id);
                  overIdRef.current = id;
                  setFinalOverId(id);
                  clearInterval(intrvl);
                }
                // else {
                //   overIdRef.current = null;
                //   setFinalOverId(null);
                //   setOverId(null);
                // }
              }, 10);
              // setTimeout(() => {
              //   setFinalOverId(overIdRef.current);
              //   if (overIdRef.current) {
              //     // Points
              //   }
              //   clearInterval(intrvl);
              // }, 1000);
            }}
          />
        ))}
      </motion.div> */}
      <Sections
        overId={finalOverId}
        start={start}
        goalRef={targetRef}
        isTonePlaying={isTonePlaying}
      />
      <Box
        position={"absolute"}
        top={"40%"}
        left={"50%"}
        sx={{ transform: "translate(-50%, -50%)", zIndex: 999999 }}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        {!start && (
          <Button
            sx={{ px: 10, py: 5 }}
            variant="contained"
            onClick={() => {
              setStart(true);
            }}
          >
            Start
          </Button>
        )}
      </Box>
      <Marbles
        angleOne={angleOne}
        angleTwo={angleTwo}
        ballRef={ballRef}
        controls={controls}
        initialObj={initialObj}
        mouseDownId={mouseDownId}
        onMouseDown={(e, id) => setMouseDownId(id)}
        voices={voices}
        finalOverId={finalOverId}
      />
      {/* {mouseDownId && <AngleDots x={angleOne.x} y={angleOne.y} />}
      {mouseDownId && <AngleDots x={angleTwo.x} y={angleTwo.y} />}
      {voices.map((id, i) => (
        // <Box
        //   key={id}
        //   sx={{
        //     "::after": {
        //       boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
        //       opacity: mouseDownId === id ? 1 : 0,
        //       // transition: opacity 0.3s ease-in-out;
        //     },
        //   }}
        // >
        <motion.div
          key={id}
          onMouseDown={(event: any) => {
            setMouseDownId(id);
          }}
          ref={(r) => {
            ballRef.current[id] = r;
          }}
          drag={false}
          dragConstraints={constraintsRef}
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            position: "absolute",
            background: `url('/${nameToSlug(id)}.png')`,
            backgroundSize: "cover",

            display: "flex",
            justifyContent: "center",
            alignItems: "center",

            cursor: "pointer",
            zIndex: 999999,
          }}
          initial={initialObj[id]}
          animate={mouseDownId === id ? controls : initialObj[id]}
          title="Press & Hold"
        />
        // </Box>
      ))} */}
    </Box>
  );
};
