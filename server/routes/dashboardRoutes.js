import express from 'express';
import { getAdminStats, getUserStats } from '../controllers/dashboardController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/user', verifyToken, getUserStats);
router.get('/admin', verifyToken, requireAdmin, getAdminStats);

export default router;