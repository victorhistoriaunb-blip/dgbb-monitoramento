const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
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
    console.log('\n--- SCANEE O QR CODE ABAIXO ---\n');
    qrcode.generate(qr, { small: true });
    console.log('\nOU COPIE A STRING DO QR CODE ABAIXO:\n', qr);
});

client.on('ready', () => {
    console.log('Bot conectado e pronto!');
});

client.initialize();
