import { Response } from 'express';
import { StoreService } from './store.service';
import { AuthRequest } from '../../common/types/auth';
import {
  validateCreateStore,
  validateUpdateStore,
} from './validators/store.validator';

const storeService = new StoreService();

export class StoreController {
  async getMyStore(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;

    const store = await storeService.getMyStore(userId);

    res.status(200).json(store);
  }

  async getStoreById(req: AuthRequest, res: Response) {
    const storeId = req.params.storeId as string;
    const userId = req.user?.userId;

    const store = await storeService.getStoreById(storeId, userId);

    res.status(200).json(store);
  }

  async getStores(req: AuthRequest, res: Response) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const userId = req.user?.userId;

    const result = await storeService.getStores(page, limit, userId);

    res.status(200).json(result);
  }

  async createStore(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const userType = req.user!.type;

    validateCreateStore(req.body);

    const store = await storeService.createStore(userId, userType, {
      name: req.body.name,
      address: req.body.address,
      detailAddress: req.body.detailAddress,
      phoneNumber: req.body.phoneNumber,
      content: req.body.content,
      image: req.body.image,
    });

    res.status(201).json(store);
  }

  async updateStore(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;

    validateUpdateStore(req.body);

    const store = await storeService.updateStore(userId, {
      name: req.body.name,
      address: req.body.address,
      detailAddress: req.body.detailAddress,
      phoneNumber: req.body.phoneNumber,
      content: req.body.content,
      image: req.body.image,
    });

    res.status(200).json(store);
  }

  async toggleLike(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const storeId = req.params.storeId as string;

    const result = await storeService.toggleLike(userId, storeId);

    res.status(200).json(result);
  }
}
