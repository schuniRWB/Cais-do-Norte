// Service Worker do Cais do Norte · ERP
// Guarda o "shell" da aplicação em cache para que continue a abrir mesmo sem internet.
// Quando há rede, tenta sempre buscar a versão mais recente primeiro (para não ficar preso
// a uma versão antiga depois de atualizares o ficheiro).

const CACHE_NAME = "cais-do-norte-v3"; // sobe este número sempre que publicares uma nova versão do HTML
const APP_SHELL = [
  "./",
  "./cais-do-norte-v2.html",
  "./manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./cais-do-norte-v2.html")))
  );
});
