import {
    auth,
    database,
    googleProvider
} from "./firebase-config.js";

import {
    signInWithPopup,
    signInAnonymously
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const googleLoginButton =
    document.getElementById("googleLoginButton");

const guestLoginButton =
    document.getElementById("guestLoginButton");

const loginMessage =
    document.getElementById("loginMessage");

function showMessage(message) {
    if (loginMessage) {
        loginMessage.textContent = message;
    }
}

function setLoading(button, isLoading, originalText) {
    if (!button) {
        return;
    }

    button.disabled = isLoading;
    button.textContent = isLoading
        ? "Please wait..."
        : originalText;
}

async function createParentRecord(user, accountType) {
    const userReference = doc(database, "users", user.uid);
    const userSnapshot = await getDoc(userReference);

    if (!userSnapshot.exists()) {
        await setDoc(userReference, {
            uid: user.uid,
            displayName:
                user.displayName ||
                (accountType === "guest"
                    ? "Guest Parent"
                    : "Parent"),
            email: user.email || null,
            photoURL: user.photoURL || null,
            accountType,
            role: "parent",
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp()
        });

        return;
    }

    await setDoc(
        userReference,
        {
            lastLoginAt: serverTimestamp()
        },
        {
            merge: true
        }
    );
}

async function loginWithGoogle() {
    setLoading(
        googleLoginButton,
        true,
        "Continue with Google"
    );

    showMessage("");

    try {
        const result = await signInWithPopup(
            auth,
            googleProvider
        );

        await createParentRecord(
            result.user,
            "google"
        );

        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("Google login error:", error);

        showMessage(
            "Google login failed. Please try again."
        );

        setLoading(
            googleLoginButton,
            false,
            "Continue with Google"
        );
    }
}

async function loginAsGuest() {
    setLoading(
        guestLoginButton,
        true,
        "Continue as Guest"
    );

    showMessage("");

    try {
        const result = await signInAnonymously(auth);

        await createParentRecord(
            result.user,
            "guest"
        );

        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("Guest login error:", error);

        showMessage(
            "Guest login failed. Please try again."
        );

        setLoading(
            guestLoginButton,
            false,
            "Continue as Guest"
        );
    }
}

googleLoginButton?.addEventListener(
    "click",
    loginWithGoogle
);

guestLoginButton?.addEventListener(
    "click",
    loginAsGuest
);
