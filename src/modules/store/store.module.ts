import { Router } from 'express';
import { StoreController } from './store.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import {
  authMiddleware,
  optionalAuthMiddleware,
} from '../../common/middlewares/auth';

const storeRouter = Router();
const storeController = new StoreController();

storeRouter.get(
  '/me',
  authMiddleware,
  asyncHandler(storeController.getMyStore)
);

storeRouter.get(
  '/',
  optionalAuthMiddleware,
  asyncHandler(storeController.getStores)
);

storeRouter.get(
  '/:storeId',
  optionalAuthMiddleware,
  asyncHandler(storeController.getStoreById)
);

storeRouter.post(
  '/',
  authMiddleware,
  asyncHandler(storeController.createStore)
);

storeRouter.patch(
  '/me',
  authMiddleware,
  asyncHandler(storeController.updateStore)
);

storeRouter.post(
  '/:storeId/like',
  authMiddleware,
  asyncHandler(storeController.toggleLike)
);

export default storeRouter;
