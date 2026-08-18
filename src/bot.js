const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

const chromeExecutablePath = path.join(process.cwd(), '.cache', 'puppeteer', 'chrome', 'linux-146.0.7680.31', 'chrome-linux64', 'chrome');

console.log('Iniciando script...');
console.log('Caminho do Chrome configurado:', chromeExecutablePath);

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
    console.log('--- QR CODE GERADO ---');
    qrcode.generate(qr, { small: true });
    console.log('STRING DO QR:', qr);
});

client.on('ready', () => {
    console.log('Bot conectado e pronto!');
});

client.on('auth_failure', msg => {
    console.error('Falha na autenticação:', msg);
});

client.on('disconnected', (reason) => {
    console.log('Cliente desconectado:', reason);
});

console.log('Inicializando o cliente do WhatsApp...');
client.initialize().catch(err => {
    console.error('Erro ao inicializar o client:', err);
});
