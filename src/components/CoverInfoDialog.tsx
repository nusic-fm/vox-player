import { LoadingButton } from "@mui/lab";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Stack,
  TextField,
  // FormControlLabel,
  // Checkbox,
  DialogActions,
  // Button,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { nameToSlug } from "../helpers";
import {
  createCoverV1Doc,
  deleteCoverDoc,
  updateCoverV1Doc,
} from "../services/db/coversV1.service";
// import {
//   createPreCoverDoc,
//   updatePreCoverDoc,
// } from "../services/db/preCovers.service";
import { User } from "../services/db/users.service";
import { YTP_CONTENT } from "./Rows";

type Props = {
  coverInfo?: YTP_CONTENT;
  onClose: (snackbarMessage?: string) => void;
  user?: User;
};

const CoverInfoDialog = ({ coverInfo, onClose, user }: Props) => {
  const [title, setTitle] = useState("");
  const [voiceName, setVoiceName] = useState("");
  const [creator, setCreator] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (coverInfo) {
      setTitle(coverInfo.title);
      setCreator(coverInfo.channelTitle);
    }
  }, [coverInfo]);

  const onSave = async () => {
    if (coverInfo && title && voiceName && creator && user) {
      setIsLoading(true);
      const voiceId = nameToSlug(voiceName);
      try {
        const coverV1DocId = await createCoverV1Doc({
          audioUrl: "",
          metadata: {
            channelId: coverInfo.channelId,
            channelTitle: coverInfo.channelTitle,
            channelThumbnail: coverInfo.channelThumbnail,
            channelDescription: coverInfo.channelDescription,
            videoName: coverInfo.title,
            videoThumbnail: coverInfo.videoThumbnail,
            videoDescription: coverInfo.videoDescription,
          },
          vid: coverInfo.vid,
          title,
          voices: [
            {
              name: voiceName,
              id: voiceId,
              creatorName: coverInfo.channelTitle,
              imageUrl: coverInfo.channelThumbnail,
              shareInfo: {
                id: user.uid,
                avatar: user.avatar,
                name: user.name,
              },
            },
          ],
          shareInfo: {
            avatar: user.avatar,
            id: user.uid,
            name: user.name,
          },
          // From Allin1
          sections: [],
          bpm: 0,
          duration: 0,
          // From No-RVC
          stemsReady: false,
          likes: { total: 0 },
          playCount: 0,
          prevRank: 0,
          rank: 0,
          totalLikesValue: 0,
        });
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_VOX_COVER_SERVER}/ytp-audio-extract`,
            { youtube_url: coverInfo.url, cover_doc_id: coverV1DocId }
          );
          if (res.data?.audioPath) {
            await updateCoverV1Doc(coverV1DocId, {
              duration: res.data.duration,
              audioUrl: `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/${encodeURIComponent(
                res.data.audioPath
              )}?alt=media`,
            });
            // createProgressDoc({
            //     coverId: coverV1DocId,
            //     voiceId,
            //     taskId: "no-rvc",
            //   }),
            //   createProgressDoc({
            //     coverId: coverV1DocId,
            //     taskId: "allin1",
            //   }),
            // `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/${encodeURIComponent(
            //   res.data?.audioPath
            // )}?alt=media`;
            // res.data?.audioPath;
            try {
              axios.post(
                `${import.meta.env.VITE_VOX_COVER_SERVER}/all-in-one`,
                {
                  cover_doc_id: coverV1DocId,
                }
              );
              axios.post(`${import.meta.env.VITE_VOX_COVER_SERVER}/no-rvc`, {
                cover_doc_id: coverV1DocId,
                voice_id: voiceId,
              });
              onClose("New Cover is Added Successfully");
            } catch (e: any) {
              onClose();
              console.log(e);
              // await updatePreCoverDoc(preCoverDocId, { error: e.message });
            }
          }
        } catch (e) {
          console.log(e);
          await deleteCoverDoc(coverV1DocId);
        } finally {
          await axios.post(
            `${import.meta.env.VITE_VOX_COVER_SERVER}/refresh-ranking`
          );
        }
      } catch (e) {
        console.log(e);
        alert("Upload Failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={!!coverInfo} onClose={() => onClose()}>
      <DialogTitle>New Cover Info</DialogTitle>
      <DialogContent>
        <Box p={1}>
          <Stack gap={2}>
            <TextField
              label="Title"
              defaultValue={coverInfo?.title}
              onChange={(e) => setTitle(e.target.value)}
              color="secondary"
            />
            <Box display={"flex"} gap={1}>
              <img
                src={coverInfo?.videoThumbnail}
                alt=""
                width={150}
                height={150}
                style={{ objectFit: "contain" }}
              />
              <Stack justifyContent={"space-around"}>
                <TextField
                  label="Voice Name"
                  color="secondary"
                  onChange={(e) => setVoiceName(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Creator"
                  defaultValue={coverInfo?.channelTitle}
                  onChange={(e) => setCreator(e.target.value)}
                  color="secondary"
                />
              </Stack>
            </Box>
            {/* <Box display={"flex"} gap={1}> */}
            {/* <FormControlLabel
                color="info"
                control={<Checkbox defaultChecked />}
                label="Credits Required"
              /> */}
            {/* </Box> */}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <LoadingButton loading={isLoading} variant="contained" onClick={onSave}>
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default CoverInfoDialog;
