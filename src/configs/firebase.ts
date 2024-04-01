// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzJLYrrMQ3hx-tEJXTXSKFdRmOtQ8dtQ0",
  authDomain: "solana-token-209bb.firebaseapp.com",
  projectId: "solana-token-209bb",
  storageBucket: "solana-token-209bb.appspot.com",
  messagingSenderId: "221581561237",
  appId: "1:221581561237:web:347167c5ec7089eba1ba9c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
