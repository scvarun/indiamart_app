// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { browserSessionPersistence, getAuth } from "firebase/auth";
import config from "@/config";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = config.firebase;

// Initialize Firebase
export const firebase = initializeApp(firebaseConfig);
export const firestore = getFirestore();
export const firebaseAuth = getAuth(firebase);
firebaseAuth.setPersistence(browserSessionPersistence);
