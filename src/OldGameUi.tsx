import {
  Button,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Box } from "@mui/system";
import { motion, PanInfo } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router-dom";
import { createRandomNumber, nameToSlug } from "./helpers";
import { useTonejs } from "./hooks/useToneService";
import theme from "./theme";
import * as Tone from "tone";
type Props = {};

const reverseAnArray = (arr: any[]) => {
  return arr.slice().reverse();
};
const SectionBox = ({
  section,
  children,
  height,
  y,
  overId,
}: {
  height: number;
  y: any;
  overId: string | null;
  children: any;
  section: { name: string; start: number; duration: number; id: number };
}) => {
  return (
    <motion.div
      className="box"
      style={{
        height,
        width: 350,
        background: "white",
        borderRadius: 10,
        backgroundImage: overId ? `url('/${nameToSlug(overId)}.png')` : "unset",
        backgroundSize: "cover",
        display: "flex",
        alignItems: "end",
        justifyContent: "center",
        zIndex: 1,
      }}
      animate={{
        y,
      }}
      // transition={{ ease: "linear", duration: 0.1, y: { duration: 0.1 } }}
      // Transition Y linearly
      transition={{ ease: "linear", duration: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

const sections = [
  { name: "verse", start: 0, duration: 12.36, id: 1 },
  { name: "verse", start: 12.36, duration: 37.09 - 12.36, id: 2 },
  { name: "verse", start: 37.09, duration: 51.95 - 37.09, id: 3 },
  { name: "verse", start: 51.95, duration: 66.79 - 51.95, id: 4 },
  { name: "chorus", start: 66.79, duration: 86.57 - 66.79, id: 5 },
  { name: "end", start: 86.57, duration: 91.21 - 86.57, id: 6 },
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
  const [showPlayArea, setShowPlayArea] = useState(false);
  console.log("showPlayArea", showPlayArea);

  const [playTime, setPlayTime] = useState(0);

  useEffect(() => {
    if (playTime) {
      const section = sections.filter(
        (s, i) =>
          s.start - 2 < Tone.Transport.seconds &&
          s.start + 2 > Tone.Transport.seconds
      )[0];
      setShowPlayArea(!!section);
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
      setInterval(() => {
        setY((prev) => prev + pxPerMs * ms);
      }, ms);
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
    >
      {reverseAnArray(sections).map((section, index) => (
        <SectionBox
          key={index}
          height={section.duration * movingSpeed}
          y={y}
          overId={overId}
          section={section}
        >
          <Stack gap={0.5}>
            <Typography color={"green"} variant="h5" align="center">
              {section.id}
            </Typography>
            <Typography color={"red"}>
              Start At: {section.start} seconds
            </Typography>
            <Typography color={"blue"}>
              Duration: {section.duration.toFixed(2)} seconds
            </Typography>
            {start && showPlayArea && (
              <Box
                ref={(r) => (goalRef.current = r)}
                width={isMobileView ? 200 : 350}
                // width={350}
                height={isMobileView ? 100 : 200}
                // height={200}
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
                <Typography color={"red"}>Play Area</Typography>
              </Box>
            )}
          </Stack>
        </SectionBox>
      ))}
      <Box
        sx={{
          transform: `translateY(${constY}px)`,
          height: "100%",
          background: "rgba(0,0,0,0.5)",
        }}
      >
        <Divider />
      </Box>
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
    if (!draggable.current || !target.current) return;
    const draggableRect = draggable.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    return !(
      draggableRect.right < targetRect.left ||
      draggableRect.left > targetRect.right ||
      draggableRect.bottom < targetRect.top ||
      draggableRect.top > targetRect.bottom
    );
  };

  // useEffect(() => {
  //   if (finalOverId) {
  //     const coverDocId = "f0pmE4twBXnJmVrJzh18";
  //     const instrumental = `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers%2F${coverDocId}%2Finstrumental.mp3?alt=media`;
  //     const vocals = `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers%2F${coverDocId}%2F${finalOverId}.mp3?alt=media`;
  //     // connectVocals(vocals);
  //     setShowPlayArea(false);
  //     // playAudio(instrumental, vocals, 140, 223, false);
  //     // playAudio(instrumental, "", 140, 223);
  //     // connectVocals();
  //   }
  // }, [finalOverId]);

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

          // display: "flex",
          // alignItems: "end",
          // justifyContent: "center",
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
              setTimeout(() => {
                setFinalOverId(overIdRef.current);
                if (overIdRef.current) {
                  // Points
                }
                clearInterval(intrvl);
              }, 1000);
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
      {/* <Box
        position={"absolute"}
        top={isMobileView ? "47%" : "40%"}
        left={"50%"}
        sx={{ transform: "translate(-50%, -50%)", zIndex: 9999 }}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        {start && showPlayArea && (
          <Box
            ref={targetRef}
            width={isMobileView ? 200 : 350}
            height={isMobileView ? 100 : 200}
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
            <Typography color={"red"}>Play Area</Typography>
          </Box>
        )}
      </Box> */}
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
              // const coverDocId = "f0pmE4twBXnJmVrJzh18";
              // const instrumental = `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers%2F${coverDocId}%2Finstrumental.mp3?alt=media`;
              // // onlyInstrument(instrumental, 140);
              // console.log("Play Audio");
              // playAudio(
              //   instrumental,
              //   "https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers%2Ff0pmE4twBXnJmVrJzh18%2Ftrevor_gta-v.mp3?alt=media",
              //   97,
              //   91.32,
              //   true
              // );

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

export default GameUi;
