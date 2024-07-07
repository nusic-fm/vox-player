import Matter from "matter-js";

export const createMarbles = (
  marbleRadius: number,
  marbleBounce: number,
  friction: number
) => {
  const marbles: Matter.Body[] = [];
  // Create circles (falling objects)
  marbles.push(
    Matter.Bodies.circle(200, 0, marbleRadius, {
      restitution: marbleBounce,
      label: "Circle 1",
      friction,
      // collisionFilter: { mask: 0x0001 },
      render: {
        sprite: {
          texture:
            "https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/voice_models%2Favatars%2Fthumbs%2Farthur-morgan_rdr2-_200x200?alt=media&token=330a3b59-e78d-4b88-81a8-94142b3b4182",
          xScale: (2 * marbleRadius) / 200,
          yScale: (2 * marbleRadius) / 200,
        },
      },
    })
  );
  marbles.push(
    Matter.Bodies.circle(400, 0, marbleRadius, {
      restitution: marbleBounce,
      label: "Circle 2",
      friction,
      // collisionFilter: { mask: 0x0001 },
      render: {
        sprite: {
          texture:
            "https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/voice_models%2Favatars%2Fthumbs%2Fbillie-eilish-2019_200x200?alt=media&token=d2b5866e-0640-4bc7-915e-05a15cd532d5",
          xScale: (2 * marbleRadius) / 200,
          yScale: (2 * marbleRadius) / 200,
        },
      },
    })
  );
  marbles.push(
    Matter.Bodies.circle(600, 0, marbleRadius, {
      restitution: marbleBounce,
      label: "Circle 3",
      friction,
      // collisionFilter: { mask: 0x0001 },
      render: {
        sprite: {
          texture:
            "https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/voice_models%2Favatars%2Fthumbs%2Fchester-bennington-_200x200?alt=media&token=30576234-1f5a-4104-860a-103e06f452d8",
          xScale: (2 * marbleRadius) / 200,
          yScale: (2 * marbleRadius) / 200,
        },
      },
    })
  );
  marbles.push(
    Matter.Bodies.circle(500, 0, marbleRadius, {
      restitution: marbleBounce,
      label: "Circle 4",
      friction,
      // collisionFilter: { mask: 0x0001 },
      render: {
        sprite: {
          texture:
            "https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/voice_models%2Favatars%2Fthumbs%2Farthur-morgan_rdr2-_200x200?alt=media&token=330a3b59-e78d-4b88-81a8-94142b3b4182",
          xScale: (2 * marbleRadius) / 200,
          yScale: (2 * marbleRadius) / 200,
        },
      },
    })
  );
  return marbles;
};
