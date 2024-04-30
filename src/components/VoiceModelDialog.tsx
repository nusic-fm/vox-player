import { LoadingButton } from "@mui/lab";
import {
  Autocomplete,
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
import { useEffect, useState } from "react";
import FileUploadRoundedIcon from "@mui/icons-material/FileUploadRounded";
import { useDropzone } from "react-dropzone";
import { fileToArraybuffer } from "../helpers/audio";
import { uploadVoiceModel } from "../services/storage/voice_models";
import {
  createFirestoreId,
  createVoiceModelDoc,
  getVoiceModels,
  VoiceModelType,
} from "../services/db/voiceModels.service";
import { CoverV1 } from "../services/db/coversV1.service";

type Props = {
  open?: boolean;
  onClose: () => void;
  songInfo: CoverV1;
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
  const [voiceModels, setVoiceModels] = useState<VoiceModelType[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(false);
  const [isAutoCompleteOpen, setIsAutoCompleteOpen] = useState(false);
  const [selectedVoiceModel, setSelectedVoiceModel] =
    useState<VoiceModelType | null>(null);

  const fetchVoiceModels = async () => {
    setVoicesLoading(true);
    const models = await getVoiceModels();
    setVoiceModels(
      models
        .filter((m, i) => !!m.name && !!m.url)
        .map((m) => ({ ...m, label: `${m.name} (${m.creator})` }))
    );
    setVoicesLoading(false);
  };

  useEffect(() => {
    if (isAutoCompleteOpen && !voiceModels.length) {
      fetchVoiceModels();
    }
  }, [isAutoCompleteOpen]);

  return (
    <Dialog open onClose={onClose} fullWidth>
      <DialogTitle>Enter Voice Model Details</DialogTitle>

      <DialogContent>
        <DialogContentText align="center">{songInfo.title}</DialogContentText>
        <Box display={"flex"} mt={2} mb={1}>
          <Autocomplete
            color="secondary"
            size="small"
            fullWidth
            options={voiceModels}
            open={isAutoCompleteOpen}
            onOpen={() => setIsAutoCompleteOpen(true)}
            onClose={() => setIsAutoCompleteOpen(false)}
            loading={voicesLoading}
            onChange={(e, val) => {
              setSelectedVoiceModel(val);
              if (val) {
                setVoiceModelUrl(val.url);
                setVoiceModelName(val.name);
              } else {
                setVoiceModelUrl("");
                setVoiceModelName("");
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                color="secondary"
                label="User Submitted Voices"
              />
            )}
          />
        </Box>
        <Typography align="center">OR</Typography>
        <Stack gap={2} mt={1}>
          <TextField
            label="Model Url"
            placeholder="Enter a Url or Upload a Zip file"
            color="secondary"
            size="small"
            fullWidth
            value={
              selectedVoiceModel?.url ||
              (uploadedZip ? uploadedZip.name : voiceModelUrl)
            }
            onChange={(e) => setVoiceModelUrl(e.target.value)}
            disabled={!!uploadedZip || !!selectedVoiceModel}
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
              disabled={!!selectedVoiceModel}
              onChange={(e) => setVoiceModelName(e.target.value)}
            />
            {!selectedVoiceModel && (
              <TextField
                size="small"
                fullWidth
                label="Creator"
                onChange={(e) => setCreator(e.target.value)}
                color="secondary"
              />
            )}
            {!selectedVoiceModel && (
              <FormControlLabel
                color="info"
                control={<Checkbox defaultChecked />}
                label="Credits Required"
                onChange={(e, checked) => setCreditsRequired(checked)}
                disabled={!!selectedVoiceModel}
              />
            )}
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
            if ((!voiceModelUrl && !uploadedZip) || !voiceModelName) {
              setRevoxLoading(false);
              return alert("Url or Model name is missing");
            }
            setRevoxLoading(true);
            let _voiceModelUrl = voiceModelUrl;
            if (!selectedVoiceModel) {
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
            }
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
