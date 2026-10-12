import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { productSchema } from '../validators/productValidator.js';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';

const router = Router();

router.get('/', listProducts);
router.post('/', validate(productSchema), createProduct);
router.get('/:id', getProduct);
router.put('/:id', validate(productSchema), updateProduct);
router.delete('/:id', deleteProduct);

export default router;