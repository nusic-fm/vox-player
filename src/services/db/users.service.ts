import { analytics, db, logFirebaseEvent } from "../firebase.service";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { setUserId } from "firebase/analytics";
import { nameToSlug } from "../../helpers";
import axios from "axios";

const DB_NAME = "users";

export type User = {
  name: string;
  uid: string;
  avatar: string;
  email: string;
  likedVoiceCovers?: string[];
  disLikedVoiceCovers?: string[];
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
      axios.post(
        "https://api.nusic.kamu.dev/nusic/login-sessions/ingest",
        {
          id: userDoc.uid,
          name: userDoc.name,
          email: userDoc.email,
          is_new_user: false,
        },
        {
          headers: {
            "Content-Type": "application/x-ndjson",
            Authorization: `Bearer ${import.meta.env.VITE_KAMU_AUTH_TOKEN}`,
          },
        }
      );
      logFirebaseEvent("login", { name: userDoc.name, id: uid });
      setUserId(analytics, nameToSlug(userDoc.name));
      return userDocRef.data() as User;
    } else {
      axios.post(
        "https://api.nusic.kamu.dev/nusic/login-sessions/ingest",
        {
          id: userDoc.uid,
          name: userDoc.name,
          email: userDoc.email,
          is_new_user: true,
        },
        {
          headers: {
            "Content-Type": "application/x-ndjson",
            Authorization: `Bearer ${import.meta.env.VITE_KAMU_AUTH_TOKEN}`,
          },
        }
      );
      logFirebaseEvent("sign_up", { name: userDoc.name, id: uid });
      await setDoc(userRef, userDoc);
      setUserId(analytics, nameToSlug(userDoc.name));
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

const addLikeToUser = async (id: string, coverId: string, voiceId: string) => {
  const d = doc(db, DB_NAME, id);
  await updateDoc(d, {
    likedVoiceCovers: arrayUnion(coverId + "_" + voiceId),
    disLikedVoiceCovers: arrayRemove(coverId + "_" + voiceId),
  });
};
const removeLikeToUser = async (
  id: string,
  coverId: string,
  voiceId: string
) => {
  const d = doc(db, DB_NAME, id);
  await updateDoc(d, {
    likedVoiceCovers: arrayRemove(coverId + "_" + voiceId),
  });
};
const addDisLikeToUser = async (
  id: string,
  coverId: string,
  voiceId: string
) => {
  const d = doc(db, DB_NAME, id);
  await updateDoc(d, {
    likedVoiceCovers: arrayRemove(coverId + "_" + voiceId),
    disLikedVoiceCovers: arrayUnion(coverId + "_" + voiceId),
  });
};
const removeDislikeToUser = async (
  id: string,
  coverId: string,
  voiceId: string
) => {
  const d = doc(db, DB_NAME, id);
  await updateDoc(d, {
    disLikedVoiceCovers: arrayRemove(coverId + "_" + voiceId),
  });
};

export {
  createUserDoc,
  getUserDoc,
  getUserById,
  addLikeToUser,
  removeLikeToUser,
  addDisLikeToUser,
  removeDislikeToUser,
};
