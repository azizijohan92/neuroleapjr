import {
    auth,
    database
} from "./firebase-config.js";

import {
    onAuthStateChanged
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    addDoc,
    collection,
    doc,
    increment,
    serverTimestamp,
    updateDoc
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    questionBank
} from "../data/questions.js";

const category =
    localStorage.getItem("selectedCategory") || "math";

const childId =
    localStorage.getItem("selectedChildId");

const childName =
    localStorage.getItem("selectedChildName") || "Hero";

const categoryLabel =
    document.getElementById("categoryLabel");

const questionCounter =
    document.getElementById("questionCounter");

const timerElement =
    document.getElementById("timer");

const progressFill =
    document.getElementById("quizProgressFill");

const questionText =
    document.getElementById("questionText");

const answerGrid =
    document.getElementById("answerGrid");

const feedbackMessage =
    document.getElementById("feedbackMessage");

let currentUser = null;
let currentQuestionIndex = 0;
let correctAnswers = 0;
let score = 0;
let timeLeft = 15;
let timerInterval = null;
let answerLocked = false;

const questions = shuffleArray(
    [...(questionBank[category] || questionBank.math)]
);

if (!childId) {
    window.location.href = "dashboard.html";
}

categoryLabel.textContent =
    `${category} mission`;

function shuffleArray(items) {
    for (let index = items.length - 1; index > 0; index -= 1) {
        const randomIndex =
            Math.floor(Math.random() * (index + 1));

        [items[index], items[randomIndex]] =
            [items[randomIndex], items[index]];
    }

    return items;
}

function startTimer() {
    clearInterval(timerInterval);

    timeLeft = 15;
    timerElement.textContent = String(timeLeft);

    timerInterval = setInterval(() => {
        timeLeft -= 1;
        timerElement.textContent = String(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeout();
        }
    }, 1000);
}

function showQuestion() {
    answerLocked = false;
    feedbackMessage.textContent = "";

    const currentQuestion =
        questions[currentQuestionIndex];

    questionCounter.textContent =
        `${currentQuestionIndex + 1} / ${questions.length}`;

    progressFill.style.width =
        `${
            ((currentQuestionIndex + 1) /
                questions.length) *
            100
        }%`;

    questionText.textContent =
        currentQuestion.question;

    answerGrid.innerHTML = "";

    shuffleArray([...currentQuestion.options])
        .forEach((option) => {
            const button =
                document.createElement("button");

            button.type = "button";
            button.className = "answer-button";
            button.textContent = option;

            button.addEventListener("click", () => {
                checkAnswer(option, button);
            });

            answerGrid.appendChild(button);
        });

    startTimer();
}

function disableAnswers() {
    document
        .querySelectorAll(".answer-button")
        .forEach((button) => {
            button.disabled = true;
        });
}

function highlightCorrectAnswer(correctAnswer) {
    document
        .querySelectorAll(".answer-button")
        .forEach((button) => {
            if (button.textContent === correctAnswer) {
                button.classList.add("correct");
            }
        });
}

function checkAnswer(selectedAnswer, selectedButton) {
    if (answerLocked) {
        return;
    }

    answerLocked = true;
    clearInterval(timerInterval);
    disableAnswers();

    const currentQuestion =
        questions[currentQuestionIndex];

    if (
        selectedAnswer ===
        currentQuestion.correctAnswer
    ) {
        correctAnswers += 1;

        const speedBonus = timeLeft * 2;
        score += 100 + speedBonus;

        selectedButton.classList.add("correct");

        feedbackMessage.textContent =
            `Correct! +${100 + speedBonus} points`;
    } else {
        selectedButton.classList.add("wrong");

        highlightCorrectAnswer(
            currentQuestion.correctAnswer
        );

        feedbackMessage.textContent =
            "Good try! Keep learning.";
    }

    window.setTimeout(nextQuestion, 1100);
}

function handleTimeout() {
    if (answerLocked) {
        return;
    }

    answerLocked = true;
    disableAnswers();

    const currentQuestion =
        questions[currentQuestionIndex];

    highlightCorrectAnswer(
        currentQuestion.correctAnswer
    );

    feedbackMessage.textContent =
        "Time is up!";

    window.setTimeout(nextQuestion, 1100);
}

function nextQuestion() {
    currentQuestionIndex += 1;

    if (currentQuestionIndex < questions.length) {
        showQuestion();
        return;
    }

    finishQuiz();
}

async function finishQuiz() {
    clearInterval(timerInterval);

    if (!currentUser) {
        return;
    }

    try {
        const xpEarned = correctAnswers * 20;

        await addDoc(
            collection(database, "results"),
            {
                parentId: currentUser.uid,
                childId,
                childName,
                category,
                score,
                correctAnswers,
                totalQuestions: questions.length,
                xpEarned,
                completedAt: serverTimestamp()
            }
        );

        await updateDoc(
            doc(database, "children", childId),
            {
                xp: increment(xpEarned),
                totalScore: increment(score)
            }
        );

        localStorage.setItem(
            "latestResult",
            JSON.stringify({
                childName,
                category,
                score,
                correctAnswers,
                totalQuestions: questions.length,
                xpEarned
            })
        );

        window.location.href = "result.html";
    } catch (error) {
        console.error("Save result error:", error);

        feedbackMessage.textContent =
            "Unable to save result. Please try again.";
    }
}

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;
    showQuestion();
});
