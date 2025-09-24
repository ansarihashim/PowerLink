import { Router } from 'express';
import { 
  register, 
  login, 
  refresh, 
  logout, 
  me, 
  updateProfile, 
  changePassword, 
  enable2FA, 
  verify2FA, 
  disable2FA 
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, me);
router.put('/profile', requireAuth, updateProfile);
router.post('/change-password', requireAuth, changePassword);
router.post('/2fa/enable', requireAuth, enable2FA);
router.post('/2fa/verify', requireAuth, verify2FA);
router.post('/2fa/disable', requireAuth, disable2FA);

export default router;
