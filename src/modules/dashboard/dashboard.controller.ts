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

    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    if (!startDate || !endDate) {
      throw new AppError(
        400,
        'startDate, endDate는 필수입니다. (YYYY-MM-DD)',
        'Bad Request'
      );
    }

    const result = await dashboardService.getDashboard(
      userId,
      startDate,
      endDate
    );

    res.status(200).json(result);
  }
}
