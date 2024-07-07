import Matter from "matter-js";

export const useCrossScreen = () => {
  const createCrossesBody = (offset: number) => {
    // Define the properties of the cross
    const crossWidth = 40;
    const crossHeight = 200;

    const yAxises = [
      offset + 100,
      offset + 300,
      offset + 500,
      offset + 700,
      //   offset + 900,
    ];
    const xEven = [80, 720];
    const xOdd = [280, 520];
    let crosses: Matter.Body[] = [];
    let constraints: Matter.Constraint[] = [];
    yAxises.map((y, i) =>
      [0, 1, 2, 3, 4].map((x) => {
        // Create the horizontal and vertical rectangles
        const horizontalRect = Matter.Bodies.rectangle(
          i % 2 ? xOdd[x] : xEven[x],
          y,
          crossHeight,
          crossWidth,
          {
            render: { fillStyle: "#009fe1" },
          }
        );
        const verticalRect = Matter.Bodies.rectangle(
          i % 2 ? xOdd[x] : xEven[x],
          y,
          crossWidth,
          crossHeight,
          {
            render: { fillStyle: "#009fe1" },
          }
        );
        const cross = Matter.Body.create({
          parts: [horizontalRect, verticalRect],
          //   inertia: Infinity, // Prevents the body from rotating due to collisions
          isStatic: true,
        });
        crosses.push(cross);
        // constraints.push(
        //   Matter.Constraint.create({
        //     pointA: { x: i % 2 ? xOdd[x] : xEven[x], y },
        //     bodyB: cross,
        //     pointB: { x: 0, y: 0 },
        //     stiffness: 1,
        //     length: 0,
        //   })
        // );
      })
    );
    // // Create a compound body
    // const cross = Matter.Body.create({
    //   parts: [horizontalRect, verticalRect],
    //   //   inertia: Infinity, // Prevents the body from rotating due to collisions
    //   //   isStatic: true,
    // });
    // // Create a constraint to hold the cross in place
    // const constraint = Matter.Constraint.create({
    //   pointA: { x: crossX, y: crossY },
    //   bodyB: cross,
    //   pointB: { x: 0, y: 0 },
    //   stiffness: 1,
    //   length: 0,
    // });
    // // Matter.Body.setAngularVelocity(cross, 0.05);

    return { crosses, constraints };
  };

  return { createCrossesBody };
};
