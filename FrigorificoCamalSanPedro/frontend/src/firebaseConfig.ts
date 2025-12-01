// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAiO6GlxTEFEX8BQ0z6JFYoOax5FffbWVc",
    authDomain: "frigorificosanpedro-9d91c.firebaseapp.com",
    projectId: "frigorificosanpedro-9d91c",
    storageBucket: "frigorificosanpedro-9d91c.firebasestorage.app",
    messagingSenderId: "46428411432",
    appId: "1:46428411432:web:0f0766cf566f90b0a3871d",
    measurementId: "G-E8FDHWJML8"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
