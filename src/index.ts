import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import lokasiRoutes from './routes/lokasi.routes'; 
import barangRoutes from './routes/barang.routes';
import kategoriRoutes from './routes/kategori.routes';
import pelajaranRoutes from './routes/pelajaran.routes';
import peminjamanRoutes from './routes/peminjaman.routes';
import barangMasukRoutes from './routes/barang-masuk.routes';
import barangKeluarRoutes from './routes/barang-keluar.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health Check Endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'SEVERA API is running',
  });
});
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/lokasi', lokasiRoutes);
app.use('/api/v1/kategori', kategoriRoutes);
app.use('/api/v1/barang', barangRoutes);
app.use('/api/v1/pelajaran', pelajaranRoutes);
app.use('/api/v1/peminjaman', peminjamanRoutes);
app.use('/api/v1/barang-masuk', barangMasukRoutes);
app.use('/api/v1/barang-keluar', barangKeluarRoutes);


// App Listener
app.listen(PORT, () => {
  console.log(`SIVERA API Running on Port ${PORT}`);
});