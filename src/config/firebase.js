import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCk1k28Vbv9CMxy5l7GT4j6f9woFHHjc5Y",
  authDomain: "online-learning-platform-6c6d0.firebaseapp.com",
  projectId: "online-learning-platform-6c6d0",
  storageBucket: "online-learning-platform-6c6d0.firebasestorage.app",
  messagingSenderId: "763025567578",
  appId: "1:763025567578:web:afdd234079d3df60ce0d63",
  measurementId: "G-7B118D0TM8",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// Configure Google provider
provider.setCustomParameters({
  prompt: 'select_account'
});
