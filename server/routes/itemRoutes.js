import express from 'express';
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getPotentialMatches,
} from '../controllers/itemController.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Publicly readable listings & single item view (with optional user context)
router.get('/', getItems);
router.get('/:id', optionalAuth, getItemById);
router.get('/:id/matches', getPotentialMatches);

// Protected report creation, editing, deletion
router.post('/', verifyToken, createItem);
router.put('/:id', verifyToken, updateItem);
router.delete('/:id', verifyToken, deleteItem);

export default router;