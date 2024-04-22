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
import {
  createPreCoverDoc,
  updatePreCoverDoc,
} from "../services/db/preCovers.service";
import { YTP_CONTENT } from "./Rows";

type Props = {
  coverInfo?: YTP_CONTENT;
  onClose: (snackbarMessage?: string) => void;
};

const CoverInfoDialog = ({ coverInfo, onClose }: Props) => {
  const [title, setTitle] = useState("");
  const [voiceName, setVoiceName] = useState("");
  const [creator, setCreator] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (coverInfo) {
      setTitle(coverInfo.title);
      setCreator(coverInfo.channelName);
    }
  }, [coverInfo]);

  const onSave = async () => {
    if (coverInfo && title && voiceName && creator) {
      setIsLoading(true);
      try {
        await axios.post(
          `${import.meta.env.VITE_VOX_COVER_SERVER}/ytp-audio-extract`,
          { youtube_url: coverInfo.url, id: coverInfo.vid }
        );
        const preCoverDocId = await createPreCoverDoc({
          audioUrl: `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/pre_covers%2F${coverInfo.vid}.mp3?alt=media`,
          ...coverInfo,
          title,
          voiceName,
          creator,
          sections: [],
        });
        try {
          await axios.post(
            `${import.meta.env.VITE_VOX_COVER_SERVER}/all-in-one`,
            { cover_doc_id: preCoverDocId }
          );
        } catch (e: any) {
          console.log(e);
          await updatePreCoverDoc(preCoverDocId, { error: e.message });
        }

        // TODO: allin1, First half
        onClose("Successfully Added.");
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
                src={coverInfo?.avatarUrl}
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
                  defaultValue={coverInfo?.channelName}
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
