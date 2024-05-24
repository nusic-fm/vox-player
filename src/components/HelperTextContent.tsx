import { Box, Stack, Typography } from "@mui/material";
import { getValue } from "firebase/remote-config";
import { remoteConfig } from "../services/firebase.service";

type Props = {};

const HelperTextContent = (props: Props) => {
  return (
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
          {getValue(remoteConfig, "a3").asString().split("_")[0]}
        </Typography>
      </Stack>
    </Box>
  );
};

export default HelperTextContent;
