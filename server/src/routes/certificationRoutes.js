import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { certificationSchema } from '../validators/certificationValidator.js';
import {
  createCertification,
  updateCertification,
  deleteCertification,
} from '../controllers/certificationController.js';

// Mounted at /api, so these paths are the full URLs after /api
const router = Router();

router.post('/products/:productId/certifications', validate(certificationSchema), createCertification);
router.put('/certifications/:id', validate(certificationSchema), updateCertification);
router.delete('/certifications/:id', deleteCertification);

export default router;