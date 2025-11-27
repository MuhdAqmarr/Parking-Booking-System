import { Router } from 'express';
import authRoutes from './auth.js';
import publicRoutes from './public.js';
import adminRoutes from './admin.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/admin', adminRoutes);

export default router;
