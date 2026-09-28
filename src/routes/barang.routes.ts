import { Router } from 'express';
import {
  getAllBarang,
  getBarangById,
  createBarang,
  updateBarang,
  deleteBarang
} from '../controller/barang.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

router.get('/', getAllBarang);
router.get('/:id', getBarangById);
router.post('/', createBarang);
router.put('/:id', updateBarang);
router.delete('/:id', deleteBarang);

export default router;