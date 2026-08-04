const CACHE_NAME = "neuroleap-v1";

const APP_FILES = [
    "./",
    "./index.html",
    "./login.html",
    "./dashboard.html",
    "./child.html",
    "./quiz.html",
    "./result.html",
    "./css/style.css",
    "./css/dashboard.css",
    "./css/quiz.css"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_FILES))
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter(
                            (key) => key !== CACHE_NAME
                        )
                        .map((key) => caches.delete(key))
                )
            )
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches
            .match(event.request)
            .then(
                (cachedResponse) =>
                    cachedResponse ||
                    fetch(event.request)
            )
    );
});
