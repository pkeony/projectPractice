import { Router } from 'express';
import { S3Controller } from './s3.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { authMiddleware } from '../../common/middlewares/auth';
import { upload } from '../../common/lib/multer';

const s3Router = Router();
const s3Controller = new S3Controller();

s3Router.post(
  '/upload',
  authMiddleware,
  upload.single('image'),
  asyncHandler(s3Controller.uploadImage)
);

export default s3Router;
