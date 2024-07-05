import { Box, Button } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useCirclesScreen } from "./Screens/useCircles";
import Matter from "matter-js";
import { useMiniCirclesScreen } from "./Screens/useMiniCircles";
import { useCrossScreen } from "./Screens/useCross";
import { createRandomNumber } from "../helpers";
import { useTonejs } from "../hooks/useToneService";
import { LoadingButton } from "@mui/lab";
import * as Tone from "tone";
import { useBarsScreen } from "./Screens/useBars";
import { createTriangleBodiesScreen } from "./Screens/useTriangle";
type Props = {};

const voices = ["snoop-dogg", "cardi-b", "trevor_gta-v", "eric-cartman"];

// const coverId = "f0pmE4twBXnJmVrJzh18";
const index = (props: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const { createCircleBody } = useCirclesScreen();
  const { createMiniCircleBody } = useMiniCirclesScreen();
  const { createCrossesBody } = useCrossScreen();
  const { createBarsBody } = useBarsScreen();
  const [first, setFirst] = useState<string | null>(null);
  const voiceIdxRef = useRef<number | null>(null);
  const circlesRef = useRef<{ [key: string]: Matter.Body }>({});
  // const [circlePositions, setCirclePositions] = useState({
  //   circle1: { x: 0, y: 0 },
  //   circle2: { x: 0, y: 0 },
  // });
  const [autoScroll, setAutoScroll] = useState(false);
  const downloadStartedRef = useRef(false);
  const [coverDocId, setCoverDocId] = useState<string | null>(
    "f0pmE4twBXnJmVrJzh18"
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const { downloadAudioFiles, marbleRaceOnlyInstrument, marbleRacePlayVocals } =
    useTonejs();
  const [isInstrPlaying, setIsInstrPlaying] = useState(false);

  useEffect(() => {
    if (!downloadStartedRef.current && coverDocId) {
      downloadStartedRef.current = true;
      (async () => {
        setIsDownloading(true);
        await downloadAudioFiles([
          `https://voxaudio.nusic.fm/covers/${coverDocId}/instrumental.mp3`,
          ...voices
            // .map((v) => v.id)
            .map(
              (id) => `https://voxaudio.nusic.fm/covers/${coverDocId}/${id}.mp3`
            ),
        ]);
        setIsDownloading(false);
      })();
    }
  }, [coverDocId]);

  useEffect(() => {
    if (sceneRef.current) {
      const engine = Matter.Engine.create();
      const { world } = engine;
      engine.gravity.scale = 0.0015;

      const canvasWidth = 800;
      const marbleRadius = 35;
      const marbleBounce = 0.5;
      // Create circles (falling objects)
      const marble1 = Matter.Bodies.circle(380, 0, marbleRadius, {
        restitution: marbleBounce,
        label: "Circle 1",
        // collisionFilter: { mask: 0x0001 },
        render: {
          sprite: {
            texture:
              "https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/voice_models%2Favatars%2Fthumbs%2Farthur-morgan_rdr2-_200x200?alt=media&token=330a3b59-e78d-4b88-81a8-94142b3b4182",
            xScale: (2 * marbleRadius) / 200,
            yScale: (2 * marbleRadius) / 200,
          },
        },
      });
      const marble2 = Matter.Bodies.circle(380, 0, marbleRadius, {
        restitution: marbleBounce,
        label: "Circle 2",
        // collisionFilter: { mask: 0x0001 },
        render: {
          sprite: {
            texture:
              "https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/voice_models%2Favatars%2Fthumbs%2Fbillie-eilish-2019_200x200?alt=media&token=d2b5866e-0640-4bc7-915e-05a15cd532d5",
            xScale: (2 * marbleRadius) / 200,
            yScale: (2 * marbleRadius) / 200,
          },
        },
      });
      const marble3 = Matter.Bodies.circle(380, 0, marbleRadius, {
        restitution: marbleBounce,
        label: "Circle 3",
        // collisionFilter: { mask: 0x0001 },
        render: {
          sprite: {
            texture:
              "https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/voice_models%2Favatars%2Fthumbs%2Fchester-bennington-_200x200?alt=media&token=30576234-1f5a-4104-860a-103e06f452d8",
            xScale: (2 * marbleRadius) / 200,
            yScale: (2 * marbleRadius) / 200,
          },
        },
      });
      const marble4 = Matter.Bodies.circle(380, 0, marbleRadius, {
        restitution: marbleBounce,
        label: "Circle 4",
        // collisionFilter: { mask: 0x0001 },
        render: {
          sprite: {
            texture:
              "https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/voice_models%2Favatars%2Fthumbs%2Farthur-morgan_rdr2-_200x200?alt=media&token=330a3b59-e78d-4b88-81a8-94142b3b4182",
            xScale: (2 * marbleRadius) / 200,
            yScale: (2 * marbleRadius) / 200,
          },
        },
      });
      circlesRef.current = {
        marble1,
        marble2,
        marble3,
        marble4,
      };
      const screens: (Matter.Body | Matter.Constraint | Matter.Composite)[] =
        [];
      let startOffset = 100;
      const circleScreen = createCircleBody(startOffset);
      screens.push(...circleScreen);
      startOffset += 850; // Screen1 offset
      // startOffset += 300; // Gap
      const miniCircleScreen = createMiniCircleBody(startOffset);
      screens.push(...miniCircleScreen);
      startOffset += 850; // Screen1 offset
      startOffset += 300; // Gap
      const crossScreen = createCrossesBody(startOffset);
      screens.push(...crossScreen.crosses);
      screens.push(...crossScreen.constraints);
      startOffset += 850; // Screen1 offset
      startOffset += 300; // Gap
      // startOffset += 300; // Gap
      // startOffset += 850; // Screen1 offset
      // startOffset += 300; // Gap
      // const barsScreen = createBarsBody(startOffset);
      // screens.push(...barsScreen);
      // startOffset += 850; // Screen1 offset
      // startOffset += 600; // Gap
      const ground = Matter.Bodies.rectangle(
        0,
        startOffset,
        canvasWidth * 2,
        100,
        {
          isStatic: true,
        }
      );

      // // Function to create a checkered pattern canvas
      // function createCheckeredPattern(
      //   width: number,
      //   height: number,
      //   boxSize: number
      // ) {
      //   const canvas = render.canvas;
      //   const context = canvas.getContext("2d");
      //   if (!context) return;
      //   for (let y = 0; y < height; y += boxSize) {
      //     for (let x = 0; x < width; x += boxSize) {
      //       context.fillStyle =
      //         (x / boxSize + y / boxSize) % 2 === 0 ? "black" : "white";
      //       context.fillRect(x, y, boxSize, boxSize);
      //     }
      //   }

      //   return canvas;
      // }

      // // Create the checkered pattern texture
      // const patternCanvas = createCheckeredPattern(canvasWidth * 2, 100, 5);
      // const texture = patternCanvas?.toDataURL();
      // if (!texture) return alert("");

      // // Create finish line with texture
      // const ground = Matter.Bodies.rectangle(
      //   0,
      //   startOffset,
      //   canvasWidth * 2,
      //   100,
      //   {
      //     isStatic: true,
      //     render: {
      //       sprite: {
      //         texture: texture,
      //         xScale: 1,
      //         yScale: 1,
      //       },
      //     },
      //   }
      // );
      startOffset += 250; // Screen1 offset
      // const ceiling = Matter.Bodies.rectangle(
      //   canvasWidth / 2,
      //   0,
      //   canvasWidth,
      //   50,
      //   { isStatic: true }
      // );
      const leftWall = Matter.Bodies.rectangle(
        0,
        startOffset / 2,
        100,
        startOffset,
        { isStatic: true }
      );
      const rightWall = Matter.Bodies.rectangle(
        canvasWidth,
        startOffset / 2,
        100,
        startOffset,
        { isStatic: true, friction: 1 }
      );

      // Create a renderer
      const render = Matter.Render.create({
        element: sceneRef.current,
        engine: engine,
        options: {
          width: canvasWidth,
          height: startOffset,
          wireframes: false,
          background: "#fff",
        },
      });
      // add mouse control
      const mouse = Matter.Mouse.create(render.canvas);
      const mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: false,
          },
        },
      });
      if (isStarted) {
        Matter.World.add(world, [
          marble1,
          marble2,
          marble3,
          marble4,
          ...screens,
          // ...createCircleBody(startOffset + 600),
          // ...createMiniCircleBody(startOffset + 750),
          // ...createCircleBody(startOffset + 600),
          // ...createMiniCircleBody(startOffset + 2700),
          // ...createCircleBody(2100),
          // ...obstacles1,
          // ...obstacles2,
          // ...obstacles3,
          ground,
          // ceiling,
          leftWall,
          rightWall,
          mouseConstraint,
        ]);
      } else
        Matter.World.add(world, [
          ...screens,
          ground,
          // ceiling,
          leftWall,
          rightWall,
        ]);
      // keep the mouse in sync with rendering
      render.mouse = mouse;
      // Run the engine
      const runner = Matter.Runner.create();
      Matter.Runner.run(runner, engine);

      // Run the renderer
      Matter.Render.run(render);

      // Apply a constant torque to make the cross rotate
      const trails1: { x: number; y: number }[] = [];
      const trails2: { x: number; y: number }[] = [];
      const trails3: { x: number; y: number }[] = [];
      const trails4: { x: number; y: number }[] = [];
      Matter.Events.on(engine, "afterUpdate", () => {
        if (circlesRef.current && coverDocId) {
          // Interval to check which circle is in the first position
          // const interval = setInterval(() => {
          const yPos1 = circlesRef.current.marble1.position.y;
          const yPos2 = circlesRef.current.marble2.position.y;
          const yPos3 = circlesRef.current.marble3.position.y;
          const yPos4 = circlesRef.current.marble4.position.y;
          const voicesCircles = [yPos1, yPos2, yPos3, yPos4];
          const largest = Math.max(...voicesCircles);
          if (autoScroll) containerRef.current?.scrollTo(0, largest - 300);
          const index = voicesCircles.findIndex((v) => v === largest);
          if (voiceIdxRef.current !== index) {
            voiceIdxRef.current = index;
            // marbleRacePlayVocals(coverDocId, voices[index]);
          }
          // }, 10); // Check every second
        }
        trails1.push({ x: marble1.position.x, y: marble1.position.y - 20 });
        trails2.push({ x: marble2.position.x, y: marble2.position.y - 20 });
        trails3.push({ x: marble3.position.x, y: marble3.position.y - 20 });
        trails4.push({ x: marble4.position.x, y: marble4.position.y - 20 });
        const trailLength = 20;
        if (trails1.length > trailLength) {
          trails1.shift();
        }
        if (trails2.length > trailLength) {
          trails2.shift();
        }
        if (trails3.length > trailLength) {
          trails3.shift();
        }
        if (trails4.length > trailLength) {
          trails4.shift();
        }
      });

      Matter.Events.on(render, "afterRender", () => {
        const ctx = render.context;
        ctx.beginPath();
        ctx.lineWidth = 50;
        ctx.lineCap = "round";
        for (let i = 1; i < trails1.length; i++) {
          ctx.moveTo(trails1[i - 1].x, trails1[i - 1].y);
          ctx.lineTo(trails1[i].x, trails1[i].y);
        }
        for (let i = 1; i < trails2.length; i++) {
          ctx.moveTo(trails2[i - 1].x, trails2[i - 1].y);
          ctx.lineTo(trails2[i].x, trails2[i].y);
        }
        for (let i = 1; i < trails3.length; i++) {
          ctx.moveTo(trails3[i - 1].x, trails3[i - 1].y);
          ctx.lineTo(trails3[i].x, trails3[i].y);
        }
        for (let i = 1; i < trails4.length; i++) {
          ctx.moveTo(trails4[i - 1].x, trails4[i - 1].y);
          ctx.lineTo(trails4[i].x, trails4[i].y);
        }
        ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
        ctx.stroke();

        // for (let i = 1; i < trails.length; i++) {
        //   ctx.beginPath();
        //   ctx.moveTo(trails[i - 1].x, trails[i - 1].y);
        //   ctx.lineTo(trails[i].x, trails[i].y);

        //   const gradient = ctx.createLinearGradient(
        //     trails[i - 1].x,
        //     trails[i - 1].y,
        //     trails[i].x,
        //     trails[i].y
        //   );
        //   // gradient.addColorStop(0, marbleColor);
        //   gradient.addColorStop(1, "rgba(255, 0, 0, 0)"); // Transparent end

        //   ctx.strokeStyle = gradient;
        //   ctx.lineWidth = marbleRadius * 2; // Set line width to match marble diameter
        //   ctx.stroke();
        // }
      });
      Matter.Events.on(engine, "beforeUpdate", function (event) {
        crossScreen.crosses.map((c, i) =>
          Matter.Body.setAngularVelocity(c, i % 2 ? 0.03 : -0.03)
        );
        // if (movingBar.position.x >= endX) {
        //   direction = -1; // Change direction to left
        // } else if (movingBar.position.x <= startX) {
        //   direction = 1; // Change direction to right
        // }

        // // Move the bar
        // Matter.Body.setPosition(movingBar, {
        //   x: movingBar.position.x + direction * speed,
        //   y: yPos,
        // });
      });
      // Event listener for collisions
      Matter.Events.on(engine, "collisionStart", function (event) {
        // var pairs = event.pairs;
        // pairs.forEach(function (pair) {
        //   if (
        //     barsScreen.includes(pair.bodyA) ||
        //     barsScreen.includes(pair.bodyB)
        //   ) {
        //     if (barsScreen.includes(pair.bodyA)) {
        //       pair.bodyB.restitution = 2;
        //     } else {
        //       pair.bodyA.restitution = 2;
        //     }
        //   }
        // });
      });

      // Clean up
      return () => {
        Matter.Render.stop(render);
        Matter.Runner.stop(runner);
        Matter.World.clear(world, false);
        Matter.Engine.clear(engine);
        render.canvas.remove();
        // render.canvas = null;
        // render.context = null;
        render.textures = {};
      };
    }
  }, [isStarted]);

  return (
    <Box
      ref={containerRef}
      position={"relative"}
      display="flex"
      justifyContent={"center"}
      sx={{ height: "100vh", overflowY: "auto" }}
    >
      <div ref={sceneRef} />
      {!isStarted && coverDocId && (
        <Box
          position={"absolute"}
          top={0}
          left={0}
          width="100%"
          height={"100%"}
          display="flex"
          justifyContent={"center"}
          alignItems="center"
        >
          <LoadingButton
            variant="contained"
            loading={isDownloading}
            onClick={async () => {
              setIsStarted(true);
              await marbleRaceOnlyInstrument(coverDocId, 97);
              Tone.Transport.start(undefined, 10);

              setIsInstrPlaying(true);
              // playVoice(voices[0], 0, 10);
            }}
          >
            Start
          </LoadingButton>
        </Box>
      )}
    </Box>
  );
};

export default index;
