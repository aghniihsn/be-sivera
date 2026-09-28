import mysql from 'mysql2/promise';
import { Client } from 'ssh2';
import dotenv from 'dotenv';

dotenv.config();

const createSshTunnelConnection = (): Promise<mysql.Pool> => {
  return new Promise((resolve, reject) => {
    // Jika SSH_HOST tidak ada di .env, gunakan koneksi langsung (tanpa tunnel)
    if (!process.env.SSH_HOST) {
      const directPool = mysql.createPool({
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || '',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || '',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      return resolve(directPool);
    }

    const sshClient = new Client();

    sshClient
      .on('ready', () => {
        // Forward koneksi dari lokal ke MySQL yang ada di dalam server SSH
        sshClient.forwardOut(
          '127.0.0.1',
          12345,
          process.env.DB_HOST || '127.0.0.1',
          Number(process.env.DB_PORT) || 3306,
          (err, stream) => {
            if (err) {
              console.error('❌ Error membuat jalur SSH:', err.message);
              sshClient.end();
              return reject(err);
            }

            // Hubungkan MySQL menggunakan stream dari SSH
            const pool = mysql.createPool({
              user: process.env.DB_USER || '',
              password: process.env.DB_PASSWORD || '',
              database: process.env.DB_NAME || '',
              stream: stream,
              waitForConnections: true,
              connectionLimit: 10,
              queueLimit: 0,
              connectTimeout: 20000 // Batas waktu tunggu koneksi 20 detik
            });

            console.log('✅ Terhubung ke MySQL melalui SSH Tunnel');
            resolve(pool);
          }
        );
      })
      .on('error', (err) => {
        console.error('❌ Gagal terhubung ke SSH:', err.message);
        reject(err);
      })
      .connect({
        host: process.env.SSH_HOST || '',
        port: Number(process.env.SSH_PORT) || 22,
        username: process.env.SSH_USER || '',
        password: process.env.SSH_PASSWORD || '',
        keepaliveInterval: 10000 // Mengirim ping setiap 10 detik agar koneksi tetap hidup
      });
  });
};

// Export promise pool agar bisa ditunggu (await) di controller
const dbPromise = createSshTunnelConnection();
export default dbPromise;