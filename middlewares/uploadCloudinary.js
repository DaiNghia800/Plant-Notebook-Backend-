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
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận các tệp tin hình ảnh!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn kích thước tối đa của ảnh là 5MB
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

module.exports = {
  singleImage: upload.single('image'), // Nhận file với key là 'image' trong form-data
  uploadToCloudinary
};
