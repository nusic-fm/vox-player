import { AnimationControls, motion } from "framer-motion";
import { nameToSlug } from "./helpers";

export const AngleDots = ({ x, y }: { x: number; y: number }) => {
  return (
    <motion.div
      style={{
        position: "absolute",
        // padding: 4,
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "#fff",
        left: x,
        top: y,
        zIndex: 9999999,
      }}
    />
  );
};
type Props = {
  mouseDownId: string | null;
  voices: string[];
  onMouseDown: (id: string) => void;
  ballRef: any;
  initialObj: { [key: string]: { x: number; y: number } };
  controls: AnimationControls;
  finalOverId: string | null;
};

const Marbles = ({
  mouseDownId,
  voices,
  onMouseDown,
  ballRef,
  initialObj,
  controls,
  finalOverId,
}: Props) => {
  return (
    <>
      {voices.map((id, i) => (
        // <Box
        //   key={id}
        //   sx={{
        //     "::after": {
        //       boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
        //       opacity: mouseDownId === id ? 1 : 0,
        //       // transition: opacity 0.3s ease-in-out;
        //     },
        //   }}
        // >
        <motion.div
          key={id}
          onMouseDown={(e: any) => {
            e.preventDefault();
            e.stopPropagation();
            onMouseDown(id);
          }}
          onTouchStart={(e: any) => {
            e.stopPropagation();
            onMouseDown(id);
          }}
          ref={(r) => {
            ballRef.current[id] = r;
          }}
          drag={false}
          //   dragConstraints={constraintsRef}
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            position: "absolute",
            background: `url(https://voxaudio.nusic.fm/voice_models%2Favatars%2Fthumbs%2F${nameToSlug(
              id
            )}_200x200?alt=media)`,
            backgroundSize: "cover",
            cursor: "pointer",
            zIndex: 999999,
            userSelect: "none",
          }}
          initial={{ x: initialObj[id].x }}
          animate={mouseDownId === id ? controls : initialObj[id]}
          transition={{
            y: {
              type: "spring",
              from: 0,
              to: initialObj[id].y,
              mass: ((1 + i) * 2) / 10,
              duration: 2,
            },
          }}
          title="Press & Hold"
        />
        // </Box>
      ))}
    </>
  );
};

export default Marbles;
