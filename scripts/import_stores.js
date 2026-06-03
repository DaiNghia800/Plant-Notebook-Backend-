const db = require('../models');

// Coordinates for Ho Chi Minh City center
const LAT = 10.762622;
const LNG = 106.660172;
const RADIUS_METERS = 15000; // 15km radius

const query = `[out:json][timeout:60];
area["name"="Thành phố Hồ Chí Minh"]->.searchArea;
(
  node["shop"="plant"](area.searchArea);
  way["shop"="plant"](area.searchArea);
  node["shop"="garden_centre"](area.searchArea);
  way["shop"="garden_centre"](area.searchArea);
  node["shop"="florist"](area.searchArea);
  way["shop"="florist"](area.searchArea);
);
out center;`;
const https = require('https');

function fetchOSM(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'PlantNotebookApp/1.0 (contact.dainghia@example.com)',
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON: ${e.message}`));
          }
        } else {
          reject(new Error(`Server returned status ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function importStores() {
  try {
    console.log(`Đang gọi OpenStreetMap Overpass API để quét các cửa hàng và vườn ươm trên toàn TP.HCM...`);
    
    const endpoints = [
      'https://overpass-api.de/api/interpreter',
      'https://lz4.overpass-api.de/api/interpreter',
      'https://overpass.nchc.org.tw/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter'
    ];
    
    let result = null;
    let errorDetails = [];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Đang thử kết nối tới Overpass API qua máy chủ: ${endpoint}...`);
        const url = `${endpoint}?data=${encodeURIComponent(query)}`;
        result = await fetchOSM(url);
        if (result && result.elements) {
          console.log(`Kết nối thành công với máy chủ: ${endpoint}`);
          break;
        }
      } catch (err) {
        console.warn(`Lỗi khi gọi máy chủ ${endpoint}: ${err.message}`);
        errorDetails.push(`${endpoint}: ${err.message}`);
      }
    }
    
    if (!result) {
      throw new Error(`Tất cả các máy chủ Overpass API đều thất bại.\nChi tiết lỗi:\n${errorDetails.join('\n')}`);
    }
    
    const elements = result.elements || [];
    
    console.log(`Tìm thấy ${elements.length} địa điểm trên OpenStreetMap. Bắt đầu xử lý nhập dữ liệu...`);

    let importedCount = 0;
    let skippedCount = 0;

    // Get a default user for reviews
    const user = await db.User.findOne();
    const userId = user ? user.id : null;

    for (const el of elements) {
      const tags = el.tags || {};
      
      // We only import locations that have a name
      if (!tags.name) {
        skippedCount++;
        continue;
      }

      const lat = el.lat || (el.center && el.center.lat);
      const lon = el.lon || (el.center && el.center.lon);

      if (!lat || !lon) {
        skippedCount++;
        continue;
      }

      // Build a readable address from OpenStreetMap tags
      let addressParts = [];
      if (tags['addr:housenumber']) addressParts.push(tags['addr:housenumber']);
      if (tags['addr:street']) addressParts.push(tags['addr:street']);
      if (tags['addr:suburb'] || tags['addr:ward']) addressParts.push(tags['addr:suburb'] || tags['addr:ward']);
      if (tags['addr:district']) addressParts.push(tags['addr:district']);
      if (tags['addr:city']) {
        addressParts.push(tags['addr:city']);
      } else {
        addressParts.push('TP. Hồ Chí Minh');
      }

      const address = addressParts.length > 1 ? addressParts.join(', ') : `${tags.name}, TP. Hồ Chí Minh`;
      
      // Determine type
      const type = tags.shop === 'garden_centre' ? 'nursery' : 'store';
      const phone = tags.phone || tags['contact:phone'] || tags['contact:mobile'] || null;
      const description = tags.description || `Cửa hàng chuyên cung cấp cây xanh, hoa cảnh chất lượng tại khu vực.`;

      // Check if store already exists by coordinates or name to avoid duplication
      const existing = await db.Store.findOne({
        where: {
          name: tags.name,
          latitude: lat,
          longitude: lon
        }
      });

      if (existing) {
        skippedCount++;
        continue;
      }

      // Set placeholder image based on type
      const imageUrl = type === 'nursery' 
        ? 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae'
        : 'https://images.unsplash.com/photo-1509423300868-3ef3f5456b41';

      // Insert store
      const store = await db.Store.create({
        name: tags.name,
        address: address,
        latitude: lat,
        longitude: lon,
        phone: phone,
        description: description,
        type: type,
        imageUrl: imageUrl,
        rating: 5.0 // Initial rating
      });

      // Add a default welcome review if user exists
      if (userId) {
        await db.StoreReview.create({
          storeId: store.id,
          userId: userId,
          rating: 5,
          comment: 'Địa điểm này được cập nhật tự động từ hệ thống bản đồ OpenStreetMap.'
        });
      }

      importedCount++;
    }

    console.log(`\n=== KẾT QUẢ NHẬP DỮ LIỆU ===`);
    console.log(`- Nhập thành công: ${importedCount} cửa hàng`);
    console.log(`- Bỏ qua (không có tên hoặc đã tồn tại): ${skippedCount} địa điểm`);
    process.exit(0);
  } catch (error) {
    console.error(`Lỗi trong quá trình import dữ liệu:`, error);
    process.exit(1);
  }
}

importStores();
