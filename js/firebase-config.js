import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyASE2gOj6EumUX3kFgKGXTht5o-OwiHFDo",
  authDomain: "neuroleapjr.firebaseapp.com",
  projectId: "neuroleapjr",
  storageBucket: "neuroleapjr.firebasestorage.app",
  messagingSenderId: "782661487013",
  appId: "1:782661487013:web:15a1725e3693c3c4be804c"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const database = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export {
    app,
    auth,
    database,
    googleProvider
};
