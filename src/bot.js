const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');

const chromeExecutablePath = path.join(process.cwd(), '.cache', 'puppeteer', 'chrome', 'linux-146.0.7680.31', 'chrome-linux64', 'chrome');

const client = new Client({
    authStrategy: new LocalAuth(),
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    },
    puppeteer: {
        executablePath: chromeExecutablePath,
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
            '--js-flags="--max-old-space-size=256"',
            '--disable-extensions'
        ]
    }
});

client.on('qr', (qr) => {
    const qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(qr);
    console.log('\n==================================================');
    console.log('ABRA O LINK ABAIXO NO NAVEGADOR PARA ESCANEAR:');
    console.log(qrImageUrl);
    console.log('==================================================\n');
});

client.on('ready', () => {
    console.log('Bot conectado e pronto!');
});

client.initialize().catch(err => {
    console.error('Erro na inicializacao:', err);
});
