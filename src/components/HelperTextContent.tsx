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
          How Do I Make An AI Cover?
        </Typography>
        <Typography variant="body2">
          Visit{" "}
          <Typography
            component={"a"}
            href="https://vox.nusic.fm"
            target={"_blank"}
            sx={{ textDecoration: "underline" }}
          >
            vox.nusic.fm
          </Typography>{" "}
          to access the tooling to create AI Covers for free (Hugging Face
          account required).
        </Typography>
        <Typography variant="body2">
          There are also numerous paid tools available online, Google is your
          friend!
        </Typography>
      </Stack>
    </Box>
  );
};

export default HelperTextContent;
