import {
  Alert,
  Avatar,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Skeleton,
  Snackbar,
  Stack,
  TextField,
  Typography,
  ListItemAvatar,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  CardActionArea,
  CardContent,
  Card,
  Select,
  Fab,
  Dialog,
  DialogContent,
  Chip,
  CardMedia,
} from "@mui/material";
import { Box, useMediaQuery } from "@mui/system";
import axios from "axios";
import {
  collection,
  DocumentData,
  limit,
  orderBy,
  query,
  QuerySnapshot,
  where,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import * as Tone from "tone";
import { getWidthByDuration, timeToSeconds } from "../helpers/audio";
import {
  db,
  // logFirebaseEvent,
  remoteConfig,
} from "../services/firebase.service";
// import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
// import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
// import RepeatRoundedIcon from "@mui/icons-material/RepeatRounded";
// import EqualizerRoundedIcon from "@mui/icons-material/EqualizerRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import { useGlobalState } from "../main";
import { useEffect, useRef, useState } from "react";
import { useSession } from "../hooks/useSession";
import {
  getDiscordLoginUrl,
  getUserAvatar,
  // timestampToDateString,
  getYouTubeVideoId,
  nameToSlug,
} from "../helpers";
import VoiceModelDialog from "./VoiceModelDialog";
// import { createRevoxProgressDoc } from "../services/db/revoxQueue.service";
import { LoadingButton } from "@mui/lab";
import CoverInfoDialog from "./CoverInfoDialog";
// import { PreCover } from "../services/db/preCovers.service";
import { getUserById, User } from "../services/db/users.service";
import {
  addCommentToCover,
  checkIfYoutubeVideoIdExists,
  CoverV1,
  getCoverDocById,
  VoiceV1Cover,
} from "../services/db/coversV1.service";
import {
  createRevoxProgressDoc,
  RevoxProcessTypeDoc,
} from "../services/db/revoxQueue.service";
import Header from "./Header";
import SimpleAudioProgress from "./SimpleAudioProgress";
import VoiceChips from "./VoiceChips";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CommentsArea from "./CommentsArea";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import { useLocation } from "react-router-dom";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import FileUploadRoundedIcon from "@mui/icons-material/FileUploadRounded";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SportsEsportsOutlinedIcon from "@mui/icons-material/SportsEsportsOutlined";
import { motion } from "framer-motion";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

export type YTP_CONTENT = {
  title: string;
  channelId: string;
  channelTitle: string;
  channelThumbnail: string;
  videoThumbnail: string;
  videoDescription: string;
  channelDescription: string;
  vid: string;
  url: string;
};

type Props = {
  user?: User;
  tempUserId?: string;
  onUserChange: (uid: string) => Promise<void>;
};

const getRowsQuery = (recordsLimit: number, isLatest: boolean) => {
  if (isLatest) {
    return query(
      collection(db, "covers"),
      orderBy("createdAt", "desc"),
      where("audioUrl", "!=", ""),
      limit(recordsLimit)
    );
  } else {
    return query(
      collection(db, "covers"),
      orderBy("rank", "asc"),
      where("audioUrl", "!=", ""),
      orderBy("playCount", "desc"),
      limit(recordsLimit)
    );
  }
};

const Rows = ({ user, tempUserId, onUserChange }: Props) => {
  const [recordsLimit, setRecordsLimit] = useState(15);
  // TODO: Queried cover needs to show at the end of the chart
  const [queriedCover, setQueriedCover] = useState<CoverV1 | null>(null);
  const [isLatest, setIsLatest] = useState(false);
  const [coversCollectionSnapshot, coversLoading, error] = useCollection(
    getRowsQuery(recordsLimit, isLatest)
  );

  const [coversSnapshot, setCoversSnapshot] = useState<
    QuerySnapshot<DocumentData, DocumentData> | undefined
  >();
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
    switchFooterPlayVisibility,
    // lastSongLoadTime,
  } = useGlobalState();
  const [anchorEl, setAnchorEl] = useState<{
    elem: HTMLDivElement;
    idx: number;
  } | null>(null);
  // const [sectionPopover, setSectionPopover] = useState<HTMLElement | null>(
  //   null
  // );
  // const [hoverSectionName, setHoverSectionName] = useState("");
  const [newAiCoverUrl, setNewAiCoverUrl] = useState("");
  const [songLoading, setSongLoading] = useState(false);
  const { pushLog, setStartLog } = useSession();
  const [userName, setUserName] = useState(() => {
    return window.localStorage.getItem("KAMU_USERNAME") || "";
  });
  const [started, setStarted] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);

  const [revoxSongInfo, setRevoxSongInfo] = useState<CoverV1 | null>(null);
  const [successSnackbarMsg, setSuccessSnackbarMsg] = useState("");
  const [errorSnackbarMsg, setErrorSnackbarMsg] = useState("");
  const [isNewCoverLoading, setIsNewCoverLoading] = useState(false);
  const [coverInfo, setCoverInfo] = useState<YTP_CONTENT>();
  const [voicesPopperEl, setVoicesPopperEl] = useState<null | {
    anchorEl: HTMLDivElement;
    coverDoc: CoverV1;
    id: string;
  }>(null);
  const [newCommentContent, setNewCommentContent] = useState("");
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down("md"));
  const [showCommentsByCoverId, setShowCommentsByCoverId] = useState("");
  const location = useLocation();
  const [refreshHeader, setRefreshHeader] = useState(false);
  const [playSongDialog, setPlaySongDialog] = useState<{
    coverDoc: CoverV1;
    coverId: string;
    voiceId: string;
    userName: string;
  } | null>(null);
  // const [gameCoverId, setGameCoverId] = useState<string | null>(null);
  // const [gameCoverDoc, setGameCoverDoc] = useState<CoverV1 | null>(null);
  const [playStart, setPlayStart] = useState(false);
  const [selectedCoverDoc, setSelectedCoverDoc] = useState<CoverV1 | null>();
  const playAreaRef = useRef<HTMLDivElement | null>(null);
  const sectionsBarRef = useRef<HTMLDivElement | null>(null);
  const [sectionsWidth, setSectionsWidth] = useState<number[]>([]);
  const firstCoverRef = useRef<HTMLDivElement | null>(null);
  const [iframeUrl, setIframeUrl] = useState("");

  useEffect(() => {
    if (songId && coversSnapshot) {
      setSelectedCoverDoc(
        coversSnapshot.docs.find((d) => d.id === songId)?.data() as CoverV1
      );
      if (playStart) {
        setPlayStart(false);
      }
    }
  }, [songId, coversSnapshot]);
  useEffect(() => {
    if (isTonePlaying && playStart) {
      setPlayStart(false);
    }
  }, [isTonePlaying]);

  useEffect(() => {
    if (songId) {
      const coverDoc = coversCollectionSnapshot?.docs
        .find((d) => d.id === songId)
        ?.data() as CoverV1;
      if (coverDoc?.sections) {
        const differences = coverDoc.sections.map(
          (s, i, arr) => (arr[i + 1]?.start || coverDoc.duration) - s.start
        );
        const durations = getWidthByDuration(
          differences,
          sectionsBarRef.current?.offsetWidth || 500
        );
        setSectionsWidth(durations);
      }
    }
  }, [songId]);

  useEffect(() => {
    if (coversCollectionSnapshot && location.search) {
      const searchParams = new URLSearchParams(location.search);
      const _coverId = searchParams.get("coverId");
      const _voiceId = searchParams.get("voiceId");
      const _uid = searchParams.get("uid");
      if (_coverId && _voiceId) {
        console.log("Cover:", _coverId);
        console.log("Voice:", _voiceId);
        (async () => {
          let doc = coversCollectionSnapshot?.docs
            .find((d) => d.id === _coverId)
            ?.data() as CoverV1;
          if (!doc) doc = await getCoverDocById(_coverId);
          let userName = "NUSIC User";
          if (_uid) {
            const user = await getUserById(_uid);
            userName = user.name;
          }
          setPlaySongDialog({
            coverDoc: doc,
            voiceId: _voiceId,
            userName,
            coverId: _coverId,
          });
        })();

        axios.post(
          "https://api.nusic.kamu.dev/nusic/cover-share-events/ingest",
          {
            user_id: _uid,
            cover_id: _coverId,
            voice_id: _voiceId,
          },
          {
            headers: {
              "Content-Type": "application/x-ndjson",
              Authorization: `Bearer ${import.meta.env.VITE_KAMU_AUTH_TOKEN}`,
            },
          }
        );
        window.history.replaceState(null, "", window.location.origin);
        location.search = "";
      }
    }
  }, [location.search, coversCollectionSnapshot]);

  useEffect(() => {
    switchFooterPlayVisibility(!playStart);
  }, [playStart]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>, i: number) => {
    setAnchorEl({ elem: event.currentTarget, idx: i });
  };
  const onSongClick = async (
    _id: string,
    coverDoc: CoverV1,
    _voiceId?: string,
    endTime?: number
  ) => {
    // if (!coversCollectionSnapshot) return;
    setSongLoading(true);
    setNewCommentContent("");
    // const coverDoc =
    //   _coverDoc ||
    //   (coversCollectionSnapshot.docs
    //     .find((d) => d.id === _id)
    //     ?.data() as CoverV1);
    // if (!coverDoc) return;
    const voice_id = _voiceId || coverDoc.voices[0].id;
    // const _instrUrl = `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers_v1%2F${_id}%2Finstrumental.mp3?alt=media`;
    //   const firstVoice = (artistsObj as any)[songId].voices[0].id;
    // const _audioUrl = `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers_v1%2F${_id}%2F${voice_id}.mp3?alt=media`;
    const _instrUrl = `https://voxaudio.nusic.fm/covers/${_id}/instrumental.mp3`;
    const _audioUrl = `https://voxaudio.nusic.fm/covers/${_id}/${voice_id}.mp3`;
    // setVoice("");
    // setSongId(_id);
    if (endTime) pushLog(endTime);
    // await playAudio(_instrUrl, _audioUrl, true);
    if (coverDoc) {
      const newPlaylistObj: any = {};
      coversCollectionSnapshot?.docs.map((d) => {
        newPlaylistObj[d.id] = d.data() as CoverV1;
      });
      const voiceInfo = coverDoc.voices.find((v) => v.id === voice_id);
      // `https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/syncledger%2F${songInfo.songImg}?alt=media`;
      await updateGlobalState({
        songImg: coverDoc.metadata.videoThumbnail,
        songName: coverDoc.title,
        songInstrUrl: _instrUrl,
        coverVocalsUrl: _audioUrl,
        fromStart: true,
        voices: coverDoc.voices,
        songId: _id,
        bpm: coverDoc.bpm,
        voiceId: voice_id,
        duration: coverDoc.duration,
        playlist: newPlaylistObj,
        sections: coverDoc.sections,
      });
      // }
      // const differences = [];
      // if (coverDoc.sections) {
      //   const differences = coverDoc.sections.map(
      //     (s, i, arr) => (arr[i + 1]?.start || coverDoc.duration) - s.start
      //   );
      //   const durations = getWidthByDuration(
      //     differences,
      //     sectionsBarRef.current?.offsetWidth || 500
      //   );
      //   setSectionsWidth(durations);
      // }

      setStartLog({
        coverId: _id,
        voiceId: voice_id,
        startTime: Math.round(Tone.Transport.seconds),
        endTime: 0,
        uid: user?.uid,
      });
    }
    setSongLoading(false);
  };

  const onPreCoverSongClick = async (_id: string, preCoverDoc: CoverV1) => {
    setSongLoading(true);
    const newPlaylistObj: any = {};
    coversCollectionSnapshot?.docs.map((d) => {
      newPlaylistObj[d.id] = d.data() as CoverV1;
    });
    await updateGlobalState({
      songImg: preCoverDoc.metadata.videoThumbnail,
      songName: preCoverDoc.title,
      songInstrUrl: "",
      coverVocalsUrl: preCoverDoc.audioUrl,
      fromStart: true,
      voices: preCoverDoc.voices,
      songId: _id,
      // bpm: 120,
      duration: preCoverDoc.duration,
      playlist: newPlaylistObj,
      voiceId: preCoverDoc.voices[0].id,
      sections: preCoverDoc.sections,
    });
    // if (preCoverDoc.sections?.length) {
    //   const differences = preCoverDoc.sections.map(
    //     (s, i, arr) => (arr[i + 1]?.start || 20) - s.start
    //   );
    //   const durations = getWidthByDuration(
    //     differences,
    //     sectionsBarRef.current?.offsetWidth || 500
    //   );
    //   setSectionsWidth(durations);
    // }
    // setStartLog({
    //   song: coverDoc.songName,
    //   voice: coverDoc.artistName,
    //   start: 0,
    //   end: 0,
    //   userName,
    // });
    setSongLoading(false);
  };

  const onVoiceChange = async (_voiceId: string, voiceObj: VoiceV1Cover) => {
    setVoiceLoading(true);
    // "https://voxaudio.nusic.fm/nusic-vox-player.appspot.com/covers_v1/0SYPvwFyi24Y1I2oOVu0/instrumental.mp3";
    const _instrUrl = `https://voxaudio.nusic.fm/covers/${songId}/instrumental.mp3`;
    const _audioUrl = `https://voxaudio.nusic.fm/covers/${songId}/${_voiceId}.mp3`;
    // const _instrUrl = `https://storage.googleapis.com/nusic-vox-player.appspot.com/covers_v1%2F${songId}%2Finstrumental.mp3`;
    // const _audioUrl = `https://storage.googleapis.com/nusic-vox-player.appspot.com/covers_v1%2F${songId}%2F${_voiceId}.mp3`;
    // setVoice(_voiceId);
    // await playAudio(_instrUrl, _audioUrl);
    const cover = coversCollectionSnapshot?.docs.find((c) => c.id === songId);
    const coverDoc = cover?.data() as CoverV1;
    if (coverDoc) {
      const newPlaylistObj: any = {};
      coversCollectionSnapshot?.docs.map((d) => {
        newPlaylistObj[d.id] = d.data() as CoverV1;
      });
      await updateGlobalState({
        songImg: coverDoc.metadata.videoThumbnail,
        songName: coverDoc.title,
        songInstrUrl: _instrUrl,
        coverVocalsUrl: _audioUrl,
        fromStart: false,
        voices: coverDoc.voices,
        songId,
        voiceId: _voiceId,
        bpm: coverDoc.bpm,
        duration: coverDoc.duration,
        playlist: newPlaylistObj,
        sections: coverDoc.sections,
      });
      // }
      pushLog(Math.round(Tone.Transport.seconds));
      setStartLog({
        coverId: songId,
        voiceId: _voiceId,
        startTime: Math.round(Tone.Transport.seconds),
        endTime: 0,
        uid: user?.uid,
      });
    }
    setVoiceLoading(false);
  };
  const onRevoxRetry = async (pendingProgressObj: RevoxProcessTypeDoc) => {
    if (coversCollectionSnapshot) {
      const docInfo = coversCollectionSnapshot.docs.find(
        (d) => d.id === pendingProgressObj.coverDocId
      );
      if (docInfo) {
        const coverDoc = docInfo.data() as CoverV1;
        const newVoiceId = nameToSlug(pendingProgressObj.voiceModelName);
        const voiceIdx = coverDoc.voices.findIndex((v) => v.id === newVoiceId); // check for existing voice id in the voices[]
        if (voiceIdx === -1) {
          await axios.post(`${import.meta.env.VITE_VOX_COVER_SERVER}/revox`, {
            progress_doc_id: pendingProgressObj.id,
            cover_doc_id: pendingProgressObj.coverDocId,
            voice_model_url: pendingProgressObj.voiceModelUrl,
            voice_model_name: pendingProgressObj.voiceModelName,
            voice_id: pendingProgressObj.voiceObj.id,
          });
        } else
          alert("Voice already exists, try a different name or voice-model");
      }
    }
  };

  const onRevoxSubmit = async (
    voiceModelUrl: string,
    voiceModelName: string
  ) => {
    if (user?.uid && coversCollectionSnapshot) {
      const docInfo = coversCollectionSnapshot.docs.find(
        (d) => d.id === songId
      );
      if (docInfo) {
        const coverDoc = docInfo.data() as CoverV1;
        const newVoiceId = nameToSlug(voiceModelName);
        // check the newVoiceId for existing voice id in the voices[]
        const voiceIdx = coverDoc.voices.findIndex((v) => v.id === newVoiceId);
        if (voiceIdx === -1) {
          const progressDocId = await createRevoxProgressDoc({
            voiceObj: {
              creatorName: user.name,
              id: newVoiceId,
              imageUrl: getUserAvatar(user.uid, user.avatar),
              name: voiceModelName,
              shareInfo: {
                avatar: user.avatar,
                id: user.uid,
                name: user.name,
              },
            },
            coverDocId: docInfo.id,
            voiceModelName,
            voiceModelUrl,
            title: coverDoc.title,
            isComplete: false,
            status: "Processing",
          });
          axios.post(`${import.meta.env.VITE_VOX_COVER_SERVER}/revox`, {
            progress_doc_id: progressDocId,
            cover_doc_id: songId,
            voice_model_url: voiceModelUrl,
            voice_model_name: voiceModelName,
            voice_id: newVoiceId,
          });
          // logFirebaseEvent("revox", {
          //   name: user.name,
          //   content_id: songId,
          //   voice_id: newVoiceId,
          // });
          setSuccessSnackbarMsg("Submitted the voice model for Revoxing");
          setRevoxSongInfo(null);
          setRefreshHeader(!refreshHeader);
        } else {
          alert("Voice already exists, try a different name or voice-model");
        }
      }
    }
  };

  const onPlay = async (id: string, coverDoc: CoverV1, _voiceId?: string) => {
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
      if (coverDoc.stemsReady) onSongClick(id, coverDoc, _voiceId, endTime);
      else onPreCoverSongClick(id, coverDoc);
    }
  };

  const onRefreshUserObj = async (uid: string) => {
    await onUserChange(uid);
  };

  useEffect(() => {
    if (coversCollectionSnapshot?.size) {
      setCoversSnapshot(coversCollectionSnapshot);
      if (isMobileView)
        setTimeout(() => {
          firstCoverRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 800);
      // if (coversCollectionSnapshot.docs.length > 0) {
      //   const coverDoc = coversCollectionSnapshot.docs[0].data() as CoverV1;
      // }
    }
  }, [coversCollectionSnapshot]);

  if (isMobileView) {
    return (
      <Stack
        sx={{
          overflowY: "auto",
          scrollSnapType: "y mandatory",
          height: "100vh",
        }}
      >
        <Box
          display={"flex"}
          justifyContent="space-between"
          alignItems={"center"}
          p={2}
          sx={{
            scrollSnapAlign: "start",
            scrollSnapStop: "always",
          }}
        >
          <Stack alignItems="center">
            <img src="/nusic_purple.png" width={130} alt="" />
            <Typography variant="body2" textAlign={"center"}>
              AI Cover Charts
            </Typography>
          </Stack>
          <Header
            user={user}
            tempUserId={tempUserId}
            onUserChange={onUserChange}
            onRevoxRetry={onRevoxRetry}
            refreshHeader={refreshHeader}
          />
        </Box>
        {/* <img src="/cover_banner.png" alt="" /> */}
        <Box display={"flex"} justifyContent="space-between" px={2} pb={2}>
          <Select
            size="small"
            sx={{ width: "135px" }}
            startAdornment={
              <FilterListOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
            }
            value={isLatest ? "latest" : "top"}
            onChange={(e) => {
              if (e.target.value === "latest") {
                setIsLatest(true);
              } else {
                setIsLatest(false);
              }
            }}
          >
            <MenuItem value="top">Top</MenuItem>
            <MenuItem value="latest">Latest</MenuItem>
          </Select>
          <Fab
            size="small"
            color="primary"
            onClick={() => {
              if (coversSnapshot)
                onPlay(
                  songId || coversSnapshot.docs[0].id,
                  songId
                    ? (coversSnapshot?.docs
                        .find((d) => d.id === songId)
                        ?.data() as CoverV1)
                    : (coversSnapshot?.docs[0].data() as CoverV1)
                );
            }}
          >
            {loading ? (
              <CircularProgress
                size={"24px"}
                sx={{ color: "rgba(255,255,255,0.5)" }}
              />
            ) : isTonePlaying ? (
              <PauseRoundedIcon fontSize="large" />
            ) : (
              <PlayArrowRoundedIcon fontSize="large" />
            )}
          </Fab>
        </Box>
        <Stack gap={1} height="100%">
          {(!coversSnapshot || coversSnapshot?.docs.length === 0) &&
            !coversLoading && (
              <Typography align="center">No Covers are available</Typography>
            )}
          <Box>
            {coversSnapshot?.docs.map((doc, i) => {
              const id = doc.id;
              const coverDoc = doc.data() as CoverV1;
              return (
                <Box
                  id={id}
                  key={id}
                  ref={i === 0 ? firstCoverRef : null}
                  // display="flex"
                  // alignItems={"center"}
                  gap={2}
                  // borderBottom="1px solid rgb(130, 137, 161)"
                  // flexGrow={1}
                  sx={{
                    ":hover": {
                      ".avatar-play": {
                        display: "flex",
                      },
                    },
                    scrollSnapAlign: "start",
                    scrollSnapStop: "always",
                  }}
                  py={1}
                  width="100%"
                  height="100vh"
                  position={"relative"}
                  p={2}
                >
                  <Box
                    position={"absolute"}
                    left={0}
                    top={0}
                    height="100%"
                    width={"100%"}
                    sx={{
                      background: `url(${coverDoc.metadata.videoThumbnail})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      filter: "blur(15px) brightness(0.4)",
                    }}
                  />
                  <Stack
                    gap={2}
                    width="100%"
                    height="100%"
                    position={"relative"}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        backgroundColor: "transparent",
                        backgroundImage: "unset",
                        flexShrink: 0,
                      }}
                      onClick={(e) => {
                        if (loading || voiceLoading) return;
                        onPlay(id, coverDoc);
                      }}
                    >
                      <CardActionArea>
                        <CardContent sx={{ p: 0 }}>
                          <Box display={"flex"} gap={1}>
                            <Stack>
                              <Box
                                minWidth={"50px"}
                                height="50px"
                                display="flex"
                                justifyContent={"center"}
                                alignItems={"center"}
                                sx={{
                                  background: "rgba(29, 33, 38, 1)",
                                  borderRadius: "6px",
                                }}
                              >
                                <Typography
                                  fontFamily={"Space Grotesk"}
                                  fontWeight={900}
                                  fontSize="2rem"
                                  position="relative"
                                >
                                  {coverDoc.rank}
                                </Typography>
                              </Box>
                              <Box
                                // position={"absolute"}
                                // top={0}
                                // left={0}
                                display="flex"
                                justifyContent={"center"}
                                alignContent={"center"}
                              >
                                {coverDoc.rank < coverDoc.prevRank ? (
                                  <ExpandLessRoundedIcon
                                    color="success"
                                    fontSize="large"
                                  />
                                ) : coverDoc.rank === coverDoc.prevRank ? (
                                  <ChevronRightRoundedIcon
                                    sx={{ color: "#c3c3c3" }}
                                    fontSize="large"
                                  />
                                ) : (
                                  <ExpandMoreRoundedIcon
                                    color="error"
                                    fontSize="large"
                                  />
                                )}
                              </Box>
                            </Stack>
                            {/* <Avatar
                              src={coverDoc.metadata.videoThumbnail}
                              onMouseEnter={(e) => handleClick(e, i)}
                              sx={{
                                alignSelf: "start",
                                borderRadius: "8px",
                                width: 50,
                                height: 50,
                                border: "2px solid rgba(255,255,255,0.2)",
                              }}
                              variant="square"

                              // onMouseLeave={handleClose}
                            /> */}
                            <Stack>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    maxWidth: "200px",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {songId === id
                                    ? coverDoc.voices.find(
                                        (v) =>
                                          v.id ===
                                          (voiceId || coverDoc.voices[0].id)
                                      )?.creatorName
                                    : coverDoc.voices[0].creatorName}
                                </Typography>
                                {/* <Typography
                                variant="caption"
                                color={"rgb(113, 118, 123)"}
                                component="a"
                              >
                                · {timestampToDateString(coverDoc.createdAt)}
                              </Typography> */}
                              </Box>
                              <Typography>{coverDoc.title}</Typography>
                            </Stack>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                    {!songLoading && songId === id && (
                      <Stack>
                        <Box
                          display={"flex"}
                          alignItems="center"
                          ref={sectionsBarRef}
                          position="relative"
                          sx={{ overflowX: "auto" }}
                        >
                          {coverDoc.sections?.map((section, i, arr) => (
                            <Button
                              key={section.start}
                              disabled={
                                !sectionsWidth.length || loading || voiceLoading
                              }
                              // p={0.85}
                              variant="contained"
                              color="info"
                              sx={{
                                mr: i === arr.length - 1 ? 0 : 0.5,
                                minWidth: 0,
                                display:
                                  sectionsWidth[i] > 1 ? "inherit" : "none",
                                width: sectionsWidth.length
                                  ? sectionsWidth[i] + "px"
                                  : "120px",
                                p: 0,
                                height: 10,
                                transition: "transform 0.3s ease",
                                ":hover": {
                                  zIndex: 999,
                                  transform: "scale(1.5)",
                                  background: "#563FC8",
                                },
                              }}
                              onClick={() => {
                                const startInSecs = timeToSeconds(
                                  Math.round(section.start || 0.1).toString()
                                );
                                if (!isTonePlaying)
                                  Tone.Transport.start(undefined, startInSecs);
                                else Tone.Transport.seconds = startInSecs;
                              }}
                            />
                          ))}
                        </Box>
                        {songId === id && (
                          <Box
                            // position={"absolute"}
                            // left={0}
                            // top={0}
                            width="100%"
                            height={1}
                            display="flex"
                            pt={1}
                          >
                            <SimpleAudioProgress
                              isTonePlaying={isTonePlaying}
                              duration={coverDoc.duration}
                            />
                          </Box>
                        )}
                      </Stack>
                    )}
                    <Stack gap={2}>
                      <Box
                        width={"100%"}
                        display="flex"
                        justifyContent={"space-between"}
                        alignItems="center"
                        sx={{ zIndex: 1 }}
                      >
                        <Typography variant="h6">
                          Choose the Voice...
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<AddRoundedIcon />}
                          variant="contained"
                          onClick={() => {
                            if (!user?.uid) alert("Sign in to Add a New Voice");
                            else if (coversSnapshot) {
                              setRevoxSongInfo(
                                selectedCoverDoc ||
                                  (coversSnapshot.docs[0].data() as CoverV1)
                              );
                            }
                          }}
                        >
                          New Voice
                        </Button>
                      </Box>
                      <Box
                        width={"100%"}
                        // display="flex"
                        // gap={2}
                        display="grid"
                        gridTemplateRows={"auto auto"}
                        gridAutoFlow="column"
                        gap={2}
                        sx={{ overflowX: "auto" }}
                        justifyItems="center"
                        my={1}
                      >
                        {coverDoc.voices.map((v) => (
                          <Card
                            key={v.id}
                            sx={{
                              width: 100,
                              zIndex: 99,
                              backgroundColor: "transparent",
                              boxShadow: "none",
                              backgroundImage: "unset",
                              flexShrink: 0,
                            }}
                            onClick={() => {
                              if (songId === id && voiceId === v.id) return;
                              if (songId === id) {
                                onVoiceChange(v.id, coverDoc.voices[0]);
                              } else {
                                onPlay(id, coverDoc, v.id);
                              }
                              //   setVoice(v.id);
                            }}
                          >
                            <CardActionArea>
                              <CardMedia
                                component="img"
                                height="100"
                                width="100"
                                image={`https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/${encodeURIComponent(
                                  "voice_models/avatars/thumbs/"
                                )}${v.id}_200x200?alt=media`}
                                alt="green iguana"
                                sx={{
                                  objectFit: "contain",
                                }}
                              ></CardMedia>
                              <CardContent
                                sx={{
                                  p: 1,
                                  background:
                                    v.id === voiceId && songId === id
                                      ? "linear-gradient(43deg, rgb(65, 88, 208) 0%, rgb(200, 80, 192) 46%, rgb(255, 204, 112) 100%)"
                                      : "none",
                                  borderBottomLeftRadius: "4px",
                                  borderBottomRightRadius: "4px",
                                }}
                              >
                                <Typography align="center">{v.name}</Typography>
                              </CardContent>
                            </CardActionArea>
                          </Card>
                        ))}
                      </Box>
                    </Stack>
                    <Box display={"flex"} gap={1} alignItems="center" px={1}>
                      {!!coverDoc.likes?.total && (
                        <Tooltip title="Total Likes">
                          <Box display={"flex"} alignItems="center" gap={0.2}>
                            <FavoriteBorderRoundedIcon
                              fontSize="small"
                              sx={{ width: 12, height: 12 }}
                            />
                            <Typography variant="caption">
                              {coverDoc.likes?.total}
                            </Typography>
                          </Box>
                        </Tooltip>
                      )}
                      {!!coverDoc.commentsCount && (
                        <Box
                          display={"flex"}
                          alignItems="center"
                          gap={0.2}
                          component="a"
                          onClick={() => setShowCommentsByCoverId(id)}
                        >
                          <ChatBubbleOutlineRoundedIcon
                            fontSize="small"
                            sx={{
                              width: 12,
                              height: 12,
                              color:
                                showCommentsByCoverId === id
                                  ? "#8973F8"
                                  : "#fff",
                            }}
                          />
                          <Typography
                            variant="caption"
                            color={
                              showCommentsByCoverId === id ? "#8973F8" : "#fff"
                            }
                          >
                            {coverDoc.commentsCount}
                          </Typography>
                        </Box>
                      )}
                      {/* <IconButton
                        href={`https://play.nusic.fm?coverId=${id}`}
                        target="_blank"
                        size="small"
                      >
                        <SportsEsportsOutlinedIcon
                          fontSize="small"
                          sx={{ width: 16, height: 16, color: "#c3c3c3" }}
                        />
                      </IconButton> */}
                    </Box>
                    {/* {(songId === id || showCommentsByCoverId === id) && (
                      <CommentsArea coverDocId={id} />
                    )} */}
                    {/* Post a Comment */}
                    {/* {songId === id && (
                      <Box width={"100%"}>
                        <TextField
                          sx={{
                            ".MuiInputBase-root::before": {
                              borderBottomColor: "rgba(255, 255, 255, 0.1)",
                            },
                          }}
                          fullWidth
                          placeholder="say something..."
                          variant="standard"
                          size="small"
                          value={newCommentContent}
                          onKeyDown={(e) => {
                            // check if the key is enter
                            if (e.key === "Enter") {
                              if (!user) return alert("Kindly Sign In...");
                              if (user && newCommentContent) {
                                addCommentToCover(id, {
                                  content: newCommentContent,
                                  shareInfo: {
                                    avatar: user.avatar,
                                    id: user.uid,
                                    name: user.name,
                                  },
                                  timeInAudio: Tone.Transport.seconds,
                                  voiceId,
                                });
                                setNewCommentContent("");
                              }
                            }
                          }}
                          onChange={(e) => setNewCommentContent(e.target.value)}
                          InputProps={{
                            endAdornment: (
                              <IconButton
                                size="small"
                                onClick={async () => {
                                  if (!user) return alert("Kindly Sign In...");
                                  if (user && newCommentContent) {
                                    await addCommentToCover(id, {
                                      content: newCommentContent,
                                      shareInfo: {
                                        avatar: user.avatar,
                                        id: user.uid,
                                        name: user.name,
                                      },
                                      timeInAudio: Tone.Transport.seconds,
                                      voiceId,
                                    });
                                    setNewCommentContent("");
                                  }
                                }}
                              >
                                <Tooltip title="Comment" placement="top">
                                  <SendRoundedIcon
                                    sx={{ width: "16px", height: "16px" }}
                                  />
                                </Tooltip>
                              </IconButton>
                            ),
                          }}
                        />
                      </Box>
                    )} */}
                    <Box
                      display={"flex"}
                      justifyContent="center"
                      alignItems={"center"}
                    >
                      <VoiceChips
                        coverDoc={coverDoc}
                        id={id}
                        loading={loading}
                        onPlay={onPlay}
                        onVoiceChange={onVoiceChange}
                        songId={songId}
                        voiceId={voiceId}
                        voiceLoading={voiceLoading}
                        setVoicesPopperEl={setVoicesPopperEl}
                        user={user}
                        setRevoxSongInfo={setRevoxSongInfo}
                        onRefreshUserObj={onRefreshUserObj}
                      />
                    </Box>
                    <Box
                      sx={{
                        zIndex: 9,
                        // mt: "auto", marginBottom: "110px"
                      }}
                    >
                      <motion.div
                        style={{
                          padding: "10px 20px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "30px",
                          background:
                            "linear-gradient(45deg, #928dab, #7355f4, #928dab)",
                          backgroundSize: "200% 200%",
                          animation: "gradient 2.5s ease infinite",

                          borderTop: "2px solid",
                          borderBottom: "2px solid",
                        }}
                        onClick={() => {
                          // playAreaRef.current?.scrollIntoView({
                          //   behavior: "smooth",
                          // });
                          setIframeUrl(id);
                          setPlayStart(true);
                          pausePlayer();
                        }}
                        variants={{
                          rest: { scale: 1 },
                          hover: { scale: 1.1 },
                          pressed: { scale: 0.95 },
                        }}
                        initial={"rest"}
                        whileHover={"hover"}
                        whileTap={"pressed"}
                      >
                        <Typography>Play Game</Typography>
                      </motion.div>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Box>
          {coversLoading && (
            <Stack gap={2} py={2}>
              {new Array(5).fill(".").map((x, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  animation="wave"
                  sx={{ p: 3 }}
                />
              ))}
            </Stack>
          )}
          {!!coversSnapshot && coversSnapshot.size >= 15 && (
            <Box display={"flex"} justifyContent="center" pt={1}>
              <Button
                onClick={() => {
                  setRecordsLimit(recordsLimit + 15);
                }}
                variant="text"
                color="secondary"
              >
                Load More
              </Button>
            </Box>
          )}
          <Box display={"flex"} gap={1} alignItems="center" py={1}>
            <TextField
              fullWidth
              placeholder="AI Cover Youtube URL"
              sx={{ transition: "1s width", ".MuiInputBase-root": { pr: 0 } }}
              onChange={(e) => setNewAiCoverUrl(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton
                    disabled={!newAiCoverUrl || isNewCoverLoading}
                    onClick={async () => {
                      setIsNewCoverLoading(true);
                      const vid = getYouTubeVideoId(newAiCoverUrl);
                      if (vid) {
                        const formData = new FormData();
                        formData.append("vid", vid);
                        const res = await axios.post(
                          `${import.meta.env.VITE_YOUTUBE_API}/ytp-content`,
                          formData
                        );
                        // return {
                        //   title: title,
                        //   channelId: channel_id,
                        //   videoThumbnail: video_thumbnail,
                        //   channelTitle: channel_title,
                        //   channelThumbnail: channel_thumbnail,
                        //   videoDescription: video_description,
                        //   channelDescription: channel_description,
                        // };

                        const {
                          channelId,
                          channelTitle,
                          title,
                          videoThumbnail,
                          channelThumbnail,
                          videoDescription,
                          channelDescription,
                        } = res.data;
                        setCoverInfo({
                          channelDescription,
                          channelThumbnail,
                          videoDescription,
                          videoThumbnail,
                          channelId,
                          channelTitle,
                          title,
                          vid,
                          url: newAiCoverUrl,
                        });
                        setIsNewCoverLoading(false);
                      }
                    }}
                  >
                    <FileUploadRoundedIcon />
                  </IconButton>
                ),
              }}
            />
            {/* <IconButton>
              <AddCircleOutlineRoundedIcon />
            </IconButton> */}
            {/* <LoadingButton
              size="small"
              variant="contained"
              disabled={!newAiCoverUrl}
              loading={isNewCoverLoading}
              onClick={async () => {
                setIsNewCoverLoading(true);
                const vid = getYouTubeVideoId(newAiCoverUrl);
                if (vid) {
                  const formData = new FormData();
                  formData.append("vid", vid);
                  const res = await axios.post(
                    `${import.meta.env.VITE_YOUTUBE_API}/ytp-content`,
                    formData
                  );
                  // return {
                  //   title: title,
                  //   channelId: channel_id,
                  //   videoThumbnail: video_thumbnail,
                  //   channelTitle: channel_title,
                  //   channelThumbnail: channel_thumbnail,
                  //   videoDescription: video_description,
                  //   channelDescription: channel_description,
                  // };

                  const {
                    channelId,
                    channelTitle,
                    title,
                    videoThumbnail,
                    channelThumbnail,
                    videoDescription,
                    channelDescription,
                  } = res.data;
                  setCoverInfo({
                    channelDescription,
                    channelThumbnail,
                    videoDescription,
                    videoThumbnail,
                    channelId,
                    channelTitle,
                    title,
                    vid,
                    url: newAiCoverUrl,
                  });
                  setIsNewCoverLoading(false);
                }
              }}
            >
              Add
            </LoadingButton> */}
          </Box>
          <Dialog
            open={playStart}
            onClose={() => setPlayStart(false)}
            fullScreen
          >
            <DialogContent sx={{ p: 0 }}>
              <Box position={"absolute"} top={0} left={0} m={1}>
                <Button
                  color="error"
                  onClick={() => {
                    setPlayStart(false);
                    setIframeUrl("");
                  }}
                  size="small"
                  variant="contained"
                  sx={{ py: 0 }}
                >
                  Stop
                </Button>
              </Box>
              {playStart && (
                <iframe
                  src={`https://play.nusic.fm/?coverId=${iframeUrl}`}
                  width="100%"
                  height={"100%"}
                  style={{ zIndex: 999, border: "unset" }}
                />
              )}
            </DialogContent>
          </Dialog>
          <CoverInfoDialog
            coverInfo={coverInfo}
            user={user}
            onClose={(snackbarMessage?: string) => {
              if (snackbarMessage) setSuccessSnackbarMsg(snackbarMessage);
              setCoverInfo(undefined);
            }}
          />
          {revoxSongInfo && (
            <VoiceModelDialog
              onClose={() => setRevoxSongInfo(null)}
              songInfo={revoxSongInfo}
              onSubmit={onRevoxSubmit}
              uid={user?.uid}
            />
          )}
          <Menu
            anchorEl={voicesPopperEl?.anchorEl}
            open={!!voicesPopperEl}
            onClose={() => setVoicesPopperEl(null)}
          >
            {voicesPopperEl?.coverDoc?.voices
              .filter(
                (v) =>
                  v.id !==
                  ((songId === voicesPopperEl.id && voiceId) ||
                    voicesPopperEl?.coverDoc?.voices[0].id)
              )
              .slice(2)
              .map((v) => (
                <MenuItem
                  key={v.id}
                  onClick={() => {
                    if (
                      voicesPopperEl &&
                      (!voiceId || songId !== voicesPopperEl?.id)
                    )
                      onPlay(voicesPopperEl?.id, voicesPopperEl.coverDoc, v.id);
                    else if (songId === voicesPopperEl?.id)
                      onVoiceChange(v.id, v);
                    setVoicesPopperEl(null);
                  }}
                  sx={{ py: 0 }}
                >
                  <ListItemAvatar
                    sx={{
                      minWidth: 36,
                      ".MuiAvatar-root": { width: 24, height: 24 },
                    }}
                  >
                    <Avatar
                      src={getUserAvatar(v.shareInfo.id, v.shareInfo.avatar)}
                    />
                  </ListItemAvatar>
                  <Typography variant="caption">{v.name}</Typography>
                </MenuItem>
              ))}
          </Menu>
          <Snackbar
            open={!!successSnackbarMsg}
            autoHideDuration={6000}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            onClose={() => setSuccessSnackbarMsg("")}
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
          {playSongDialog && (
            <Dialog open fullWidth>
              <DialogContent>
                <Box
                  display={"flex"}
                  justifyContent="space-between"
                  alignItems={"center"}
                >
                  {/* <Typography variant="h6">{playSongDialog.userName}</Typography> */}
                  <Typography variant="caption">
                    <Typography component={"span"} color="#8973F8">
                      {playSongDialog.userName}
                    </Typography>{" "}
                    has shared a cover with you
                  </Typography>
                  <IconButton size="small">
                    <CloseRoundedIcon
                      fontSize="small"
                      onClick={() => setPlaySongDialog(null)}
                    />
                  </IconButton>
                </Box>
                <Divider sx={{ mt: 1, mb: 1.6 }} />
                <Stack gap={1} my={1} alignItems="center">
                  <img
                    width={220}
                    height={180}
                    src={playSongDialog.coverDoc.metadata.videoThumbnail}
                    alt={""}
                    style={{ objectFit: "cover", borderRadius: 8 }}
                  ></img>
                  <Typography variant="h6" align="center">
                    {playSongDialog.coverDoc.title}
                  </Typography>
                  <Box
                    display={"flex"}
                    justifyContent="center"
                    gap={1}
                    flexWrap="wrap"
                  >
                    {playSongDialog.coverDoc.voices.map((voice) => (
                      <Chip
                        key={voice.id}
                        variant={
                          voice.id === playSongDialog.voiceId
                            ? "outlined"
                            : "filled"
                        }
                        color={
                          voice.id === playSongDialog.voiceId
                            ? "info"
                            : "default"
                        }
                        avatar={<PlayArrowRoundedIcon fontSize="small" />}
                        clickable
                        onClick={() => {
                          onSongClick(
                            playSongDialog.coverId,
                            playSongDialog.coverDoc,
                            voice.id
                          );
                          document
                            .getElementById(playSongDialog.coverId)
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          setPlaySongDialog(null);
                        }}
                        label={voice.name}
                      />
                    ))}
                  </Box>
                </Stack>
              </DialogContent>
            </Dialog>
          )}
        </Stack>
      </Stack>
    );
  } else
    return (
      <Box>
        <Stack>
          <Box
            p={2}
            display="flex"
            justifyContent={"space-between"}
            alignItems="center"
          >
            <Stack flexBasis={"20%"} alignItems="center">
              <img src="/nusic_purple.png" width={155} alt="" />
              <Typography variant="body2" textAlign={"center"}>
                AI Cover Charts
              </Typography>
            </Stack>
            <Box
              display={"flex"}
              gap={2}
              alignItems="center"
              py={2}
              flexBasis="50%"
            >
              <TextField
                fullWidth
                placeholder="Add your AI Cover to this Playlist, Youtube url goes here"
                sx={{ transition: "1s width" }}
                value={newAiCoverUrl}
                onChange={(e) => setNewAiCoverUrl(e.target.value)}
              />
              <LoadingButton
                variant="contained"
                disabled={!newAiCoverUrl}
                loading={isNewCoverLoading}
                onClick={async () => {
                  const vid = getYouTubeVideoId(newAiCoverUrl);
                  if (vid) {
                    setIsNewCoverLoading(true);
                    const isExists = await checkIfYoutubeVideoIdExists(vid);
                    if (isExists) {
                      setNewAiCoverUrl("");
                      setIsNewCoverLoading(false);
                      setErrorSnackbarMsg("Cover already Exists");
                      // TODO: Play that cover
                      return;
                    }
                    if (!user) {
                      alert("Kindly Sign In...");
                      window.open(getDiscordLoginUrl());
                      return;
                    }
                    const formData = new FormData();
                    formData.append("vid", vid);
                    const res = await axios.post(
                      `${import.meta.env.VITE_YOUTUBE_API}/ytp-content`,
                      formData
                    );
                    const {
                      channelId,
                      channelTitle,
                      title,
                      videoThumbnail,
                      channelThumbnail,
                      videoDescription,
                      channelDescription,
                    } = res.data;
                    setCoverInfo({
                      channelDescription,
                      channelThumbnail,
                      videoDescription,
                      videoThumbnail,
                      channelId,
                      channelTitle,
                      title,
                      vid,
                      url: newAiCoverUrl,
                    });
                    setIsNewCoverLoading(false);
                  } else {
                    setErrorSnackbarMsg("Invalid Youtube URL");
                  }
                }}
              >
                Save
              </LoadingButton>
            </Box>
            <Header
              user={user}
              tempUserId={tempUserId}
              onUserChange={onUserChange}
              onRevoxRetry={onRevoxRetry}
              refreshHeader={refreshHeader}
            />
          </Box>
        </Stack>
        <Box display={"flex"}>
          <Stack
            sx={{
              overflowY: "auto",
              // background: `linear-gradient(white 30%,rgba(255, 255, 255, 0)) center top,linear-gradient(rgba(255, 255, 255, 0), white 70%) center bottom,radial-gradient(farthest-side at 50% 0,rgba(0, 0, 0, 0.2),rgba(0, 0, 0, 0)) center top,radial-gradient(farthest-side at 50% 100%,rgba(0, 0, 0, 0.2),rgba(0, 0, 0, 0)) center bottom`,
              // backgroundRepeat: "no-repeat",
              // backgroundSize: "100% 40px, 100% 40px, 100% 14px, 100% 14px",
              // backgroundAttachment: "local, local, scroll, scroll",
            }}
            height={"calc(100vh - 95px)"}
            flexBasis="20%"
            minWidth={345}
            flexShrink={0}
          >
            <Box display={"flex"} justifyContent="center" width={"100%"}>
              <Select
                size="small"
                sx={{ width: "135px" }}
                startAdornment={
                  <FilterListOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                }
                value={isLatest ? "latest" : "top"}
                onChange={(e) => {
                  if (e.target.value === "latest") {
                    setIsLatest(true);
                  } else {
                    setIsLatest(false);
                  }
                }}
              >
                <MenuItem value="top">Top</MenuItem>
                <MenuItem value="latest">Latest</MenuItem>
              </Select>
            </Box>
            {coversSnapshot?.docs.map((doc, i) => {
              const id = doc.id;
              const coverDoc = doc.data() as CoverV1;
              return (
                <Box key={id} flexGrow={1} flexShrink={0}>
                  <Box
                    id={id}
                    display="flex"
                    alignItems={"center"}
                    gap={1}
                    borderBottom="1px solid rgb(130, 137, 161)"
                    sx={{
                      ":hover": {
                        ".avatar-play": {
                          display: "flex",
                        },
                      },
                    }}
                    // py={2}
                  >
                    <Box
                      minWidth={"85px"}
                      display="flex"
                      justifyContent={"center"}
                      alignItems={"center"}
                      height="100%"
                      sx={{
                        background: "rgba(29, 33, 38, 1)",
                        borderTopRightRadius: i === 0 ? "6px" : "0px",
                        borderTopLeftRadius: i === 0 ? "6px" : "0px",
                        borderBottomLeftRadius:
                          i === coversSnapshot.size - 1 ? "6px" : "0px",
                        borderBottomRightRadius:
                          i === coversSnapshot.size - 1 ? "6px" : "0px",
                      }}
                    >
                      <Typography
                        fontFamily={"Space Grotesk"}
                        fontWeight={900}
                        fontSize="2rem"
                        position="relative"
                      >
                        {coverDoc.rank}
                        <Box
                          position={"absolute"}
                          bottom={-45}
                          left={0}
                          display="flex"
                          justifyContent={"center"}
                          alignContent={"center"}
                          width="100%"
                        >
                          {coverDoc.rank < coverDoc.prevRank ? (
                            <ExpandLessRoundedIcon
                              color="success"
                              fontSize="large"
                            />
                          ) : coverDoc.rank === coverDoc.prevRank ? (
                            <ChevronRightRoundedIcon
                              sx={{ color: "rgb(130, 137, 161)" }}
                              fontSize="large"
                            />
                          ) : (
                            <ExpandMoreRoundedIcon
                              color="error"
                              fontSize="large"
                            />
                          )}
                        </Box>
                      </Typography>
                    </Box>
                    <Stack gap={1} py={2} flexGrow={1}>
                      <Card
                        onClick={() => {
                          onPlay(id, coverDoc);
                        }}
                      >
                        <CardActionArea>
                          <CardContent>
                            <Box
                              display={"flex"}
                              alignItems="center"
                              gap={2}
                              width="100%"
                              flexWrap={"wrap"}
                            >
                              <Stack>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography
                                    variant="caption"
                                    color={"#c3c3c3"}
                                  >
                                    {songId === id
                                      ? coverDoc.voices.find(
                                          (v) =>
                                            v.id ===
                                            (voiceId || coverDoc.voices[0].id)
                                        )?.creatorName
                                      : coverDoc.voices[0].creatorName}
                                  </Typography>
                                </Box>
                                <Typography>{coverDoc.title}</Typography>
                              </Stack>
                            </Box>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                      {songId === id && (
                        <Box
                          // position={"absolute"}
                          // left={0}
                          // top={0}
                          width="100%"
                          height={"100%"}
                          display="flex"
                        >
                          <SimpleAudioProgress
                            isTonePlaying={isTonePlaying}
                            duration={coverDoc.duration}
                          />
                        </Box>
                      )}
                      <Box>
                        <Box display={"flex"} gap={1} alignItems="center">
                          {!!coverDoc.likes?.total && (
                            <Tooltip title="Total Likes">
                              <Box
                                display={"flex"}
                                alignItems="center"
                                gap={0.2}
                              >
                                <FavoriteBorderRoundedIcon
                                  fontSize="small"
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    color: "#c3c3c3",
                                  }}
                                />
                                <Typography variant="caption" color={"#c3c3c3"}>
                                  {coverDoc.likes?.total}
                                </Typography>
                              </Box>
                            </Tooltip>
                          )}
                          {!!coverDoc.commentsCount && (
                            <Box
                              display={"flex"}
                              alignItems="center"
                              gap={0.2}
                              component="a"
                              onClick={() => setShowCommentsByCoverId(id)}
                            >
                              <ChatBubbleOutlineRoundedIcon
                                fontSize="small"
                                sx={{
                                  width: 12,
                                  height: 12,
                                  color:
                                    showCommentsByCoverId === id
                                      ? "#8973F8"
                                      : "#c3c3c3",
                                }}
                              />
                              <Typography
                                variant="caption"
                                color={
                                  showCommentsByCoverId === id
                                    ? "#8973F8"
                                    : "#c3c3c3"
                                }
                              >
                                {coverDoc.commentsCount}
                              </Typography>
                            </Box>
                          )}
                          <VoiceChips
                            coverDoc={coverDoc}
                            id={id}
                            loading={loading}
                            onPlay={onPlay}
                            onVoiceChange={onVoiceChange}
                            songId={songId}
                            voiceId={voiceId}
                            voiceLoading={voiceLoading}
                            setVoicesPopperEl={setVoicesPopperEl}
                            user={user}
                            setRevoxSongInfo={setRevoxSongInfo}
                            onRefreshUserObj={onRefreshUserObj}
                          />
                        </Box>
                      </Box>
                      {(songId === id || showCommentsByCoverId === id) && (
                        <CommentsArea coverDocId={id} />
                      )}
                      {songId === id && (
                        <Box width={"100%"}>
                          <TextField
                            sx={{
                              ".MuiInputBase-root::before": {
                                borderBottomColor: "rgba(255, 255, 255, 0.1)",
                              },
                            }}
                            fullWidth
                            placeholder="say something..."
                            variant="standard"
                            size="small"
                            value={newCommentContent}
                            onChange={(e) =>
                              setNewCommentContent(e.target.value)
                            }
                            onKeyDown={(e) => {
                              // check if the key is enter
                              if (e.key === "Enter") {
                                if (!user) return alert("Kindly Sign In...");
                                if (user && newCommentContent) {
                                  addCommentToCover(id, {
                                    content: newCommentContent,
                                    shareInfo: {
                                      avatar: user.avatar,
                                      id: user.uid,
                                      name: user.name,
                                    },
                                    timeInAudio: Tone.Transport.seconds,
                                    voiceId,
                                  });
                                  setNewCommentContent("");
                                }
                              }
                            }}
                            InputProps={{
                              endAdornment: (
                                <IconButton
                                  size="small"
                                  onClick={async () => {
                                    if (!user)
                                      return alert("Kindly Sign In...");
                                    if (user && newCommentContent) {
                                      await addCommentToCover(id, {
                                        content: newCommentContent,
                                        shareInfo: {
                                          avatar: user.avatar,
                                          id: user.uid,
                                          name: user.name,
                                        },
                                        timeInAudio: Tone.Transport.seconds,
                                        voiceId,
                                      });
                                      setNewCommentContent("");
                                    }
                                  }}
                                >
                                  <Tooltip title="Comment" placement="top">
                                    <SendRoundedIcon
                                      sx={{
                                        width: "16px",
                                        height: "16px",
                                      }}
                                    />
                                  </Tooltip>
                                </IconButton>
                              ),
                            }}
                          />
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </Box>
              );
            })}
            {!!coversSnapshot && coversSnapshot.size >= 15 && (
              <Box display={"flex"} justifyContent="center" pt={2}>
                <Button
                  onClick={() => {
                    setRecordsLimit(recordsLimit + 15);
                  }}
                  variant="text"
                  color="secondary"
                >
                  Load More
                </Button>
              </Box>
            )}
          </Stack>
          <Box
            ref={playAreaRef}
            flexBasis={"80%"}
            height="calc(100vh - 95px)"
            position={"relative"}
          >
            {!playStart && (
              <Box
                position={"absolute"}
                width="100%"
                height={"100%"}
                left={0}
                top={0}
                sx={{
                  background: `url(${
                    (selectedCoverDoc || coversSnapshot?.docs[0].data())
                      ?.metadata.videoThumbnail
                  })`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(15px) brightness(0.6)",
                }}
              />
            )}
            {playStart && (
              <Box position={"absolute"} top={0} left={20} m={1}>
                <Button
                  color="error"
                  onClick={() => setPlayStart(false)}
                  variant="contained"
                  sx={{ py: 0 }}
                >
                  Stop
                </Button>
              </Box>
            )}
            {!playStart && (
              <Stack
                // justifyContent={"space-between"}
                width="100%"
                height="100%"
              >
                <Stack gap={2} height="75%">
                  <Box
                    width={"100%"}
                    display="flex"
                    justifyContent={"space-between"}
                    alignItems="center"
                    px={4}
                    sx={{ zIndex: 1 }}
                  >
                    <Typography variant="h5">Choose the Voice...</Typography>
                    <Fab
                      size="medium"
                      color="primary"
                      onClick={() => {
                        if (coversSnapshot)
                          onPlay(
                            songId || coversSnapshot.docs[0].id,
                            songId
                              ? (coversSnapshot?.docs
                                  .find((d) => d.id === songId)
                                  ?.data() as CoverV1)
                              : (coversSnapshot?.docs[0].data() as CoverV1)
                          );
                      }}
                    >
                      {loading ? (
                        <CircularProgress
                          size={"24px"}
                          sx={{ color: "rgba(255,255,255,0.5)" }}
                        />
                      ) : isTonePlaying ? (
                        <PauseRoundedIcon fontSize="large" />
                      ) : (
                        <PlayArrowRoundedIcon fontSize="large" />
                      )}
                    </Fab>
                  </Box>
                  <Box
                    display={"flex"}
                    gap={2}
                    flexWrap="wrap"
                    justifyContent={"center"}
                    alignItems="center"
                    sx={{ overflowY: "auto" }}
                  >
                    {(
                      selectedCoverDoc ||
                      (coversSnapshot?.docs[0].data() as CoverV1)
                    )?.voices.map((v) => (
                      <Card
                        key={v.id}
                        sx={{
                          width: 140,
                          minHeight: 220,
                          zIndex: 99,
                          backgroundColor: "transparent",
                          boxShadow: "none",
                          backgroundImage: "unset",
                        }}
                        onClick={() => {
                          if (voiceId === v.id) return;
                          if (songId && selectedCoverDoc) {
                            onVoiceChange(v.id, v);
                          } else {
                            onPlay(
                              songId || coversSnapshot?.docs[0].id,
                              selectedCoverDoc ||
                                (coversSnapshot?.docs[0].data() as CoverV1),
                              v.id
                            );
                          }
                          //   setVoice(v.id);
                        }}
                      >
                        <CardActionArea>
                          <CardMedia
                            component="img"
                            height="140"
                            width="140"
                            image={`https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/${encodeURIComponent(
                              "voice_models/avatars/thumbs/"
                            )}${v.id}_200x200?alt=media`}
                            alt="green iguana"
                            sx={{
                              objectFit: "contain",
                            }}
                          ></CardMedia>
                          <CardContent
                            sx={{
                              background:
                                v.id === voiceId
                                  ? "linear-gradient(43deg, rgb(65, 88, 208) 0%, rgb(200, 80, 192) 46%, rgb(255, 204, 112) 100%)"
                                  : "none",
                              borderBottomLeftRadius: "4px",
                              borderBottomRightRadius: "4px",
                            }}
                          >
                            <Typography align="center">{v.name}</Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    ))}
                    {!coversLoading && (
                      <Card
                        sx={{
                          width: 140,
                          minHeight: 220,
                          zIndex: 99,
                          backgroundColor: "transparent",
                          boxShadow: "none",
                          backgroundImage: "unset",
                        }}
                        onClick={() => {
                          if (!user?.uid) alert("Sign in to Add a New Voice");
                          else if (coversSnapshot) {
                            setRevoxSongInfo(
                              selectedCoverDoc ||
                                (coversSnapshot.docs[0].data() as CoverV1)
                            );
                          }
                        }}
                      >
                        <CardActionArea sx={{ height: "100%" }}>
                          <Box
                            width={140}
                            height={140}
                            display="flex"
                            justifyContent={"center"}
                            alignItems="center"
                          >
                            <AddRoundedIcon sx={{ width: 80, height: 80 }} />
                          </Box>
                          <CardContent sx={{ height: "100%" }}>
                            <Box sx={{ height: "100%" }}>
                              <Typography align="center">
                                Add <br /> New Voice
                              </Typography>
                            </Box>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    )}
                  </Box>
                </Stack>
                <Box
                  sx={{
                    // my: "auto",
                    zIndex: 9,
                  }}
                  height="12%"
                  display={"flex"}
                  alignItems="center"
                >
                  <motion.div
                    style={{
                      width: "100%",
                      padding: "10px 20px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "30px",
                      background:
                        "linear-gradient(45deg, #928dab, #7355f4, #928dab)",
                      backgroundSize: "200% 200%",
                      animation: "gradient 2.5s ease infinite",

                      borderTop: "2px solid",
                      borderBottom: "2px solid",
                    }}
                    onClick={() => {
                      // playAreaRef.current?.scrollIntoView({
                      //   behavior: "smooth",
                      // });
                      setPlayStart(true);
                      pausePlayer();
                    }}
                    variants={{
                      rest: { scale: 1 },
                      hover: { scale: 1.1 },
                      pressed: { scale: 0.95 },
                    }}
                    initial={"rest"}
                    whileHover={"hover"}
                    whileTap={"pressed"}
                  >
                    <Typography>Play Game</Typography>
                  </motion.div>
                </Box>

                {/* <Button
                  variant="contained"
                  fullWidth
                  sx={{ my: "auto" }}
                  onClick={() => {
                    setPlayStart(true);
                    pausePlayer();
                  }}
                >
                  Play Game
                </Button> */}
              </Stack>
            )}
            {playStart && (
              <iframe
                src={`https://play.nusic.fm/?coverId=${
                  songId || coversSnapshot?.docs[0].id
                }`}
                width="100%"
                height={"100%"}
                style={{ zIndex: 999, border: "unset" }}
              />
            )}
          </Box>
        </Box>
        {revoxSongInfo && (
          <VoiceModelDialog
            onClose={() => setRevoxSongInfo(null)}
            songInfo={revoxSongInfo}
            onSubmit={onRevoxSubmit}
            uid={user?.uid}
          />
        )}
        <CoverInfoDialog
          coverInfo={coverInfo}
          user={user}
          onClose={(snackbarMessage?: string) => {
            if (snackbarMessage) setSuccessSnackbarMsg(snackbarMessage);
            setCoverInfo(undefined);
          }}
        />
        {revoxSongInfo && (
          <VoiceModelDialog
            onClose={() => setRevoxSongInfo(null)}
            songInfo={revoxSongInfo}
            onSubmit={onRevoxSubmit}
            uid={user?.uid}
          />
        )}
        <Menu
          anchorEl={voicesPopperEl?.anchorEl}
          open={!!voicesPopperEl}
          onClose={() => setVoicesPopperEl(null)}
        >
          {voicesPopperEl?.coverDoc?.voices
            .filter(
              (v) =>
                v.id !==
                ((songId === voicesPopperEl.id && voiceId) ||
                  voicesPopperEl?.coverDoc?.voices[0].id)
            )
            .slice(2)
            .map((v) => (
              <MenuItem
                key={v.id}
                onClick={() => {
                  if (
                    voicesPopperEl &&
                    (!voiceId || songId !== voicesPopperEl?.id)
                  )
                    onPlay(voicesPopperEl?.id, voicesPopperEl.coverDoc, v.id);
                  else if (songId === voicesPopperEl?.id)
                    onVoiceChange(v.id, v);
                  setVoicesPopperEl(null);
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={getUserAvatar(v.shareInfo.id, v.shareInfo.avatar)}
                  />
                </ListItemAvatar>
                <Typography variant="inherit">{v.name}</Typography>
              </MenuItem>
            ))}
        </Menu>
        <Snackbar
          open={!!successSnackbarMsg}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          onClose={() => setSuccessSnackbarMsg("")}
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
        <Snackbar
          open={!!errorSnackbarMsg}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          onClose={() => setErrorSnackbarMsg("")}
        >
          <Alert
            onClose={() => setErrorSnackbarMsg("")}
            severity="error"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {errorSnackbarMsg}
          </Alert>
        </Snackbar>
        {playSongDialog && (
          <Dialog open sx={{ ".MuiPaper-root": { maxWidth: 650 } }}>
            <DialogContent>
              <Box display={"flex"} gap={2}>
                <img
                  width={220}
                  height={180}
                  src={playSongDialog.coverDoc.metadata.videoThumbnail}
                  alt={""}
                  style={{ objectFit: "cover", borderRadius: 8 }}
                ></img>
                <Box>
                  <Box
                    display={"flex"}
                    justifyContent="space-between"
                    alignItems={"center"}
                  >
                    {/* <Typography variant="h6">{playSongDialog.userName}</Typography> */}
                    <Box display={"flex"} gap={1}>
                      <Typography variant="caption">
                        <Typography component={"span"} color="#8973F8">
                          {playSongDialog.userName}
                        </Typography>{" "}
                        has shared a cover with you
                      </Typography>
                    </Box>
                    <IconButton size="small">
                      <CloseRoundedIcon
                        onClick={() => setPlaySongDialog(null)}
                      />
                    </IconButton>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Stack gap={2}>
                    <Typography variant="h6" align="center">
                      {playSongDialog.coverDoc.title}
                    </Typography>
                    <Stack gap={1}>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          fontStyle={"italic"}
                          align="center"
                        >
                          Available Voices
                        </Typography>
                      </Box>
                      <Box
                        display={"flex"}
                        justifyContent="center"
                        gap={1}
                        flexWrap="wrap"
                      >
                        {playSongDialog.coverDoc.voices.map((voice) => (
                          <Chip
                            key={voice.id}
                            variant={
                              voice.id === playSongDialog.voiceId
                                ? "outlined"
                                : "filled"
                            }
                            color={
                              voice.id === playSongDialog.voiceId
                                ? "info"
                                : "default"
                            }
                            avatar={<PlayArrowRoundedIcon fontSize="small" />}
                            clickable
                            onClick={() => {
                              onSongClick(
                                playSongDialog.coverId,
                                playSongDialog.coverDoc,
                                voice.id
                              );
                              document
                                .getElementById(voice.id)
                                ?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "center",
                                });
                              setPlaySongDialog(null);
                            }}
                            label={voice.name}
                          />
                        ))}
                      </Box>
                    </Stack>
                  </Stack>
                </Box>
              </Box>
            </DialogContent>
          </Dialog>
        )}
      </Box>
    );
};

export default Rows;
