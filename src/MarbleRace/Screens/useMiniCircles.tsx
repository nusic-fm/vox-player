import Matter from "matter-js";

const createComposite = (
  circleRadius: number,
  rectangleWidth: number,
  rectangleX: number,
  rectangleY: number,
  angle: number,
  isLeft: boolean
) => {
  // Create the two circular bodies
  const circleA = Matter.Bodies.circle(
    isLeft
      ? rectangleX - rectangleWidth - circleRadius
      : rectangleX + rectangleWidth + circleRadius,
    rectangleY - 50,
    circleRadius,
    {
      isStatic: true,
      render: { fillStyle: "#ff5733" },
    }
  );
  const circleB = Matter.Bodies.circle(
    isLeft
      ? rectangleX + rectangleWidth + circleRadius
      : rectangleX - rectangleWidth - circleRadius,
    rectangleY + 50,
    circleRadius,
    {
      isStatic: true,
      render: { fillStyle: "#ff5733" },
    }
  );

  // Create the rectangle body
  const rectangle = Matter.Bodies.rectangle(
    rectangleX,
    rectangleY,
    rectangleWidth,
    100,
    {
      isStatic: true,
      angle: angle,
      render: { fillStyle: "#ff5733" },
    }
  );

  // Create a composite body to combine the shapes
  // const compoundBody = Matter.Composite.create();
  // Matter.Composite.add(compoundBody, [circleA, circleB, rectangle]);
  const compoundBody = Matter.Body.create({
    parts: [circleA, circleB, rectangle],
    isStatic: true,
  });
  return compoundBody;
};

