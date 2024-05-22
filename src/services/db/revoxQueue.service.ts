import { db } from "../firebase.service";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { VoiceV1Cover } from "./coversV1.service";

const DB_NAME = "revox_queue";

export type RevoxProcessType = {
  voiceObj: VoiceV1Cover;
  coverDocId: string;
  voiceModelName: string;
  voiceModelUrl: string;
  title: string;
  isComplete: boolean;
  status: string;
  error?: string;
  // taskId: "revox" | "no-rvc" | "allin1";
};
export type RevoxProcessTypeDoc = RevoxProcessType & {
  id: string;
};
const createRevoxProgressDoc = async (
  voiceModelObj: RevoxProcessType
): Promise<string> => {
  const d = collection(db, DB_NAME);
  const ref = await addDoc(d, {
    ...voiceModelObj,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

// const createProgressDoc = async (voiceModelObj: {
//   coverId: string;
//   taskId: "revox" | "no-rvc" | "allin1";
//   voiceId?: string;
// }): Promise<string> => {
//   const d = collection(db, DB_NAME);
//   const ref = await addDoc(d, {
//     ...voiceModelObj,
//     createdAt: serverTimestamp(),
//   });
//   return ref.id;
// };

const getOnGoingProgress = async (uid: string) => {
  const q = query(
    collection(db, DB_NAME),
    where("voiceObj.shareInfo.id", "==", uid),
    where("isComplete", "==", false)
  );
  const docsSs = await getDocs(q);
  if (docsSs.size)
    return docsSs.docs.map(
      (d) => ({ ...d.data(), id: d.id } as RevoxProcessTypeDoc)
    );
  else return [];
};

const deleteRevoxQueue = async (id: string) => {
  const d = doc(db, DB_NAME, id);
  await updateDoc(d, {
    isDelete: true,
    isComplete: true,
    deletedAt: serverTimestamp(),
  });
};

export {
  createRevoxProgressDoc,
  getOnGoingProgress,
  deleteRevoxQueue,
  // createProgressDoc,
};
