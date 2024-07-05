import Matter from "matter-js";

export const createTriangleBodiesScreen = (offset: number) => {
  // Define the vertices for a triangle
  const vertices = [
    { x: 19.9, y: 20.1 },
    { x: 21.1, y: 18.9 },
    { x: 16.4, y: 0.7 },
    { x: 16.4, y: 0.7 },
    { x: 21.7, y: 12.4 },
    { x: 25.2, y: 11.3 },
    { x: 26.9, y: 6.2 },
    { x: 30.6, y: -3.5 },
    { x: 29.8, y: 6.3 },
    { x: 30.1, y: 10.2 },
    { x: 35.9, y: 5.0 },
    { x: 46.7, y: 6.0 },
    { x: 39.7, y: 16.6 },
    { x: 38.1, y: 19.5 },
    { x: 42.6, y: 25.1 },
    { x: 52.7, y: 23.8 },
    { x: 43.7, y: 28.1 },
    { x: 38.2, y: 34.2 },
    { x: 47.7, y: 39.1 },
    { x: 37.0, y: 37.7 },
    { x: 41.1, y: 45.7 },
    { x: 48.4, y: 53.6 },
    { x: 38.1, y: 46.0 },
    { x: 31.6, y: 49.0 },
    { x: 28.6, y: 43.0 },
    { x: 21.3, y: 57.0 },
    { x: 25.0, y: 42.7 },
    { x: 20.6, y: 47.0 },
    { x: 11.7, y: 55.0 },
    { x: 17.6, y: 46.0 },
    { x: 10.0, y: 37.0 },
    { x: 0.3, y: 37.1 },
    { x: 9.0, y: 33.8 },
    { x: 16.6, y: 31.3 },
    { x: 14.2, y: 25.5 },
    { x: 2.9, y: 23.9 },
    { x: 10.6, y: 24.6 },
    { x: 14.5, y: 25.3 },
    { x: 18.4, y: 19.5 },
    { x: 1.1, y: 7.7 },
    { x: 18.0, y: 22.0 },
    { x: 19.9, y: 20.1 },
  ];

  // Create a triangle
  const triangle = Matter.Bodies.fromVertices(
    400,
    200,
    [vertices],
    {
      isStatic: true,
      //   render: {
      //     fillStyle: "green", // Background color
      //   },
    },
    true
  );
  return [triangle];
};
