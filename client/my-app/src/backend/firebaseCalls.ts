import {
  AuthError,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import app from "../config/firebase";
import { ReadingSchedule } from "../types/types";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../config/firebase";

export function authenticateUser(email: string, password: string) {
  return new Promise((resolve, reject) => {
    const auth = getAuth(app);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        resolve(userCredential.user);
      })
      .catch((error: AuthError) => {
        reject(error);
      });
  });
}

export function addReadingSchedule(
  readingSchedule: ReadingSchedule,
): Promise<string> {
  return new Promise((resolve, reject) => {
    addDoc(collection(db, "readingSchedules"), readingSchedule)
      .then((docRef) => {
        // return id of reading schedule added
        resolve(docRef.id);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

export function registerUser(email: string, password: string) {
  return new Promise((resolve, reject) => {
    const auth = getAuth(app);
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        resolve(userCredential.user);
      })
      .catch((error: AuthError) => {
        reject(error);
      });
  });
}
