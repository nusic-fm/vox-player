import Matter from "matter-js";

export const createUtils = (startOffset: number, canvasWidth: number) => {
  const ceiling = Matter.Bodies.rectangle(canvasWidth / 2, 0, canvasWidth, 50, {
    isStatic: true,
  });
  const ground = Matter.Bodies.rectangle(0, startOffset, canvasWidth * 2, 100, {
    isStatic: true,
  });
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
    { isStatic: true }
  );

  return [ceiling, ground, leftWall, rightWall];
};
