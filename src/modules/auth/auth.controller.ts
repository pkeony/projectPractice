import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { validateSignUp, validateLogin } from './validators/auth.validator';

const authService = new AuthService();

//auth컨트롤러
export class AuthController {
  //회원가입
  async signup(req: Request, res: Response) {
    //1. 유효성 검증
    validateSignUp(req.body);

    //2. 서비스 호출

    const result = await authService.signup({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
      type: req.body.type,
    });

    //3. refreshToken 쿠키 설정
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    //4. 응답
    res.status(201).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  }

  async login(req: Request, res: Response) {
    //1. 유효성 검증
    validateLogin(req.body);

    //2. 서비스 호출
    const result = await authService.login({
      email: req.body.email,
      password: req.body.password,
    });

    //3. refreshToken 쿠키 설정
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    //4. 응답
    res.status(200).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  }

  //로그아웃
  async logout(req: Request, res: Response) {
    const userId = (req as any).user?.userId;

    if (!userId) {
      const { AppError } = require('../../common/types/errors');
      throw new AppError(401, '로그인이 필요합니다.', 'Unauthorized');
    }

    await authService.logout(userId);
    res.clearCookie('refreshToken');
    res.status(200).json({ message: '로그아웃 성공' });
  }

  //토큰 갱신
  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      const { AppError } = require('../../common/types/errors');
      throw new AppError(401, 'Refresh token이 없습니다', 'Unauthorized');
    }

    const result = await authService.refreshAccessToken(refreshToken);
    res.status(200).json({ accessToken: result.accessToken });
  }
}
