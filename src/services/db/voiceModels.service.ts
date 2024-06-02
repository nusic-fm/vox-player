import { db } from "../firebase.service";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const DB_NAME = "voice_models";

export type VoiceModelType = {
  url: string;
  name: string;
  creator: string;
  creditsRequired: boolean;
  uid: string;
  avatarPath: string;
  id: string;
};

export type VoiceModelTypeDoc = VoiceModelType & { docId: string };

// export const createFirestoreId = (userString: string) => {
//   // Convert to lowercase
//   let firestoreId = userString.toLowerCase();
//   // Remove spaces
//   firestoreId = firestoreId.replace(/\s+/g, "");
//   // Remove any non-alphanumeric characters except underscores
//   firestoreId = firestoreId.replace(/\W+/g, "");
//   return firestoreId;
// };

const createVoiceModelDoc = async (
  voiceModelObj: VoiceModelType
): Promise<void> => {
  const col = collection(db, DB_NAME);
  await addDoc(col, { ...voiceModelObj, createdAt: serverTimestamp() });
};

const getVoiceModels = async (): Promise<VoiceModelTypeDoc[]> => {
  const col = collection(db, DB_NAME);
  const docsRef = await getDocs(col);
  return docsRef.docs.map((d) => ({
    ...(d.data() as VoiceModelType),
    docId: d.id,
  }));
};

const updateVoiceModelAvatar = async (
  voiceId: string,
  { avatarPath, id }: { avatarPath: string; id: string }
) => {
  const d = doc(db, DB_NAME, voiceId);
  await updateDoc(d, { avatarPath, id });
};
export { createVoiceModelDoc, getVoiceModels, updateVoiceModelAvatar };
