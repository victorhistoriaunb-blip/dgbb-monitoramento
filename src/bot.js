const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const { processarMensagem } = require('./ingestor/processor');
const { exportarRelatorioGeralExcel } = require('./query/exporter');
const { buscarNoticiasPorClienteEData } = require('./query/report');

// IDs Exatos dos Grupos
const ID_GRUPO_FONTE = '556181626759-1458852010@g.us';   // Instainfo DGBB (Somente Leitura)
const ID_GRUPO_COMANDOS = '120363430268341815@g.us'; // Bot Instainfo (Comandos e Respostas)

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  }
});

client.on('qr', (qr) => {
  console.log('\n================================================--');
  console.log(' Escaneie o QR Code abaixo com seu WhatsApp:');
  console.log('================================================--\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('\n================================================--');
  console.log('🤖 DGBB Monitoramento ligado e 100% operacional!');
  console.log(`📥 Leitura (Silenciosa): Instainfo DGBB (${ID_GRUPO_FONTE})`);
  console.log(`📤 Respostas & Comandos: Bot Instainfo (${ID_GRUPO_COMANDOS})`);
  console.log('================================================--\n');
});

function extrairClienteEDatas(parametro) {
  const hoje = new Date();
  const diaHoje = String(hoje.getDate()).padStart(2, '0');
  const mesHoje = String(hoje.getMonth() + 1).padStart(2, '0');
  const dataHojeStr = `${diaHoje}/${mesHoje}`;

  const matchIntervalo = parametro.match(/^(.+?)\s+(\d{2}\/\d{2})\s*(?:a|-)\s*(\d{2}\/\d{2})$/i);
  if (matchIntervalo) {
    return {
      cliente: matchIntervalo[1].trim(),
      dataInicio: matchIntervalo[2],
      dataFim: matchIntervalo[3],
      foiDataEspecifica: true
    };
  }

  const matchDataUnica = parametro.match(/^(.+?)\s+(\d{2}\/\d{2})$/i);
  if (matchDataUnica) {
    return {
      cliente: matchDataUnica[1].trim(),
      dataInicio: matchDataUnica[2],
      dataFim: null,
      foiDataEspecifica: true
    };
  }

  return {
    cliente: parametro.trim(),
    dataInicio: dataHojeStr,
    dataFim: null,
    foiDataEspecifica: false
  };
}

function formatarLinhaNoticia(n) {
  const raw = n.raw_message || '';
  const clienteNome = n.cliente || '';
  
  const temClipping = /Clipping/i.test(raw);
  const temComCliente = new RegExp(`com\\s+${clienteNome}`, 'i').test(raw);

  let veiculoFormatado = n.veiculo;

  if (temClipping || temComCliente) {
    veiculoFormatado = `${n.veiculo} com ${clienteNome}`;
  }

  return `▪️ *${veiculoFormatado}* - ${n.titulo} - ${n.url}`;
}

// Conjunto para evitar processar a mesma mensagem duas vezes
const mensagensProcessadas = new Set();

async function tratarMensagem(msg) {
  try {
    if (!msg || !msg.body || typeof msg.body !== 'string' || msg.body.trim() === '') return;
    
    // Evita duplicidade de execução
    const msgId = msg.id ? msg.id._serialized : null;
    if (msgId && mensagensProcessadas.has(msgId)) return;
    if (msgId) {
      mensagensProcessadas.add(msgId);
      if (mensagensProcessadas.size > 500) {
        const primeiro = mensagensProcessadas.values().next().value;
        mensagensProcessadas.delete(primeiro);
      }
    }

    const texto = msg.body.trim();
    const textoMin = texto.toLowerCase();
    
    // Identificação do Chat
    const idChatAtual = msg.from.includes('@g.us') ? msg.from : (msg.to.includes('@g.us') ? msg.to : '');

    // 1. INGESTÃO SILENCIOSA NO GRUPO FONTE
    if (idChatAtual === ID_GRUPO_FONTE) {
      if (!textoMin.startsWith('!')) {
        const resultado = processarMensagem(msg.body);
        if (resultado && resultado.status === 'sucesso') {
          console.log(`💾 [INGESTÃO] Nova notícia extraída e salva no banco! ID: ${resultado.noticiaId}`);
        }
      }
      return; // Nunca envia nada de volta no grupo fonte
    }

    // 2. COMANDOS EXCLUSIVOS NO GRUPO BOT INSTAINFO
    if (idChatAtual === ID_GRUPO_COMANDOS) {

      // Comando !relatorio
      if (textoMin === '!relatorio') {
        const caminhoArquivo = path.resolve('./relatorio_geral.xlsx');
        exportarRelatorioGeralExcel(caminhoArquivo);
        const media = MessageMedia.fromFilePath(caminhoArquivo);
        await client.sendMessage(ID_GRUPO_COMANDOS, media);
        console.log(`📊 [COMANDO] Relatório Excel gerado e enviado.`);
        return;
      }

      // Comandos !resumo e !clipping
      if (textoMin.startsWith('!resumo') || textoMin.startsWith('!clipping')) {
        const eApenasClipping = textoMin.startsWith('!clipping');
        const prefixo = eApenasClipping ? '!clipping' : '!resumo';
        const parametro = texto.replace(new RegExp(`^${prefixo}\\s*`, 'i'), '').trim();

        if (!parametro) {
          await client.sendMessage(ID_GRUPO_COMANDOS, `⚠️ *Como usar:* \`${prefixo} <cliente> [data/período]\`\nEx: \`${prefixo} abrasca\` ou \`${prefixo} abrasca 18/08\``);
          return;
        }

        const { cliente, dataInicio, dataFim, foiDataEspecifica } = extrairClienteEDatas(parametro);
        const resultado = buscarNoticiasPorClienteEData(cliente, dataInicio, dataFim, eApenasClipping);

        if (resultado.total === 0) {
          const periodoTxt = dataFim ? `${dataInicio} a ${dataFim}` : (foiDataEspecifica ? dataInicio : 'últimas 24h / cadastradas');
          const tipoTxt = eApenasClipping ? 'clipping com citação' : 'notícia';
          await client.sendMessage(ID_GRUPO_COMANDOS, `🤖 *DGBB Monitoramento*\n\nNenhum(a) ${tipoTxt} encontrado(a) para "*${resultado.cliente}*" no período/banco (${periodoTxt}).`);
          return;
        }

        const cabecalhoData = dataFim ? `${dataInicio} a ${dataFim}` : (foiDataEspecifica ? dataInicio : `${dataInicio} (Hoje)`);
        const tituloTipo = eApenasClipping ? 'Clippings Destacados' : 'Geral';
        let resposta = `🤖 *DGBB Monitoramento — ${resultado.cliente} (${tituloTipo})* - ${cabecalhoData}\n\n`;

        resultado.noticias.forEach((n) => {
          resposta += `${formatarLinhaNoticia(n)}\n\n`;
        });

        resposta += `📊 *Total:* ${resultado.total}`;
        
        await client.sendMessage(ID_GRUPO_COMANDOS, resposta);
        console.log(`📤 [COMANDO] Resposta de ${prefixo} para "${cliente}" enviada com sucesso.`);
      }
    }

  } catch (erro) {
    console.error('❌ Erro no processamento de mensagem:', erro.message || erro);
  }
}

client.on('message', tratarMensagem);
client.on('message_create', tratarMensagem);

client.initialize();
