// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDSklgwCF-sP6kr7NxrvzyOANTkQ_eZ2Ok",
  authDomain: "media-bridge-student-content.firebaseapp.com",
  projectId: "media-bridge-student-content",
  storageBucket: "media-bridge-student-content.firebasestorage.app",
  messagingSenderId: "893510981583",
  appId: "1:893510981583:web:d2f0b616253b22bbfc64ba"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

export { storage, db, collection, addDoc, getDocs };