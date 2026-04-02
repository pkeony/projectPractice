//로그인 요청 데이터
export interface LoginDto {
  email: string;
  password: string;
}

//로그인 응답 데이터
export interface LoginResponseDto {
  accessToken: string;
  refreshToken?: string;
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
