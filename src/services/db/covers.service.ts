import { db } from "../firebase.service";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { Cover } from "../../components/Rows";

const DB_NAME = "covers";

const createCoverDoc = async (coverObj: Cover): Promise<void> => {
  const d = collection(db, DB_NAME);
  await addDoc(d, coverObj);
};
export { createCoverDoc };
