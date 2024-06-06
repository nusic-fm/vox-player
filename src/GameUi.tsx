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

const AngleDots = ({ x, y }: { x: number; y: number }) => {
  return (
    <motion.div
      style={{
        position: "absolute",
        padding: 4,
        borderRadius: "50%",
        background: "#fff",
        left: x,
        top: y,
        zIndex: 9999999,
      }}
    />
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
      {/* <Box
        sx={{
          transform: `translateY(${constY}px)`,
          height: "100%",
          background: "rgba(0,0,0,0.5)",
        }}
      >
        <Divider />
      </Box> */}
    </Box>
  );
};

// const PlayArea = ({ isTonePlaying }: { isTonePlaying: boolean }) => {
//   const [playTime, setPlayTime] = useState(0);
//   useEffect(() => {
//     if (isTonePlaying) {
//       const intervalRef = setInterval(() => {
//         setPlayTime(Tone.Transport.seconds);
//       }, 50);
//       return () => clearInterval(intervalRef);
//     }
//   }, [isTonePlaying]);

//   return (
//     <Box
//       sx={{
//         position: "absolute",
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//       }}
//     >
//       {playTime}
//     </Box>
//   );
// };
const GameUi = (props: Props) => {
  const [start, setStart] = useState(false);
  const constraintsRef = useRef(null);
  const targetRef = useRef(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [finalOverId, setFinalOverId] = useState<string | null>(null);
  const overIdRef = useRef<string | null>(null);
  const [dragId, setDragId] = useState<string>("");
  const { onlyInstrument, connectVocals, playAudio, isTonePlaying } =
    useTonejs();

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

  return (
    <Box
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
      {/* <PlayArea isTonePlaying={isTonePlaying} /> */}
      <motion.div
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
      </motion.div>
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
    </Box>
  );
};

// const TestControls = () => {
//   const controls = useDragControls();
//   const x = useMotionValue(0);

//   const startDrag = (event: any) => {
//     // x.jump(500);
//     x.setWithVelocity(0, 500, 0);
//     // controls.start(event, { cursorProgress: 10 });
//   };

//   return (
//     <Box>
//       <Box onPointerDown={startDrag} sx={{ background: "red", p: 10 }}></Box>
//       <motion.div
//         style={{
//           width: 200,
//           height: 200,
//           background: "blue",
//           padding: "10px",
//           x,
//           // transition: "all 1s ease",
//         }}
//       />
//     </Box>
//   );
// };

// const ThrowingDiv = () => {
//   const [isThrown, setIsThrown] = useState(false);

//   // Coordinates for the target position
//   const targetX = 300; // target x position
//   const targetY = 200; // target y position

//   // Speed in pixels per second
//   const speed = 1000;

//   // Calculate the distance to the target
//   const distance = Math.sqrt(targetX ** 2 + targetY ** 2);

//   // Calculate the duration based on speed
//   const duration = distance / speed;

//   return (
//     <div>
//       <motion.div
//         drag
//         animate={isThrown ? { x: targetX, y: targetY } : { x: 0, y: 0 }}
//         transition={{ duration, ease: "linear" }}
//         style={{
//           width: 100,
//           height: 100,
//           backgroundColor: "red",
//           position: "absolute",
//           top: 100,
//           left: 200,
//         }}
//       />
//       <Button onClick={() => setIsThrown(!isThrown)}>
//         {isThrown ? "Reset" : "Throw"}
//       </Button>
//     </div>
//   );
// };

// export default ThrowingDiv;

const ThrowingDiv = () => {
  const controls = useAnimation();
  const constraintsRef = useRef(null);
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [angleOne, setAngleOne] = useState({ x: 0, y: 0 });
  const [angleTwo, setAngleTwo] = useState({ x: 0, y: 0 });

  const handleThrow = (angle: number) => {
    const speed = 1500; // pixels per second
    // const angle = Math.random() * 2 * Math.PI; // random direction
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;
    setVelocity({ x: velocityX, y: velocityY });

    controls.start({
      x: velocityX,
      y: velocityY,
      transition: { ease: "linear", duration: 1 },
    });
  };

  return (
    <div
      ref={constraintsRef}
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <AngleDots x={angleOne.x} y={angleOne.y} />
      <AngleDots x={angleTwo.x} y={angleTwo.y} />
      <motion.div
        drag={false}
        dragConstraints={constraintsRef}
        style={{
          width: 100,
          height: 100,
          backgroundColor: "red",
          borderRadius: "50%",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        onMouseMove={(e: any) => {
          // Get the x and y coordinates of the pointer
          const x = e.clientX;
          const y = e.clientY;
          // Calculate the distance from the pointer to the center of the circle
          const distanceX = x - e.target.getBoundingClientRect().x - 50;
          const distanceY = y - e.target.getBoundingClientRect().y - 50;
          // Calculate the angle of the throw which should point upwards
          let angle = Math.atan2(distanceX, distanceY);
          // Ensure the angle is within the range of 180 to 360 degrees (π to 2π in radians)
          if (angle < -Math.PI) {
            angle += 2 * Math.PI;
          } else if (angle < 0) {
            angle += Math.PI;
          } else if (angle > 0 && angle < Math.PI) {
            angle += Math.PI;
          }
          // Calculate the coordinates of the second point above the pointer using the angle
          const x2 = Math.cos(angle) * 100 + x;
          const y2 = Math.sin(angle) * 100 + y;
          const x3 = Math.cos(angle) * 200 + x;
          const y3 = Math.sin(angle) * 200 + y;
          // handleThrow(angle);
          setAngleOne({ x: x2, y: y2 });
          setAngleTwo({ x: x3, y: y3 });

          // Add some offset to create diagonal throw
          // const offsetX = Math.random() * 100;
          // const offsetY = Math.random() * 100;
          // // Calculate the distance from the pointer to the center of the circle
          // const distanceX =
          //   x - (e.target as any).getBoundingClientRect().x - 50 + offsetX;
          // const distanceY =
          //   y - (e.target as any).getBoundingClientRect().y - 50 + offsetY;
          // // Calculate the angle of the throw
          // const angle = Math.atan2(distanceY, distanceX);
          // // Calculate the speed based on the distance
          // const speed = Math.sqrt(distanceX ** 2 + distanceY ** 2) * 10;
          // // Calculate the velocity based on the angle and speed
          // const velocityX = Math.cos(angle) * speed;
          // const velocityY = Math.sin(angle) * speed;
          // // Set the velocity
          // setVelocity({ x: velocityX, y: velocityY });
          // // Start the throw animation
          // controls.start({
          //   x: `+=${velocityX}`,
          //   y: `+=${velocityY}`,
          //   transition: { ease: "linear", duration: 1 },
          // });
        }}
        onDrag={(event, info) => {
          console.log(info);
        }}
        animate={controls}
        // onDragEnd={(event, info) => {
        //   // Calculate the velocity based on the drag release
        //   const newVelocityX = info.velocity.x;
        //   const newVelocityY = info.velocity.y;
        //   setVelocity({ x: newVelocityX, y: newVelocityY });

        //   // Continue the throw based on the drag release velocity
        //   controls.start({
        //     x: `+=${newVelocityX}`,
        //     y: `+=${newVelocityY}`,
        //     transition: { ease: "linear", duration: 1 },
        //   });
        // }}
      />
      <button
        // onClick={handleThrow}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          padding: "10px 20px",
          fontSize: "16px",
        }}
      >
        Throw
      </button>
    </div>
  );
};

export default ThrowingDiv;
// To throw a `div` in a direction at a given speed with the drag property enabled and have it bounce back from the edges, you can use Framer Motion's `motion.div` along with the `drag`, `dragConstraints`, and `onDragEnd` properties. Additionally, you can use a custom animation to handle the "throw" effect.

// Here's an example implementation in a React component:

// ```jsx
// import { useState } from 'react';
// import { motion, useAnimation } from 'framer-motion';

// const ThrowingDiv = () => {
//   const controls = useAnimation();
//   const [isDragging, setIsDragging] = useState(false);

//   const speed = 500; // Speed in pixels per second
//   const direction = { x: 1, y: 1 }; // Direction vector (e.g., { x: 1, y: 1 } for bottom-right)

//   const throwDiv = () => {
//     const distance = speed; // Distance is speed for one second of movement
//     controls.start({
//       x: direction.x * distance,
//       y: direction.y * distance,
//       transition: {
//         duration: 1, // Move for one second
//         ease: 'linear',
//       },
//     });
//   };

//   return (
//     <div
//       style={{
//         width: '100vw',
//         height: '100vh',
//         position: 'relative',
//         overflow:
