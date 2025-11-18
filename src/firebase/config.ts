import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA4roFEEmkCsIyYgtkvNXpyDdi-VLzuuAQ",
  authDomain: "ultimate-praia.firebaseapp.com",
  projectId: "ultimate-praia",
  storageBucket: "ultimate-praia.firebasestorage.app",
  messagingSenderId: "587532969770",
  appId: "1:587532969770:web:7b0b0a658b87ee2a046053",
  measurementId: "G-D3R8BWZMH6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
