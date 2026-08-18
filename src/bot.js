const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

// Aponta o cache do Puppeteer para a pasta local do projeto
process.env.PUPPETEER_CACHE_DIR = path.join(__dirname, '../.cache/puppeteer');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
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
    console.log('--- SCANEE O QR CODE ABAIXO ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot conectado e pronto!');
});

client.initialize();
