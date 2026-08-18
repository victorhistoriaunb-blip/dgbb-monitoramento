const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('ready', () => {
  console.log('\n================================================--');
  console.log('🟢 CONECTADO E PRONTO!');
  console.log('Agora envie QUALQUER mensagem nos grupos pelo celular.');
  console.log('================================================--\n');
});

client.on('message_create', (msg) => {
  // Imprime o ID da conversa de QUALQUER mensagem (recebida ou enviada por você)
  const idChat = msg.from.includes('@g.us') ? msg.from : (msg.to.includes('@g.us') ? msg.to : null);
  
  if (idChat) {
    console.log(`📌 GRUPO ENCONTRADO!`);
    console.log(`   ID DO GRUPO : ${idChat}`);
    console.log(`   CONTEÚDO    : "${msg.body}"\n`);
  }
});

client.initialize();
