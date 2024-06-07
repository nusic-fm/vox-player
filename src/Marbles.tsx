import { AnimationControls, motion } from "framer-motion";
import { nameToSlug } from "./helpers";

export const AngleDots = ({ x, y }: { x: number; y: number }) => {
  return (
    <motion.div
      style={{
        position: "absolute",
        // padding: 4,
        width: 10,
        height: 10,
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
  angleOne: { x: number; y: number };
  angleTwo: { x: number; y: number };
  voices: string[];
  onMouseDown: (e: any, id: string) => void;
  ballRef: any;
  initialObj: { [key: string]: { x: number; y: number } };
  controls: AnimationControls;
};

const Marbles = ({
  mouseDownId,
  angleOne,
  angleTwo,
  voices,
  onMouseDown,
  ballRef,
  initialObj,
  controls,
}: Props) => {
  return (
    <>
      {mouseDownId && <AngleDots x={angleOne.x} y={angleOne.y} />}
      {mouseDownId && <AngleDots x={angleTwo.x} y={angleTwo.y} />}
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
            onMouseDown(e, id);
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
            background: `url('/${nameToSlug(id)}.png')`,
            backgroundSize: "cover",
            cursor: "pointer",
            zIndex: 999999,
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
