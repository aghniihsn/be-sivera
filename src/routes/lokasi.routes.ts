import { Router } from 'express';
import {
  getAllLokasi,
  getLokasiById,
  createLokasi,
  updateLokasi,
  deleteLokasi
} from '../controller/lokasi.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// Semua endpoint lokasi wajib menyertakan token JWT
router.use(verifyToken);

router.get('/', getAllLokasi);
router.get('/:id', getLokasiById);
router.post('/', createLokasi);
router.put('/:id', updateLokasi);
router.delete('/:id', deleteLokasi);

export default router;