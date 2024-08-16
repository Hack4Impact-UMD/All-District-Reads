import {
  AuthError,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import app from "../config/firebase";

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
