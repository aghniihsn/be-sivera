import { Router } from 'express';
import { createPeminjaman, getAllPeminjaman } from '../controller/peminjaman.controller';
import { verifyToken } from '../middleware/auth.middleware'; 

const router = Router();

router.use(verifyToken);

router.get('/', getAllPeminjaman);
router.post('/', createPeminjaman);

export default router;