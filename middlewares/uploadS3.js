const multer = require('multer');
const { uploadToS3 } = require('../services/shared/s3Service');

// Cấu hình Multer để lưu trữ tạm thời tệp trong bộ nhớ (Memory Storage) dưới dạng Buffer
const storage = multer.memoryStorage();

// Bộ lọc chỉ cho phép tải lên các tệp định dạng hình ảnh
const fileFilter = (req, file, cb) => {
  const isImageMime = file.mimetype && file.mimetype.startsWith('image/');
  const isImageExt = file.originalname && file.originalname.match(/\.(jpg|jpeg|png|gif|webp|heic|heif)$/i);

  if (isImageMime || isImageExt) {
    cb(null, true);
  } else {
    cb(new Error(`Chỉ chấp nhận các tệp tin hình ảnh! Nhận được: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 30 * 1024 * 1024 // Giới hạn kích thước tối đa của ảnh là 30MB
  },
  fileFilter: fileFilter
});

// Middleware xử lý việc tải hình ảnh từ Buffer lên Amazon S3
const uploadToS3Middleware = async (req, res, next) => {
  try {
    // Nếu không có tệp nào được tải lên (ví dụ: client gửi trực tiếp link ảnh qua JSON hoặc không update ảnh)
    if (!req.file) {
      return next();
    }

    // Thực hiện upload qua S3 Service
    const publicUrl = await uploadToS3(req.file.buffer, req.file.mimetype, req.file.originalname);
    
    // Gán URL ảnh nhận được từ S3 vào req.body.imageUrl và req.body.image_url
    // Cách này giúp tương thích với cả camelCase và snake_case của các controller/service khác nhau
    req.body.imageUrl = publicUrl;
    req.body.image_url = publicUrl;
    
    next();
  } catch (error) {
    console.error('Lỗi khi tải ảnh lên Amazon S3:', error);
    return res.status(500).json({
      message: 'Lỗi tải ảnh lên hệ thống S3',
      error: error.message
    });
  }
};

// Bọc middleware của multer để bắt lỗi (ví dụ: file quá lớn) và trả về thông báo lỗi JSON sạch sẽ
const singleImageWrapper = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.warn('[singleImageWrapper] Multer Error occurred:', err.code, err.message);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: 'Kích thước hình ảnh quá lớn, giới hạn tối đa cho phép là 30MB.'
        });
      }
      return res.status(400).json({
        message: `Lỗi xử lý file ảnh: ${err.message}`
      });
    } else if (err) {
      console.warn('[singleImageWrapper] Non-Multer Error occurred:', err.message);
      return res.status(400).json({
        message: err.message
      });
    }
    next();
  });
};

module.exports = {
  singleImage: singleImageWrapper, // Nhận file với key là 'image' trong form-data
  uploadToS3: uploadToS3Middleware // Sử dụng S3 thay cho Cloudinary
};
