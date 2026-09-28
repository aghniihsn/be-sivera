import { Router } from 'express';
import { createBarangKeluar } from '../controller/barang-keluar.controller';

const router = Router();

// Endpoint: POST /api/v1/barang-keluar
router.post('/', createBarangKeluar);

export default router;