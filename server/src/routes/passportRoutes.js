import { Router } from 'express';
import {
  previewPassport,
  publishPassport,
  getPublicPassport,
} from '../controllers/passportController.js';

// Mounted at /api, so these paths are the full URLs after /api
const router = Router();

// Admin
router.get('/products/:id/passport-preview', previewPassport);
router.post('/products/:id/publish', publishPassport);

// Public (read-only)
router.get('/public/passports/:sku', getPublicPassport);

export default router;