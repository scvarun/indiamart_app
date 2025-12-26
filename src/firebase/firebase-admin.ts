// Import the functions you need from the SDKs you need
import * as admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import serviceAccount from "@/firebase-sdk-key.json";

// Initialize Firebase
export const firebase = admin.apps.length
  ? admin.app()
  : admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
      }),
    });
export const firestore = firebase.firestore();
export const firebaseAuth = getAuth(firebase);
