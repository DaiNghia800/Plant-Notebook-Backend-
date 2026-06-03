-- 1. Thêm Người dùng mẫu
INSERT INTO "Users" ("id", "fullName", "email", "password", "createdAt", "updatedAt")
VALUES 
(gen_random_uuid(), 'Nguyen Anh Nguyen', 'anhnguyen@example.com', 'hashed_password_123', NOW(), NOW())
RETURNING id; -- Sau khi chạy, hãy copy cái ID này để dùng cho bảng GardenPlants bên dưới.

-- 2. Thêm Thư viện các loài cây (Plants)
INSERT INTO "Plants" ("id", "name", "description", "imageUrl", "createdAt", "updatedAt")
VALUES 
(gen_random_uuid(), 'Xương rồng Sen đá', 'Cây mọng nước, chịu hạn tốt, cần nhiều ánh sáng.', 'https://images.unsplash.com/photo-1509423300868-3ef3f5456b41', NOW(), NOW()),
(gen_random_uuid(), 'Cây Kim Tiền', 'Lá xanh mướt, thân mập mạp, mang ý nghĩa tài lộc.', 'https://images.unsplash.com/photo-1632205301078-590b01427ec1', NOW(), NOW()),
(gen_random_uuid(), 'Trầu Bà Thủy Sinh', 'Dễ trồng trong nước, lọc không khí rất tốt.', 'https://images.unsplash.com/photo-1597055181300-e3633a207519', NOW(), NOW()),
(gen_random_uuid(), 'Cây Lưỡi Hổ', 'Cung cấp oxy vào ban đêm, phù hợp để trong phòng ngủ.', 'https://images.unsplash.com/photo-1599598424968-373811737440', NOW(), NOW());

INSERT INTO "Categories" ("id", "name", "createdAt", "updatedAt")
VALUES 
(gen_random_uuid(), 'Trong nhà', NOW(), NOW()),
(gen_random_uuid(), 'Ban công', NOW(), NOW()),
(gen_random_uuid(), 'Ngoài trời', NOW(), NOW());

-- 3. Thêm cây vào "Khu vườn của tôi" (GardenPlants)
-- LƯU Ý: Thay 'ID_USER_O_TREN' và 'ID_PLANT_O_TREN' bằng mã UUID thực tế vừa tạo ra
INSERT INTO "GardenPlants" ("id", "userId", "plantId", "categoryId", "status", "startedAt", "imageUrl", "createdAt", "updatedAt")
VALUES 
(gen_random_uuid(), 
 (SELECT id FROM "Users" LIMIT 1), 
 (SELECT id FROM "Plants" WHERE "name" = 'Xương rồng Sen đá' LIMIT 1),
 (SELECT id FROM "Categories" WHERE "name" = 'Ban công' LIMIT 1),
 'Khỏe mạnh', '2026-01-15', 'https://example.com/garden/senda1.jpg', NOW(), NOW()),

(gen_random_uuid(), 
 (SELECT id FROM "Users" LIMIT 1), 
 (SELECT id FROM "Plants" WHERE "name" = 'Cây Kim Tiền' LIMIT 1),
 (SELECT id FROM "Categories" WHERE "name" = 'Trong nhà' LIMIT 1),
 'Đang khát', '2026-02-10', 'https://example.com/garden/kimtien1.jpg', NOW(), NOW()),

(gen_random_uuid(), 
 (SELECT id FROM "Users" LIMIT 1), 
 (SELECT id FROM "Plants" WHERE "name" = 'Cây Lưỡi Hổ' LIMIT 1),
 (SELECT id FROM "Categories" WHERE "name" = 'Trong nhà' LIMIT 1),
 'Đang bệnh', '2026-03-20', 'https://example.com/garden/luoiho1.jpg', NOW(), NOW());

-- 4. Thêm Nhắc nhở (Reminders) cho các cây trong vườn
INSERT INTO "Reminders" ("id", "gardenPlantId", "type", "frequencyDays", "lastActionAt", "isPushEnabled", "createdAt", "updatedAt")
VALUES 
(
    gen_random_uuid(), 
    (SELECT gp.id FROM "GardenPlants" gp 
     JOIN "Plants" p ON gp."plantId" = p.id 
     WHERE p.name = 'Xương rồng Sen đá' LIMIT 1), 
    'Tưới nước', 7, NOW(), true, NOW(), NOW()
),
(
    gen_random_uuid(), 
    (SELECT gp.id FROM "GardenPlants" gp 
     JOIN "Plants" p ON gp."plantId" = p.id 
     WHERE p.name = 'Cây Kim Tiền' LIMIT 1), 
    'Tưới nước', 3, NOW(), true, NOW(), NOW()
),
(
    gen_random_uuid(), 
    (SELECT gp.id FROM "GardenPlants" gp 
     JOIN "Plants" p ON gp."plantId" = p.id 
     WHERE p.name = 'Cây Kim Tiền' LIMIT 1), 
    'Bón phân', 30, NOW(), false, NOW(), NOW()
);