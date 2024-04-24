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
import { collection, query, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
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
import { getYouTubeVideoId, nameToSlug } from "../helpers";
import VoiceModelDialog from "./VoiceModelDialog";
// import { createRevoxProgressDoc } from "../services/db/revoxQueue.service";
import { LoadingButton } from "@mui/lab";
import CoverInfoDialog from "./CoverInfoDialog";
// import { PreCover } from "../services/db/preCovers.service";
import { User } from "../services/db/users.service";
import { CoverV1, VoiceV1Cover } from "../services/db/coversV1.service";
import { createRevoxProgressDoc } from "../services/db/revoxQueue.service";

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

type Props = { user?: User };

const Rows = ({ user }: Props) => {
  const [coversCollectionSnapshot, coversLoading] = useCollection(
    query(collection(db, "covers_v1"), where("audioUrl", "!=", ""))
  );
  // const [preCoversCollectionSnapshot] = useCollection(
  //   collection(db, "pre_covers")
  // );
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
  // const [sectionPopover, setSectionPopover] = useState<HTMLElement | null>(
  //   null
  // );
  // const [hoverSectionName, setHoverSectionName] = useState("");
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
  const [revoxSongInfo, setRevoxSongInfo] = useState<CoverV1 | null>(null);
  const [successSnackbarMsg, setSuccessSnackbarMsg] = useState("");
  const [isNewCoverLoading, setIsNewCoverLoading] = useState(false);
  const [coverInfo, setCoverInfo] = useState<YTP_CONTENT>();

  const handleClick = (event: React.MouseEvent<HTMLDivElement>, i: number) => {
    setAnchorEl({ elem: event.currentTarget, idx: i });
  };
  const onSongClick = async (_id: string, endTime: number) => {
    setSongLoading(true);
    const cover = coversCollectionSnapshot?.docs.find((c) => c.id === _id);
    const coverDoc = cover?.data() as CoverV1;
    const voice_id = coverDoc.voices[0].id;
    const _instrUrl = `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers_v1%2F${_id}%2Finstrumental.mp3?alt=media`;
    //   const firstVoice = (artistsObj as any)[songId].voices[0].id;
    const _audioUrl = `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers_v1%2F${_id}%2F${voice_id}.mp3?alt=media`;
    // setVoice("");
    // setSongId(_id);
    pushLog(endTime);
    // await playAudio(_instrUrl, _audioUrl, true);
    // if (globalStateHook?.updateGlobalState) {
    if (coverDoc) {
      // `https://firebasestorage.googleapis.com/v0/b/dev-numix.appspot.com/o/syncledger%2F${songInfo.songImg}?alt=media`;
      await updateGlobalState({
        songImg: coverDoc.voices[0].imageUrl,
        songName: coverDoc.title,
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
      if (coverDoc.sections) {
        const differences = coverDoc.sections.map(
          (s, i, arr) => (arr[i + 1]?.start || 20) - s.start
        );
        const durations = getWidthByDuration(
          differences,
          sectionsBarRef.current?.offsetWidth || 500
        );
        setSectionsWidth(durations);
      }

      setStartLog({
        song: coverDoc.title,
        voice: coverDoc.voices[0].name,
        start: 0,
        end: 0,
        userName,
      });
    }
    setPrevSeconds(0);
    setSongLoading(false);
  };
  const onPreCoverSongClick = async (_id: string, preCoverDoc: CoverV1) => {
    setSongLoading(true);

    await updateGlobalState({
      songImg: preCoverDoc.voices[0].imageUrl,
      songName: preCoverDoc.title,
      coverVocalsUrl: preCoverDoc.audioUrl,
      fromStart: true,
      voices: [],
      songId: _id,
      bpm: 120,
    });
    if (preCoverDoc.sections?.length) {
      const differences = preCoverDoc.sections.map(
        (s, i, arr) => (arr[i + 1]?.start || 20) - s.start
      );
      const durations = getWidthByDuration(
        differences,
        sectionsBarRef.current?.offsetWidth || 500
      );
      setSectionsWidth(durations);
    }
    // setStartLog({
    //   song: coverDoc.songName,
    //   voice: coverDoc.artistName,
    //   start: 0,
    //   end: 0,
    //   userName,
    // });

    setPrevSeconds(0);
    setSongLoading(false);
  };

  const onVoiceChange = async (_voiceId: string, voiceObj: VoiceV1Cover) => {
    setVoiceLoading(true);
    const _instrUrl = `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers%2F${songId}%2Fno_vocals.mp3?alt=media`;
    const _audioUrl = `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/covers%2F${songId}%2F${_voiceId}.mp3?alt=media`;
    // setVoice(_voiceId);
    // await playAudio(_instrUrl, _audioUrl);
    // if (globalStateHook?.updateGlobalState) {
    const cover = coversCollectionSnapshot?.docs.find((c) => c.id === songId);
    const coverDoc = cover?.data() as CoverV1;
    if (coverDoc) {
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
      });
      // }
      pushLog(Math.round(Tone.Transport.seconds));
      setStartLog({
        song: coverDoc.title,
        voice: voiceObj.name,
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
    if (user?.uid && coversCollectionSnapshot) {
      const docInfo = coversCollectionSnapshot.docs.find(
        (d) => d.id === songId
      );
      if (docInfo) {
        const coverDoc = docInfo.data() as CoverV1;
        const voiceInfo = coverDoc.voices.find((v) => v.id === voiceId);
        if (voiceInfo) {
          const voiceId = nameToSlug(voiceModelName);
          debugger;
          const progressDocId = await createRevoxProgressDoc({
            voiceObj: {
              creatorName: user.name,
              id: voiceId,
              imageUrl: "",
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
          setSuccessSnackbarMsg("Submitted the voice model for Revoxing");
          // TODO: check for existing voice id in the voices[]
          axios.post(`${import.meta.env.VITE_VOX_COVER_SERVER}/revox`, {
            progress_doc_id: progressDocId,
            cover_doc_id: songId,
            voice_model_url: voiceModelUrl,
            voice_model_name: voiceModelName,
            voice_id: voiceId,
          });
          setRevoxSongInfo(null);
        }
      }
    }
  };

  const onPlay = async (id: string, coverDoc: CoverV1) => {
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
      if (coverDoc.stemsReady) onSongClick(id, endTime);
      else onPreCoverSongClick(id, coverDoc);
    }
  };

  return (
    <Stack gap={2} py={2} width="100%">
      {coversCollectionSnapshot?.docs.map((doc, i) => {
        const id = doc.id;
        const coverDoc = doc.data() as CoverV1;
        return (
          <Box key={id} display="flex" alignItems={"center"} gap={2}>
            <Box display={"flex"} alignItems="center">
              <IconButton
                // disabled={loading || voiceLoading}
                onClick={() => onPlay(id, coverDoc)}
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
              src={coverDoc.metadata.videoThumbnail}
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
                    {coverDoc.voices[0].creatorName}
                  </Typography>
                  <Typography>{coverDoc.title}</Typography>
                </Stack>
                <Box display={"flex"} flexGrow={1}>
                  <Chip
                    avatar={<Avatar src={coverDoc.metadata.channelThumbnail} />}
                    disabled={loading || voiceLoading}
                    key={coverDoc.voices[0].name}
                    label={coverDoc.voices[0].name}
                    variant={
                      songId === id && voiceId === coverDoc.voices[0].id
                        ? "outlined"
                        : "filled"
                    }
                    color={
                      songId === id && voiceId === coverDoc.voices[0].id
                        ? "info"
                        : "default"
                    }
                    clickable
                    onClick={() => {
                      if (songId) {
                        onVoiceChange(
                          coverDoc.voices[0].id,
                          coverDoc.voices[0]
                        );
                      } else {
                        onPlay(id, coverDoc);
                      }
                      //   setVoice(v.id);
                    }}
                  />
                  {songId === id && (
                    <Box
                      display={"flex"}
                      flexGrow={1}
                      justifyContent="space-between"
                    >
                      <Box
                        display={"flex"}
                        gap={2}
                        mx={2}
                        sx={{ overflowX: "auto" }}
                      >
                        {coverDoc.voices.slice(1).map((v, i) => (
                          <Chip
                            avatar={<Avatar src={v.imageUrl} />}
                            disabled={loading || voiceLoading}
                            key={v.name}
                            label={v.name}
                            variant={voiceId === v.id ? "outlined" : "filled"}
                            color={voiceId === v.id ? "info" : "default"}
                            clickable
                            onClick={() => {
                              onVoiceChange(v.id, v);
                              //   setVoice(v.id);
                            }}
                          />
                        ))}
                      </Box>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          if (!user?.uid)
                            alert("Sign in to continue with Revox");
                          else setRevoxSongInfo(coverDoc);
                        }}
                        disabled={!coverDoc.stemsReady}
                      >
                        Revox
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
              <Box
                display={"flex"}
                alignItems="center"
                width={"100%"}
                ref={sectionsBarRef}
              >
                {!songLoading && songId === id && (
                  <>
                    {!coverDoc.sections?.length && (
                      <Typography
                        variant="caption"
                        mr={1}
                        sx={{ textDecoration: "italic" }}
                        color="gray"
                      >
                        Processing
                      </Typography>
                    )}
                    {(coverDoc.sections?.length
                      ? coverDoc.sections
                      : new Array(6).fill({ name: "", start: 0 })
                    ).map((section, i) => (
                      <Button
                        disabled={
                          !sectionsWidth.length || loading || voiceLoading
                        }
                        key={section.start}
                        // p={0.85}
                        variant="contained"
                        color="info"
                        sx={{
                          mr: 0.5,
                          minWidth: 0,
                          width: sectionsWidth.length
                            ? sectionsWidth[i]
                            : "120px",
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
                  </>
                )}
              </Box>
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
        <LoadingButton
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
