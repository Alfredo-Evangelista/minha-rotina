import { el, dinheiro, preencherSelect } from '../compartilhado/utilidades.js';

const telaFinanceiro = document.getElementById('financeiro');

// ----- Opções fixas -----
const metodos = ['Pix', 'Cartão', 'Transferência', 'Dinheiro'];
const tiposConta = ['Conta corrente', 'Cartão de crédito', 'Dinheiro', 'Outro'];

// ----- Dados de mentira -----
function diasAtras(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const contas = [
  { id: 1, nome: 'Nubank',   tipo: 'Cartão de crédito' },
  { id: 2, nome: 'Itaú',     tipo: 'Conta corrente' },
  { id: 3, nome: 'Carteira', tipo: 'Dinheiro' },
];

const gastos = [
  { descricao: 'Mercado',   valor: 182.50, contaId: 1, metodo: 'Cartão',        data: diasAtras(0) },
  { descricao: 'Almoço',    valor: 38.90,  contaId: 2, metodo: 'Pix',           data: diasAtras(1) },
  { descricao: 'Aluguel',   valor: 900,    contaId: 2, metodo: 'Transferência', data: diasAtras(2) },
  { descricao: 'Padaria',   valor: 12.50,  contaId: 3, metodo: 'Dinheiro',      data: diasAtras(3) },
  { descricao: 'Streaming', valor: 39.90,  contaId: 1, metodo: 'Cartão',        data: diasAtras(5) },
];

// Estado: qual conta está filtrada (null = todas)
let contaFiltro = null;

function somar(lista) {
  return lista.reduce((total, g) => total + g.valor, 0);
}

// ----- Janelas que sobem de baixo (formulários) -----
const fundo = document.getElementById('folha-fundo');
const folhaConta = document.getElementById('folha-conta');
const folhaGasto = document.getElementById('folha-gasto');

function abrirFolha(folha) {
  fundo.classList.add('aberta');
  folha.classList.add('aberta');
}

function fecharFolhas() {
  fundo.classList.remove('aberta');
  document.querySelectorAll('.folha').forEach(f => f.classList.remove('aberta'));
}

// ----- Desenho da tela -----
function criarCartaoConta(titulo, subtitulo, total, selecionada, aoClicar) {
  const card = el('button', 'conta-card' + (selecionada ? ' selecionada' : ''));
  card.appendChild(el('span', 'conta-nome', titulo));
  card.appendChild(el('span', 'conta-tipo', subtitulo));
  card.appendChild(el('span', 'conta-valor', dinheiro(total)));
  card.addEventListener('click', aoClicar);
  return card;
}

function desenharFinanceiro() {
  telaFinanceiro.innerHTML = '';

  // Gastos que aparecem agora (todos ou só de uma conta), do mais novo para o mais antigo
  const visiveis = gastos
    .filter(g => contaFiltro === null || g.contaId === contaFiltro)
    .sort((a, b) => b.data - a.data);

  // --- Resumo ---
  const contaEscolhida = contas.find(c => c.id === contaFiltro);
  const resumo = el('div', 'resumo');
  resumo.appendChild(el('p', 'resumo-rotulo',
    contaEscolhida ? `Total gasto · ${contaEscolhida.nome}` : 'Total gasto · todas as contas'));
  resumo.appendChild(el('p', 'resumo-total', dinheiro(somar(visiveis))));

  const chips = el('div', 'resumo-metodos');
  metodos.forEach(metodo => {
    const soma = somar(visiveis.filter(g => g.metodo === metodo));
    if (soma > 0) chips.appendChild(el('span', 'chip-metodo', `${metodo} ${dinheiro(soma)}`));
  });
  resumo.appendChild(chips);
  telaFinanceiro.appendChild(resumo);

  // --- Contas ---
  telaFinanceiro.appendChild(el('h2', 'fin-secao', 'Contas'));
  const faixa = el('div', 'contas');

  faixa.appendChild(criarCartaoConta(
    'Todas', `${contas.length} contas`, somar(gastos),
    contaFiltro === null,
    () => { contaFiltro = null; desenharFinanceiro(); }
  ));

  contas.forEach(conta => {
    faixa.appendChild(criarCartaoConta(
      conta.nome, conta.tipo, somar(gastos.filter(g => g.contaId === conta.id)),
      contaFiltro === conta.id,
      () => { contaFiltro = conta.id; desenharFinanceiro(); }
    ));
  });

  const nova = el('button', 'conta-card nova', '+ Nova conta');
  nova.addEventListener('click', () => abrirFolha(folhaConta));
  faixa.appendChild(nova);
  telaFinanceiro.appendChild(faixa);

  // --- Lista de gastos ---
  telaFinanceiro.appendChild(el('h2', 'fin-secao', 'Gastos'));

  if (visiveis.length === 0) {
    telaFinanceiro.appendChild(el('p', 'vazio', 'Nenhum gasto nesta conta ainda.'));
    return;
  }

  const lista = el('ul', 'gastos');
  visiveis.forEach(g => {
    const conta = contas.find(c => c.id === g.contaId);
    const dataCurta = g.data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    const item = el('li', 'gasto');
    const info = el('div', 'gasto-info');
    info.appendChild(el('span', 'gasto-desc', g.descricao));
    info.appendChild(el('span', 'gasto-detalhe', `${conta.nome} · ${g.metodo} · ${dataCurta}`));
    item.appendChild(info);
    item.appendChild(el('span', 'gasto-valor', dinheiro(g.valor)));
    lista.appendChild(item);
  });
  telaFinanceiro.appendChild(lista);
}

// O app.js chama esta função uma vez, ao abrir o app
export function iniciar() {
  fundo.addEventListener('click', fecharFolhas);
  document.querySelectorAll('[data-fechar]').forEach(b => {
    b.addEventListener('click', fecharFolhas);
  });

  // Opções dos campos de seleção
  preencherSelect(document.getElementById('conta-tipo'),
    tiposConta.map(t => ({ valor: t, texto: t })));
  preencherSelect(document.getElementById('gasto-metodo'),
    metodos.map(m => ({ valor: m, texto: m })));

  // Botão "+": prepara o formulário de gasto e abre
  document.getElementById('botao-novo-gasto').addEventListener('click', () => {
    preencherSelect(document.getElementById('gasto-conta'),
      contas.map(c => ({ valor: c.id, texto: c.nome })));
    // O formato 'sv-SE' devolve a data local como AAAA-MM-DD (o que o campo de data pede)
    document.getElementById('gasto-data').value = new Date().toLocaleDateString('sv-SE');
    abrirFolha(folhaGasto);
  });

  // Salvar: por enquanto só fecha. Vamos guardar os dados no próximo passo.
  document.getElementById('form-conta').addEventListener('submit', e => {
    e.preventDefault();
    fecharFolhas();
  });
  document.getElementById('form-gasto').addEventListener('submit', e => {
    e.preventDefault();
    fecharFolhas();
  });

  desenharFinanceiro();
}