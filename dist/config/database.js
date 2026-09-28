"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const ssh2_1 = require("ssh2");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sshClient = new ssh2_1.Client();
const getRequiredEnv = (name) => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value.trim();
};
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = Number(process.env.DB_PORT) || 3306;
const sshDbHost = process.env.SSH_DB_HOST || dbHost;
const sshDbPort = Number(process.env.SSH_DB_PORT) || dbPort;
const dbPromise = new Promise((resolve, reject) => {
    // 1. Jika SSH config diisi, buat SSH Tunnel dulu
    if (process.env.SSH_HOST) {
        sshClient
            .on('ready', () => {
            sshClient.forwardOut('127.0.0.1', 12345, sshDbHost, sshDbPort, (err, stream) => {
                if (err) {
                    console.error(`SSH forwarding failed: ${sshDbHost}:${dbPort} is unreachable from the SSH server.`, err);
                    return reject(err);
                }
                // 2. Buat koneksi MySQL melalui stream SSH
                const pool = promise_1.default.createPool({
                    user: getRequiredEnv('DB_USER'),
                    password: getRequiredEnv('DB_PASSWORD'),
                    database: getRequiredEnv('DB_NAME'),
                    stream: stream,
                    waitForConnections: true,
                    connectionLimit: 10,
                    queueLimit: 0
                });
                console.log('Connected to MySQL via SSH Tunnel');
                resolve(pool);
            });
        })
            .on('error', (err) => {
            console.error('SSH Connection Error:', err);
            reject(err);
        })
            .connect({
            host: getRequiredEnv('SSH_HOST'),
            port: Number(process.env.SSH_PORT) || 22,
            username: getRequiredEnv('SSH_USER'),
            password: getRequiredEnv('SSH_PASSWORD')
        });
    }
    else {
        // Jika tidak pakai SSH (Koneksi Langsung)
        const pool = promise_1.default.createPool({
            host: dbHost,
            port: dbPort,
            user: getRequiredEnv('DB_USER'),
            password: getRequiredEnv('DB_PASSWORD'),
            database: getRequiredEnv('DB_NAME'),
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        console.log('Connected to MySQL Directly');
        resolve(pool);
    }
});
exports.default = dbPromise;
//# sourceMappingURL=database.js.map