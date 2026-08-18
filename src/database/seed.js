const { db, initDb } = require('./db');

initDb();

const initialData = {
  setores: ['Energia', 'Educação', 'Shopping Centers', 'Saúde'],
  
  clientes: [
    'ABCE', 'ABEEólica', 'ABiogás', 'ABIAPE', 'ABRADEE', 'ABRATE', 'ABRAGE', 'APINE', 'FASE', 'FMASE', 'Renova Energia', 'Instituto Totum',
    'ABMES', 'FENEP', 'Fórum das Entidades Representativas do Ensino Superior Particular', 'SINEPE/DF',
    'CNSaúde', 'FenaSaúde',
    'iFood', 'Mercado Livre', 'ABRASCA', 'ANAFE', 'SINAL', 'Quadraimob'
  ],

  temas: [
    {
      nome: 'ENERGIA',
      setores: ['Energia'],
      clientes: ['ABCE', 'ABEEólica', 'ABiogás', 'ABIAPE', 'ABRADEE', 'ABRATE', 'ABRAGE', 'APINE', 'FASE', 'FMASE', 'Renova Energia', 'Instituto Totum']
    },
    {
      nome: 'EDUCAÇÃO',
      setores: ['Educação'],
      clientes: ['ABMES', 'FENEP', 'Fórum das Entidades Representativas do Ensino Superior Particular', 'SINEPE/DF']
    },
    {
      nome: 'SAÚDE',
      setores: ['Saúde'],
      clientes: ['CNSaúde', 'FenaSaúde']
    },
    { nome: 'IFOOD', clientes: ['iFood'] },
    { nome: 'MERCADO LIVRE', clientes: ['Mercado Livre'] },
    { nome: 'ABRASCA', clientes: ['ABRASCA'] },
    { nome: 'ANAFE', clientes: ['ANAFE'] },
    { nome: 'SINAL', clientes: ['SINAL'] },
    { nome: 'QUADRAIMOB', clientes: ['Quadraimob'] }
  ]
};

function seedDatabase() {
  const insertSetor = db.prepare('INSERT OR IGNORE INTO setores (nome) VALUES (?)');
  const insertCliente = db.prepare('INSERT OR IGNORE INTO clientes (nome) VALUES (?)');
  const insertTema = db.prepare('INSERT OR IGNORE INTO temas (nome) VALUES (?)');
  
  const getSetorId = db.prepare('SELECT id FROM setores WHERE LOWER(nome) = LOWER(?)');
  const getClienteId = db.prepare('SELECT id FROM clientes WHERE LOWER(nome) = LOWER(?)');
  const getTemaId = db.prepare('SELECT id FROM temas WHERE LOWER(nome) = LOWER(?)');

  const insertTemaCliente = db.prepare('INSERT OR IGNORE INTO tema_clientes (tema_id, cliente_id) VALUES (?, ?)');
  const insertTemaSetor = db.prepare('INSERT OR IGNORE INTO tema_setores (tema_id, setor_id) VALUES (?, ?)');

  const transaction = db.transaction(() => {
    for (const setor of initialData.setores) {
      insertSetor.run(setor);
    }

    for (const cliente of initialData.clientes) {
      insertCliente.run(cliente);
    }

    for (const tema of initialData.temas) {
      insertTema.run(tema.nome);
      const tId = getTemaId.get(tema.nome)?.id;

      if (tId) {
        if (tema.clientes) {
          for (const cNome of tema.clientes) {
            const cId = getClienteId.get(cNome)?.id;
            if (cId) insertTemaCliente.run(tId, cId);
          }
        }
        if (tema.setores) {
          for (const sNome of tema.setores) {
            const sId = getSetorId.get(sNome)?.id;
            if (sId) insertTemaSetor.run(tId, sId);
          }
        }
      }
    }
  });

  transaction();
  console.log('✅ Carga inicial de Clientes, Setores e Temas realizada com sucesso!');
}

seedDatabase();
