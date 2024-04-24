import { db } from "../firebase.service";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";

const DB_NAME = "covers";

type Cover = {
  songName: string;
  vid: string;
  artistName: string;
  voices: {
    name: string;
    id: string;
    creatorName: string;
    creatorId: string;
    avatar: string;
  }[];
  img: string;
  createdInfo: { name: string; id: string; img: string };
  sections: { name: string; start: number }[];
  bpm: number;
  views: number;
  duration: number;
};

const createCoverDoc = async (coverObj: Cover): Promise<void> => {
  const d = collection(db, DB_NAME);
  await addDoc(d, coverObj);
};
export { createCoverDoc };
