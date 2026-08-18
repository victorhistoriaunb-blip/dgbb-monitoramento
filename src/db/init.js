const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.resolve('./database.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS noticias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    veiculo TEXT,
    data_noticia TEXT,
    titulo TEXT,
    url TEXT,
    raw_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS noticia_clientes (
    noticia_id INTEGER,
    cliente_id INTEGER,
    PRIMARY KEY (noticia_id, cliente_id),
    FOREIGN KEY (noticia_id) REFERENCES noticias(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
  );
`);

console.log('✅ Banco de dados e tabelas criados com sucesso!');
