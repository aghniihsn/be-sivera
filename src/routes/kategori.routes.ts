import { Router } from 'express';
import {
  getAllKategori,
  getKategoriById,
  createKategori,
  updateKategori,
  deleteKategori
} from '../controller/kategori.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

router.get('/', getAllKategori);
router.get('/:id', getKategoriById);
router.post('/', createKategori);
router.put('/:id', updateKategori);
router.delete('/:id', deleteKategori);

export default router;