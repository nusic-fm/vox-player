import { Box, Stack, Typography } from "@mui/material";

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
          How Do I Share My AI Cover?
        </Typography>
        <Typography variant="body2">
          Simply paste the Youtube url of your AI Cover into the input field at
          the bottom of the charts.
        </Typography>
        <Typography variant="body2">
          Only Youtube urls are currently supported. More options will be coming
          soon...
        </Typography>
      </Stack>
      <Stack
        p={2}
        sx={{ backgroundColor: "rgba(29, 33, 38, 1)" }}
        gap={2}
        flex={1}
        borderRadius={2}
      >
        <Typography color={"rgb(140, 118, 253)"}>What is REVOX?</Typography>
        <Typography variant="body2">
          REVOX enables loading of RVC models to an AI Cover of your choice, so
          you can hear it in an alternative voice.
        </Typography>
        <Typography variant="body2">
          Alternatively you can select a voice another user has already loaded
          into the chart...
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
