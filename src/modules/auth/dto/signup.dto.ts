//회원가입 요청 데이터
export interface SignUpDto {
  email: string;
  password: string;
  name: string;
  type: 'BUYER' | 'SELLER';
}

//회원가입 응답 데이터
export interface SignUpResponseDto {
  id: string;
  email: string;
  name: string;
  type: string;
  image: string;
  points: number;
  gradeId: string;
  createdAt: Date;
  updatedAt: Date;
}
