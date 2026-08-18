function normalizarTexto(texto) {
  if (!texto) return '';
  return texto
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizarNomeCliente(nome) {
  if (!nome) return '';
  return nome
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

module.exports = { normalizarTexto, normalizarNomeCliente };
