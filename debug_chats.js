const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('ready', async () => {
  console.log('\n================================================--');
  console.log('⏳ Sincronizando e buscando grupos do seu WhatsApp...');
  console.log('================================================--\n');

  // Aguarda 8 segundos para garantir o carregamento das conversas no WhatsApp Web
  await new Promise(resolve => setTimeout(resolve, 8000));

  try {
    const chats = await client.getChats();
    const grupos = chats.filter(c => c.isGroup);

    if (grupos.length === 0) {
      console.log('⚠️ Nenhum grupo foi localizado. Verifique se o WhatsApp está conectado.');
    } else {
      console.log(`📌 ENCONTRADOS ${grupos.length} GRUPOS:\n`);
      grupos.forEach((g) => {
        console.log(`▪️ NOME : "${g.name}"`);
        console.log(`   ID   : ${g.id._serialized}\n`);
      });
    }
  } catch (err) {
    console.error('❌ Erro ao listar chats:', err.message || err);
  }

  console.log('================================================--');
  console.log('Pressione CTRL + C para encerrar.');
});

client.initialize();
