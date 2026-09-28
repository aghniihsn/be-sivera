import { Router } from 'express';
import { login, register } from '../controller/auth.controller';
import { verifyToken, AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils/response';

const router = Router();

// Endpoint Public (Login)
router.post('/login', login);

// Endpoint Public (Register)
router.post('/register', register);

// Endpoint Protected (Cek Profile / Me)
router.get('/me', verifyToken, (req: AuthenticatedRequest, res) => {
  return sendSuccess(res, 'Data user aktif', req.user);
});

export default router;