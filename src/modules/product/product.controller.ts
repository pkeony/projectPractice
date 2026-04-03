import { Response } from 'express';
import { ProductService } from './product.service';
import { AuthRequest } from '../../common/types/auth';
import {
  validateCreateProduct,
  validateUpdateProduct,
} from './validators/product.validator';

const productService = new ProductService();

export class ProductController {
  async getProductById(req: AuthRequest, res: Response) {
    const productId = req.params.productId as string;

    const product = await productService.getProductById(productId);

    res.status(200).json(product);
  }

  async getProducts(req: AuthRequest, res: Response) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const categoryId = req.query.categoryId as string | undefined;
    const storeId = req.query.storeId as string | undefined;
    const keyword = req.query.keyword as string | undefined;
    const sortBy = req.query.sortBy as string | undefined;

    const result = await productService.getProducts({
      page,
      limit,
      categoryId,
      storeId,
      keyword,
      sortBy,
    });

    res.status(200).json(result);
  }

  async createProduct(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;

    validateCreateProduct(req.body);

    const product = await productService.createProduct(userId, req.body);

    res.status(201).json(product);
  }

  async updateProduct(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const productId = req.params.productId as string;

    validateUpdateProduct(req.body);

    const product = await productService.updateProduct(
      userId,
      productId,
      req.body
    );

    res.status(200).json(product);
  }

  async deleteProduct(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const productId = req.params.productId as string;

    const result = await productService.deleteProduct(userId, productId);

    res.status(200).json(result);
  }
}
