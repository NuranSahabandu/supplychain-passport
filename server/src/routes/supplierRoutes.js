import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { supplierSchema } from '../validators/supplierValidator.js';
import {
  listSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../controllers/supplierController.js';

const router = Router();

router.get('/', listSuppliers);
router.post('/', validate(supplierSchema), createSupplier);
router.get('/:id', getSupplier);
router.put('/:id', validate(supplierSchema), updateSupplier);
router.delete('/:id', deleteSupplier);

export default router;
