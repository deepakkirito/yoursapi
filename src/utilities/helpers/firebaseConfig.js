// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2osd_6M5_unXpo_oweGpVM-UjqMLtAV0",
  authDomain: "yoursapi.firebaseapp.com",
  projectId: "yoursapi",
  storageBucket: "yoursapi.firebasestorage.app",
  messagingSenderId: "1001393073164",
  appId: "1:1001393073164:web:cc085689cb89950a005229",
  measurementId: "G-SQ1S756N53",
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// const analytics = getAnalytics(app);

const storage = getStorage(app);

export { storage };
//currently it is not secured