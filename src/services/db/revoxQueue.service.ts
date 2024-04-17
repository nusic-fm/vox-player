import { db } from "../firebase.service";
import { addDoc, collection } from "firebase/firestore";

const DB_NAME = "revox_queue";

export type RevoxProcessType = {
  coverDocId: string;
  creatorId: string;
  voiceModelUrl: string;
  voiceModelName: string;
};
const createRevoxProgressDoc = async (
  voiceModelObj: RevoxProcessType
): Promise<string> => {
  const d = collection(db, DB_NAME);
  const ref = await addDoc(d, voiceModelObj);
  return ref.id;
};

export { createRevoxProgressDoc };
