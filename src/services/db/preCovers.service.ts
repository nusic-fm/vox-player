import { db } from "../firebase.service";
import {
  addDoc,
  collection,
  doc,
  // getDoc,
  // setDoc,
  updateDoc,
} from "firebase/firestore";

const DB_NAME = "pre_covers";

export type PreCover = {
  audioUrl: string;
  channelId: string;
  channelName: string;
  avatarUrl: string;
  title: string;
  vid: string;
  voiceName: string;
  creator: string;
  sections?: { name: string; start: number }[];
  error?: string;
  shareInfo: { name: string; id: string; avatar: string };
  stemsReady: boolean;
};

const createPreCoverDoc = async (coverObj: PreCover): Promise<string> => {
  const d = collection(db, DB_NAME);
  const ref = await addDoc(d, coverObj);
  return ref.id;
};
const updatePreCoverDoc = async (
  id: string,
  coverObj: Partial<PreCover>
): Promise<void> => {
  const d = doc(db, DB_NAME, id);
  await updateDoc(d, coverObj);
};
export { createPreCoverDoc, updatePreCoverDoc };
