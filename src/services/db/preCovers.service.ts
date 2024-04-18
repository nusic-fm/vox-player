import { db } from "../firebase.service";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";

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
};

const createPreCoverDoc = async (coverObj: PreCover): Promise<void> => {
  const d = collection(db, DB_NAME);
  await addDoc(d, coverObj);
};
export { createPreCoverDoc };
