import multer from 'multer';
import path from 'path';

//메모리 저장소 설정(S3에 업로드 할 것)
const storage = multer.memoryStorage();

//파일 필터 설정
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  //허용된 이미지 확장자
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true); //null은 에러가 없단 뜻
  } else {
    cb(new Error('이미지 파일만 업로드 가능합니다. (jpg, png, gif, webp'));
  }
};

//파일 크기 제한
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
};

//Multer 인스턴스 생성
export const upload = multer({
  storage,
  fileFilter,
  limits,
});


