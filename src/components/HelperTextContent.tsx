import { LoadingButton } from "@mui/lab";
import {
  Autocomplete,
  Box,
  Button,
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
    dial_code: string;
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
        <Stack gap={1}>
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
              fullWidth
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
            <Box display={"flex"} gap={1} flexGrow={1} flexWrap="wrap">
              <Autocomplete
                sx={{ width: 150 }}
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
                  return option.code;
                }}
              />
              <TextField
                label="Mobile"
                color="info"
                size="small"
                value={mobile}
                fullWidth
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
                      {countryCode?.dial_code || "+"}
                    </Typography>
                  ),
                }}
                type="tel"
                variant="outlined"
                sx={{ ".MuiFormLabel-root": { color: "#878787" } }}
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
    </Stack>
  );
};

export default HelperTextContent;
