import { Box, Slider, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import * as Tone from "tone";
import { formatDuration } from "../helpers";

type Props = {
  isTonePlaying: boolean;
  loading: boolean;
  duration: number;
};

const AudioProgress = ({ isTonePlaying, duration, loading }: Props) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (isTonePlaying) {
      const intervalRef = setInterval(() => {
        setCurrentValue(Tone.Transport.seconds);
      }, 50);
      return () => clearInterval(intervalRef);
    }
  }, [isTonePlaying]);

  return (
    <Box display="flex" gap={2} flex={1} alignItems="center">
      <Typography variant="caption" color={"#c4c4c4"}>
        {formatDuration(currentValue)}
      </Typography>
      <Slider
        disabled={loading}
        value={currentValue}
        min={0}
        step={1}
        max={duration}
        onChangeCommitted={(e, val) => {
          if (!isTonePlaying) Tone.Transport.start(undefined, val as number);
          else Tone.Transport.seconds = val as number;
        }}
        size="small"
        sx={{
          // flexGrow: 5,
          // flexShrink: 5,
          color: "#fff",
          height: 2,
          p: 1,
          "&.MuiSlider-root": {
            padding: "0px !important",
          },
          "& .MuiSlider-thumb": {
            width: 8,
            height: 8,
            transition: "0.3s cubic-bezier(.47,1.64,.41,.8)",
            "&::before": {
              boxShadow: "0 2px 12px 0 rgba(0,0,0,0.4)",
            },
            "&:hover, &.Mui-focusVisible": {
              boxShadow: `0px 0px 0px 8px rgb(255 255 255 / 16%)`,
            },
            "&.Mui-active": {
              width: 20,
              height: 20,
            },
          },
          "& .MuiSlider-rail": {
            opacity: 0.28,
          },
        }}
      />
      <Typography variant="caption" color={"#c4c4c4"}>
        {formatDuration(duration)}
      </Typography>
    </Box>
  );
};

export default AudioProgress;
