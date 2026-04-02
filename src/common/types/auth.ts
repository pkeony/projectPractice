import { Request } from 'express';

export interface SignUpRequest {
  //회원가입 요청 데이터
  email: string;
  password: string;
  name: string;
  type: 'BUYER' | 'SELLER';
}

export interface LoginRequest {
  //로그인 요청 데이터
  email: string;
  password: string;
}

export interface AuthReponse {
  // 인증 응답 데이터
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    type: string;
    image: string;
    points: number;
    gradeId: string;
  };
}

export interface JWTPayload {
  //JWT 토큰 안의 정보
  userId: string;
  email: string;
  type: string;
}

export interface AuthRequest extends Request {
  //인증된 HTTP요청
  user?: JWTPayload;
}
