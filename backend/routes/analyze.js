import express from 'express';
import { analyze } from '../controllers/analyzeController.js';

const router = express.Router();

// POST /api/analyze
router.post('/analyze', analyze);

export default router;
