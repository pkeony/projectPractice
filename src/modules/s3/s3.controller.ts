import { Response } from 'express';
import { AuthRequest } from '../../common/types/auth';
import { uploadToS3 } from '../../common/lib/s3';
import { AppError } from '../../common/types/errors';

export class S3Controller {
  async uploadImage(req: AuthRequest, res: Response): Promise<void> {
    if (!req.file) {
      throw new AppError(400, '이미지 파일이 필요합니다.', 'Bad Request');
    }

    const result = await uploadToS3(req.file.buffer, req.file.originalname);

    res.status(200).json({ url: result.url });
  }
}
