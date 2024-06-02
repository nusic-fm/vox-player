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
  runTransaction,
  arrayRemove,
  query,
  where,
  limit,
  getDocs,
  getDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { User } from "./users.service";

const DB_NAME = "covers";

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
  avatarPath?: string;
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
  commentsCount?: number;
  disLikes?: {
    [id: string]: number;
    total: number;
  };
  totalLikesValue: number;
  playCount: number;
  rank: number;
  prevRank: number;
  createdAt?: Timestamp;
};

const getCoverDocById = async (docId: string) => {
  const d = doc(db, DB_NAME, docId);
  return (await getDoc(d)).data() as CoverV1;
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

const SUB_COLLECTION = "comments";

const addCommentToCover = async (id: string, commentInfo: Comment) => {
  await runTransaction(db, async (transaction) => {
    const collectionDocRef = doc(collection(db, DB_NAME, id, SUB_COLLECTION));
    transaction.set(collectionDocRef, {
      ...commentInfo,
      createdAt: serverTimestamp(),
    });
    // await addDoc(c, { ...commentInfo, createdAt: serverTimestamp() });
    const d = doc(db, DB_NAME, id);
    transaction.update(d, { commentsCount: increment(1) });
  });
};
const addLikesToCover = async (
  uid: string,
  coverId: string,
  voiceId: string
) => {
  await runTransaction(db, async (transaction) => {
    const userRef = doc(db, "users", uid);
    const userDocSs = await transaction.get(userRef);
    const latestUserDoc = userDocSs.data() as undefined | User;
    if (latestUserDoc?.likedVoiceCovers?.includes(coverId + "_" + voiceId)) {
      // Already Liked and trying to Like again - ignore
    } else {
      const coverDocRef = doc(db, DB_NAME, coverId);
      let incrementValue = 1;
      const updateObj: any = {
        likes: {
          [voiceId]: increment(1),
          total: increment(1),
        },
      };
      if (
        latestUserDoc?.disLikedVoiceCovers?.includes(coverId + "_" + voiceId)
      ) {
        updateObj.disLikes = {
          [voiceId]: increment(-1),
          total: increment(-1),
        };
        incrementValue = 2.5;
      }
      updateObj.totalLikesValue = increment(incrementValue);
      await transaction.set(coverDocRef, updateObj, { merge: true });
      await transaction.update(userRef, {
        likedVoiceCovers: arrayUnion(coverId + "_" + voiceId),
        disLikedVoiceCovers: arrayRemove(coverId + "_" + voiceId),
      });
    }
  });
  // const d = doc(db, DB_NAME, coverId);
  // const updateObj: any = {
  //   likes: {
  //     [voiceId]: increment(1),
  //     total: increment(1),
  //   },
  // };
  // if (removeDislike) {
  //   updateObj.disLikes = {
  //     [voiceId]: increment(-1),
  //     total: increment(-1),
  //   };
  // }
  // await setDoc(d, updateObj, { merge: true });
  // await updateDoc(d, updateObj);
};
const removeLikesToCover = async (
  uid: string,
  coverId: string,
  voiceId: string
) => {
  await runTransaction(db, async (transaction) => {
    const userRef = doc(db, "users", uid);
    const userDocSs = await transaction.get(userRef);
    const latestUserDoc = userDocSs.data() as undefined | User;
    if (latestUserDoc?.likedVoiceCovers?.includes(coverId + "_" + voiceId)) {
      // Already Liked so Remove the like as per the request
      const coverDocRef = doc(db, DB_NAME, coverId);
      const updateObj: any = {
        likes: {
          [voiceId]: increment(-1),
          total: increment(-1),
        },
        totalLikesValue: increment(-1),
      };
      await transaction.set(coverDocRef, updateObj, { merge: true });
      await transaction.update(userRef, {
        likedVoiceCovers: arrayRemove(coverId + "_" + voiceId),
      });
    }
  });
  // const d = doc(db, DB_NAME, coverId);
  // await setDoc(
  //   d,
  //   {
  //     likes: {
  //       [voiceId]: increment(-1),
  //       total: increment(-1),
  //     },
  //   },
  //   { merge: true }
  // );
  // await updateDoc(d, );
};
const addDisLikesToCover = async (
  uid: string,
  coverId: string,
  voiceId: string
) => {
  await runTransaction(db, async (transaction) => {
    const userRef = doc(db, "users", uid);
    const userDocSs = await transaction.get(userRef);
    const latestUserDoc = userDocSs.data() as undefined | User;
    if (latestUserDoc?.disLikedVoiceCovers?.includes(coverId + "_" + voiceId)) {
      // Already Liked and trying to Like again - ignore
    } else {
      let incrementValue = -1.5;
      const coverDocRef = doc(db, DB_NAME, coverId);
      const updateObj: any = {
        disLikes: {
          [voiceId]: increment(1),
          total: increment(1),
        },
      };
      if (latestUserDoc?.likedVoiceCovers?.includes(coverId + "_" + voiceId)) {
        updateObj.likes = {
          [voiceId]: increment(-1),
          total: increment(-1),
        };
        incrementValue = -2.5;
      }
      updateObj.totalLikesValue = increment(incrementValue);
      await transaction.set(coverDocRef, updateObj, { merge: true });
      await transaction.update(userRef, {
        disLikedVoiceCovers: arrayUnion(coverId + "_" + voiceId),
        likedVoiceCovers: arrayRemove(coverId + "_" + voiceId),
      });
    }
  });
  // const d = doc(db, DB_NAME, coverId);
  // const updateObj: any = {
  //   disLikes: {
  //     [voiceId]: increment(1),
  //     total: increment(1),
  //   },
  // };
  // if (removeLike) {
  //   updateObj.likes = {
  //     [voiceId]: increment(-1),
  //     total: increment(-1),
  //   };
  // }
  // await setDoc(d, updateObj, { merge: true });
  // await updateDoc(d, updateObj);
};
const removeDisLikesToCover = async (
  uid: string,
  coverId: string,
  voiceId: string
) => {
  await runTransaction(db, async (transaction) => {
    const userRef = doc(db, "users", uid);
    const userDocSs = await transaction.get(userRef);
    const latestUserDoc = userDocSs.data() as undefined | User;
    if (latestUserDoc?.disLikedVoiceCovers?.includes(coverId + "_" + voiceId)) {
      // Already Liked so Remove the like as per the request
      const coverDocRef = doc(db, DB_NAME, coverId);
      const updateObj: any = {
        disLikes: {
          [voiceId]: increment(1),
          total: increment(1),
        },
        totalLikesValue: increment(1.5),
      };
      await transaction.set(coverDocRef, updateObj, { merge: true });
      await transaction.update(userRef, {
        disLikedVoiceCovers: arrayRemove(coverId + "_" + voiceId),
      });
    }
  });
  // const d = doc(db, DB_NAME, coverId);
  // await setDoc(
  //   d,
  //   {
  //     disLikes: {
  //       [voiceId]: increment(-1),
  //       total: increment(-1),
  //     },
  //   },
  //   { merge: true }
  // );
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
const checkIfYoutubeVideoIdExists = async (vid: string): Promise<boolean> => {
  const c = collection(db, DB_NAME);
  const docSs = await getDocs(query(c, where("vid", "==", vid), limit(1)));
  return !!docSs.size;
};

const deleteCoverDoc = async (coverId: string) => {
  const c = doc(db, DB_NAME, coverId);
  await deleteDoc(c);
};
export {
  createCoverV1Doc,
  updateCoverV1Doc,
  addCommentToCover,
  addLikesToCover,
  removeLikesToCover,
  addDisLikesToCover,
  removeDisLikesToCover,
  checkIfYoutubeVideoIdExists,
  getCoverDocById,
  deleteCoverDoc,
  // addToDisLikes,
  // addToLikes,
};
