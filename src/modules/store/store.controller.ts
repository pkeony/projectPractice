import { Response } from 'express';
import { StoreService } from './store.service';
import { AuthRequest } from '../../common/types/auth';
import {
  validateCreateStore,
  validateUpdateStore,
} from './validators/store.validator';
import { uploadToS3 } from '../../common/lib/s3';

const storeService = new StoreService();

export class StoreController {
  async getMyStoreDetail(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;

    const store = await storeService.getMyStoreDetail(userId);

    res.status(200).json(store);
  }

  async getMyStoreProducts(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;

    const result = await storeService.getMyStoreProducts(userId, page, pageSize);

    res.status(200).json(result);
  }

  async getStoreById(req: AuthRequest, res: Response) {
    const storeId = req.params.storeId as string;
    const userId = req.user?.userId;

    const store = await storeService.getStoreById(storeId, userId);

    res.status(200).json(store);
  }

  async createStore(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const userType = req.user!.type;

    validateCreateStore(req.body);

    let imageUrl: string | undefined = req.body.image;
    if (req.file) {
      const uploaded = await uploadToS3(req.file.buffer, req.file.originalname);
      imageUrl = uploaded.url;
    }

    const store = await storeService.createStore(userId, userType, {
      name: req.body.name,
      address: req.body.address,
      detailAddress: req.body.detailAddress,
      phoneNumber: req.body.phoneNumber,
      content: req.body.content,
      image: imageUrl,
    });

    res.status(201).json(store);
  }

  async updateStore(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const storeId = req.params.storeId as string;

    validateUpdateStore(req.body);

    let imageUrl: string | undefined = req.body.image;
    if (req.file) {
      const uploaded = await uploadToS3(req.file.buffer, req.file.originalname);
      imageUrl = uploaded.url;
    }

    const store = await storeService.updateStore(userId, storeId, {
      name: req.body.name,
      address: req.body.address,
      detailAddress: req.body.detailAddress,
      phoneNumber: req.body.phoneNumber,
      content: req.body.content,
      image: imageUrl,
    });

    res.status(200).json(store);
  }

  async addFavorite(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const storeId = req.params.storeId as string;

    const result = await storeService.addFavorite(userId, storeId);

    res.status(200).json(result);
  }

  async removeFavorite(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const storeId = req.params.storeId as string;

    const result = await storeService.removeFavorite(userId, storeId);

    res.status(200).json(result);
  }
}
