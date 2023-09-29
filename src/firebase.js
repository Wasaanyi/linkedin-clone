// import firebase from "firebase/app";
import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBdCyZVE2UAMiMNPSkwr5YRqofQIkM8-4U",
  authDomain: "linkedin-clone-60887.firebaseapp.com",
  projectId: "linkedin-clone-60887",
  storageBucket: "linkedin-clone-60887.appspot.com",
  messagingSenderId: "297890342462",
  appId: "1:297890342462:web:5da7af60de0f03f11d136f",
};

const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();
const storage = getStorage(firebaseApp);

export { auth, provider, storage };
export default db;
