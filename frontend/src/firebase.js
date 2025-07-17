import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyC_fS_I_g0jicSPKLqBxF8if2ffnDKrvNM",
    authDomain: "date-app-41a1c.firebaseapp.com",
    projectId: "date-app-41a1c",
    storageBucket: "date-app-41a1c.appspot.com",
    messagingSenderId: "950558236414",
    appId: "1:950558236414:web:f65dad635607345aa8cfaf",
    databaseURL: "https://date-app-41a1c-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app); // 변수명 db로 변경
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, db, app }; // db로 내보내기
