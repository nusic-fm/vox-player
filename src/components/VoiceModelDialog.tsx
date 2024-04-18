import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Cover } from "./Rows";
import FileUploadRoundedIcon from "@mui/icons-material/FileUploadRounded";
import { useDropzone } from "react-dropzone";
import { fileToArraybuffer } from "../helpers/audio";
import { uploadVoiceModel } from "../services/storage/voice_models";
import {
  createFirestoreId,
  createVoiceModelDoc,
} from "../services/db/voiceModels.service";

type Props = {
  open?: boolean;
  onClose: () => void;
  songInfo: Cover;
  onSubmit: (url: string, name: string) => void;
  uid?: string;
};

const VoiceModelDialog = ({ onClose, songInfo, onSubmit, uid }: Props) => {
  const [uploadedZip, setUploadedZip] = useState<File>();
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles: File[]) => {
      if (acceptedFiles.length) {
        setUploadedZip(acceptedFiles[0]);
      }
    },
    maxFiles: 1,
    accept: { "application/zip": [".zip"] },
  });
  const [revoxLoading, setRevoxLoading] = useState(false);
  const [creditsRequired, setCreditsRequired] = useState(false);
  const [voiceModelUrl, setVoiceModelUrl] = useState("");
  const [voiceModelName, setVoiceModelName] = useState("");
  const [creator, setCreator] = useState("");

  return (
    <Dialog open onClose={onClose} fullWidth>
      <DialogTitle>Enter Voice Model Details</DialogTitle>

      <DialogContent>
        <DialogContentText align="center">
          {songInfo.songName}
        </DialogContentText>
        <Stack gap={2} my={1}>
          <TextField
            label="Model Url"
            placeholder="Enter a Url or Upload a Zip file"
            color="secondary"
            size="small"
            fullWidth
            value={uploadedZip ? uploadedZip.name : voiceModelUrl}
            onChange={(e) => setVoiceModelUrl(e.target.value)}
            disabled={!!uploadedZip}
            InputProps={{
              endAdornment: (
                <IconButton {...getRootProps({ className: "dropzone" })}>
                  <FileUploadRoundedIcon />
                </IconButton>
              ),
            }}
          />
          <input {...getInputProps()} />
          <Box display={"flex"} gap={2}>
            <TextField
              label="Name"
              color="secondary"
              size="small"
              value={voiceModelName}
              onChange={(e) => setVoiceModelName(e.target.value)}
              fullWidth
            />
            <TextField
              size="small"
              fullWidth
              label="Creator"
              onChange={(e) => setCreator(e.target.value)}
              color="secondary"
            />
            <FormControlLabel
              color="info"
              control={<Checkbox defaultChecked />}
              label="Credits Required"
              onChange={(e, checked) => setCreditsRequired(checked)}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          loading={revoxLoading}
          variant="contained"
          sx={{ mx: "auto" }}
          onClick={async () => {
            if (!uid) return;
            setRevoxLoading(true);
            let _voiceModelUrl = voiceModelUrl;
            const id = createFirestoreId(voiceModelName);
            if (uploadedZip) {
              const buffer = await fileToArraybuffer(uploadedZip);
              await uploadVoiceModel(id, buffer);
              _voiceModelUrl = `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/voice_models%2F${id}.zip?alt=media`;
            }
            await createVoiceModelDoc({
              url: _voiceModelUrl,
              creator,
              creditsRequired,
              name: voiceModelName,
              slug: id,
              uid,
            });
            await onSubmit(_voiceModelUrl, voiceModelName);
            setRevoxLoading(false);
          }}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default VoiceModelDialog;
