import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { authMiddleware } from '../../common/middlewares/auth';

const dashboardRouter = Router();
const dashboardController = new DashboardController();

dashboardRouter.get(
  '/',
  authMiddleware,
  asyncHandler(dashboardController.getDashboard)
);

export default dashboardRouter;
