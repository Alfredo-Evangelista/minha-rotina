import { iniciar as iniciarHome } from './home/home.js';
import { iniciar as iniciarCalendario } from './calendario/calendario.js';
import { iniciar as iniciarFinanceiro } from './financeiro/financeiro.js';

// ----- Service worker -----
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('Service worker registrado'))
    .catch(err => console.error('Erro no service worker:', err));
}

// ----- Abas -----
const botoesAba = document.querySelectorAll('.aba');
const telas = document.querySelectorAll('.tela');

function mostrarTela(id) {
  telas.forEach(t => t.classList.toggle('ativa', t.id === id));
  botoesAba.forEach(b => b.classList.toggle('ativa', b.dataset.tela === id));
}
botoesAba.forEach(botao => {
  botao.addEventListener('click', () => mostrarTela(botao.dataset.tela));
});

// ----- Liga cada aba -----
iniciarHome();
iniciarCalendario();
iniciarFinanceiro();