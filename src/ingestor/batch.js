const { processarMensagem } = require('./processor');

function processarLote(mensagens) {
  const resultados = {
    total: mensagens.length,
    sucesso: 0,
    erros: 0,
    detalhes: []
  };

  for (const msg of mensagens) {
    const res = processarMensagem(msg);
    if (res.status === 'sucesso') {
      resultados.sucesso++;
    } else {
      resultados.erros++;
    }
    resultados.detalhes.push(res);
  }

  return resultados;
}

module.exports = { processarLote };
