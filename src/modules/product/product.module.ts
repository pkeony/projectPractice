import { Router } from 'express';
import { ProductController } from './product.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { authMiddleware } from '../../common/middlewares/auth';
import {
  optionalAuthMiddleware,
} from '../../common/middlewares/auth';
import { upload } from '../../common/lib/multer';

const productRouter = Router();
const productController = new ProductController();

productRouter.get('/', asyncHandler(productController.getProducts));

productRouter.get(
  '/:productId',
  asyncHandler(productController.getProductById)
);

productRouter.post(
  '/',
  authMiddleware,
  upload.single('image'),
  asyncHandler(productController.createProduct)
);

productRouter.patch(
  '/:productId',
  authMiddleware,
  upload.single('image'),
  asyncHandler(productController.updateProduct)
);

productRouter.delete(
  '/:productId',
  authMiddleware,
  asyncHandler(productController.deleteProduct)
);

productRouter.post(
  '/:productId/inquiries',
  authMiddleware,
  asyncHandler(productController.createInquiry)
);

productRouter.get(
  '/:productId/inquiries',
  optionalAuthMiddleware,
  asyncHandler(productController.getInquiries)
);

export default productRouter;
