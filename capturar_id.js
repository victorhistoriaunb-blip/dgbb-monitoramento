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
  console.log('📡 ESCUTANDO MENSAGENS...');
  console.log('Envie ou receba qualquer mensagem no grupo desejado.');
  console.log('================================================--\n');
});

async function capturarIdGrupo(msg) {
  try {
    const chat = await msg.getChat();
    if (chat && chat.isGroup) {
      console.log(`📌 GRUPO DETECTADO:`);
      console.log(`   NOME : "${chat.name}"`);
      console.log(`   ID   : ${chat.id._serialized}\n`);
    }
  } catch (e) {
    // Silencia erros de injeção temporária
  }
}

client.on('message', capturarIdGrupo);
client.on('message_create', capturarIdGrupo);

client.initialize();
