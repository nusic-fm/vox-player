import { db } from "../firebase.service";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

const DB_NAME = "revox_queue";

export type RevoxProcessType = {
  coverDocId: string;
  uid: string;
  voiceModelUrl: string;
  voiceModelName: string;
  isComplete: boolean;
  songName: string;
  status: string;
};
const createRevoxProgressDoc = async (
  voiceModelObj: RevoxProcessType
): Promise<string> => {
  const d = collection(db, DB_NAME);
  const ref = await addDoc(d, voiceModelObj);
  return ref.id;
};

const getOnGoingProgress = async (uid: string) => {
  const q = query(
    collection(db, DB_NAME),
    where("uid", "==", uid),
    where("isComplete", "==", false)
  );
  const docsSs = await getDocs(q);
  return docsSs.docs.map((d) => d.data() as RevoxProcessType);
};

export { createRevoxProgressDoc, getOnGoingProgress };
