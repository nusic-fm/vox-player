import { db } from "../firebase.service";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";

const DB_NAME = "voice_models";

export type VoiceModelType = {
  url: string;
  name: string;
  creator: string;
  creditsRequired: boolean;
  uid: string;
  slug: string;
};

export const createFirestoreId = (userString: string) => {
  // Convert to lowercase
  let firestoreId = userString.toLowerCase();
  // Remove spaces
  firestoreId = firestoreId.replace(/\s+/g, "");
  // Remove any non-alphanumeric characters except underscores
  firestoreId = firestoreId.replace(/\W+/g, "");
  return firestoreId;
};

const createVoiceModelDoc = async (
  voiceModelObj: VoiceModelType
): Promise<void> => {
  const col = collection(db, DB_NAME);
  await addDoc(col, voiceModelObj);
};
export { createVoiceModelDoc };
