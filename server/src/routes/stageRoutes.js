import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { stageSchema, reorderSchema } from '../validators/stageValidator.js';
import {
  createStage,
  updateStage,
  deleteStage,
  reorderStages,
} from '../controllers/stageController.js';

// Mounted at /api, so these paths are the full URLs after /api
const router = Router();

router.post('/products/:productId/stages', validate(stageSchema), createStage);
router.put('/products/:productId/stages/order', validate(reorderSchema), reorderStages);
router.put('/stages/:id', validate(stageSchema), updateStage);
router.delete('/stages/:id', deleteStage);

export default router;