// Registra o service worker (necessário para notificações e uso offline)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('Service worker registrado'))
    .catch(err => console.error('Erro no service worker:', err));
}

// Mostra se abrimos pelo ícone (app) ou por uma aba do navegador
const status = document.getElementById('status');
const instalado = window.matchMedia('(display-mode: standalone)').matches
  || navigator.standalone;
status.textContent = instalado
  ? '✅ Rodando como app instalado'
  : '🌐 Rodando no navegador';