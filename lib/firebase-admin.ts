// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase-admin/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2-ZdBiAjCYsduBm0phBQEvM7w3U8aPJA",
  authDomain: "helio-lab.firebaseapp.com",
  projectId: "helio-lab",
  storageBucket: "helio-lab.firebasestorage.app",
  messagingSenderId: "156481702835",
  appId: "1:156481702835:web:7e74d4a871f63a5c5419c6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);