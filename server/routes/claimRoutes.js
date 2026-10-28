import express from 'express';
import {
  createClaim,
  getUserClaims,
  getAdminClaims,
  reviewClaim,
} from '../controllers/claimController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// User endpoints
router.post('/', verifyToken, createClaim);
router.get('/my-claims', verifyToken, getUserClaims);

// Admin endpoints
router.get('/admin/all', verifyToken, requireAdmin, getAdminClaims);
router.put('/:id/review', verifyToken, requireAdmin, reviewClaim);

export default router;