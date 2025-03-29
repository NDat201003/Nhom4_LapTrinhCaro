import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA8d02jpxYy-glvEErjrRJOJBcTbSWmPcE",
  authDomain: "caro-game-server-74a52.firebaseapp.com",
  projectId: "caro-game-server-74a52",
  storageBucket: "caro-game-server-74a52.firebasestorage.app",
  messagingSenderId: "415115975177",
  appId: "1:415115975177:web:127b14d81f9c185b0af6d8",
  measurementId: "G-CQZVT328VL",
  databaseURL:
    "https://caro-game-server-74a52-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };
