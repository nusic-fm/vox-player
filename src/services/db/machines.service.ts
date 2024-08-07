import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.service";

const DB_NAME = "machines";
const updateMachinesDoc = async (
  id: string,
  isAvailable: boolean
): Promise<void> => {
  const d = doc(db, DB_NAME, id);
  await updateDoc(d, { isAvailable });
};
export { updateMachinesDoc };
