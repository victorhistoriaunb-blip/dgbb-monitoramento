const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve('./database.sqlite');
const db = new Database(dbPath);

function buscarNoticiasPorClienteEData(clienteBusca, dataInicioStr, dataFimStr = null, apenasClipping = false) {
  try {
    const term = `%${clienteBusca.trim().toLowerCase()}%`;

    let sql = `
      SELECT n.id, n.veiculo, n.titulo, n.url, n.data_publicacao, n.raw_message, c.nome as cliente
      FROM noticias n
      INNER JOIN noticia_clientes nc ON n.id = nc.noticia_id
      INNER JOIN clientes c ON nc.cliente_id = c.id
      WHERE LOWER(c.nome) LIKE ?
    `;

    const params = [term];

    if (dataInicioStr) {
      if (dataFimStr) {
        sql += ` AND n.data_publicacao BETWEEN ? AND ?`;
        params.push(dataInicioStr, dataFimStr);
      } else {
        sql += ` AND n.data_publicacao = ?`;
        params.push(dataInicioStr);
      }
    }

    if (apenasClipping) {
      sql += ` AND (n.raw_message LIKE '%Clipping%' OR n.raw_message LIKE '%com %')`;
    }

    sql += ` ORDER BY n.id DESC`;

    const stmt = db.prepare(sql);
    const noticias = stmt.all(...params);

    return {
      cliente: clienteBusca.toUpperCase(),
      total: noticias.length,
      noticias: noticias
    };
  } catch (err) {
    console.error('❌ Erro na consulta ao banco:', err.message);
    return { cliente: clienteBusca, total: 0, noticias: [] };
  }
}

module.exports = { buscarNoticiasPorClienteEData };
