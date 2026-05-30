const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Cấu hình Cloudinary bằng các biến môi trường từ file .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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

// Middleware xử lý việc tải hình ảnh từ Buffer lên Cloudinary
const uploadToCloudinary = async (req, res, next) => {
  try {
    // Nếu không có tệp nào được tải lên (ví dụ: client gửi trực tiếp link ảnh qua JSON)
    if (!req.file) {
      return next();
    }

    // Kiểm tra cấu hình Cloudinary trong .env
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn("Cảnh báo: Thiếu cấu hình Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) trong file .env. Bỏ qua tải lên Cloudinary.");
      return next();
    }

    // Hàm chuyển đổi file buffer thành stream để upload lên Cloudinary
    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'plant_notebook', // Thư mục lưu trữ trên Cloudinary
            resource_type: 'auto'
          },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        stream.end(req.file.buffer);
      });
    };

    // Thực hiện upload và lấy kết quả trả về
    const result = await streamUpload(req);
    
    // Gán URL ảnh nhận được từ Cloudinary vào req.body.imageUrl và req.body.image_url
    // Cách này giúp tương thích với cả camelCase và snake_case của các controller/service khác nhau
    req.body.imageUrl = result.secure_url;
    req.body.image_url = result.secure_url;
    
    next();
  } catch (error) {
    console.error('Lỗi khi tải ảnh lên Cloudinary:', error);
    return res.status(500).json({
      message: 'Lỗi tải ảnh lên Cloudinary',
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
        message: `Lỗi tải tải ảnh: ${err.message}`
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
  uploadToCloudinary
};
