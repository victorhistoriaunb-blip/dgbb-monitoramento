const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.resolve('./database.db');
const db = new Database(dbPath);

function normalizarTexto(texto) {
  if (!texto) return '';
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function processarMensagem(rawMessage) {
  try {
    if (!rawMessage || typeof rawMessage !== 'string') return null;

    // Isola e considera EXCLUSIVAMENTE a primeira linha (cabeçalho)
    const primeiraLinha = rawMessage.trim().split('\n')[0].trim();

    // 1. Extrai a URL
    const urlMatch = primeiraLinha.match(/(https?:\/\/\S+)/);
    if (!urlMatch) return null;
    const url = urlMatch[1];

    // 2. Regex para padrões com parênteses (suporta "Instainfo", "Clipping", "DGBB", etc.)
    // Ex: *(Clipping Instainfo DGBB - ABRASCA) Portal Terra* - 18/08 - Título - URL
    const regexParen = /^\*\((?:(?:Clipping|Instainfo)\s+)*(?:DGBB(?:[\w\s&]*))\s*-\s*([^)]+)\)\s*([^*]+)\*\s*-\s*(\d{2}\/\d{2})\s*-\s*(.+?)\s*-\s*https?:\/\//i;

    // 3. Regex para padrões sem parênteses
    // Ex: *Instainfo DGBB Comunicação & Estratégia: Veículo* - 18/08 - Título - URL
    const regexSemParen = /^\*(?:(?:Clipping|Instainfo)\s+)*(?:DGBB(?:[\w\s&]*)):\s*([^*]+)\*\s*-\s*(\d{2}\/\d{2})\s*-\s*(.+?)\s*-\s*https?:\/\//i;

    let clienteNome = '';
    let veiculo = '';
    let dataNoticia = '';
    let titulo = '';

    const matchParen = primeiraLinha.match(regexParen);
    if (matchParen) {
      clienteNome = matchParen[1].trim();
      veiculo = matchParen[2].trim();
      dataNoticia = matchParen[3].trim();
      titulo = matchParen[4].trim();
    } else {
      const matchSemParen = primeiraLinha.match(regexSemParen);
      if (matchSemParen) {
        veiculo = matchSemParen[1].trim();
        dataNoticia = matchSemParen[2].trim();
        titulo = matchSemParen[3].trim();
      }
    }

    if (!titulo) return null;

    const clientesEncontradosIds = new Set();

    // Registra o cliente extraído do cabeçalho
    if (clienteNome) {
      const clienteNorm = normalizarTexto(clienteNome);
      let clienteObj = db.prepare('SELECT id FROM clientes WHERE nome_normalizado = ?').get(clienteNorm);
      if (!clienteObj) {
        const resCli = db.prepare('INSERT INTO clientes (nome, nome_normalizado) VALUES (?, ?)').run(clienteNome, clienteNorm);
        clienteObj = { id: resCli.lastInsertRowid };
      }
      clientesEncontradosIds.add(clienteObj.id);
    }

    // Verifica se algum outro cliente cadastrado no banco é citado no título ou no veículo
    const listaClientes = db.prepare('SELECT id, nome, nome_normalizado FROM clientes').all();
    const textoAnaliseNorm = normalizarTexto(`${veiculo} ${titulo}`);

    for (const cli of listaClientes) {
      if (textoAnaliseNorm.includes(cli.nome_normalizado)) {
        clientesEncontradosIds.add(cli.id);
      }
    }

    // 4. Salva a notícia e vincula aos clientes
    const anoAtual = new Date().getFullYear();
    const dataFormatadaBanco = dataNoticia.includes('/') ? `${dataNoticia}/${anoAtual}` : dataNoticia;

    const stmtNoticia = db.prepare(`
      INSERT INTO noticias (veiculo, titulo, url, data_noticia, raw_message)
      VALUES (?, ?, ?, ?, ?)
    `);
    const resNoticia = stmtNoticia.run(veiculo, titulo, url, dataFormatadaBanco, primeiraLinha);
    const noticiaId = resNoticia.lastInsertRowid;

    const stmtVinculo = db.prepare(`
      INSERT OR IGNORE INTO noticia_clientes (noticia_id, cliente_id)
      VALUES (?, ?)
    `);

    for (const cId of clientesEncontradosIds) {
      stmtVinculo.run(noticiaId, cId);
    }

    return {
      status: 'sucesso',
      noticiaId,
      veiculo,
      titulo,
      url,
      dataNoticia: dataFormatadaBanco
    };

  } catch (erro) {
    console.error('❌ Erro no processor:', erro.message);
    return null;
  }
}

module.exports = { processarMensagem, normalizarTexto };
