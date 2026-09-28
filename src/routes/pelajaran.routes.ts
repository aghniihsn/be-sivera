import { Router } from 'express';
import {
  getAllPelajaran,
  getPelajaranById,
  createPelajaran,
  updatePelajaran,
  deletePelajaran
} from '../controller/pelajaran.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

router.get('/', getAllPelajaran);
router.get('/:id', getPelajaranById);
router.post('/', createPelajaran);
router.put('/:id', updatePelajaran);
router.delete('/:id', deletePelajaran);

export default router;