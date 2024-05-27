import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.service";

const DB_NAME = "user_submissions";

const createUserSubmissionDoc = async (obj: {
  name: string;
  email: string;
  countryCode: { name: string; flag: string; code: string };
  mobile: string;
}): Promise<string> => {
  const d = collection(db, DB_NAME);
  const ref = await addDoc(d, { ...obj, createdAt: serverTimestamp() });
  return ref.id;
};

export { createUserSubmissionDoc };
