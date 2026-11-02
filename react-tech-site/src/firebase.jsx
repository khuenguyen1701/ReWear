// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCkcNs1_e7z2EPPTDc9oDXJ2U5bylB7TUw",
  authDomain: "rewear-6bd06.firebaseapp.com",
  projectId: "rewear-6bd06",
  storageBucket: "rewear-6bd06.firebasestorage.app",
  messagingSenderId: "65013814323",
  appId: "1:65013814323:web:97b9337a69aa904986bf46",
  measurementId: "G-FW7SJM2WSQ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);