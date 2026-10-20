const CACHE_NAME = "todo-list-shell-v1";
const APP_FILES = [
	"./",
	"./index.html",
	"./app.webmanifest",
	"./css/styles.css",
	"./js/todoApp.js",
	"./js/registerServiceWorker.js",
	"./assets/icons/todo-icon.svg",
	"./assets/favIcon.png",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)),
	);
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => Promise.all(
			cacheNames
				.filter((cacheName) => cacheName.startsWith("todo-list-shell-") && cacheName !== CACHE_NAME)
				.map((cacheName) => caches.delete(cacheName)),
		)),
	);
	self.clients.claim();
});

self.addEventListener("fetch", (event) => {
	if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) {
		return;
	}

	event.respondWith(
		fetch(event.request)
			.then((response) => {
				if (response.ok) {
					const responseCopy = response.clone();
					caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
				}
				return response;
			})
			.catch(async () => {
				const cachedResponse = await caches.match(event.request);
				if (cachedResponse) {
					return cachedResponse;
				}

				if (event.request.mode === "navigate") {
					return caches.match("./index.html");
				}

				return Response.error();
			}),
	);
});