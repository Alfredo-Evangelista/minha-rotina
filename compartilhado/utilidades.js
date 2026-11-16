// Funções e valores usados por mais de uma aba.
// "export" deixa outros arquivos pegarem estas coisas com "import".

export const hoje = new Date();

// Cria um elemento com classe e texto, para não repetir código
export function el(tag, classe, texto) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto !== undefined) e.textContent = texto;
  return e;
}

// Formata um número como dinheiro: 182.5 vira "R$ 182,50"
export function dinheiro(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Preenche um <select> com opções [{ valor, texto }, ...]
export function preencherSelect(select, opcoes) {
  select.innerHTML = '';
  opcoes.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o.valor;
    opt.textContent = o.texto;
    select.appendChild(opt);
  });
}