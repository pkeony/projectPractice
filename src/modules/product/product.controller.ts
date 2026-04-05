import { Response } from 'express';
import { ProductService } from './product.service';
import { AuthRequest } from '../../common/types/auth';
import {
  validateCreateProduct,
  validateUpdateProduct,
} from './validators/product.validator';
import { uploadToS3 } from '../../common/lib/s3';
import { InquiryService } from '../inquiry/inquiry.service';
import { validateCreateInquiry } from '../inquiry/validators/inquiry.validator';

const productService = new ProductService();
const inquiryService = new InquiryService();

export class ProductController {
  async getProductById(req: AuthRequest, res: Response) {
    const productId = req.params.productId as string;

    const product = await productService.getProductById(productId);

    res.status(200).json(product);
  }

  async getProducts(req: AuthRequest, res: Response) {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const sort = req.query.sort as string | undefined;
    const search = req.query.search as string | undefined;
    const priceMin = req.query.priceMin
      ? Number(req.query.priceMin)
      : undefined;
    const priceMax = req.query.priceMax
      ? Number(req.query.priceMax)
      : undefined;
    const size = req.query.size as string | undefined;
    const favoriteStore = req.query.favoriteStore as string | undefined;
    const categoryName = req.query.categoryName as string | undefined;

    const result = await productService.getProducts({
      page,
      pageSize,
      sort,
      search,
      priceMin,
      priceMax,
      size,
      favoriteStore,
      categoryName,
    });

    res.status(200).json(result);
  }

  async createProduct(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;

    validateCreateProduct(req.body);

    let imageUrl: string | undefined = req.body.image;
    if (req.file) {
      const uploaded = await uploadToS3(req.file.buffer, req.file.originalname);
      imageUrl = uploaded.url;
    }

    const product = await productService.createProduct(userId, {
      ...req.body,
      image: imageUrl,
    });

    res.status(201).json(product);
  }

  async updateProduct(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const productId = req.params.productId as string;

    validateUpdateProduct(req.body);

    let imageUrl: string | undefined = req.body.image;
    if (req.file) {
      const uploaded = await uploadToS3(req.file.buffer, req.file.originalname);
      imageUrl = uploaded.url;
    }

    const product = await productService.updateProduct(userId, productId, {
      ...req.body,
      image: imageUrl,
    });

    res.status(200).json(product);
  }

  async deleteProduct(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const productId = req.params.productId as string;

    const result = await productService.deleteProduct(userId, productId);

    res.status(200).json(result);
  }

  async createInquiry(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const productId = req.params.productId as string;

    validateCreateInquiry(req.body);

    const inquiry = await inquiryService.createInquiry(userId, {
      productId,
      title: req.body.title,
      content: req.body.content,
      isSecret: req.body.isSecret,
    });

    res.status(201).json(inquiry);
  }

  async getInquiries(req: AuthRequest, res: Response) {
    const productId = req.params.productId as string;
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const sort = (req.query.sort as string) || 'recent';
    const status = req.query.status as string | undefined;
    const userId = req.user?.userId;

    const result = await productService.getProductInquiries(
      productId,
      page,
      pageSize,
      sort,
      status,
      userId
    );

    res.status(200).json(result);
  }
}
