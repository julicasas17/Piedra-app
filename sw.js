// Service worker: guarda la aplicación en el teléfono para abrirla sin señal.
// Abre siempre desde lo guardado (rápido y sin conexión) y, si hay internet, busca la versión nueva para la próxima vez.
const CACHE = 'pa-0.15';
const ARCHIVOS = ['./', './index.html', './config.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('pa-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return; // la nube (Supabase) va directo
  const clave = r.mode === 'navigate' ? './index.html' : r;
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const guardado = await c.match(clave, { ignoreSearch: true });
    const red = fetch(r).then((res) => { if (res && res.ok) c.put(clave, res.clone()); return res; }).catch(() => null);
    if (guardado) { e.waitUntil(red); return guardado; }
    return (await red) || new Response('Sin conexión', { status: 503 });
  }));
});
