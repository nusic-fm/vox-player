import { db } from "../firebase.service";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const DB_NAME = "users";

export type User = {
  name: string;
  uid: string;
  avatar: string;
  email: string;
};
const createUserDoc = async (
  uid: string,
  userDoc: User
): Promise<null | User> => {
  try {
    const userRef = doc(db, "users", uid);
    const userDocRef = await getDoc(userRef);
    if (userDocRef.exists()) {
      const docData = userDocRef.data();
      if (docData.avatar !== userDoc.avatar) {
        await updateDoc(userRef, { avatar: userDoc.avatar });
      }
      return userDocRef.data() as User;
    } else {
      await setDoc(userRef, userDoc);
      return userDoc;
    }
  } catch (e) {
    console.log("ERROR: ", e);
    return null;
  }
};
const getUserById = async (uid: string): Promise<User> => {
  const userRef = doc(db, DB_NAME, uid);
  const userDocRef = await getDoc(userRef);
  return userDocRef.data() as User;
};

const getUserDoc = async (id: string): Promise<any> => {
  const d = doc(db, DB_NAME, id);
  const wdoc = await getDoc(d);
  return wdoc.data();
};

const updateUserDoc = async (id: string, userObj: any) => {
  const d = doc(db, DB_NAME, id);
  await updateDoc(d, userObj);
};

export { createUserDoc, getUserDoc, getUserById, updateUserDoc };
