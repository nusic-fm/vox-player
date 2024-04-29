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
      //   onChangeCommitted={(e, val) => (Tone.Transport.seconds = val as number)}
      sx={{
        height: 1,
        p: 0,
        // transition: "linear",
        // ".MuiSlider-thumb": {
        //   height: 24,
        //   width: 12,
        //   borderRadius: "4px",
        // },
        "& .MuiSlider-thumb": {
          display: "none",
          //   height: 24,
          //   width: 12,
          //   borderRadius: "4px",
          //   transition: "0.3s cubic-bezier(.47,1.64,.41,.8)",
          //   "&::before": {
          //     boxShadow: "0 2px 12px 0 rgba(0,0,0,0.4)",
          //   },
          //   "&:hover, &.Mui-focusVisible": {
          //     boxShadow: `0px 0px 0px 8px rgb(255 255 255 / 16%)`,
          //   },
          //   "&.Mui-active": {
          //     width: 16,
          //     height: 32,
          //   },
        },
        // ".MuiSlider-rail": {
        //   backgroundColor: "transparent",
        // },
        // "& .MuiSlider-rail": {
        //   opacity: 0.28,
        // },
      }}
    />
  );
};

export default SimpleAudioProgress;
