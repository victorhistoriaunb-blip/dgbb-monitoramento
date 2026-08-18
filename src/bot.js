const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');

const chromeExecutablePath = path.join(process.cwd(), '.cache', 'puppeteer', 'chrome', 'linux-146.0.7680.31', 'chrome-linux64', 'chrome');

const client = new Client({
    authStrategy: new LocalAuth(),
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
            '--disable-gpu'
        ]
    }
});

client.on('qr', (qr) => {
    const qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(qr);
    console.log('\n==================================================');
    console.log('ABRA O LINK ABAIXO NO SEU NAVEGADOR PARA ESCANEAR:');
    console.log(qrImageUrl);
    console.log('==================================================\n');
});

client.on('ready', () => {
    console.log('Bot conectado e pronto!');
});

client.initialize();
