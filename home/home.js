import { hoje } from '../compartilhado/utilidades.js';

// Dia que está sendo mostrado na Home (começa em hoje, à meia-noite)
const diaHome = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

// Compromissos de mentira, só para testar o layout
const compromissos = [
  { hora: '08:00', titulo: 'Academia' },
  { hora: '10:00', titulo: 'Reunião' },
  { hora: '14:00', titulo: 'Estudar' },
];

function inicioDoDia(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

function atualizarCabecalho() {
  // Diferença em dias entre o dia mostrado e hoje
  const diferenca = Math.round((diaHome - inicioDoDia(hoje)) / 86400000);

  let rotulo;
  if (diferenca === 0) rotulo = 'Hoje';
  else if (diferenca === 1) rotulo = 'Amanhã';
  else if (diferenca === -1) rotulo = 'Ontem';
  else rotulo = diaHome.getFullYear();

  const semana = diaHome.toLocaleDateString('pt-BR', { weekday: 'long' });
  const diaMes = diaHome.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  document.getElementById('dia-semana').textContent = rotulo;
  document.getElementById('data-hoje').textContent = `${semana}, ${diaMes}`;
}

function mudarDia(delta) {
  diaHome.setDate(diaHome.getDate() + delta); // o JS ajusta mês/ano sozinho
  atualizarCabecalho();
}

function desenharHorarios() {
  const lista = document.getElementById('lista-horarios');
  lista.innerHTML = '';

  for (let h = 6; h <= 22; h++) {
    const hora = String(h).padStart(2, '0') + ':00';

    const item = document.createElement('li');
    item.className = 'horario';

    const rotuloHora = document.createElement('span');
    rotuloHora.className = 'hora';
    rotuloHora.textContent = hora;
    item.appendChild(rotuloHora);

    compromissos
      .filter(c => c.hora === hora)
      .forEach(c => {
        const etiqueta = document.createElement('span');
        etiqueta.className = 'compromisso';
        etiqueta.textContent = c.titulo;
        item.appendChild(etiqueta);
      });

    lista.appendChild(item);
  }
}

// Mostra se estamos no app instalado ou no navegador
function mostrarStatus() {
  const instalado = window.matchMedia('(display-mode: standalone)').matches
    || navigator.standalone;
  document.getElementById('status').textContent = instalado
    ? '✅ Rodando como app instalado'
    : '🌐 Rodando no navegador';
}

// O app.js chama esta função uma vez, ao abrir o app
export function iniciar() {
  mostrarStatus();
  document.getElementById('dia-anterior').addEventListener('click', () => mudarDia(-1));
  document.getElementById('dia-seguinte').addEventListener('click', () => mudarDia(1));
  atualizarCabecalho();
  desenharHorarios();
}