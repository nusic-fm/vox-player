import Matter from "matter-js";

export const useBarsScreen = () => {
  const createBarsBody = (offset: number) => {
    const obstacles = [];
    obstacles.push(
      Matter.Bodies.rectangle(50, offset + 150, 80, 20, {
        isStatic: true,
      })
    );
    obstacles.push(
      Matter.Bodies.rectangle(250, offset + 150, 120, 20, {
        isStatic: true,
      })
    );
    obstacles.push(
      Matter.Bodies.rectangle(500, offset + 150, 80, 20, {
        isStatic: true,
      })
    );
    obstacles.push(
      Matter.Bodies.rectangle(400, offset + 350, 80, 20, {
        isStatic: true,
      })
    );
    obstacles.push(
      Matter.Bodies.rectangle(700, offset + 350, 100, 20, {
        isStatic: true,
      })
    );
    obstacles.push(
      Matter.Bodies.rectangle(200, offset + 550, 120, 20, {
        isStatic: true,
      })
    );
    obstacles.push(
      Matter.Bodies.rectangle(520, offset + 550, 60, 20, {
        isStatic: true,
      })
    );
    obstacles.push(
      Matter.Bodies.rectangle(60, offset + 750, 60, 20, {
        isStatic: true,
      })
    );
    obstacles.push(
      Matter.Bodies.rectangle(360, offset + 750, 60, 20, {
        isStatic: true,
      })
    );
    obstacles.push(
      Matter.Bodies.rectangle(700, offset + 750, 60, 20, {
        isStatic: true,
      })
    );
    return obstacles;
  };
  return { createBarsBody };
};
