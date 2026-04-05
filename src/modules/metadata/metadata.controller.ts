import { Request, Response } from 'express';
import { MetadataService } from './metadata.service';

const metadataService = new MetadataService();

export class MetadataController {
  async getGrades(req: Request, res: Response): Promise<void> {
    const grades = await metadataService.getGrades();
    res.status(200).json(grades);
  }
}
