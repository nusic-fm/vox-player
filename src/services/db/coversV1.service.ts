import { db } from "../firebase.service";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  // getDoc,
  // setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";

const DB_NAME = "covers_v1";

type ShareInfo = {
  id: string;
  avatar: string;
  name: string;
};
type Comment = {
  content: string;
  timeInAudio: number;
  shareInfo: ShareInfo;
  voiceId: string;
};
export type VoiceV1Cover = {
  url?: string;
  creatorName: string;
  name: string;
  id: string;
  imageUrl: string;
  shareInfo: ShareInfo;
};
export type CoverV1 = {
  audioUrl: string;
  metadata: {
    channelId: string;
    channelTitle: string;
    channelDescription: string;
    channelThumbnail: string;
    videoThumbnail: string;
    videoName: string;
    videoDescription: string;
  };
  voices: VoiceV1Cover[];
  //   avatarUrl: string;
  title: string;
  vid: string;
  sections?: { name: string; start: number }[];
  bpm: number;
  duration: number;
  error?: string;
  shareInfo: ShareInfo;
  stemsReady: boolean;
  comments?: Comment[];
  likes?: {
    [id: string]: number;
    total: number;
  };
};

const createCoverV1Doc = async (coverObj: CoverV1): Promise<string> => {
  const d = collection(db, DB_NAME);
  const ref = await addDoc(d, { ...coverObj, createdAt: serverTimestamp() });
  return ref.id;
};
const updateCoverV1Doc = async (
  id: string,
  coverObj: Partial<CoverV1>
): Promise<void> => {
  const d = doc(db, DB_NAME, id);
  await updateDoc(d, { ...coverObj, updatedAt: serverTimestamp() });
};
const addCommentToCover = async (id: string, commentInfo: Comment) => {
  const d = doc(db, DB_NAME, id);
  await updateDoc(d, { comments: arrayUnion(commentInfo) });
};
const addLikesToCover = async (
  coverId: string,
  voiceId: string,
  removeDislike: boolean
) => {
  const d = doc(db, DB_NAME, coverId);
  const updateObj: any = {
    likes: {
      [voiceId]: increment(1),
      total: increment(1),
    },
  };
  if (removeDislike) {
    updateObj.disLikes = {
      [voiceId]: increment(-1),
      total: increment(-1),
    };
  }
  await setDoc(d, updateObj, { merge: true });
  // await updateDoc(d, updateObj);
};
const removeLikesToCover = async (coverId: string, voiceId: string) => {
  const d = doc(db, DB_NAME, coverId);
  await setDoc(
    d,
    {
      likes: {
        [voiceId]: increment(-1),
        total: increment(-1),
      },
    },
    { merge: true }
  );
  // await updateDoc(d, );
};
const addDisLikesToCover = async (
  coverId: string,
  voiceId: string,
  removeLike: boolean
) => {
  const d = doc(db, DB_NAME, coverId);
  const updateObj: any = {
    disLikes: {
      [voiceId]: increment(1),
      total: increment(1),
    },
  };
  if (removeLike) {
    updateObj.likes = {
      [voiceId]: increment(-1),
      total: increment(-1),
    };
  }
  await setDoc(d, updateObj, { merge: true });
  // await updateDoc(d, updateObj);
};
const removeDisLikesToCover = async (coverId: string, voiceId: string) => {
  const d = doc(db, DB_NAME, coverId);
  await setDoc(
    d,
    {
      disLikes: {
        [voiceId]: increment(-1),
        total: increment(-1),
      },
    },
    { merge: true }
  );
  // await updateDoc(d, {
  //   dislikes: {
  //     [voiceId]: increment(-1),
  //     total: increment(-1),
  //   },
  // });
};

// const addCoverLike = async (
//   coverId: string,
//   voiceId: string,
//   userObj: { avatar: string; name: string; uid: string }
// ) => {
//   const c = doc(db, DB_NAME, coverId, "likes", voiceId, userObj.uid);
//   await setDoc(c, { ...userObj, likedAt: serverTimestamp() });
// };
// const removeCoverLike = async (
//   coverId: string,
//   voiceId: string,
//   uid: string
// ) => {
//   const c = doc(db, DB_NAME, coverId, "likes", voiceId, uid);
//   await deleteDoc(c);
// };
// const addCoverDislike = async (
//   coverId: string,
//   voiceId: string,
//   userObj: { avatar: string; name: string; uid: string }
// ) => {
//   const c = doc(db, DB_NAME, coverId, "dis_likes", voiceId, userObj.uid);
//   await setDoc(c, { ...userObj, likedAt: serverTimestamp() });
// };
// const removeCoverDislike = async (
//   coverId: string,
//   voiceId: string,
//   userObj: { avatar: string; name: string; uid: string }
// ) => {
//   const c = doc(db, DB_NAME, coverId, "dis_likes", voiceId, userObj.uid);
//   await setDoc(c, { ...userObj, likedAt: serverTimestamp() });
// };

export {
  createCoverV1Doc,
  updateCoverV1Doc,
  addCommentToCover,
  addLikesToCover,
  removeLikesToCover,
  addDisLikesToCover,
  removeDisLikesToCover,
  // addToDisLikes,
  // addToLikes,
};
