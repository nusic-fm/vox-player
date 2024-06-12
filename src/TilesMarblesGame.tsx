import { useAnimation } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { calculatePositions, createRandomNumber } from "./helpers";
import { useTonejs } from "./hooks/useToneService";
import Marbles from "./Marbles";
import SectionsFalling from "./Tiles";
import "./index.css";
import { CoverV1, getCoverDocById } from "./services/db/coversV1.service";
import { getUserById } from "./services/db/users.service";
import {
  Box,
  Dialog,
  DialogContent,
  Stack,
  TextField,
  useMediaQuery,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import theme from "./theme";

export type SectionsWithDuration = {
  start: number;
  duration: number;
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
    isMobileView ? Math.floor(window.innerWidth / 6) : 80
  );
  const [beatsRange, setBeatsRange] = useState([2, 8]);
  const [startSection, setStartSection] = useState(4);

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
        const duration = beatDuration * randomNo;
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
          width={trackWidth * numberOfTracks}
          height={`calc(100vh - ${playheadHeight}px)`}
        >
          {!start && (
            <LoadingButton
              loading={isDownloading}
              onClick={() => setStart(true)}
              variant="contained"
              color="info"
              sx={{
                zIndex: 9,
                borderTop: "2px solid",
                borderBottom: "2px solid",
                borderRadius: 0,
              }}
            >
              Start
            </LoadingButton>
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
              <TextField
                size="small"
                label="Min Beats, Max Beats"
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
                onChange={(e) => setStartSection(parseInt(e.target.value))}
                color="secondary"
                helperText={`Track will start at ${
                  coverDoc?.sections?.at(startSection)?.start
                }s`}
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
    </>
  );
};
export default TilesMarblesGame;
