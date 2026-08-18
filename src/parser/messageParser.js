const { normalizarTexto } = require('../utils/normalizer');

function parseMensagem(mensagemRaw) {
  const textoLimpo = normalizarTexto(mensagemRaw);

  // 1. Extração do Link
  const matchLink = textoLimpo.match(/(https?:\/\/[^\s]+)/);
  if (!matchLink) {
    throw new Error('Link não encontrado');
  }
  const link = matchLink[1];

  // 2. Extração do Cabeçalho e Cliente
  let clienteExtraido = null;
  const matchCabecalho = textoLimpo.match(/\((?:Clipping\s+)?Instainfo\s+DGBB\s*[-–]\s*([^)]+)\)/i) ||
                         textoLimpo.match(/Instainfo\s+DGBB[^:]*?:\s*([^-–\n]+)/i);

  if (matchCabecalho) {
    clienteExtraido = matchCabecalho[1].trim();
  } else {
    throw new Error('Cabeçalho não identificado');
  }

  // 3. Isolamento da estrutura da notícia removendo o cabeçalho
  let textoSemCabecalho = textoLimpo.replace(/\([^)]+\)/g, '').trim();

  // Procura a linha que contém a data e o hífen
  const linhas = mensagemRaw.split('\n');
  let linhaNoticia = '';

  for (const l of linhas) {
    if (/\d{1,2}\/\d{1,2}/.test(l) && (l.includes('-') || l.includes('–'))) {
      linhaNoticia = normalizarTexto(l).replace(/\([^)]+\)/g, '').trim();
      break;
    }
  }

  if (!linhaNoticia) {
    linhaNoticia = textoSemCabecalho;
  }

  // Regex para extrair Veículo - Data - Título
  const regexEstrutura = /^([^-–]+?)\s*[-–]\s*(\d{1,2}\/\d{1,2})\s*[-–]\s*(.+?)(?:\s*[-–]\s*https?:\/\/.+)?$/;
  const matchEstrutura = linhaNoticia.match(regexEstrutura);

  if (!matchEstrutura) {
    throw new Error('Estrutura Veículo - Data - Título não encontrada');
  }

  const veiculo = matchEstrutura[1].trim();
  const dataNoticia = matchEstrutura[2].trim();
  const titulo = matchEstrutura[3].replace(link, '').trim();

  const [dia, mes] = dataNoticia.split('/');
  const anoAtual = new Date().getFullYear();
  const dataFormatada = `${anoAtual}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;

  return {
    link,
    titulo,
    veiculo,
    data_noticia: dataFormatada,
    cliente: clienteExtraido,
    cabecalho_original: matchCabecalho[0]
  };
}

module.exports = { parseMensagem };
