import { Router } from 'express';
import { createBarangMasuk } from '../controller/barang-masuk.controller';

const router = Router();

// Endpoint: POST /api/v1/barang-masuk
router.post('/', createBarangMasuk);

export default router;