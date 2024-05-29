import { Timestamp } from "firebase/firestore";
import { VoiceV1Cover } from "../services/db/coversV1.service";

export const getClosesNoInArr = (arr: number[], goal: number) =>
  arr.reduce((prev, curr) =>
    Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev
  );
export const getYouTubeVideoId = (url: string) => {
  // YouTube video ID regex
  const regex = /[?&]v=([^#&]*)/;
  const match = url.match(regex);

  if (match && match[1]) {
    return match[1];
  } else {
    // Handle cases where the URL format may differ
    console.error("Invalid YouTube URL");
    return null;
  }
};

export const getUserAvatar = (uid: string, avatarId: string) => {
  if (avatarId.length <= 2) {
    return `https://firebasestorage.googleapis.com/v0/b/nusic-vox-player.appspot.com/o/avatars%2F${avatarId}.webp?alt=media`;
  }
  return `https://cdn.discordapp.com/avatars/${uid}/${avatarId}`;
};

export const nameToSlug = (name: string, delimiter = "-") => {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove special characters
    .replace(/\s+/g, delimiter) // Replace spaces with delimiter
    .replace(new RegExp(`${delimiter}+`, "g"), delimiter) // Replace consecutive delimiters
    .trim(); // Trim any leading/trailing whitespace
};

export const formatDuration = (value: number) => {
  const minute = Math.floor(value / 60);
  const secondLeft = value - minute * 60;
  return `${minute}:${
    secondLeft < 10 ? `0${secondLeft.toFixed(0)}` : secondLeft.toFixed(0)
  }`;
};
// const isLink = (text: string) => {
//     // Regular expression pattern to match URLs
//     var urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;

//     return urlPattern.test(text);
// }

// Convert Firebase timestamp to a date string formatted to either "1h ago" or "May 21"
export const timestampToDateString = (timestamp?: Timestamp) => {
  if (!timestamp) return "";
  const date = timestamp.toDate();
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = diff / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;

  if (hours < 24) {
    return `${Math.floor(hours)}h ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
};

export const sortArrBasedOnLikesObj = (
  voices: VoiceV1Cover[],
  likesObj?: { [key: string]: number; total: number }
) => {
  if (likesObj === undefined) return voices;

  return voices.sort((a, b) => {
    // compare the likes of the two voices and then return the voice with the most likes
    return (likesObj[b.id] || 0) - (likesObj[a.id] || 0);
  });
};

// export const timestampToDateString = (timestamp: Timestamp) => {
//   const date = timestamp.toDate();
//   const options = { weekday: "long", hour: "numeric", minute: "numeric" };
//   //No overload matches this call.
//   // return date.toLocaleDateString("en-US", options);
//   return date.toLocaleDateString("en-US", {
//     weekday: "long",
//     hour: "numeric",
//     minute: "numeric",
//   });
// };
