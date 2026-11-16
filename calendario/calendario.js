import { hoje } from '../compartilhado/utilidades.js';

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

// O app.js chama esta função uma vez, ao abrir o app
export function iniciar() {
  desenharCalendario();
}