import { Slider } from "@mui/material";
import { useEffect, useState } from "react";
import * as Tone from "tone";

type Props = { isTonePlaying: boolean; duration: number };

const SimpleAudioProgress = ({ isTonePlaying, duration }: Props) => {
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
    <Slider
      value={currentValue}
      max={duration}
      min={0}
      size="small"
      //   onChangeCommitted={(e, val) => (Tone.Transport.seconds = val as number)}
      sx={{
        height: "1px",
        p: 0,
        "&.MuiSlider-root": {
          padding: "0px !important",
        },
        "& .MuiSlider-thumb": {
          display: "none",
        },
      }}
    />
  );
};

export default SimpleAudioProgress;
