import { Router } from 'express';
import { StoreController } from './store.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import {
  authMiddleware,
  optionalAuthMiddleware,
} from '../../common/middlewares/auth';
import { upload } from '../../common/lib/multer';

const storeRouter = Router();
const storeController = new StoreController();

storeRouter.get(
  '/detail/my',
  authMiddleware,
  asyncHandler(storeController.getMyStoreDetail)
);

storeRouter.get(
  '/detail/my/product',
  authMiddleware,
  asyncHandler(storeController.getMyStoreProducts)
);

storeRouter.get(
  '/:storeId',
  optionalAuthMiddleware,
  asyncHandler(storeController.getStoreById)
);

storeRouter.post(
  '/',
  authMiddleware,
  upload.single('image'),
  asyncHandler(storeController.createStore)
);

storeRouter.patch(
  '/:storeId',
  authMiddleware,
  upload.single('image'),
  asyncHandler(storeController.updateStore)
);

storeRouter.post(
  '/:storeId/favorite',
  authMiddleware,
  asyncHandler(storeController.addFavorite)
);

storeRouter.delete(
  '/:storeId/favorite',
  authMiddleware,
  asyncHandler(storeController.removeFavorite)
);

export default storeRouter;
