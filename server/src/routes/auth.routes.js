import { Router } from 'express';
import { 
  register, 
  login, 
  refresh, 
  logout, 
  me, 
  updateProfile, 
  changePassword
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
// 2FA routes removed

export default router;
