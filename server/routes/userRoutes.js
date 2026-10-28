import express from 'express';
import {
  getProfile,
  updateProfile,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Current user profile
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

// Admin user management
router.get('/admin/all', verifyToken, requireAdmin, getAllUsers);
router.post('/admin', verifyToken, requireAdmin, createUser);
router.put('/admin/:id', verifyToken, requireAdmin, updateUser);
router.delete('/admin/:id', verifyToken, requireAdmin, deleteUser);

export default router;