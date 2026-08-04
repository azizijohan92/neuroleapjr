import {
    auth,
    database
} from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    addDoc,
    collection,
    getDocs,
    query,
    serverTimestamp,
    where
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const parentName = document.getElementById("parentName");
const welcomeName = document.getElementById("welcomeName");
const logoutButton = document.getElementById("logoutButton");

const openChildModal =
    document.getElementById("openChildModal");

const closeChildModal =
    document.getElementById("closeChildModal");

const childModal =
    document.getElementById("childModal");

const childForm =
    document.getElementById("childForm");

const childFormMessage =
    document.getElementById("childFormMessage");

const childrenGrid =
    document.getElementById("childrenGrid");

const totalChildren =
    document.getElementById("totalChildren");

const totalActivities =
    document.getElementById("totalActivities");

const averageScore =
    document.getElementById("averageScore");

let currentUser = null;

function openModal() {
    childModal.classList.remove("hidden");
}

function closeModal() {
    childModal.classList.add("hidden");
    childForm.reset();
    childFormMessage.textContent = "";
}

function createChildCard(childId, childData) {
    const card = document.createElement("article");
    card.className = "child-card";

    card.innerHTML = `
        <div class="child-avatar">
            ${childData.avatar || "🦸"}
        </div>

        <h3>${escapeHtml(childData.name)}</h3>

        <p>${Number(childData.age)} years old</p>

        <div class="child-stats">
            <div class="child-stat">
                Level
                <strong>${Number(childData.level || 1)}</strong>
            </div>

            <div class="child-stat">
                XP
                <strong>${Number(childData.xp || 0)}</strong>
            </div>

            <div class="child-stat">
                Score
                <strong>${Number(childData.totalScore || 0)}</strong>
            </div>
        </div>
    `;

    card.addEventListener("click", () => {
        localStorage.setItem(
            "selectedChildId",
            childId
        );

        localStorage.setItem(
            "selectedChildName",
            childData.name
        );

        window.location.href = "child.html";
    });

    return card;
}

function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = String(value ?? "");
    return element.innerHTML;
}

async function loadChildren() {
    if (!currentUser) {
        return;
    }

    childrenGrid.innerHTML =
        "<p>Loading child profiles...</p>";

    try {
        const childrenQuery = query(
            collection(database, "children"),
            where("parentId", "==", currentUser.uid)
        );

        const snapshot = await getDocs(childrenQuery);

        childrenGrid.innerHTML = "";

        let childCount = 0;

        snapshot.forEach((documentSnapshot) => {
            childCount += 1;

            const card = createChildCard(
                documentSnapshot.id,
                documentSnapshot.data()
            );

            childrenGrid.appendChild(card);
        });

        totalChildren.textContent = String(childCount);

        if (childCount === 0) {
            childrenGrid.innerHTML = `
                <p>
                    No child profile yet.
                    Add your first child.
                </p>
            `;
        }
    } catch (error) {
        console.error("Load children error:", error);

        childrenGrid.innerHTML = `
            <p>
                Unable to load child profiles.
            </p>
        `;
    }
}

async function loadResultsSummary() {
    if (!currentUser) {
        return;
    }

    try {
        const resultsQuery = query(
            collection(database, "results"),
            where("parentId", "==", currentUser.uid)
        );

        const snapshot = await getDocs(resultsQuery);

        let activityCount = 0;
        let totalPercentage = 0;

        snapshot.forEach((documentSnapshot) => {
            const result = documentSnapshot.data();

            activityCount += 1;

            const totalQuestions =
                Number(result.totalQuestions || 0);

            const correctAnswers =
                Number(result.correctAnswers || 0);

            if (totalQuestions > 0) {
                totalPercentage +=
                    (correctAnswers / totalQuestions) * 100;
            }
        });

        const average =
            activityCount > 0
                ? Math.round(
                    totalPercentage / activityCount
                )
                : 0;

        totalActivities.textContent =
            String(activityCount);

        averageScore.textContent =
            `${average}%`;
    } catch (error) {
        console.error("Load summary error:", error);
    }
}

childForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentUser) {
        return;
    }

    const childName =
        document
            .getElementById("childName")
            .value
            .trim();

    const childAge =
        Number(
            document.getElementById("childAge").value
        );

    const childAvatar =
        document.getElementById("childAvatar").value;

    if (!childName || !childAge) {
        childFormMessage.textContent =
            "Please complete all fields.";

        return;
    }

    const submitButton =
        childForm.querySelector(
            "button[type='submit']"
        );

    submitButton.disabled = true;
    submitButton.textContent = "Creating...";

    try {
        await addDoc(
            collection(database, "children"),
            {
                parentId: currentUser.uid,
                name: childName,
                age: childAge,
                avatar: childAvatar,
                level: 1,
                xp: 0,
                totalScore: 0,
                createdAt: serverTimestamp()
            }
        );

        closeModal();
        await loadChildren();
    } catch (error) {
        console.error("Create child error:", error);

        childFormMessage.textContent =
            "Unable to create profile.";
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Create Profile";
    }
});

openChildModal.addEventListener("click", openModal);
closeChildModal.addEventListener("click", closeModal);

childModal.addEventListener("click", (event) => {
    if (event.target === childModal) {
        closeModal();
    }
});

logoutButton.addEventListener("click", async () => {
    try {
        await signOut(auth);

        localStorage.removeItem("selectedChildId");
        localStorage.removeItem("selectedChildName");

        window.location.href = "login.html";
    } catch (error) {
        console.error("Logout error:", error);
    }
});

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    const displayName =
        user.displayName || "Guest Parent";

    parentName.textContent = displayName;
    welcomeName.textContent =
        displayName.split(" ")[0];

    await Promise.all([
        loadChildren(),
        loadResultsSummary()
    ]);
});
