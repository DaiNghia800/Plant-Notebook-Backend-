const db = require("../../models");

// Get all stores with filter options (by type)
module.exports.getStores = async (req, res) => {
  try {
    const { type } = req.query;
    const whereClause = {};
    if (type && type !== "Tất cả") {
      if (type === "Vườn ươm") {
        whereClause.type = "nursery";
      } else if (type === "Vật tư & Cây cảnh" || type === "Cửa hàng") {
        whereClause.type = "store";
      }
    }

    const stores = await db.Store.findAll({
      where: whereClause,
      include: [
        {
          model: db.StoreReview,
          as: 'reviews',
          attributes: ['rating']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({ success: true, data: stores });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get single store details with user reviews
module.exports.getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await db.Store.findOne({
      where: { id },
      include: [
        {
          model: db.StoreReview,
          as: 'reviews',
          include: [
            {
              model: db.User,
              as: 'user',
              attributes: ['fullName', 'email']
            }
          ]
        }
      ]
    });

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Sort reviews by creation date descending
    if (store.reviews) {
      store.reviews.sort((a, b) => b.createdAt - a.createdAt);
    }

    return res.status(200).json({ success: true, data: store });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create review for a store
module.exports.createReview = async (req, res) => {
  try {
    const { id: storeId } = req.params;
    const { rating, comment, userId } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Check store exists
    const store = await db.Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Find or fallback userId (if not logged in, fetch the first available user)
    let selectedUserId = userId;
    if (!selectedUserId) {
      const firstUser = await db.User.findOne();
      if (firstUser) {
        selectedUserId = firstUser.id;
      } else {
        return res.status(400).json({ success: false, message: 'No user exists to make review. Please register a user first.' });
      }
    }

    // Create review
    const newReview = await db.StoreReview.create({
      storeId,
      userId: selectedUserId,
      rating,
      comment
    });

    // Recalculate average rating for store
    const reviews = await db.StoreReview.findAll({
      where: { storeId }
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    // Update store average rating
    store.rating = parseFloat(avgRating.toFixed(1));
    await store.save();

    // Load full review with user info to return
    const reviewWithUser = await db.StoreReview.findByPk(newReview.id, {
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['fullName', 'email']
        }
      ]
    });

    return res.status(201).json({ success: true, data: reviewWithUser, storeRating: store.rating });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Seed sample stores and reviews
module.exports.seedStores = async (req, res) => {
  try {
    // Delete existing reviews and stores first
    await db.StoreReview.destroy({ where: {} });
    await db.Store.destroy({ where: {} });

    // Make sure we have a user
    let user = await db.User.findOne();
    if (!user) {
      user = await db.User.create({
        fullName: 'Nguyễn Anh Nguyên',
        email: 'anhnguyen@example.com',
        password: 'hashed_password_123', // Just a placeholder
      });
    }

    // Create stores
    const storesData = [
      {
        name: 'Vườn ươm Gia Nguyễn',
        address: '122 Lý Thái Tổ, Phường 2, Quận 3, TP. Hồ Chí Minh',
        phone: '0901234567',
        latitude: 10.765622,
        longitude: 106.662172,
        type: 'nursery',
        description: 'Chuyên cung cấp sỉ và lẻ các loại cây kiểng nghệ thuật, cây giống ăn trái chất lượng và các dịch vụ thiết kế thi công cảnh quan sân vườn.',
        imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae',
        rating: 4.8
      },
      {
        name: 'Vật Tư Nông Nghiệp Greenlife',
        address: '45 Thành Thái, Phường 14, Quận 10, TP. Hồ Chí Minh',
        phone: '0987654321',
        latitude: 10.760622,
        longitude: 106.658172,
        type: 'store',
        description: 'Nhà phân phối chính hãng các sản phẩm phân bón hữu cơ vi sinh, giá thể đất sạch trồng cây, chậu nhựa thông minh và các giải pháp phòng trừ sâu bệnh thảo mộc an toàn cho nông nghiệp đô thị.',
        imageUrl: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a',
        rating: 4.5
      },
      {
        name: 'Tiệm Cây Cảnh & Sen Đá Tí Hon',
        address: '89 Đường 3/2, Phường 11, Quận 10, TP. Hồ Chí Minh',
        phone: '0911223344',
        latitude: 10.763622,
        longitude: 106.664172,
        type: 'store',
        description: 'Thiên đường của các tín đồ sen đá, xương rồng mẫu mã lạ mắt, tiểu cảnh trang trí xinh xắn phù hợp làm quà tặng hoặc để bàn làm việc văn phòng.',
        imageUrl: 'https://images.unsplash.com/photo-1509423300868-3ef3f5456b41',
        rating: 4.2
      },
      {
        name: 'Vườn Ươm Cây Giống Miền Nam',
        address: '210 Lê Văn Lương, Phường Tân Hưng, Quận 7, TP. Hồ Chí Minh',
        phone: '0933445566',
        latitude: 10.738622,
        longitude: 106.695172,
        type: 'nursery',
        description: 'Vườn ươm quy mô hơn 2 hecta chuyên nhân giống các loại hoa cảnh công trình, cây xanh đô thị và các giống cây ăn quả nhiệt đới chuẩn giống, năng suất cao.',
        imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b',
        rating: 4.6
      }
    ];

    const createdStores = await db.Store.bulkCreate(storesData);

    // Add some reviews
    const comments = [
      ['Cây ở đây rất khỏe, cô chủ vườn hướng dẫn cách bón phân siêu tận tình luôn.', 'Dịch vụ thiết kế vườn rất chuyên nghiệp, cây giống chất lượng.'],
      ['Đất sạch ở đây mịn và thoát nước tốt, phân trùn quế rất xịn.', 'Nhiều dụng cụ làm vườn, giá cả hợp lý phù hợp cho người mới bắt đầu.'],
      ['Sen đá mini đẹp xuất sắc, chậu xi măng phối màu rất nghệ thuật.', 'Giá hơi cao so với chỗ khác nhưng cây được chăm rất kỹ, không bị héo.'],
      ['Giống cây ăn trái rất chuẩn, mua cây ổi trồng 6 tháng đã có quả ngọt lịm.', 'Vườn siêu rộng, nhân viên nhiệt tình hỗ trợ khuân vác lên xe.']
    ];

    const reviewsData = [];
    for (let i = 0; i < createdStores.length; i++) {
      const store = createdStores[i];
      const commentList = comments[i];
      reviewsData.push({
        storeId: store.id,
        userId: user.id,
        rating: 5,
        comment: commentList[0]
      });
      reviewsData.push({
        storeId: store.id,
        userId: user.id,
        rating: 4,
        comment: commentList[1]
      });
    }

    await db.StoreReview.bulkCreate(reviewsData);

    return res.status(200).json({ success: true, message: 'Seed stores and reviews successfully', count: createdStores.length });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
