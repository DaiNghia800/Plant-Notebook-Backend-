const geminiScannerService = require('../client/gemini_scanner.service');

/**
 * Hàm phân tích bệnh cây từ URL ảnh sử dụng service Gemini của team.
 * Nó sẽ tải ảnh từ URL về dạng Buffer trước khi gọi service thật.
 * 
 * @param {string} imageUrl URL của ảnh trên S3
 * @returns {Promise<Object>} Kết quả JSON phân tích từ Gemini
 */
const analyzePlantDisease = async (imageUrl) => {
  try {
    console.log(`[GeminiAiService] Đang tải ảnh từ S3: ${imageUrl}`);
    
    // 1. Tải ảnh từ URL về dạng Buffer
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from S3. Status: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    
    console.log(`[GeminiAiService] Tải ảnh thành công. Kích thước: ${imageBuffer.length} bytes, Loại: ${mimeType}`);

    // 2. Tái sử dụng trọn vẹn logic AI mà team đã viết (giữ nguyên Prompt, model, v.v.)
    const aiResult = await geminiScannerService.scanPlant(imageBuffer, mimeType);
    
    return aiResult;
  } catch (error) {
    console.error(`[GeminiAiService] Lỗi khi phân tích ảnh:`, error);
    throw error;
  }
};

module.exports = {
  analyzePlantDisease
};
