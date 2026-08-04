import {
    auth
} from "./firebase-config.js";

import {
    onAuthStateChanged
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const childNameElement =
    document.getElementById("childName");

const selectedChildId =
    localStorage.getItem("selectedChildId");

const selectedChildName =
    localStorage.getItem("selectedChildName");

if (!selectedChildId) {
    window.location.href = "dashboard.html";
}

childNameElement.textContent =
    selectedChildName || "Hero";

document
    .querySelectorAll(".mission-button")
    .forEach((button) => {
        button.addEventListener("click", () => {
            const category =
                button.dataset.category;

            localStorage.setItem(
                "selectedCategory",
                category
            );

            window.location.href = "quiz.html";
        });
    });

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    }
});
