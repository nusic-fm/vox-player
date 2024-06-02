import { ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase.service";

const FOLDER_NAME = "voice_models";

const uploadVoiceModel = async (id: string, audioStrValue: ArrayBuffer) => {
  const storageRef = ref(storage, `${FOLDER_NAME}/${id}.zip`);
  const snapshot = await uploadBytes(storageRef, audioStrValue);
  return snapshot.ref.fullPath;
};

const uploadVoiceModelAvatar = async (
  id: string,
  imageStrValue: ArrayBuffer,
  blobType: string
) => {
  const storageRef = ref(storage, `${FOLDER_NAME}/avatars/${id}`);
  const snapshot = await uploadBytes(storageRef, imageStrValue, {
    contentType: blobType,
  });
  return snapshot.ref.fullPath;
};

export { uploadVoiceModel, uploadVoiceModelAvatar };