export const useMiniCirclesScreen = () => {
  const createMiniCircleBody = (offset: number = 0) => {
    const obstacles: (Matter.Body | Matter.Composite)[] = [];
    // const xEven = [20, 200, 400, 600, 760];
    // const xOdd = [110, 310, 510, 710];
    // const yAxises = [
    //   offset + 250,
    //   offset + 300,
    //   offset + 450,
    //   offset + 650,
    //   offset + 750,
    //   offset + 850,
    //   //   offset + 900,
    // ];
    const circleRadius = 20;
    const rectangleWidth = 15;
    const leftAngle = 235;
    const rightAngle = 10.05;
    obstacles.push(
      createComposite(
        circleRadius,
        rectangleWidth,
        100,
        offset + 250,
        leftAngle,
        true
      )
    );
    obstacles.push(
      Matter.Bodies.circle(200, offset + 200, circleRadius, {
        isStatic: true,
        render: { fillStyle: "#ff5733" },
      })
    );
    obstacles.push(
      Matter.Bodies.circle(400, offset + 200, circleRadius, {
        isStatic: true,
        render: { fillStyle: "#ff5733" },
      })
    );
    obstacles.push(
      Matter.Bodies.circle(600, offset + 200, circleRadius, {
        isStatic: true,
        render: { fillStyle: "#ff5733" },
      })
    );
    // Matter.Bodies.circle(i % 2 === 0 ? xEven[x] : xOdd[x], 250, circleRadius, {
    //   isStatic: true,
    // });
    // Matter.Bodies.circle(i % 2 === 0 ? xEven[x] : xOdd[x], 250, circleRadius, {
    //   isStatic: true,
    // });
    obstacles.push(
      createComposite(
        circleRadius,
        rectangleWidth,
        700,
        offset + 250,
        rightAngle,
        false
      )
    );
    obstacles.push(
      Matter.Bodies.circle(300, offset + 300, circleRadius, {
        isStatic: true,
        render: { fillStyle: "#ff5733" },
      })
    );
    obstacles.push(
      Matter.Bodies.circle(500, offset + 300, circleRadius, {
        isStatic: true,
        render: { fillStyle: "#ff5733" },
      })
    );
    obstacles.push(
      createComposite(
        circleRadius,
        rectangleWidth,
        70,
        offset + 450,
        leftAngle,
        true
      )
    );
    obstacles.push(
      Matter.Bodies.circle(200, offset + 400, circleRadius, {
        isStatic: true,
        render: { fillStyle: "#ff5733" },
      })
    );
    obstacles.push(
      Matter.Bodies.circle(400, offset + 400, circleRadius, {
        isStatic: true,
        render: { fillStyle: "#ff5733" },
      })
    );
    obstacles.push(
      Matter.Bodies.circle(600, offset + 400, circleRadius, {
        isStatic: true,
        render: { fillStyle: "#ff5733" },
      })
    );
    obstacles.push(
      createComposite(
        circleRadius,
        rectangleWidth,
        700,
        offset + 450,
        rightAngle,
        false
      )
    );
    obstacles.push(
      Matter.Bodies.circle(300, offset + 500, circleRadius, {
        isStatic: true,
        render: { fillStyle: "#ff5733" },
      })
    );
    obstacles.push(
      Matter.Bodies.circle(500, offset + 500, circleRadius, {
        isStatic: true,
        render: { fillStyle: "#ff5733" },
      })
    );
    obstacles.push(
      createComposite(
        circleRadius,
        rectangleWidth,
        70,
        offset + 650,
        leftAngle,
        true
      )
    );
    obstacles.push(
      Matter.Bodies.circle(200, offset + 600, circleRadius, {
        isStatic: true,
        render: { fillStyle: "#ff5733" },
      })
    );
    obstacles.push(
      Matter.Bodies.circle(400, offset + 600, circleRadius, {
        isStatic: true,
        render: { fillStyle: "#ff5733" },
      })
    );
    obstacles.push(
      Matter.Bodies.circle(600, offset + 600, circleRadius, {
        isStatic: true,
        render: { fillStyle: "#ff5733" },
      })
    );
    obstacles.push(
      createComposite(
        circleRadius,
        rectangleWidth,
        700,
        offset + 650,
        rightAngle,
        false
      )
    );
    obstacles.push(
      Matter.Bodies.circle(300, offset + 700, circleRadius, {
        isStatic: true,
        render: { fillStyle: "#ff5733" },
      })
    );
    obstacles.push(
      Matter.Bodies.circle(500, offset + 700, circleRadius, {
        isStatic: true,
        render: { fillStyle: "#ff5733" },
      })
    );
    obstacles.push(
      createComposite(
        circleRadius,
        rectangleWidth,
        70,
        offset + 850,
        leftAngle,
        true
      )
    );
    obstacles.push(
      Matter.Bodies.circle(200, offset + 800, circleRadius, {
        isStatic: true,
        render: { fillStyle: "#ff5733" },
      })
    );
    obstacles.push(
      Matter.Bodies.circle(400, offset + 800, circleRadius, {
        isStatic: true,
        render: { fillStyle: "#ff5733" },
      })
    );
    obstacles.push(
      Matter.Bodies.circle(600, offset + 800, circleRadius, {
        isStatic: true,
        render: { fillStyle: "#ff5733" },
      })
    );
    obstacles.push(
      createComposite(
        circleRadius,
        rectangleWidth,
        700,
        offset + 850,
        rightAngle,
        false
      )
    );
    obstacles.push(
      Matter.Bodies.circle(300, offset + 900, circleRadius, {
        isStatic: true,
        render: { fillStyle: "#ff5733" },
      })
    );
    obstacles.push(
      Matter.Bodies.circle(500, offset + 900, circleRadius, {
        isStatic: true,
        render: { fillStyle: "#ff5733" },
      })
    );
    // yAxises.map((y, i) =>
    //   [0, 1, 2, 3, 4].map((x) =>
    //     obstacles.push(
    //       Matter.Bodies.circle(
    //         i % 2 === 0 ? xEven[x] : xOdd[x],
    //         y,
    //         circleRadius,
    //         {
    //           isStatic: true,
    //         }
    //       )
    //     )
    //   )
    // );

    return obstacles;
  };

  return { createMiniCircleBody };
};
