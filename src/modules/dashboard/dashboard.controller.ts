import { Response } from 'express';
import { DashboardService } from './dashboard.service';
import { AuthRequest } from '../../common/types/auth';
import { AppError } from '../../common/types/errors';

const dashboardService = new DashboardService();

export class DashboardController {
  async getDashboard(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const userType = req.user!.type;

    if (userType !== 'SELLER') {
      throw new AppError(
        403,
        '판매자만 대시보드를 조회할 수 있습니다.',
        'Forbidden'
      );
    }

    const result = await dashboardService.getDashboard(userId);

    res.status(200).json(result);
  }
}
