import { PauseRounded, PlayArrow } from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Popover,
  Skeleton,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { collection } from "firebase/firestore";
import { useCollectionOnce } from "react-firebase-hooks/firestore";
import * as Tone from "tone";
import { getWidthByDuration, timeToSeconds } from "../helpers/audio";
import { db } from "../services/firebase.service";
// import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
// import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
// import RepeatRoundedIcon from "@mui/icons-material/RepeatRounded";
// import EqualizerRoundedIcon from "@mui/icons-material/EqualizerRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import { useGlobalState } from "../main";
import { useRef, useState } from "react";
import { useSession } from "../hooks/useSession";
import { getCoverCreatorAvatar } from "../helpers";
import VoiceModelDialog from "./VoiceModelDialog";
import { createRevoxProgressDoc } from "../services/db/revoxQueue.service";

export type Cover = {
  songName: string;
  vid: string;
  artistName: string;
  voices: {
    name: string;
    id: string;
    creatorName: string;
    creatorId: string;
    avatar: string;
  }[];
  img: string;
  createdInfo: { name: string; id: string; img: string };
  sections: { name: string; start: number }[];
  bpm: number;
  views: number;
  duration: number;
};

type Props = { uid?: string };

const Rows = ({ uid }: Props) => {
  const [collectionSnapshot] = useCollectionOnce(collection(db, "covers"));
  const {
    updateGlobalState,
    songId,
    initializeTone,
    isTonePlaying,
    stopPlayer,
    pausePlayer,
    playPlayer,
    voiceId,
    loading,
  } = useGlobalState();
  const [anchorEl, setAnchorEl] = useState<{
    elem: HTMLDivElement;
    idx: number;
  } | null>(null);
  const [sectionPopover, setSectionPopover] = useState<HTMLElement | null>(
    null
  );
  const [hoverSectionName, setHoverSectionName] = useState("");
  const [newAiCoverUrl, setNewAiCoverUrl] = useState("");
  const [newAiCoverContentUrl, setNewAiContentCoverUrl] = useState("");
  const [songLoading, setSongLoading] = useState(false);
  const [sectionsWidth, setSectionsWidth] = useState<number[]>([]);
  const { pushLog, setPrevSeconds, setStartLog } = useSession();
  const [userName, setUserName] = useState(() => {
    return window.localStorage.getItem("KAMU_USERNAME") || "";
  });
  const [started, setStarted] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const sectionsBarRef = useRef<HTMLDivElement | null>(null);
  // const [revoxInfo, setRevoxInfo] = useState<{
  //   coverDocId: string;
  //   creatorId: string;
  //   vocalsUrl: string;
  //   voiceModelUrl: string;
  //   voiceModelName: string;
  // }>();
  const [revoxSongInfo, setRevoxSongInfo] = useState<Cover | null>(null);
  const [successSnackbarMsg, setSuccessSnackbarMsg] = useState("");

  const handleClick = (event: React.MouseEvent<HTMLDivElement>, i: number) => {
    setAnchorEl({ elem: event.currentTarget, idx: i });
  };
  const onSongClick = async (_id: string, endTime: number) => {
    setSongLoading(true);
    const cover = collectionSnapshot?.docs.find((c) => c.id === _id);
    const coverDoc = cover?.data() as Cover;
    const voice_id = coverDoc.voices[0].id;
    const _instrUrl = `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers%2F${_id}%2Fno_vocals.mp3?alt=media`;
    //   const firstVoice = (artistsObj as any)[songId].voices[0].id;
    const _audioUrl = `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers%2F${_id}%2F${voice_id}.mp3?alt=media`;
    // setVoice("");
    // setSongId(_id);
    pushLog(endTime);
    // await playAudio(_instrUrl, _audioUrl, true);
    // if (globalStateHook?.updateGlobalState) {
    if (coverDoc) {
      await updateGlobalState({
        songImg: coverDoc.img,
        songName: coverDoc.songName,
        songInstrUrl: _instrUrl,
        coverVocalsUrl: _audioUrl,
        fromStart: true,
        voices: coverDoc.voices,
        songId: _id,
        bpm: coverDoc.bpm,
        voiceId: voice_id,
      });
      // }
      // const differences = [];
      const differences = coverDoc.sections.map(
        (s, i, arr) => (arr[i + 1]?.start || 20) - s.start
      );
      const durations = getWidthByDuration(
        differences,
        sectionsBarRef.current?.offsetWidth || 500
      );
      setSectionsWidth(durations);
      setStartLog({
        song: coverDoc.songName,
        voice: coverDoc.artistName,
        start: 0,
        end: 0,
        userName,
      });
    }
    setPrevSeconds(0);
    setSongLoading(false);
  };

  const onVoiceChange = async (_voiceId: string, artistName: string) => {
    setVoiceLoading(true);
    const _instrUrl = `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers%2F${songId}%2Fno_vocals.mp3?alt=media`;
    const _audioUrl = `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers%2F${songId}%2F${_voiceId}.mp3?alt=media`;
    // setVoice(_voiceId);
    // await playAudio(_instrUrl, _audioUrl);
    // if (globalStateHook?.updateGlobalState) {
    const cover = collectionSnapshot?.docs.find((c) => c.id === songId);
    const coverDoc = cover?.data() as Cover;
    if (coverDoc) {
      await updateGlobalState({
        songImg: coverDoc.img,
        songName: coverDoc.songName,
        songInstrUrl: _instrUrl,
        coverVocalsUrl: _audioUrl,
        fromStart: false,
        voices: coverDoc.voices,
        songId,
        voiceId: _voiceId,
        bpm: coverDoc.bpm,
      });
      // }
      pushLog(Math.round(Tone.Transport.seconds));
      setStartLog({
        song: coverDoc.songName,
        voice: artistName,
        start: Math.round(Tone.Transport.seconds),
        end: 0,
        userName,
      });
    }
    setVoiceLoading(false);
  };

  const onRevoxSubmit = async (
    voiceModelUrl: string,
    voiceModelName: string
  ) => {
    if (uid && collectionSnapshot) {
      const docInfo = collectionSnapshot.docs.find((d) => d.id === songId);
      if (docInfo) {
        const coverDoc = docInfo.data() as Cover;
        const voiceInfo = coverDoc.voices.find((v) => v.id === voiceId);
        if (voiceInfo) {
          const progressDocId = await createRevoxProgressDoc({
            coverDocId: songId,
            uid,
            voiceModelName,
            voiceModelUrl,
            isComplete: false,
            songName: coverDoc.songName,
          });
          setSuccessSnackbarMsg("Submitted the voice model for Revoxing");
          axios.post(`${import.meta.env.VITE_VOX_COVER_SERVER}/revox`, {
            progress_doc_id: progressDocId,
            cover_doc_id: songId,
            voice_model_url: voiceModelUrl,
            voice_model_name: voiceModelName,
            uid,
          });
          setRevoxSongInfo(null);
        }
      }
    }
  };

  if (collectionSnapshot?.size)
    // return (
    //   <Stack>
    //     {collectionSnapshot.docs.map((d) => (
    //       <Box key={d.id}>
    //         <Typography>
    //           {d.id} - {(d.data() as any).songName} -{" "}
    //           {(d.data() as any).voices.map((v: any) => (
    //             <Typography>{v.id}</Typography>
    //           ))}
    //         </Typography>
    //       </Box>
    //     ))}
    //   </Stack>
    // );
    return (
      <Stack gap={2} py={2} width="100%">
        {collectionSnapshot?.docs.map((doc, i) => {
          const id = doc.id;
          const coverDoc = doc.data() as Cover;
          return (
            <Box key={id} display="flex" alignItems={"center"} gap={2}>
              <Box display={"flex"} alignItems="center">
                <IconButton
                  // disabled={loading || voiceLoading}
                  onClick={async () => {
                    // createVoiceDoc();
                    const endTime = Math.round(Tone.Transport.seconds);
                    if (isTonePlaying && id === songId) {
                      pausePlayer();
                    } else if (id === songId) {
                      playPlayer();
                    } else {
                      if (!started) {
                        await initializeTone();
                        setStarted(true);
                      }
                      if (isTonePlaying) {
                        stopPlayer();
                      }
                      //   setSongId(id);
                      onSongClick(id, endTime);
                    }
                  }}
                >
                  {loading && id === songId ? (
                    <CircularProgress size={"24px"} color="secondary" />
                  ) : isTonePlaying && id === songId ? (
                    <PauseRounded />
                  ) : (
                    <PlayArrow />
                  )}
                </IconButton>
              </Box>
              <Avatar
                src={getCoverCreatorAvatar(
                  coverDoc.voices[0].creatorId,
                  coverDoc.voices[0].avatar
                )}
                onMouseEnter={(e) => handleClick(e, i)}
                // onMouseLeave={handleClose}
              />
              {/* <Popover
                open={!!anchorEl && i === anchorEl.idx}
                anchorEl={anchorEl?.elem}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                disableRestoreFocus
                // sx={{
                //   pointerEvents: "none",
                // }}
              >
                <Box p={2} onMouseLeave={handleClose}>
                  <Stack gap={2}>
                    <Box display={"flex"} gap={2} width="400px">
                      <Avatar
                        sizes="10px"
                        src={`https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/lens_profiles%2F${coverDoc.createdInfo.id}.webp?alt=media`}
                      />
                      <Typography variant="caption">
                        <Typography
                          component={"a"}
                          color="#8973F8"
                          sx={{ textDecoration: "underline", mr: 1 }}
                        >
                          {coverDoc.createdInfo.name}
                        </Typography>
                        shared "{coverDoc.songName}" on Mon, Mar 25th 2014 with{" "}
                        <Typography
                          component={"a"}
                          color="#8973F8"
                          sx={{ textDecoration: "underline", mr: 1 }}
                        >
                          {coverDoc.voices[0].name}
                        </Typography>
                      </Typography>
                    </Box>
                    <Box display={"flex"} gap={2} alignItems="center">
                      <IconButton size="small">
                        <FavoriteBorderRoundedIcon sx={{ fontSize: "18px" }} />
                      </IconButton>
                      <IconButton size="small">
                        <ChatBubbleOutlineOutlinedIcon
                          sx={{ fontSize: "18px" }}
                        />
                      </IconButton>
                      <IconButton size="small">
                        <RepeatRoundedIcon sx={{ fontSize: "18px" }} />
                      </IconButton>
                      <Box display={"flex"} gap={0.5} alignItems="center">
                        <IconButton size="small">
                          <EqualizerRoundedIcon sx={{ fontSize: "18px" }} />
                        </IconButton>
                        <Typography variant="caption">
                          {coverDoc.views}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              </Popover> */}
              <Stack gap={1} width="100%">
                <Box display={"flex"} alignItems="center" gap={2}>
                  <Stack>
                    <Typography
                      variant="caption"
                      color={
                        voiceId === coverDoc.voices[0].id && songId === id
                          ? "#8973F8"
                          : "#fff"
                      }
                      component="a"
                      onClick={() =>
                        onVoiceChange(
                          coverDoc.voices[0].id,
                          coverDoc.voices[0].name
                        )
                      }
                    >
                      {coverDoc.voices[0].name}
                    </Typography>
                    <Typography>{coverDoc.songName}</Typography>
                  </Stack>
                  {songId === id && (
                    <Box
                      display={"flex"}
                      justifyContent="space-between"
                      flexGrow={1}
                    >
                      <Box
                        display={"flex"}
                        gap={2}
                        mx={2}
                        sx={{ overflowX: "auto" }}
                      >
                        {coverDoc.voices.slice(1).map((v, i) => (
                          <Chip
                            avatar={
                              <Avatar
                                src={getCoverCreatorAvatar(
                                  v.creatorId,
                                  v.avatar
                                )}
                              />
                            }
                            disabled={loading || voiceLoading}
                            key={v.name}
                            label={v.name}
                            variant={voiceId === v.id ? "outlined" : "filled"}
                            color={voiceId === v.id ? "info" : "default"}
                            clickable
                            onClick={() => {
                              onVoiceChange(v.id, v.name);
                              //   setVoice(v.id);
                            }}
                          />
                        ))}
                      </Box>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => setRevoxSongInfo(coverDoc)}
                        disabled={!uid}
                      >
                        Revox
                      </Button>
                    </Box>
                  )}
                </Box>
                <Box
                  display={"flex"}
                  alignItems="center"
                  width={"100%"}
                  ref={sectionsBarRef}
                >
                  {!songLoading &&
                    songId === id &&
                    coverDoc.sections.map((section, i) => (
                      <Button
                        disabled={loading || voiceLoading}
                        key={section.start}
                        // p={0.85}
                        variant="contained"
                        color="info"
                        sx={{
                          mr: 0.5,
                          minWidth: 0,
                          width: sectionsWidth[i],
                          // width: coverDoc.sections[i + 1]
                          //   ? `${
                          //       (timeToSeconds(
                          //         coverDoc.sections[i + 1].start.toString()
                          //       ) -
                          //         timeToSeconds(
                          //           coverDoc.sections[i].start.toString()
                          //         )) *
                          //       3
                          //     }px`
                          //   : "100px",
                          transition: "transform 0.3s ease",
                          ":hover": {
                            zIndex: 999,
                            transform: "scale(1.5)",
                            background: "#563FC8",
                          },
                        }}
                        onClick={() => {
                          Tone.Transport.seconds = timeToSeconds(
                            section.start.toString()
                          );
                          if (!isTonePlaying) playPlayer();
                        }}
                        onMouseEnter={(e) => {
                          setSectionPopover(e.currentTarget);
                          setHoverSectionName(section.name);
                        }}
                        onMouseLeave={() => {
                          setSectionPopover(null);
                        }}
                      />
                    ))}
                </Box>
                <Popover
                  open={!!sectionPopover}
                  anchorEl={sectionPopover}
                  onClose={() => setSectionPopover(null)}
                  onMouseLeave={() => setSectionPopover(null)}
                  anchorOrigin={{ vertical: 35, horizontal: "center" }}
                  transformOrigin={{
                    vertical: 85,
                    horizontal: "center",
                  }}
                  sx={{
                    pointerEvents: "none",
                  }}
                  disableRestoreFocus
                >
                  <Typography px={2} py={1} textTransform="capitalize">
                    {hoverSectionName}
                  </Typography>
                </Popover>
              </Stack>
            </Box>
          );
        })}
        <Box display={"flex"} gap={2} alignItems="center">
          <IconButton>
            <AddCircleOutlineRoundedIcon />
          </IconButton>
          <TextField
            fullWidth
            placeholder="Add your AI Cover to this Playlist, Youtube or weights.gg url goes here"
            sx={{ transition: "1s width" }}
            onChange={(e) => setNewAiCoverUrl(e.target.value)}
          />
          <Button
            variant="contained"
            disabled={!newAiCoverUrl}
            onClick={async () => {
              const res = await axios.get(newAiCoverUrl);
              const url = URL.createObjectURL(res.data);
              setNewAiContentCoverUrl(url);
            }}
          >
            Save
          </Button>
        </Box>
        {newAiCoverUrl && (
          <audio controls>
            <source src={newAiCoverUrl} type="audio/mpeg"></source>
          </audio>
        )}
        {revoxSongInfo && (
          <VoiceModelDialog
            onClose={() => setRevoxSongInfo(null)}
            songInfo={revoxSongInfo}
            onSubmit={onRevoxSubmit}
          />
        )}
        <Snackbar
          open={!!successSnackbarMsg}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSuccessSnackbarMsg("")}
            severity="success"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {successSnackbarMsg}
          </Alert>
        </Snackbar>
      </Stack>
    );
  return (
    <Stack gap={2} py={2}>
      <Skeleton variant="rectangular" animation="wave" sx={{ p: 2.5 }} />
      <Skeleton variant="rectangular" animation="wave" sx={{ p: 2.5 }} />
      <Skeleton variant="rectangular" animation="wave" sx={{ p: 2.5 }} />
      <Skeleton variant="rectangular" animation="wave" sx={{ p: 2.5 }} />
      <Skeleton variant="rectangular" animation="wave" sx={{ p: 2.5 }} />
      <Skeleton variant="rectangular" animation="wave" sx={{ p: 2.5 }} />
    </Stack>
  );
};

export default Rows;
