import {
    auth
} from "./firebase-config.js";

import {
    onAuthStateChanged
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const storedResult =
    localStorage.getItem("latestResult");

if (!storedResult) {
    window.location.href = "dashboard.html";
}

const result = JSON.parse(storedResult);

document.getElementById("resultMessage").textContent =
    `Excellent work, ${result.childName}!`;

document.getElementById("resultScore").textContent =
    String(result.score);

document.getElementById("resultCorrect").textContent =
    `${result.correctAnswers}/${result.totalQuestions}`;

document.getElementById("resultXp").textContent =
    `+${result.xpEarned}`;

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    }
});
