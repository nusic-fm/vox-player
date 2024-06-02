import { LoadingButton } from "@mui/lab";
import {
  Autocomplete,
  Avatar,
  Box,
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
import {
  uploadVoiceModel,
  uploadVoiceModelAvatar,
} from "../services/storage/voice_models";
import {
  createFirestoreId,
  createVoiceModelDoc,
  getVoiceModels,
  updateVoiceModelAvatar,
  VoiceModelTypeDoc,
} from "../services/db/voiceModels.service";
import { CoverV1 } from "../services/db/coversV1.service";

type Props = {
  open?: boolean;
  onClose: () => void;
  songInfo: CoverV1;
  onSubmit: (url: string, name: string, avatarPath: string) => void;
  uid?: string;
};

const VoiceModelDialog = ({ onClose, songInfo, onSubmit, uid }: Props) => {
  const [uploadedZip, setUploadedZip] = useState<File>();
  const [avatarFile, setAvatarFile] = useState<File>();
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles: File[]) => {
      if (acceptedFiles.length) {
        setUploadedZip(acceptedFiles[0]);
      }
    },
    maxFiles: 1,
    accept: { "application/zip": [".zip"] },
  });
  const {
    getRootProps: getAvatarRootProps,
    getInputProps: getAvatarInputProps,
  } = useDropzone({
    onDrop: async (acceptedFiles, rejections) => {
      if (rejections.length) {
        if (rejections[0].errors[0].code === "file-too-large")
          alert("File size is too large. Max size is 10MB");
        return;
      }
      if (acceptedFiles.length) {
        setAvatarFile(acceptedFiles[0]);
      }
    },
    maxFiles: 1,
    maxSize: 10000000, // 10MB
    // Accept only image files
    accept: { "image/*": [".jpg", ".jpeg", ".png"] },
  });
  const [revoxLoading, setRevoxLoading] = useState(false);
  const [creditsRequired, setCreditsRequired] = useState(false);
  const [onlyAvatar, setOnlyAvatar] = useState(false);
  const [voiceModelUrl, setVoiceModelUrl] = useState("");
  const [voiceModelName, setVoiceModelName] = useState("");
  const [creator, setCreator] = useState("");
  const [voiceModels, setVoiceModels] = useState<VoiceModelTypeDoc[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(false);
  const [isAutoCompleteOpen, setIsAutoCompleteOpen] = useState(false);
  const [selectedVoiceModel, setSelectedVoiceModel] =
    useState<VoiceModelTypeDoc | null>(null);

  const fetchVoiceModels = async () => {
    setVoicesLoading(true);
    const models = await getVoiceModels();
    setVoiceModels(models.filter((m, i) => !!m.name && !!m.url));
    setVoicesLoading(false);
  };

  useEffect(() => {
    if (avatarFile) {
      setAvatarUrl(URL.createObjectURL(avatarFile));
    }
  }, [avatarFile]);

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
            value={selectedVoiceModel}
            getOptionLabel={(option) => option.name}
            onChange={(e, val) => {
              setSelectedVoiceModel(val);
              if (val) {
                setVoiceModelUrl(val.url);
                setVoiceModelName(val.name);
                if (val.avatarPath)
                  setAvatarUrl(
                    `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/${encodeURIComponent(
                      val.avatarPath
                    )}?alt=media`
                  );
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
            renderOption={(props, option) => (
              <Box
                component="li"
                {...props}
                key={option.id}
                display="flex"
                alignItems={"center"}
                gap={2}
                // sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
              >
                <Avatar
                  sx={{ width: 24, height: 24 }}
                  src={
                    option.avatarPath
                      ? `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/${encodeURIComponent(
                          option.avatarPath
                        )}?alt=media`
                      : ""
                  }
                />
                <Typography>{option.name}</Typography>
                <Typography variant="caption" color="#c3c3c3" ml={"auto"}>
                  by {option.creator}
                </Typography>
              </Box>
            )}
          />
        </Box>
        <Typography align="center">OR</Typography>
        <Stack gap={2} mt={1}>
          <Box
            display="flex"
            alignItems={"center"}
            justifyContent="center"
            gap={2}
            flexWrap="wrap"
          >
            <Box
              {...getAvatarRootProps({ className: "dropzone" })}
              display="flex"
              justifyContent={"center"}
              alignItems={"center"}
              borderRadius="50%"
              height={100}
              width={100}
              border={"1px solid rgba(255, 255, 255, 0.23)"}
              sx={{
                cursor: "pointer",
                backgroundImage: `url(${avatarUrl})`,
                backgroundSize: "cover",
              }}
              position="relative"
            >
              <input {...getAvatarInputProps()} />
              {!avatarUrl && (
                <Typography align="center" variant="caption">
                  Upload <br /> Voice Avatar
                </Typography>
              )}
            </Box>
            <Box flexBasis={{ xs: "100%", md: "calc(100% - 116px)" }}>
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
            </Box>
          </Box>
          <Box display={"flex"} gap={2} flexWrap="wrap">
            <TextField
              sx={{ width: { xs: "100%", md: "180px" } }}
              label="Model Name"
              color="secondary"
              size="small"
              value={voiceModelName}
              disabled={!!selectedVoiceModel}
              onChange={(e) => setVoiceModelName(e.target.value)}
            />
            {selectedVoiceModel &&
              uid &&
              [
                "826040837275910154",
                "362272367063597056",
                "879400465861869638",
              ].includes(uid) && (
                <FormControlLabel
                  color="info"
                  control={<Checkbox checked={onlyAvatar} color="info" />}
                  label="Update only the Avatar"
                  onChange={(e, checked) => setOnlyAvatar(checked)}
                />
              )}
            {!selectedVoiceModel && (
              <TextField
                sx={{ width: { xs: "100%", md: "180px" } }}
                size="small"
                fullWidth
                label="Creator"
                onChange={(e) => setCreator(e.target.value)}
                color="secondary"
              />
            )}
            {!selectedVoiceModel && (
              <FormControlLabel
                sx={{ width: { xs: "100%", md: "100px" } }}
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
            if (
              (!voiceModelUrl && !uploadedZip) ||
              !voiceModelName ||
              !avatarFile
            ) {
              return alert("Url, Model, Name or Avatar is missing");
            }
            setRevoxLoading(true);
            let _voiceModelUrl = voiceModelUrl;
            const avatarBuffer = await fileToArraybuffer(avatarFile);
            const voiceId =
              selectedVoiceModel?.slug || createFirestoreId(voiceModelName);
            const avatarPath = await uploadVoiceModelAvatar(
              voiceId,
              avatarBuffer
            );
            if (!selectedVoiceModel) {
              if (uploadedZip) {
                const buffer = await fileToArraybuffer(uploadedZip);
                await uploadVoiceModel(voiceId, buffer);
                _voiceModelUrl = `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/voice_models%2F${voiceId}.zip?alt=media`;
              }

              await createVoiceModelDoc({
                url: _voiceModelUrl,
                creator,
                creditsRequired,
                name: voiceModelName,
                slug: voiceId,
                uid,
                avatarPath,
              });
            } else if (onlyAvatar) {
              await updateVoiceModelAvatar(selectedVoiceModel?.id, avatarPath);
            }
            if (onlyAvatar === false)
              await onSubmit(_voiceModelUrl, voiceModelName, avatarPath);
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
