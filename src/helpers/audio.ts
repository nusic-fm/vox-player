export const fileToArraybuffer = async (file: Blob): Promise<ArrayBuffer> => {
  const reader = new FileReader();

  const promise: Promise<ArrayBuffer> = new Promise(
    (res) =>
      (reader.onload = (event) => {
        if (event.target?.result) res(event.target.result as ArrayBuffer);
      })
  );

  // Read the entire file as a data URL
  reader.readAsArrayBuffer(file);
  return promise;
};

export const fileToBase64 = async (file: Blob) => {
  const reader = new FileReader();

  const promise = new Promise(
    (res) =>
      (reader.onload = (event) => {
        if (event.target?.result)
          res((event.target.result as string).split(",")[1]);
      })
  );

  // Read the entire file as a data URL
  reader.readAsDataURL(file);
  return promise;
};

export const convertSecondsToHHMMSS = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let hhmmss = "";

  if (hours > 0) {
    hhmmss += hours + ":";
  }

  hhmmss += ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2);

  return hhmmss;
};

export const getObjectURLBlob = async (url: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return blob;
};
export const timeToSeconds = (time: string) => {
  const [minutes, seconds] = time.includes(".")
    ? time.split(".").map(Number)
    : [0, Number(time)];
  return minutes * 60 + seconds;
};
export const getWidthByDuration = (
  durations: number[],
  screenWidth: number
) => {
  const totalDuration = durations.reduce(
    (total, duration) => total + duration,
    0
  );
  const durationCount = durations.length;

  // Calculate the total width needed by all durations
  const totalWidthNeeded = durations.reduce(
    (total, duration) => total + duration.toString().length,
    0
  );

  // Calculate the width each duration should occupy
  const avgWidthPerDuration = screenWidth / totalWidthNeeded;

  // Display each duration with the calculated width
  // let output = "";
  return durations.map((duration) => {
    const durationWidth = Math.floor(
      duration.toString().length * avgWidthPerDuration
    );
    // output += duration + "s".padStart(durationWidth - duration.toString().length + 1);
    // if (index < durationCount - 1) {
    //     output += ' ';
    // }
    return durationWidth;
  });

  // console.log(output);
};

// Example usage
// const durations = [10, 5, 20, 15, 30];
// const screenWidth = 50;
// displayDurations(durations, screenWidth);
