// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0rMWPuFr_VxR3boUekKqXLEnReMt3j3o",
  authDomain: "snpsu-hackathon-portal.firebaseapp.com",
  databaseURL: "https://snpsudb.firebaseio.com",
  projectId: "snpsu-hackathon-portal",
  storageBucket: "snpsu-hackathon-portal.firebasestorage.app",
  messagingSenderId: "435264048446",
  appId: "1:435264048446:web:cd24e4dff35b798e4cf06f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
export { database, ref, set, push, onValue };
