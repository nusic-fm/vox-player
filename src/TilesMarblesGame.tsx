import { motion, useAnimation } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { calculatePositions, createRandomNumber } from "./helpers";
import { useTonejs } from "./hooks/useToneService";
import Marbles from "./Marbles";
import SectionsFalling from "./Tiles";
import "./index.css";
import { CoverV1, getCoverDocById } from "./services/db/coversV1.service";
import {
  Box,
  Dialog,
  DialogContent,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import theme from "./theme";

export type SectionsWithDuration = {
  start: number;
  duration: number;
};

const motionButton = {
  rest: { scale: 1 },
  hover: { scale: 1.1 },
  pressed: { scale: 0.95 },
};

const TilesMarblesGame = () => {
  const controls = useAnimation();
  const ballRef = useRef<{ [id: string]: any }>({});
  const [initialObj, setInitialObj] = useState<{
    [key: string]: { x: number; y: number };
  }>({});
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
  const [coverDocId, setCoverDocId] = useState<string | null>(
    "ByE2N5MsLcSYpUR8s6a3"
  );
  const [coverDoc, setCoverDoc] = useState<CoverV1 | null>(null);
  const [startOffset, setStartOffset] = useState(0);
  const [sectionsWithDuration, setSectionsWithDuration] = useState<
    SectionsWithDuration[]
  >([]);
  const [playheadHeight, setPlayHeadHeight] = useState(
    Math.floor(window.innerHeight * 0.65)
  );
  const isMobileView = useMediaQuery(theme.breakpoints.down("md"));
  const [numberOfTracks, setNumberOfTracks] = useState(6);
  const [trackWidth, setTrackWidth] = useState(
    isMobileView ? Math.floor((window.innerWidth - 10) / 6) : 80
  );
  const [beatsRange, setBeatsRange] = useState([2, 8]);
  const [startSection, setStartSection] = useState(0);
  const [hitMode, setHitMode] = useState<0 | 1>(0);

  const fetchCoverDoc = async (_coverId: string) => {
    const doc = await getCoverDocById(_coverId);
    if (!doc) return;
    // let userName = "NUSIC User";
    // if (_uid) {
    //   const user = await getUserById(_uid);
    //   userName = user.name;
    // }
    setCoverDoc(doc);
    const obj: { [key: string]: { x: number; y: number } } = {};
    const positions = calculatePositions(
      window.innerWidth,
      window.innerHeight,
      trackWidth * numberOfTracks,
      doc.voices.length
    );
    doc.voices
      .map((v) => v.name)
      .map((v, i) => {
        obj[v] = positions[i];
      });
    setInitialObj(obj);
  };

  useEffect(() => {
    if (coverDoc?.sections) {
      // const durations = doc.sections?.map((s, i, arr) => ({
      //   start: s.start,
      //   duration: (arr[i + 1]?.start || doc.duration) - s.start,
      // }));
      // const minBars = doc.bpm > 140 ? 6 : doc.bpm > 100 ? 4 : 2;
      // const maxBars = doc.bpm > 140 ? 8 : doc.bpm > 100 ? 6 : 4;
      const minBeats = beatsRange[0];
      const maxBeats = beatsRange[1];
      const beatDuration = 60 / coverDoc.bpm;
      // const barDuration = beatDuration * 4;
      let start = coverDoc.sections[startSection].start;
      const durations = [];
      while (start < coverDoc.duration) {
        const randomNo = createRandomNumber(minBeats, maxBeats);
        const duration = parseFloat((beatDuration * randomNo).toFixed(2));
        durations.push({
          start,
          duration,
        });
        start += duration;
      }
      if (durations) setSectionsWithDuration(durations);
      setStartOffset(coverDoc.sections[startSection].start);
    }
  }, [coverDoc, beatsRange, startSection]);

  useEffect(() => {
    if (location.search) {
      const searchParams = new URLSearchParams(location.search);
      const _coverId = searchParams.get("coverId");
      const _uid = searchParams.get("uid");
      if (_coverId) {
        setCoverDocId(_coverId);
        console.log("Cover:", _coverId);
        // window.history.replaceState(null, "", window.location.origin);
        // location.search = "";
      }
    }
  }, [location.search]);
  useEffect(() => {
    if (coverDocId) {
      fetchCoverDoc(coverDocId);
    }
  }, [coverDocId]);

  useEffect(() => {
    if (!downloadStartedRef.current && coverDoc && coverDocId) {
      downloadStartedRef.current = true;
      (async () => {
        setIsDownloading(true);
        await downloadAudioFiles([
          `https://voxaudio.nusic.fm/covers/${coverDocId}/instrumental.mp3`,
          ...coverDoc.voices
            .map((v) => v.id)
            .map(
              (id) => `https://voxaudio.nusic.fm/covers/${coverDocId}/${id}.mp3`
            ),
        ]);
        setIsDownloading(false);
      })();
    }
  }, [coverDoc]);

  const onMouseDown = (id: string) => {
    setMouseDownId((prevId) => {
      if (prevId) {
        return prevId;
      }
      return id;
    });
  };

  if (!coverDoc || !coverDocId) {
    return (
      <Dialog open>
        <DialogContent>
          <TextField
            label="Cover ID"
            value={coverDocId}
            onChange={(e) => setCoverDocId(e.target.value)}
          ></TextField>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <SectionsFalling
        mouseDownId={mouseDownId}
        controls={controls}
        initialObj={initialObj}
        ballRef={ballRef}
        setMouseDownId={setMouseDownId}
        voices={coverDoc?.voices.map((v) => v.name)}
        finalOverIdState={[finalOverId, setFinalOverId]}
        startInstrumental={async () => {
          return playAudioFromDownloadObj(
            coverDocId,
            coverDoc.voices.map((v) => v.name),
            coverDoc.bpm
          );
        }}
        tilesVoiceObjState={[tilesVoiceObj, setTilesVoiceObj]}
        changeVoice={playVoice}
        startOffset={startOffset}
        sectionsWithDuration={sectionsWithDuration}
        playheadHeight={playheadHeight}
        trackWidth={trackWidth}
        numberOfTracks={numberOfTracks}
        isStarted={start}
        hitMode={hitMode}
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
          voices={coverDoc?.voices.map((v) => v.name)}
          finalOverId={finalOverId}
        />
      )}
      <Box
        position={"absolute"}
        width="100vw"
        display={"flex"}
        justifyContent="center"
        sx={{ userSelect: "none" }}
      >
        <Stack
          position={"absolute"}
          top={playheadHeight}
          width={trackWidth * numberOfTracks + 10}
          height={`calc(100vh - ${playheadHeight}px)`}
        >
          {!start && (
            <motion.div
              style={{
                padding: "10px 20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "30px",
                background: "linear-gradient(45deg, #928dab, #7355f4, #928dab)",
                backgroundSize: "200% 200%",
                animation: !isDownloading
                  ? "gradient 2.5s ease infinite"
                  : "unset",
                zIndex: 9,
                borderTop: "2px solid",
                borderBottom: "2px solid",
              }}
              onClick={() => !isDownloading && setStart(true)}
              variants={motionButton}
              initial={!isDownloading ? "rest" : undefined}
              whileHover={!isDownloading ? "hover" : undefined}
              whileTap={!isDownloading ? "pressed" : undefined}
            >
              <Typography>
                {isDownloading ? "Downloading..." : "Play"}
              </Typography>
            </motion.div>
          )}
          {!start && (
            <Stack
              alignItems={"center"}
              justifyContent="center"
              mt={2}
              zIndex={9}
              gap={1}
            >
              <Box
                display={"flex"}
                justifyContent="space-between"
                gap={2}
                px={2}
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
              </Box>
              <Stack px={2} my={1}>
                <Box display={"flex"} gap={2} width="100%">
                  <TextField
                    size="small"
                    label="Min,Max Beats"
                    value={beatsRange.join(",")}
                    onChange={(e) => {
                      const [min, max] = e.target.value.split(",").map((v) => {
                        const n = parseInt(v);
                        return isNaN(n) ? 0 : n;
                      });
                      setBeatsRange([min, max]);
                    }}
                    color="secondary"
                  />
                  <TextField
                    size="small"
                    label="Start Section Idx"
                    type={"number"}
                    value={startSection}
                    autoComplete="off"
                    onChange={(e) => {
                      const newIdx = parseInt(e.target.value);
                      if (
                        coverDoc.sections?.length &&
                        newIdx >= 0 &&
                        newIdx < coverDoc.sections.length
                      ) {
                        setStartSection(newIdx);
                      }
                    }}
                    color="secondary"
                    helperText={`Track will start at ${
                      coverDoc?.sections?.at(startSection)?.start
                    }s`}
                    FormHelperTextProps={{
                      sx: { color: "yellow" },
                    }}
                  />
                </Box>
                {/* <FormControl size="small">
                  <InputLabel>Hit Mode</InputLabel>
                  <Select
                    label="Hit Mode"
                    sx={{ width: 120 }}
                    color="secondary"
                    value={hitMode}
                    onChange={(e) => setHitMode(e.target.value as 0 | 1)}
                  >
                    <MenuItem value={0}>Reverse</MenuItem>
                    <MenuItem value={1}>Front</MenuItem>
                  </Select>
                </FormControl> */}
              </Stack>
            </Stack>
          )}
          {!!coverDoc && (
            <Typography align="center" zIndex={9} my={1}>
              {coverDoc.title}
            </Typography>
          )}
          <Box
            width={"100%"}
            height={"100%"}
            sx={{
              background: "rgba(0,0,0,0.6)",
              borderTopRightRadius: 30,
              borderTopLeftRadius: 30,
            }}
            position="absolute"
            top={0}
            left={0}
            zIndex={0}
          />
        </Stack>
      </Box>
    </>
  );
};
export default TilesMarblesGame;
