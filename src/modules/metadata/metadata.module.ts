import { Router } from 'express';
import { MetadataController } from './metadata.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';

const metadataRouter = Router();
const metadataController = new MetadataController();

metadataRouter.get('/grade', asyncHandler(metadataController.getGrades));

export default metadataRouter;
