import { db } from "../firebase.service";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  serverTimestamp,
  // getDoc,
  // setDoc,
  updateDoc,
} from "firebase/firestore";

const DB_NAME = "covers_v1";

type ShareInfo = {
  id: string;
  avatar: string;
  name: string;
};
type Comment = {
  content: string;
  timeInAudio: number;
  shareInfo: ShareInfo;
  voiceId: string;
};
export type VoiceV1Cover = {
  url?: string;
  creatorName: string;
  name: string;
  id: string;
  imageUrl: string;
  shareInfo: ShareInfo;
};
export type CoverV1 = {
  audioUrl: string;
  metadata: {
    channelId: string;
    channelTitle: string;
    channelDescription: string;
    channelThumbnail: string;
    videoThumbnail: string;
    videoName: string;
    videoDescription: string;
  };
  voices: VoiceV1Cover[];
  //   avatarUrl: string;
  title: string;
  vid: string;
  sections?: { name: string; start: number }[];
  bpm: number;
  duration: number;
  error?: string;
  shareInfo: ShareInfo;
  stemsReady: boolean;
  comments?: Comment[];
};

const createCoverV1Doc = async (coverObj: CoverV1): Promise<string> => {
  const d = collection(db, DB_NAME);
  const ref = await addDoc(d, { ...coverObj, createdAt: serverTimestamp() });
  return ref.id;
};
const updateCoverV1Doc = async (
  id: string,
  coverObj: Partial<CoverV1>
): Promise<void> => {
  const d = doc(db, DB_NAME, id);
  await updateDoc(d, { ...coverObj, updatedAt: serverTimestamp() });
};
const addCommentToCover = async (id: string, commentInfo: Comment) => {
  const d = doc(db, DB_NAME, id);
  await updateDoc(d, { comments: arrayUnion(commentInfo) });
};

export { createCoverV1Doc, updateCoverV1Doc, addCommentToCover };
