// Service worker mínimo. Vamos adicionar cache offline e notificações depois.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));