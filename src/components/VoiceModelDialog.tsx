import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Cover } from "./Rows";

type Props = {
  open?: boolean;
  onClose: () => void;
  songInfo: Cover;
  onSubmit: (url: string, name: string) => void;
};

const VoiceModelDialog = ({ onClose, songInfo, onSubmit }: Props) => {
  const [revoxLoading, setRevoxLoading] = useState(false);
  const [voiceModelUrl, setVoiceModelUrl] = useState("");
  const [voiceModelName, setVoiceModelName] = useState("");

  return (
    <Dialog open onClose={onClose} fullWidth>
      <DialogTitle>Enter Voice Model Detail</DialogTitle>

      <DialogContent>
        <DialogContentText align="center">
          {songInfo.songName}
        </DialogContentText>
        <Stack gap={2} my={1}>
          <TextField
            label="Model Url"
            color="secondary"
            size="small"
            fullWidth
            value={voiceModelUrl}
            onChange={(e) => setVoiceModelUrl(e.target.value)}
          />
          <Box>
            <TextField
              label="Name"
              color="secondary"
              size="small"
              value={voiceModelName}
              onChange={(e) => setVoiceModelName(e.target.value)}
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
            setRevoxLoading(true);
            await onSubmit(voiceModelUrl, voiceModelName);
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
