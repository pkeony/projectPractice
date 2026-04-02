import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'codiit-bucket';
const FOLDER_PREFIX = 'codiit';

export const uploadToS3 = async (
  buffer: Buffer,
  fileName: string
): Promise<{ url: string; key: string }> => {
  try {
    //고유한 파일명 생성
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;
    const key = `${FOLDER_PREFIX}/${uniqueFileName}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg', // 또는 image/png 등
      ACL: 'public-read',
    };

    const result = await s3.upload(params).promise();

    return {
      url: result.Location,
      key: result.Key,
    };
  } catch (error) {
    console.error('S3 업로드 에러:', error);
    throw new Error('S3 업로드에 실패했습니다.');
  }
};

export const deleteFromS3 = async (key: string): Promise<void> => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('S3 삭제 에러:', error);
    throw new Error('S3 파일 삭제에 실패했습니다.');
  }
};
