const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');
const os = require('os');

const isWindows = os.platform() === 'win32';
const chromeExecutablePath = isWindows 
    ? undefined 
    : path.join(process.cwd(), '.cache', 'puppeteer', 'chrome', 'linux-146.0.7680.31', 'chrome-linux64', 'chrome');

const puppeteerConfig = {
    headless: true,
    timeout: 60000,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-extensions'
    ]
};

if (chromeExecutablePath) {
    puppeteerConfig.executablePath = chromeExecutablePath;
}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: puppeteerConfig
});

client.on('qr', (qr) => {
    const qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(qr);
    console.log('\n==================================================');
    console.log('ABRA O LINK ABAIXO NO NAVEGADOR PARA ESCANEAR:');
    console.log(qrImageUrl);
    console.log('==================================================\n');
});

client.on('authenticated', () => {
    console.log('✅ Autenticado com sucesso!');
});

client.on('ready', () => {
    console.log('🚀 Bot conectado e pronto!');
});

client.initialize().catch(err => {
    console.error('Erro na inicialização:', err);
});
