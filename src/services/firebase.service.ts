// Import the functions you need from the SDKs you need
// import { getStripePayments } from "@stripe/firestore-stripe-payments";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { fetchAndActivate, getRemoteConfig } from "firebase/remote-config";
// import { getStripePayments } from "@invertase/firestore-stripe-payments";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);
const remoteConfig = getRemoteConfig(app);

const convertHoursToMilliseconds = (hours: number) => {
  return hours * 60 * 60 * 1000;
};

remoteConfig.settings.minimumFetchIntervalMillis =
  convertHoursToMilliseconds(3);

remoteConfig.defaultConfig = {
  reverb_default_value: "1",
  q1: "How Do I Share My AI Cover?",
  a1: "Simply paste the Youtube url of your AI Cover into the input field at           the bottom of the charts._Only Youtube urls are currently supported. More options will be coming           soon...",
  q2: "What is REVOX?",
  a2: "REVOX enables loading of RVC models to an AI Cover of your choice, so           you can hear it in an alternative voice._Alternatively you can select a voice another user has already loaded           into the chart...",
  alex_users: JSON.stringify([
    "dYCM8E7Wfz3JjyyRA17V j_voorhees",
    "I5ZljIvkolMOHOiJiYJ6 Cyber Monkey",
    "CAbXJvrMXAeV5r8kfbHA AI Audio Lab",
    "geEf5ZwcHOJNKZHR86Pv frank_costello",
    "Z3IG8LHJK2S03L7BcZiD aimafia77",
    "ve0Yg5v3jNLrxq6Ez3Zp peterpunk12",
    "Mak3wXEn3OzrleoRx4hO the_bugg88",
    "rTU6Pbn3eEGhYjV4zgev SilencioGPT",
    "fVbXnhQHPfK5Zy7n4a3b OrchidQueen",
    "DkcrmVEysfjfKAKeB6Fq mystic_muse",
    "362272367063597056 alesalis",
  ]),
  adam_users: JSON.stringify([
    "3Cx4l7iMeFMKx2ywnaqS samUrI",
    "ugKfRzQqn6yUFitpPapN Pammy",
    "ENxvDxiBSsUy6TaupP3g AstralVisions",
    "JEIOJky1oU90XsMFnvAw Emkatters",
    "ZUKKbz0etLsdkGB2BUTM paradroid68",
    "yA7gbZ85WIGPalUn3BjJ Gr8Fairee",
    "OFBeiFrt6AvMNmbMScmz readi-playa",
    "826040837275910154 adamnusic",
  ]),
};
fetchAndActivate(remoteConfig);
// const payments = getStripePayments(app, {
//   productsCollection: "products",
//   customersCollection: "customers",
// });
// logFirebaseEvent("select_content", {
//   content_type: "spotifyArtistId",
//   content_id: spotifyArtistId,
// });
const logFirebaseEvent = (
  type: "login" | "sign_up" | "purchase" | "select_content" | "share" | "revox",
  additionalParams: any
) => {
  logEvent(analytics, type as any, additionalParams);
};

export { app, auth, logFirebaseEvent, db, storage, analytics, remoteConfig };
