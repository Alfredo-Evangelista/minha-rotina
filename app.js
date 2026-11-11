// ----- Service worker (continua igual) -----
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('Service worker registrado'))
    .catch(err => console.error('Erro no service worker:', err));
}

// ----- Status: app instalado ou navegador -----
const instalado = window.matchMedia('(display-mode: standalone)').matches
  || navigator.standalone;
document.getElementById('status').textContent = instalado
  ? '✅ Rodando como app instalado'
  : '🌐 Rodando no navegador';

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

// =====================================================
// HOME: dia mostrado + lista de horários
// =====================================================
const hoje = new Date();

// Dia que está sendo mostrado na Home (começa em hoje, à meia-noite)
const diaHome = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

function inicioDoDia(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

function atualizarCabecalhoHome() {
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
  atualizarCabecalhoHome();
}

document.getElementById('dia-anterior').addEventListener('click', () => mudarDia(-1));
document.getElementById('dia-seguinte').addEventListener('click', () => mudarDia(1));
atualizarCabecalhoHome();

// Compromissos de mentira, só para testar o layout
const compromissos = [
  { hora: '08:00', titulo: 'Academia' },
  { hora: '10:00', titulo: 'Reunião' },
  { hora: '14:00', titulo: 'Estudar' },
];

const lista = document.getElementById('lista-horarios');

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

// =====================================================
// CALENDÁRIO: visão do mês e visão do ano
// =====================================================
const calendario = document.getElementById('calendario');

// Estado: o que está sendo mostrado agora
let modo = 'mes';                  // 'mes' ou 'ano'
let anoAtual = hoje.getFullYear();
let mesAtual = hoje.getMonth();    // 0 = janeiro ... 11 = dezembro
let diaSelecionado = null;         // guarda um texto tipo "2026-10-15"
let seletorAberto = false;         // grade de escolha de mês aberta?

function chaveDia(ano, mes, dia) {
  return `${ano}-${mes}-${dia}`;
}

function ehHoje(ano, mes, dia) {
  return ano === hoje.getFullYear() && mes === hoje.getMonth() && dia === hoje.getDate();
}

function nomeMes(ano, mes) {
  return new Date(ano, mes, 1).toLocaleDateString('pt-BR', { month: 'long' });
}

// Cria um botão (usado nos cabeçalhos)
function criarBotao(texto, aoClicar, classe = 'botao-texto') {
  const b = document.createElement('button');
  b.className = classe;
  b.textContent = texto;
  b.addEventListener('click', aoClicar);
  return b;
}

// Cria a grade de dias de UM mês (serve para o mês grande e para os mini-meses)
function criarGradeMes(ano, mes, mini) {
  const grade = document.createElement('div');
  grade.className = 'grade' + (mini ? ' mini' : '');

  if (!mini) {
    ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].forEach(letra => {
      const s = document.createElement('span');
      s.className = 'letra-semana';
      s.textContent = letra;
      grade.appendChild(s);
    });
  }

  // Espaços vazios antes do dia 1 (0 = domingo)
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  for (let i = 0; i < primeiroDiaSemana; i++) {
    grade.appendChild(document.createElement('span'));
  }

  // Dia 0 do mês seguinte = último dia deste mês
  const totalDias = new Date(ano, mes + 1, 0).getDate();

  for (let dia = 1; dia <= totalDias; dia++) {
    const celula = document.createElement(mini ? 'span' : 'button');
    celula.className = 'dia';
    celula.textContent = dia;

    if (ehHoje(ano, mes, dia)) celula.classList.add('hoje');

    if (!mini) {
      if (diaSelecionado === chaveDia(ano, mes, dia)) celula.classList.add('selecionado');
      celula.addEventListener('click', () => {
        diaSelecionado = chaveDia(ano, mes, dia);
        desenharCalendario();
      });
    }

    grade.appendChild(celula);
  }

  return grade;
}

// Grade com os 12 meses para escolher
function criarSeletorMes() {
  const painel = document.createElement('div');
  painel.className = 'seletor-mes';

  for (let m = 0; m < 12; m++) {
    const botao = document.createElement('button');
    botao.className = 'opcao-mes' + (m === mesAtual ? ' atual' : '');
    botao.textContent = nomeMes(anoAtual, m);
    botao.addEventListener('click', () => {
      mesAtual = m;
      seletorAberto = false;
      desenharCalendario();
    });
    painel.appendChild(botao);
  }

  return painel;
}

// ----- Visão do mês -----
function desenharMes() {
  // Linha de cima: só o ano, que leva para a visão do ano
  const topo = document.createElement('div');
  topo.className = 'linha-topo';
  topo.appendChild(criarBotao(String(anoAtual), () => {
    modo = 'ano';
    seletorAberto = false;
    desenharCalendario();
  }));
  calendario.appendChild(topo);

  // Título com setas; tocar no nome do mês abre/fecha o seletor
  const titulo = document.createElement('div');
  titulo.className = 'titulo-mes';
  titulo.appendChild(criarBotao('◀', () => mudarMes(-1)));
  titulo.appendChild(criarBotao(
  nomeMes(anoAtual, mesAtual),
  () => { seletorAberto = !seletorAberto; desenharCalendario(); },
  'botao-titulo'
));
  titulo.appendChild(criarBotao('▶', () => mudarMes(1)));
  calendario.appendChild(titulo);

  // Mostra o seletor de meses OU a grade de dias
  if (seletorAberto) {
    calendario.appendChild(criarSeletorMes());
  } else {
    calendario.appendChild(criarGradeMes(anoAtual, mesAtual, false));
  }
}

function mudarMes(delta) {
  mesAtual += delta;
  if (mesAtual < 0)  { mesAtual = 11; anoAtual--; }
  if (mesAtual > 11) { mesAtual = 0;  anoAtual++; }
  seletorAberto = false;
  desenharCalendario();
}

// ----- Visão do ano (12 mini-meses) -----
function desenharAno() {
  const titulo = document.createElement('div');
  titulo.className = 'titulo-mes';
  titulo.appendChild(criarBotao('◀', () => { anoAtual--; desenharCalendario(); }));
  const rotuloAno = document.createElement('span');
  rotuloAno.className = 'titulo-ano';
  rotuloAno.textContent = anoAtual;
  titulo.appendChild(rotuloAno);
  titulo.appendChild(criarBotao('▶', () => { anoAtual++; desenharCalendario(); }));
  calendario.appendChild(titulo);

  const gradeAno = document.createElement('div');
  gradeAno.className = 'grade-ano';

  for (let mes = 0; mes < 12; mes++) {
    const bloco = document.createElement('button');
    bloco.className = 'mini-mes';
    if (anoAtual === hoje.getFullYear() && mes === hoje.getMonth()) {
      bloco.classList.add('mes-atual');
    }

    const nome = document.createElement('h2');
    nome.textContent = nomeMes(anoAtual, mes);
    bloco.appendChild(nome);
    bloco.appendChild(criarGradeMes(anoAtual, mes, true));

    // Tocar no mês abre ele em tamanho grande
    bloco.addEventListener('click', () => {
      mesAtual = mes;
      modo = 'mes';
      desenharCalendario();
    });

    gradeAno.appendChild(bloco);
  }

  calendario.appendChild(gradeAno);
}

// ----- Redesenha tudo conforme o estado -----
function desenharCalendario() {
  calendario.innerHTML = '';
  if (modo === 'mes') desenharMes();
  else desenharAno();
}

desenharCalendario();