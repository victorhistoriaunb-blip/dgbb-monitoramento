const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'dgbb_monitoramento.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS noticias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        link TEXT UNIQUE NOT NULL,
        titulo TEXT NOT NULL,
        veiculo TEXT NOT NULL,
        data_noticia TEXT NOT NULL,
        tipo TEXT DEFAULT 'Instainfo',
        cabecalho_original TEXT,
        data_coleta DATETIME DEFAULT CURRENT_TIMESTAMP,
        hash_identificador TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT UNIQUE NOT NULL,
        ativo INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS setores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT UNIQUE NOT NULL,
        ativo INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS temas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT UNIQUE NOT NULL,
        ativo INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS tema_clientes (
        tema_id INTEGER,
        cliente_id INTEGER,
        PRIMARY KEY (tema_id, cliente_id),
        FOREIGN KEY (tema_id) REFERENCES temas(id) ON DELETE CASCADE,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tema_setores (
        tema_id INTEGER,
        setor_id INTEGER,
        PRIMARY KEY (tema_id, setor_id),
        FOREIGN KEY (tema_id) REFERENCES temas(id) ON DELETE CASCADE,
        FOREIGN KEY (setor_id) REFERENCES setores(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS noticia_clientes (
        noticia_id INTEGER,
        cliente_id INTEGER,
        PRIMARY KEY (noticia_id, cliente_id),
        FOREIGN KEY (noticia_id) REFERENCES noticias(id) ON DELETE CASCADE,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS noticia_setores (
        noticia_id INTEGER,
        setor_id INTEGER,
        PRIMARY KEY (noticia_id, setor_id),
        FOREIGN KEY (noticia_id) REFERENCES noticias(id) ON DELETE CASCADE,
        FOREIGN KEY (setor_id) REFERENCES setores(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS mensagens_erro (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mensagem_raw TEXT,
        motivo_falha TEXT,
        data_tentativa DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Banco de dados SQLite inicializado com sucesso.');
}

module.exports = { db, initDb };
