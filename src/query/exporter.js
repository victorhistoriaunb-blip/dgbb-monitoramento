const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { relatorioGeral, buscarNoticiasPorCliente } = require('./report');

function exportarRelatorioGeralExcel(caminhoSaida = './relatorio_geral.xlsx') {
  const dados = relatorioGeral();

  if (dados.length === 0) {
    console.log('Nenhum dado encontrado para exportação.');
    return;
  }

  const dadosFormatados = dados.map(item => ({
    'ID': item.id,
    'Data da Notícia': item.data_noticia,
    'Veículo': item.veiculo,
    'Título': item.titulo,
    'Clientes Impactados': item.clientes_impactados,
    'Link': item.link
  }));

  const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório Geral');

  XLSX.writeFile(workbook, caminhoSaida);
  console.log(`✅ Relatório exportado com sucesso para: ${path.resolve(caminhoSaida)}`);
}

module.exports = { exportarRelatorioGeralExcel };
