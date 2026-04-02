import { AuthRepository } from './auth.repository';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { hashPassword, comparePassword } from '../../common/lib/password';
import { generateTokens } from '../../common/lib/jwt';
import { AppError, ErrorMessages } from '../../common/types/errors';
import { UserType } from '@prisma/client';

const authRepository = new AuthRepository();

export class AuthService {
  //회원가입
  async signup(signUpDto: SignUpDto) {
    //이메일 중복 확인
    const existingUser = await authRepository.findByEmail(signUpDto.email);
    if (existingUser) {
      throw new AppError(409, ErrorMessages.USER_ALREADY_EXISTS, 'Conflict');
    }

    //비밀번호 해싱
    const hashedPassword = await hashPassword(signUpDto.password);

    //사용자 생성
    const user = await authRepository.createUser({
      email: signUpDto.email,
      password: hashedPassword,
      name: signUpDto.name,
      type: signUpDto.type as UserType,
    });

    // JWT 토큰 생성
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
      type: user.type,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type,
        image: user.image,
        points: user.points,
        gradeId: user.gradeId,
      },
    };
  }

  //로그인
  async login(loginDto: LoginDto) {
    //사용자 조회
    const user = await authRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new AppError(
        401,
        ErrorMessages.INVALID_CREDENTIALS,
        'Unauthorized'
      );
    }

    //비밀번호 검증
    const isPasswordValid = await comparePassword(
      loginDto.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new AppError(
        401,
        ErrorMessages.INVALID_CREDENTIALS,
        'Unauthorized'
      );
    }

    //JWT 토큰 생성
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
      type: user.type,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type,
        image: user.image,
        points: user.points,
        gradeId: user.gradeId,
      },
    };
  }

  //로그아웃
  async logout(userId: string): Promise<void> {
    console.log('user logged out');
  }

  //access token 갱신
  async refreshAccessToken(refreshToken: string) {
    return {
      accessToken: 'new-access-token-here',
    };
  }
}
