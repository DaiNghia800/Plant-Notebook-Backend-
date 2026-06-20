const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');

// Khởi tạo S3 Client lấy cấu hình từ biến môi trường
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload file buffer lên Amazon S3
 * @param {Buffer} fileBuffer - Dữ liệu file ở dạng buffer
 * @param {string} mimetype - Loại file (VD: image/jpeg)
 * @param {string} originalname - Tên file gốc
 * @returns {Promise<string>} - Public URL của ảnh trên S3
 */
const uploadToS3 = async (fileBuffer, mimetype, originalname) => {
  if (!process.env.AWS_S3_BUCKET_NAME) {
    throw new Error('Thiếu cấu hình AWS_S3_BUCKET_NAME trong file .env');
  }

  // Tạo tên file unique tránh trùng lặp (lưu vào thư mục plant_notebook/)
  const extension = path.extname(originalname);
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const fileName = `plant_notebook/${uniqueSuffix}${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimetype,
  });

  // Gửi lệnh upload lên S3
  await s3Client.send(command);

  // Cấu trúc URL public của object trên S3
  // Lưu ý: Bucket của bạn phải được cấu hình Bucket Policy cho phép public-read
  const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  return publicUrl;
};

module.exports = {
  uploadToS3,
};
