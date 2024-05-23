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
import { db, logFirebaseEvent } from "../services/firebase.service";
// import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
// import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
// import RepeatRoundedIcon from "@mui/icons-material/RepeatRounded";
// import EqualizerRoundedIcon from "@mui/icons-material/EqualizerRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import { useGlobalState } from "../main";
import { useEffect, useRef, useState } from "react";
import { useSession } from "../hooks/useSession";
import { getUserAvatar, getYouTubeVideoId, nameToSlug } from "../helpers";
import VoiceModelDialog from "./VoiceModelDialog";
// import { createRevoxProgressDoc } from "../services/db/revoxQueue.service";
import { LoadingButton } from "@mui/lab";
import CoverInfoDialog from "./CoverInfoDialog";
// import { PreCover } from "../services/db/preCovers.service";
import { User } from "../services/db/users.service";
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

const Rows = ({ user, tempUserId, onUserChange }: Props) => {
  const [recordsLimit, setRecordsLimit] = useState(15);
  const [queriedCover, setQueriedCover] = useState<CoverV1 | null>(null);
  const [coversCollectionSnapshot, coversLoading, error] = useCollection(
    query(
      collection(db, "covers"),
      orderBy("rank", "asc"),
      where("audioUrl", "!=", ""),
      orderBy("playCount", "desc"),
      limit(recordsLimit)
    )
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
  const [sectionsWidth, setSectionsWidth] = useState<number[]>([]);
  const { pushLog, setStartLog } = useSession();
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

  useEffect(() => {
    if (coversCollectionSnapshot && location.search) {
      const searchParams = new URLSearchParams(location.search);
      const _coverId = searchParams.get("coverId");
      const _voiceId = searchParams.get("voiceId");
      const _uid = searchParams.get("uid");
      if (_coverId && _voiceId) {
        console.log("Cover:", _coverId);
        console.log("Voice:", _voiceId);
        const doc = coversCollectionSnapshot?.docs
          .find((d) => d.id === _coverId)
          ?.data() as CoverV1;
        if (doc) onSongClick(_coverId, doc, _voiceId);
        else {
          getCoverDocById(_coverId).then((_doc) => {
            setQueriedCover(_doc);
            onSongClick(_coverId, _doc, _voiceId);
          });
        }
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
      // `https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/syncledger%2F${songInfo.songImg}?alt=media`;
      await updateGlobalState({
        songImg: coverDoc.voices.find((v) => v.id === voice_id)?.imageUrl,
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

  const onPreCoverSongClick = async (_id: string, preCoverDoc: CoverV1) => {
    setSongLoading(true);
    const newPlaylistObj: any = {};
    coversCollectionSnapshot?.docs.map((d) => {
      newPlaylistObj[d.id] = d.data() as CoverV1;
    });
    await updateGlobalState({
      songImg: preCoverDoc.voices[0].imageUrl,
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
        songImg: voiceObj.imageUrl,
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
          logFirebaseEvent("revox", {
            name: user.name,
            content_id: songId,
            voice_id: newVoiceId,
          });
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
    }
  }, [coversCollectionSnapshot]);

  if (isMobileView) {
    return (
      <Stack>
        <Header
          user={user}
          tempUserId={tempUserId}
          onUserChange={onUserChange}
          onRevoxRetry={onRevoxRetry}
          refreshHeader={refreshHeader}
        />
        <img src="/cover_banner.png" alt="" />
        <Stack gap={1} py={2}>
          {(!coversSnapshot || coversSnapshot?.docs.length === 0) &&
            !coversLoading && (
              <Typography align="center">No Covers are available</Typography>
            )}
          {coversSnapshot?.docs.map((doc, i) => {
            const id = doc.id;
            const coverDoc = doc.data() as CoverV1;
            return (
              <Box
                key={id}
                display="flex"
                alignItems={"center"}
                gap={2}
                borderBottom="1px solid rgb(130, 137, 161)"
                flexGrow={1}
                sx={{
                  ":hover": {
                    ".avatar-play": {
                      display: "flex",
                    },
                  },
                }}
                py={1}
              >
                <Stack gap={2} width="100%">
                  <Card
                    elevation={0}
                    sx={{
                      backgroundColor: "transparent",
                      backgroundImage: "unset",
                    }}
                    onClick={(e) => {
                      if (loading || voiceLoading) return;
                      onPlay(id, coverDoc);
                    }}
                  >
                    <CardActionArea>
                      <CardContent sx={{ p: 1 }}>
                        <Box display={"flex"} gap={1}>
                          <Box
                            minWidth={"65px"}
                            height="55px"
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
                              <Box
                                position={"absolute"}
                                bottom={-35}
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
                          <Avatar
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
                          />
                          <Stack>
                            <Typography variant="caption" component="a">
                              {songId === id
                                ? coverDoc.voices.find(
                                    (v) =>
                                      v.id ===
                                      (voiceId || coverDoc.voices[0].id)
                                  )?.creatorName
                                : coverDoc.voices[0].creatorName}
                              {/* {songId === id &&
                                !loading &&
                                !!lastSongLoadTime && (
                                  <Typography
                                    component={"span"}
                                    color="yellow"
                                    variant="caption"
                                  >
                                    {" "}
                                    - {lastSongLoadTime}s
                                  </Typography>
                                )} */}
                            </Typography>
                            <Typography>{coverDoc.title}</Typography>
                          </Stack>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
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
                  <Box display={"flex"} gap={1} alignItems="center" px={1}>
                    {!!coverDoc.likes?.total && (
                      <Tooltip title="Total Likes">
                        <Box display={"flex"} alignItems="center" gap={0.2}>
                          <FavoriteBorderRoundedIcon
                            fontSize="small"
                            sx={{ width: 12, height: 12, color: "#c3c3c3" }}
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
                            showCommentsByCoverId === id ? "#8973F8" : "#c3c3c3"
                          }
                        >
                          {coverDoc.commentsCount}
                        </Typography>
                      </Box>
                    )}
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
                  )}
                </Stack>
              </Box>
            );
          })}
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
                    <Avatar src={v.imageUrl} />
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
        </Stack>
      </Stack>
    );
  } else
    return (
      <Stack width="100%">
        <Header
          user={user}
          tempUserId={tempUserId}
          onUserChange={onUserChange}
          onRevoxRetry={onRevoxRetry}
          refreshHeader={refreshHeader}
        />
        <img src="/cover_banner.png" alt="" />
        <Stack py={2} width="100%">
          {(!coversSnapshot || coversSnapshot?.docs.length === 0) &&
            !coversLoading && (
              <Typography align="center">No Covers are available</Typography>
            )}
          {coversSnapshot?.docs.map((doc, i) => {
            const id = doc.id;
            const coverDoc = doc.data() as CoverV1;
            return (
              <Box
                key={id}
                display="flex"
                alignItems={"center"}
                gap={2}
                borderBottom="1px solid rgb(130, 137, 161)"
                flexGrow={1}
                sx={{
                  ":hover": {
                    ".avatar-play": {
                      display: "flex",
                    },
                  },
                }}
                // py={2}
              >
                {/* <Box display={"flex"} alignItems="center" alignSelf={"start"}>
                  <IconButton
                    disabled={loading || voiceLoading}
                    onClick={() => {
                      onPlay(id, coverDoc);
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
                </Box> */}
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
                    {i + 1}
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
                        <ExpandMoreRoundedIcon color="error" fontSize="large" />
                      )}
                    </Box>
                  </Typography>
                </Box>
                <Stack
                  alignItems="center"
                  justifyContent={"space-between"}
                  my={4}
                  position="relative"
                >
                  <Avatar
                    src={coverDoc.metadata.videoThumbnail}
                    onMouseEnter={(e) => handleClick(e, i)}
                    sx={{
                      alignSelf: "start",
                      borderRadius: "8px",
                      width: 100,
                      height: 100,
                      border: "1px solid",
                    }}
                    variant="square"

                    // onMouseLeave={handleClose}
                  />
                  <Box
                    className="avatar-play"
                    position={"absolute"}
                    top={0}
                    left={0}
                    width="100%"
                    height={"100%"}
                    zIndex={9}
                    display={id === songId ? "flex" : "none"}
                    justifyContent={"center"}
                    alignItems="center"
                    borderRadius="8px"
                    sx={{
                      background: "rgba(0,0,0,0.6)",
                    }}
                  >
                    <IconButton
                      size="small"
                      disabled={loading || voiceLoading}
                      onClick={() => {
                        onPlay(id, coverDoc);
                      }}
                    >
                      {loading && id === songId ? (
                        <CircularProgress
                          size={"24px"}
                          sx={{ color: "rgba(255,255,255,0.5)" }}
                        />
                      ) : isTonePlaying && id === songId ? (
                        <PauseRoundedIcon fontSize="large" />
                      ) : (
                        <PlayArrowRoundedIcon fontSize="large" />
                      )}
                    </IconButton>
                  </Box>
                </Stack>
                <Stack gap={1} py={2} flexGrow={1}>
                  <Box
                    display={"flex"}
                    alignItems="center"
                    gap={2}
                    width="100%"
                    flexWrap={"wrap"}
                  >
                    <Stack flexBasis="70%">
                      <Typography
                        variant="caption"
                        // color={
                        //   voiceId === coverDoc.voices[0].id && songId === id
                        //     ? "#8973F8"
                        //     : "#fff"
                        // }
                        component="a"
                        // onClick={() =>
                        //   onVoiceChange(
                        //     coverDoc.voices[0].id,
                        //     coverDoc.voices[0].name
                        //   )
                        // }
                      >
                        {songId === id
                          ? coverDoc.voices.find(
                              (v) => v.id === (voiceId || coverDoc.voices[0].id)
                            )?.creatorName
                          : coverDoc.voices[0].creatorName}
                        {/* {songId === id && !loading && !!lastSongLoadTime && (
                          <Typography
                            component={"span"}
                            color="yellow"
                            variant="caption"
                          >
                            {" "}
                            - {lastSongLoadTime}s
                          </Typography>
                        )} */}
                      </Typography>
                      <Typography
                      // sx={{
                      //   textOverflow: "ellipsis",
                      //   overflow: "hidden",
                      //   whiteSpace: "nowrap",
                      // }}
                      >
                        {coverDoc.title}
                      </Typography>
                    </Stack>
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
                    display={"flex"}
                    alignItems="center"
                    width={"100%"}
                    ref={sectionsBarRef}
                    position="relative"
                  >
                    {!songLoading &&
                      songId === id &&
                      coverDoc.sections?.map((section, i, arr) => (
                        <Button
                          disabled={
                            !sectionsWidth.length || loading || voiceLoading
                          }
                          key={section.start}
                          // p={0.85}
                          variant="contained"
                          color="info"
                          sx={{
                            mr: i === arr.length - 1 ? 0 : 0.5,
                            minWidth: 0,
                            display: sectionsWidth[i] > 1 ? "inherit" : "none",
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
                          // onMouseEnter={(e) => {
                          //   setSectionPopover(e.currentTarget);
                          //   setHoverSectionName(section.name);
                          // }}
                          // onMouseLeave={() => {
                          //   setSectionPopover(null);
                          // }}
                        />
                      ))}
                  </Box>
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
                  {/* <Box
                display={"flex"}
                alignItems="center"
                width={"100%"}
                ref={sectionsBarRef}
              >
                {!songLoading &&
                  songId === id &&
                  coverDoc.sections?.map((section, i) => (
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
                      // onMouseEnter={(e) => {
                      //   setSectionPopover(e.currentTarget);
                      //   setHoverSectionName(section.name);
                      // }}
                      // onMouseLeave={() => {
                      //   setSectionPopover(null);
                      // }}
                    />
                  ))}
              </Box> */}
                  {/* <Popover
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
                </Popover> */}
                  <Box>
                    <Box display={"flex"} gap={1} alignItems="center">
                      {!!coverDoc.likes?.total && (
                        <Tooltip title="Total Likes">
                          <Box display={"flex"} alignItems="center" gap={0.2}>
                            <FavoriteBorderRoundedIcon
                              fontSize="small"
                              sx={{ width: 12, height: 12, color: "#c3c3c3" }}
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
                        onChange={(e) => setNewCommentContent(e.target.value)}
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
                  )}
                </Stack>
              </Box>
            );
          })}
          {coversLoading && !coversSnapshot?.size && (
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
          <Box display={"flex"} gap={2} alignItems="center" py={2}>
            <Box
              minWidth={"85px"}
              display="flex"
              justifyContent={"center"}
              alignItems="center"
            >
              <IconButton
                disableFocusRipple
                disableRipple
                disableTouchRipple
                sx={{ cursor: "unset" }}
              >
                <AddCircleOutlineRoundedIcon />
              </IconButton>
            </Box>
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
                setIsNewCoverLoading(true);
                const vid = getYouTubeVideoId(newAiCoverUrl);
                if (vid) {
                  const isExists = await checkIfYoutubeVideoIdExists(vid);
                  if (isExists) {
                    setNewAiCoverUrl("");
                    setIsNewCoverLoading(false);
                    setErrorSnackbarMsg("Cover already Exists");
                    // TODO: Play that cover
                    return;
                  }
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
              Save
            </LoadingButton>
          </Box>
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
                    <Avatar src={v.imageUrl} />
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
        </Stack>
      </Stack>
    );
};

export default Rows;

// {
//   preCoversCollectionSnapshot?.docs.map((doc, i) => {
//     const preCoverDoc = doc.data() as PreCover;
//     const id = doc.id;
//     return (
//       <Box key={id} display="flex" alignItems={"center"} gap={2}>
//         <Box display={"flex"} alignItems="center">
//           <IconButton
//             // disabled={loading || voiceLoading}
//             onClick={async () => {
//               // createVoiceDoc();
//               const endTime = Math.round(Tone.Transport.seconds);
//               if (isTonePlaying && id === songId) {
//                 pausePlayer();
//               } else if (id === songId) {
//                 playPlayer();
//               } else {
//                 if (!started) {
//                   await initializeTone();
//                   setStarted(true);
//                 }
//                 if (isTonePlaying) {
//                   stopPlayer();
//                 }
//                 //   setSongId(id);
//                 onPreCoverSongClick(id, preCoverDoc);
//               }
//             }}
//           >
//             {loading && id === songId ? (
//               <CircularProgress size={"24px"} color="secondary" />
//             ) : isTonePlaying && id === songId ? (
//               <PauseRounded />
//             ) : (
//               <PlayArrow />
//             )}
//           </IconButton>
//         </Box>
//         <Avatar
//           src={preCoverDoc.avatarUrl}
//           onMouseEnter={(e) => handleClick(e, i)}
//           // onMouseLeave={handleClose}
//         />
//         <Stack gap={1} width="100%">
//           <Box display={"flex"} alignItems="center" gap={2}>
//             <Stack>
//               <Typography variant="caption" color={"#fff"}>
//                 {preCoverDoc.creator}
//               </Typography>
//               <Typography>{preCoverDoc.title}</Typography>
//             </Stack>
//             <Box display={"flex"} flexGrow={1}>
//               <Chip
//                 avatar={
//                   <Avatar
//                     src={getCoverCreatorAvatar(
//                       preCoverDoc.shareInfo.id,
//                       preCoverDoc.shareInfo.avatar
//                     )}
//                   />
//                 }
//                 disabled={loading || voiceLoading}
//                 // key={coverDoc.voices[0].name}
//                 label={preCoverDoc.voiceName}
//                 // variant={
//                 //   songId === id && voiceId === coverDoc.voices[0].id
//                 //     ? "outlined"
//                 //     : "filled"
//                 // }
//                 // color={
//                 //   songId === id && voiceId === coverDoc.voices[0].id
//                 //     ? "info"
//                 //     : "default"
//                 // }
//                 clickable
//                 onClick={async () => {
//                   // createVoiceDoc();
//                   const endTime = Math.round(Tone.Transport.seconds);
//                   if (isTonePlaying && id === songId) {
//                     pausePlayer();
//                   } else if (id === songId) {
//                     playPlayer();
//                   } else {
//                     if (!started) {
//                       await initializeTone();
//                       setStarted(true);
//                     }
//                     if (isTonePlaying) {
//                       stopPlayer();
//                     }
//                     //   setSongId(id);
//                     onPreCoverSongClick(id, preCoverDoc);
//                   }
//                 }}
//                 // onClick={() => {
//                 //   // if (songId) {
//                 //   //   onVoiceChange(
//                 //   //     coverDoc.voices[0].id,
//                 //   //     coverDoc.voices[0].name
//                 //   //   );
//                 //   // } else {
//                 //   //   onPlay(id);
//                 //   // }
//                 //   //   setVoice(v.id);
//                 // }}
//               />
//             </Box>
//           </Box>
//           {/* {preCoverDoc.voiceName} */}
// <Box
//   display={"flex"}
//   alignItems="center"
//   width={"100%"}
//   ref={sectionsBarRef}
// >
//   {!songLoading && songId === id && (
//     <>
//       {!preCoverDoc.sections?.length && (
//         <Typography
//           variant="caption"
//           mr={1}
//           sx={{ textDecoration: "italic" }}
//           color="gray"
//         >
//           Processing
//         </Typography>
//       )}
//       {(
//         preCoverDoc.sections ||
//         new Array(6).fill({ name: "", start: 0 })
//       ).map((section, i) => (
//         <Button
//           disabled={!sectionsWidth.length || loading || voiceLoading}
//           key={section.start}
//           // p={0.85}
//           variant="contained"
//           color="info"
//           sx={{
//             mr: 0.5,
//             minWidth: 0,
//             width: sectionsWidth.length ? sectionsWidth[i] : "120px",
//             transition: "transform 0.3s ease",
//             ":hover": {
//               zIndex: 999,
//               transform: "scale(1.5)",
//               background: "#563FC8",
//             },
//           }}
//           onClick={() => {
//             Tone.Transport.seconds = timeToSeconds(
//               section.start.toString()
//             );
//             if (!isTonePlaying) playPlayer();
//           }}
//           // onMouseEnter={(e) => {
//           //   setSectionPopover(e.currentTarget);
//           //   setHoverSectionName(section.name);
//           // }}
//           // onMouseLeave={() => {
//           //   setSectionPopover(null);
//           // }}
//         />
//       ))}
//     </>
//   )}
// </Box>
//         </Stack>
//       </Box>
//     );
//   });
// }
