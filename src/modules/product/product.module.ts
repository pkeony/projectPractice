import { Router } from 'express';
import { ProductController } from './product.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { authMiddleware } from '../../common/middlewares/auth';

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
  asyncHandler(productController.createProduct)
);

productRouter.patch(
  '/:productId',
  authMiddleware,
  asyncHandler(productController.updateProduct)
);

productRouter.delete(
  '/:productId',
  authMiddleware,
  asyncHandler(productController.deleteProduct)
);

export default productRouter;
