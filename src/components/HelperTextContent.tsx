import { LoadingButton } from "@mui/lab";
import {
  Autocomplete,
  Box,
  Divider,
  Fab,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { getValue } from "firebase/remote-config";
import { useState } from "react";
import { createUserSubmissionDoc } from "../services/db/userSubmissions";
import { remoteConfig } from "../services/firebase.service";
import CountryCodes from "./CountryCodes.json";

type Props = {};

const HelperTextContent = (props: Props) => {
  const [name, setName] = useState<string>();
  const [mobile, setMobile] = useState<string>("");
  const [email, setEmail] = useState<string>();
  const [countryCode, setCountryCode] = useState<{
    name: string;
    flag: string;
    code: string;
  }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Stack gap={4}>
      <Box
        display="flex"
        gap={2}
        flexWrap="wrap"
        justifyContent={"center"}
        flexDirection={{ xs: "column", md: "row" }}
      >
        <Stack
          p={2}
          sx={{ backgroundColor: "rgba(29, 33, 38, 1)" }}
          gap={2}
          flex={1}
          borderRadius={2}
        >
          <Typography color={"rgb(140, 118, 253)"}>
            {getValue(remoteConfig, "q1").asString()}
          </Typography>
          <Typography variant="body2">
            {getValue(remoteConfig, "a1").asString().split("_")[0]}
          </Typography>
          <Typography variant="body2">
            {getValue(remoteConfig, "a1").asString().split("_")[1]}
          </Typography>
        </Stack>
        <Stack
          p={2}
          sx={{ backgroundColor: "rgba(29, 33, 38, 1)" }}
          gap={2}
          flex={1}
          borderRadius={2}
        >
          <Typography color={"rgb(140, 118, 253)"}>
            {getValue(remoteConfig, "q2").asString()}
          </Typography>
          <Typography variant="body2">
            {getValue(remoteConfig, "a2").asString().split("_")[0]}
          </Typography>
          <Typography variant="body2">
            {getValue(remoteConfig, "a2").asString().split("_")[1]}
          </Typography>
        </Stack>
        <Stack
          p={2}
          sx={{ backgroundColor: "rgba(29, 33, 38, 1)" }}
          gap={2}
          flex={1}
          borderRadius={2}
        >
          <Typography color={"rgb(140, 118, 253)"}>
            {getValue(remoteConfig, "q3").asString()}
          </Typography>
          <Typography variant="body2">
            {getValue(remoteConfig, "a3").asString().split("_")[0]}
          </Typography>
          <Typography variant="body2">
            {getValue(remoteConfig, "a3").asString().split("_")[1]}
          </Typography>
        </Stack>
      </Box>
      <Stack
        gap={2}
        p={2}
        sx={{ backgroundColor: "rgba(29, 33, 38, 1)" }}
        borderRadius={2}
      >
        <Stack gap={1}>
          <Typography variant="h5" align="center">
            {getValue(remoteConfig, "footer_head").asString()}
          </Typography>
          <Typography variant="subtitle1" align="center">
            {getValue(remoteConfig, "footer_content").asString()}
          </Typography>
        </Stack>
        <Divider />
        <Stack gap={1.5}>
          <Box
            display={"flex"}
            alignItems="center"
            gap={1}
            flexWrap={{ xs: "wrap", md: "unset" }}
          >
            <Typography flexBasis={{ md: "180px" }} flexShrink={0}>
              Song or Voice:
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Box>
          <Box
            display={"flex"}
            alignItems="center"
            gap={1}
            flexWrap={{ xs: "wrap", md: "unset" }}
          >
            <Typography flexBasis={{ md: "180px" }} flexShrink={0}>
              Email:
            </Typography>
            <TextField
              sx={{ width: { xs: "100%", md: "280px" } }}
              size="small"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Box>
          <Box
            display={"flex"}
            alignItems="center"
            gap={1}
            flexWrap={{ xs: "wrap", md: "unset" }}
          >
            <Typography flexBasis={{ md: "180px" }} flexShrink={0}>
              Phone:
            </Typography>
            <Box
              display={"flex"}
              gap={2}
              flexGrow={1}
              flexWrap={{ xs: "wrap", md: "unset" }}
            >
              <Autocomplete
                sx={{ width: { xs: 220, md: 280 } }}
                color="info"
                options={CountryCodes}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Country"
                    color="info"
                    variant="outlined"
                    size="small"
                    sx={{ ".MuiFormLabel-root": { color: "#878787" } }}
                    value={countryCode}
                  />
                )}
                onChange={(e, newValue) => {
                  if (newValue) {
                    setCountryCode(newValue);
                  }
                }}
                getOptionLabel={(option) => {
                  return `${option.flag} ${option.name}`;
                }}
              />
              <TextField
                label="Mobile"
                color="info"
                size="small"
                value={mobile}
                onChange={(e) => {
                  if (
                    !isNaN(Number(e.target.value)) &&
                    e.target.value.length <= 10
                  ) {
                    setMobile(e.target.value);
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <Typography mr={2} sx={{ color: "#878787" }}>
                      {countryCode?.code || ""}
                    </Typography>
                  ),
                }}
                type="tel"
                variant="outlined"
                sx={{
                  ".MuiFormLabel-root": { color: "#878787" },
                  width: { xs: "100%", md: 250 },
                }}
              />
            </Box>
          </Box>
        </Stack>
        <Box display={"flex"} justifyContent={"center"} my={2}>
          <LoadingButton
            loading={isSubmitting}
            variant="contained"
            disabled={!name || !email || !mobile}
            onClick={async () => {
              if (name && email && mobile && countryCode) {
                setIsSubmitting(true);
                await createUserSubmissionDoc({
                  name,
                  email,
                  mobile,
                  countryCode,
                });
                alert(
                  "Thank you for your submission, We will get back to you soon."
                );
                setIsSubmitting(false);
                setName("");
                setEmail("");
                setMobile("");
                setCountryCode(undefined);
              }
            }}
          >
            Submit
          </LoadingButton>
        </Box>
      </Stack>
      <Box display={"flex"} width="100%" justifyContent="center" gap={1}>
        <Fab
          sx={{ bgcolor: "rgba(48, 48, 48, 1)", width: 40, height: 40 }}
          size="small"
          color="primary"
          href={"https://discord.gg/eHyRQADgQ4"}
          target="_blank"
        >
          <img src="/discord_logo.webp" alt="discord" width={20} />
        </Fab>
        <Fab
          sx={{ bgcolor: "rgba(48, 48, 48, 1)", width: 40, height: 40 }}
          size="small"
          color="primary"
          href={"https://twitter.com/nusicOfficial"}
          target="_blank"
        >
          <img src="/x_logo_white.png" alt="x" width={14} />
        </Fab>
      </Box>
    </Stack>
  );
};

export default HelperTextContent;
