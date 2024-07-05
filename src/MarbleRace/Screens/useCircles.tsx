import Matter from "matter-js";

export const useCirclesScreen = () => {
  const createCircleBody = (offset: number) => {
    const obstacle1 = Matter.Bodies.circle(0, offset + 150, 80, {
      isStatic: true,
    });
    const obstacle2 = Matter.Bodies.circle(800, offset + 150, 80, {
      isStatic: true,
    });
    const obstacle3 = Matter.Bodies.circle(400, offset + 150, 80, {
      isStatic: true,
    });
    const obstacle4 = Matter.Bodies.circle(200, offset + 300, 50, {
      isStatic: true,
    });

    const obstacle5 = Matter.Bodies.circle(600, offset + 300, 50, {
      isStatic: true,
    });
    const obstacle6 = Matter.Bodies.circle(0, offset + 450, 80, {
      isStatic: true,
    });
    const obstacle7 = Matter.Bodies.circle(800, offset + 450, 80, {
      isStatic: true,
    });
    const obstacle8 = Matter.Bodies.circle(410, offset + 450, 80, {
      isStatic: true,
    });
    const obstacle9 = Matter.Bodies.circle(200, offset + 600, 50, {
      isStatic: true,
    });

    const obstacle10 = Matter.Bodies.circle(600, offset + 600, 50, {
      isStatic: true,
    });
    const obstacle11 = Matter.Bodies.circle(0, offset + 750, 80, {
      isStatic: true,
    });
    const obstacle12 = Matter.Bodies.circle(800, offset + 750, 80, {
      isStatic: true,
    });
    const obstacle13 = Matter.Bodies.circle(410, offset + 750, 80, {
      isStatic: true,
    });
    return [
      obstacle1,
      obstacle2,
      obstacle3,
      obstacle4,
      obstacle5,
      obstacle6,
      obstacle7,
      obstacle8,
      obstacle9,
      obstacle10,
      obstacle11,
      obstacle12,
      obstacle13,
    ];
  };

  return { createCircleBody };
};
