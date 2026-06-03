const { Sequelize } = require("sequelize");
const bcrypt = require("bcrypt");
const { sequelize } = require("./config/database");

// Import models
const db = require("./models");
const { User, LibraryPlant, GardenPlant, Plant, Category, Reminder, CareHistory } = db;

const runSeeder = async () => {
  try {
    console.log("=== BẮT ĐẦU ĐỒNG BỘ VÀ NẠP DỮ LIỆU DB ===");
    
    // Đồng bộ database trước
    await db.sequelize.sync({ force: false });
    console.log("Đã đồng bộ cấu trúc bảng thành công.");

    // Dọn dẹp dữ liệu cũ (Xóa theo thứ tự ràng buộc khóa ngoại)
    await Reminder.destroy({ where: {} });
    await CareHistory.destroy({ where: {} });
    await GardenPlant.destroy({ where: {} });
    await Plant.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await User.destroy({ where: {} });
    await LibraryPlant.destroy({ where: {} });
    console.log("Đã xóa sạch dữ liệu cũ trong các bảng.");

    // 1. TẠO NGƯỜI DÙNG MẪU (3 Users)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("password123", saltRounds);

    const usersData = [
      {
        fullName: "Nguyễn Văn An",
        email: "an.nguyen@gmail.com",
        password: hashedPassword,
      },
      {
        fullName: "Trần Thị Bình",
        email: "binh.tran@gmail.com",
        password: hashedPassword,
      },
      {
        fullName: "Lê Minh Cường",
        email: "cuong.le@gmail.com",
        password: hashedPassword,
      },
    ];

    const users = await User.bulkCreate(usersData, { returning: true });
    console.log(`Đã tạo thành công ${users.length} tài khoản người dùng mẫu.`);

    // 2. TẠO THƯ VIỆN CÂY (30 Library Plants)
    const libraryPlantsData = [
      {
        name: "Trầu Bà Vàng",
        scientificName: "Epipremnum aureum",
        category: "Trong nhà",
        shortDescription: "Loại cây thân leo cực kỳ dễ chăm sóc, có khả năng thanh lọc không khí tuyệt vời.",
        description: "Trầu Bà Vàng (Golden Pothos) là một trong những loại cây cảnh phổ biến nhất cho người mới bắt đầu. Cây có những chiếc lá hình trái tim màu xanh tươi pha lẫn những vệt màu vàng nhạt hay trắng sữa rất bắt mắt. Thân cây leo dài có thể rủ xuống từ chậu treo hoặc leo lên các cột xơ dừa. Cây rất dễ tính, có thể chịu được điều kiện thiếu sáng và tưới nước không đều đặn.",
        lightLevel: "Trung bình",
        waterNeed: "Vừa phải",
        difficulty: "Dễ",
        careGuide: [
          "Đặt cây ở vị trí có ánh sáng gián tiếp, tránh ánh nắng mặt trời trực tiếp chiếu thẳng làm cháy lá.",
          "Chỉ tưới nước khi lớp đất mặt sâu khoảng 2-3 cm đã khô hoàn toàn.",
          "Cắt tỉa các cành quá dài để cây phân nhánh nhiều hơn và giữ dáng gọn gàng.",
          "Lau sạch bụi trên lá định kỳ để giúp cây quang hợp tốt hơn."
        ],
        funFacts: [
          "Cây Trầu Bà Vàng được NASA xếp vào nhóm những loại cây lọc không khí tốt nhất, loại bỏ hiệu quả formaldehyde, benzene và xylene.",
          "Ở một số nước, cây này còn được gọi là 'Devil's Ivy' (Vy của Quỷ) vì nó gần như không thể chết và vẫn xanh tươi ngay cả khi bị bỏ bê trong bóng tối."
        ],
        imageUrl: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=600",
        isTrending: true,
        isRare: false,
        temperature: "15°C - 30°C",
        badge: "Phổ biến",
        humidity: "Trung bình đến cao (50% - 70%)",
        toxicity: "Độc hại nhẹ đối với chó, mèo nếu nhai phải do chứa tinh thể canxi oxalat.",
        wateringIntervalDays: 4,
        wateringFrequencyLabel: "2 lần/tuần",
      },
      {
        name: "Lưỡi Hổ",
        scientificName: "Sansevieria trifasciata",
        category: "Trong nhà",
        shortDescription: "Cây cảnh phong thủy mạnh mẽ, chịu hạn cực tốt và sản sinh oxy vào ban đêm.",
        description: "Cây Lưỡi Hổ nổi bật với những chiếc lá cứng cáp, mọc thẳng đứng như những thanh gươm, viền lá màu vàng sáng rực rỡ trên nền xanh sọc vằn. Cây có nguồn gốc từ vùng khí hậu khô hạn nên tích lũy nước rất tốt, có thể sống bền bỉ trong những điều kiện khắc nghiệt nhất mà ít loại cây nào chịu nổi.",
        lightLevel: "Thấp",
        waterNeed: "Ít",
        difficulty: "Dễ",
        careGuide: [
          "Tránh tưới quá nhiều nước vì đây là nguyên nhân phổ biến nhất khiến cây bị úng gốc và chết.",
          "Cây có thể chịu bóng râm hoàn toàn nhưng sẽ phát triển đẹp hơn nếu có ánh sáng gián tiếp nhẹ.",
          "Sử dụng đất trồng có độ thoát nước cực nhanh, tránh giữ nước lâu ngày.",
          "Không cần bón phân quá thường xuyên, chỉ cần 1-2 lần vào mùa xuân hoặc mùa hè."
        ],
        funFacts: [
          "Khác với đa số loài cây hấp thụ oxy ban đêm, Lưỡi Hổ thực hiện cơ chế quang hợp CAM, giúp giải phóng khí oxy vào ban đêm, cực kỳ thích hợp đặt trong phòng ngủ.",
          "Trong phong thủy, Lưỡi Hổ tượng trưng cho sức mạnh cá nhân, xua đuổi tà ma và mang lại may mắn, tài lộc."
        ],
        imageUrl: "https://images.unsplash.com/photo-1593487568522-746db8894941?auto=format&fit=crop&q=80&w=600",
        isTrending: true,
        isRare: false,
        temperature: "18°C - 35°C",
        badge: "Phong thủy",
        humidity: "Thấp đến trung bình (30% - 50%)",
        toxicity: "Độc hại nhẹ đối với thú cưng do chứa saponin gây kích ứng tiêu hóa.",
        wateringIntervalDays: 10,
        wateringFrequencyLabel: "1 lần/10 ngày",
      },
      {
        name: "Kim Tiền",
        scientificName: "Zamioculcas zamiifolia",
        category: "Trong nhà",
        shortDescription: "Lá xanh bóng láng như những đồng xu trù phú, mang ý nghĩa phát tài phát lộc.",
        description: "Kim Tiền hay còn gọi là cây ZZ, có lá kép đối xứng xanh đen, bóng mượt tựa như được phủ một lớp sáp mỏng. Thân cây mọng nước phình to ở gốc giúp trữ nước hiệu quả. Đây là ứng cử viên hàng đầu cho không gian văn phòng và các góc phòng khách sang trọng nhờ vẻ đẹp hiện đại và sức sống dẻo dai.",
        lightLevel: "Thấp đến trung bình",
        waterNeed: "Ít",
        difficulty: "Dễ",
        careGuide: [
          "Chỉ tưới khi toàn bộ bầu đất đã khô ráo hoàn toàn. Thà tưới thiếu còn hơn tưới thừa.",
          "Cây sống tốt dưới ánh đèn huỳnh quang văn phòng, tránh ánh nắng gay gắt trực tiếp làm cháy lá.",
          "Thỉnh thoảng dùng khăn ẩm lau lá để giữ độ bóng đẹp mắt của cây.",
          "Thay chậu sau mỗi 2-3 năm khi rễ cây đã mọc chật kín chậu."
        ],
        funFacts: [
          "Hệ thống rễ củ dưới lòng đất của cây ZZ có hình dáng như những củ khoai tây nhỏ, đảm nhận vai trò lưu trữ nước vô cùng hiệu quả giúp cây vượt qua mùa khô hạn kéo dài.",
          "Cây này có nguồn gốc từ Đông Phi hoang dã khô cằn nên khả năng chịu hạn vô cùng phi thường."
        ],
        imageUrl: "https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&q=80&w=600",
        isTrending: true,
        isRare: false,
        temperature: "18°C - 32°C",
        badge: "Hút tài lộc",
        humidity: "Trung bình (40% - 60%)",
        toxicity: "Tất cả các bộ phận của cây đều có độc vì chứa canxi oxalat, tránh xa tầm tay trẻ em.",
        wateringIntervalDays: 7,
        wateringFrequencyLabel: "1 lần/tuần",
      },
      {
        name: "Kim Ngân",
        scientificName: "Pachira aquatica",
        category: "Trong nhà",
        shortDescription: "Thân cây tết bím độc đáo mang lại sự thịnh vượng và cân bằng năng lượng.",
        description: "Kim Ngân nổi tiếng với phần thân dưới được uốn tết bím như đuôi tóc rất nghệ thuật, phía trên tỏa ra những chùm lá xanh 5 nhánh như bàn tay hứng lộc. Cây biểu trưng cho 5 yếu tố ngũ hành tương sinh, giúp cân bằng sinh khí trong ngôi nhà.",
        lightLevel: "Trung bình",
        waterNeed: "Vừa phải",
        difficulty: "Trung bình",
        careGuide: [
          "Đặt cây nơi thoáng mát, có ánh sáng nhẹ hoặc bóng râm bán phần.",
          "Tưới nước đều quanh gốc khi thấy lớp đất trên cùng đã hơi khô.",
          "Tránh di chuyển vị trí cây quá đột ngột khiến cây bị sốc và rụng lá.",
          "Bón phân tan chậm mỗi tháng một lần vào mùa sinh trưởng hoạt động."
        ],
        funFacts: [
          "Tên tiếng Anh của cây là 'Money Tree' (Cây Tiền), gắn liền với truyền thuyết về một người đàn ông nghèo khổ cầu nguyện xin tài lộc và tìm thấy loài cây kỳ lạ này, sau đó đổi đời nhờ nhân giống bán cây.",
          "Trong tự nhiên tại vùng đầm lầy Trung Mỹ, cây có thể cao tới 18 mét và nở hoa rực rỡ."
        ],
        imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=600",
        isTrending: false,
        isRare: false,
        temperature: "16°C - 30°C",
        badge: "May mắn",
        humidity: "Cao (60% - 80%)",
        toxicity: "Hoàn toàn an toàn cho người và các loài thú nuôi trong nhà.",
        wateringIntervalDays: 6,
        wateringFrequencyLabel: "1-2 lần/tuần",
      },
      {
        name: "Lan Ý",
        scientificName: "Spathiphyllum",
        category: "Trong nhà",
        shortDescription: "Đóa hoa trắng thanh tao thuần khiết kết hợp khả năng hấp thụ sóng điện từ.",
        description: "Lan Ý quyến rũ với tán lá xanh mướt mọc dày từ gốc, vươn cao những bông hoa màu trắng muốt mang dáng dấp cánh buồm bình yên. Cây có khả năng lọc sạch các khí độc và hấp thụ bớt các bức xạ có hại phát ra từ máy tính, điện thoại, tivi.",
        lightLevel: "Thấp",
        waterNeed: "Nhiều",
        difficulty: "Dễ",
        careGuide: [
          "Lan Ý sẽ 'báo hiệu' khát nước bằng cách rủ lá xuống. Sau khi tưới, lá sẽ nhanh chóng dựng thẳng lại vô cùng kỳ diệu.",
          "Cần giữ đất ẩm nhẹ liên tục, nhưng tuyệt đối tránh để đáy chậu bị ngâm nước quá lâu gây thối rễ.",
          "Cây ưa nước mát, nên dùng nước lọc hoặc nước mưa, tránh nguồn nước máy chứa nhiều clo.",
          "Cắt tỉa các lá già sát gốc để kích thích cây mọc ra nhiều mầm non mới khỏe mạnh."
        ],
        funFacts: [
          "Thực chất phần 'cánh hoa' màu trắng muốt xinh đẹp của Lan Ý là lá bắc biến đổi màu sắc (gọi là mo hoa) nhằm bao bọc bảo vệ bông hoa thật sự là cụm hoa hình trụ nhỏ bên trong.",
          "Đây là loài cây có tác dụng loại bỏ cồn, acetone, trichloroethylene cực tốt từ môi trường văn phòng."
        ],
        imageUrl: "https://images.unsplash.com/photo-1598880940080-ff9a29891b85?auto=format&fit=crop&q=80&w=600",
        isTrending: false,
        isRare: false,
        temperature: "16°C - 28°C",
        badge: "Thanh lọc khí",
        humidity: "Cao (60% - 80%)",
        toxicity: "Chứa tinh thể canxi oxalat gây kích ứng mạnh vùng miệng nếu vô tình nhai phải.",
        wateringIntervalDays: 3,
        wateringFrequencyLabel: "2-3 lần/tuần",
      },
      {
        name: "Bàng Singapore",
        scientificName: "Ficus lyrata",
        category: "Trong nhà",
        shortDescription: "Dáng cây vươn thẳng kiêu hãnh với những chiếc lá bản to xanh thẫm sang trọng.",
        description: "Bàng Singapore là biểu tượng phong cách thiết kế nội thất hiện đại Scandinavian. Điểm nổi bật nhất của cây là những chiếc lá rất to, cứng cáp, gân lá nổi rõ, hình dáng tròn trịa như chiếc đàn violon quý phái. Cây mang vẻ đẹp sang trọng, uy nghiêm giúp tôn vinh không gian kiến trúc.",
        lightLevel: "Cao",
        waterNeed: "Vừa phải",
        difficulty: "Khó",
        careGuide: [
          "Cần rất nhiều ánh sáng tự nhiên gián tiếp (như gần cửa sổ lớn) để lá không bị rụng.",
          "Tưới nước kỹ khi lớp đất bề mặt sâu 3-4 cm đã khô hoàn toàn, đảm bảo nước thoát tốt.",
          "Sử dụng khăn mềm ẩm lau bụi bẩn bám trên lá thường xuyên để giữ mặt lá luôn láng bóng khỏe mạnh.",
          "Tránh luồng gió lùa trực tiếp từ máy lạnh thổi vào tán cây làm khô các mép lá."
        ],
        funFacts: [
          "Ở môi trường tự nhiên Tây Phi hoang dã, loài cây này có thể phát triển thành những cây cổ thụ khổng lồ cao tới 15 mét.",
          "Bàng Singapore cực kỳ nhạy cảm với sự thay đổi của ánh sáng và môi trường xung quanh, chúng thường phản ứng bằng cách rụng hàng loạt lá nếu bị dịch chuyển liên tục."
        ],
        imageUrl: "https://images.unsplash.com/photo-1597055181300-e3633a207518?auto=format&fit=crop&q=80&w=600",
        isTrending: true,
        isRare: false,
        temperature: "18°C - 27°C",
        badge: "Nội thất cao cấp",
        humidity: "Trung bình đến cao (50% - 75%)",
        toxicity: "Nhựa mủ trắng của cây gây kích ứng nhẹ ngoài da và đường ruột.",
        wateringIntervalDays: 5,
        wateringFrequencyLabel: "1-2 lần/tuần",
      },
      {
        name: "Nha Đam",
        scientificName: "Aloe vera",
        category: "Mọng nước",
        shortDescription: "Thảo dược đa năng tại gia, vừa làm dịu vết bỏng vừa làm sạch da hiệu quả.",
        description: "Nha Đam (Aloe Vera) là loài cây mọng nước không còn xa lạ gì. Cây mọc thành bụi với những lá dày, mọng nước, mép có răng cưa nhỏ không nhọn. Nhờ lượng gel dinh dưỡng dồi dào tích tụ bên trong lá, Nha Đam được ứng dụng rộng rãi trong ẩm thực, làm đẹp và sơ cứu gia đình.",
        lightLevel: "Cao",
        waterNeed: "Ít",
        difficulty: "Dễ",
        careGuide: [
          "Đặt cây ở vị trí ngập tràn ánh sáng mặt trời, tối thiểu 6 tiếng mỗi ngày.",
          "Sử dụng chậu đất nung có lỗ thoát nước lớn để hạn chế độ ẩm dư thừa tích tụ dưới đáy.",
          "Tưới nước rất hạn chế, chỉ tưới khi đất khô cằn hoàn toàn giống như sa mạc.",
          "Đất trồng cần pha nhiều cát và sỏi nhỏ để nước thoát đi cực nhanh."
        ],
        funFacts: [
          "Người Ai Cập cổ đại gọi Nha Đam là 'loài cây bất tử' và thường chôn nó cùng các pharaoh để làm quà tặng dẫn đường ở thế giới bên kia.",
          "Lớp vỏ lá Nha Đam có các lỗ khí nhỏ đóng kín vào ban ngày để giảm thiểu thất thoát nước và chỉ mở ra ban đêm để trao đổi khí."
        ],
        imageUrl: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=600",
        isTrending: false,
        isRare: false,
        temperature: "15°C - 35°C",
        badge: "Thảo dược",
        humidity: "Thấp (30% - 40%)",
        toxicity: "Vỏ lá có thể gây tiêu chảy cho thú cưng nếu nhai phải lượng lớn.",
        wateringIntervalDays: 12,
        wateringFrequencyLabel: "1 lần/2 tuần",
      },
      {
        name: "Cỏ Lan Chi",
        scientificName: "Chlorophytum comosum",
        category: "Trong nhà",
        shortDescription: "Tán lá mảnh mai duyên dáng mọc rủ kết hợp khả năng sinh sản cây con độc đáo.",
        description: "Cỏ Lan Chi (Spider Plant) nổi bật với những chiếc lá dài mảnh mai, cong nhẹ mềm mại màu xanh sọc trắng kem thanh lịch. Cây phát triển rất nhanh, thường vươn ra những nhánh dài treo lơ lửng mang các cụm cây con nhỏ xinh trông giống như những chú nhện con đáng yêu.",
        lightLevel: "Trung bình",
        waterNeed: "Vừa phải",
        difficulty: "Dễ",
        careGuide: [
          "Cây thích hợp trồng trong các chậu treo trên cao để tán lá rủ xuống tự nhiên đẹp mắt.",
          "Tưới nước vừa đủ ẩm đất, chú ý kiểm tra lỗ thoát nước của chậu.",
          "Đầu lá dễ bị khô cháy nếu tiếp xúc trực tiếp ánh nắng gay gắt hoặc nguồn nước có chứa clo nồng độ cao.",
          "Dễ dàng nhân giống bằng cách cắt các cụm cây con trên nhánh treo để cắm vào đất ẩm."
        ],
        funFacts: [
          "Cỏ Lan Chi cực kỳ an toàn cho trẻ nhỏ và các loài vật nuôi nghịch ngợm, là lựa chọn lý tưởng cho các gia đình có thú cưng.",
          "Một cây Lan Chi đơn lẻ có khả năng thanh lọc đến 95% khí độc hại chứa cacbon monoxit trong một không gian kín chỉ sau 24 giờ."
        ],
        imageUrl: "https://images.unsplash.com/photo-1599880940080-ff9a29891b85?auto=format&fit=crop&q=80&w=600",
        isTrending: false,
        isRare: false,
        temperature: "13°C - 27°C",
        badge: "An toàn cho pet",
        humidity: "Trung bình (50% - 60%)",
        toxicity: "Hoàn toàn không độc hại, rất an toàn đối với các loài động vật.",
        wateringIntervalDays: 4,
        wateringFrequencyLabel: "2 lần/tuần",
      },
      {
        name: "Sen Đá Phật Bà",
        scientificName: "Sempervivum tectorum",
        category: "Mọng nước",
        shortDescription: "Các cánh lá mọng nước xếp đều đặn như tòa sen thanh tịnh, mang may mắn ngập tràn.",
        description: "Sen Đá Phật Bà thu hút bởi các phiến lá thuôn nhọn ở đầu mọc xếp lớp đan xen xoay tròn cân đối quanh trục như đóa hoa sen thanh khiết. Mép lá có những sợi lông nhỏ mịn màng màu trắng tinh khôi và đầu lá thường ửng đỏ hồng vô cùng đáng yêu khi tiếp xúc đủ nắng mặt trời.",
        lightLevel: "Cao",
        waterNeed: "Ít",
        difficulty: "Trung bình",
        careGuide: [
          "Đảm bảo đặt cây ở nơi hứng được nhiều ánh sáng tự nhiên trực tiếp nhất có thể để giữ màu đỏ ở ngọn lá.",
          "Chỉ tưới nước trực tiếp sát gốc đất, tuyệt đối tránh đọng nước trên kẽ lá gây úng thối lá.",
          "Sử dụng giá thể trồng thoát nước nhanh chuyên dụng cho sen đá xương rồng chứa đá perlite và trấu hun.",
          "Không tưới nước vào những ngày thời tiết mưa âm u ẩm ướt kéo dài."
        ],
        funFacts: [
          "Tên khoa học 'Sempervivum' trong tiếng Latinh có nghĩa là 'sống mãi mãi', tượng trưng cho tình yêu và tình bạn bền chặt theo năm tháng.",
          "Cây có nguồn gốc từ các khe đá trên những dãy núi cao ở châu Âu, chịu lạnh tốt hơn các loại sen đá vùng nhiệt đới."
        ],
        imageUrl: "https://images.unsplash.com/photo-1520302630591-fd1c66ed11db?auto=format&fit=crop&q=80&w=600",
        isTrending: true,
        isRare: false,
        temperature: "10°C - 28°C",
        badge: "Được yêu thích",
        humidity: "Rất thấp (20% - 40%)",
        toxicity: "Không độc hại cho con người cũng như vật nuôi.",
        wateringIntervalDays: 9,
        wateringFrequencyLabel: "1 lần/tuần",
      },
      {
        name: "Xương Rồng Tai Thỏ",
        scientificName: "Opuntia microdasys",
        category: "Xương rồng",
        shortDescription: "Vẻ ngoài dễ thương ngộ nghĩnh tựa như những chiếc tai thỏ, cực kỳ dễ chăm.",
        description: "Xương Rồng Tai Thỏ có thân dẹt, chia thành các phân khúc tròn trịa mọc đối xứng tựa như đôi tai thỏ đang vểnh lên nghe ngóng. Thay vì gai nhọn hoắt gai góc, bề mặt cây được phủ đầy các cụm gai nhỏ màu vàng nhạt mềm mịn như nhung rất đặc trưng.",
        lightLevel: "Cao",
        waterNeed: "Rất ít",
        difficulty: "Dễ",
        careGuide: [
          "Đòi hỏi ánh nắng mặt trời trực tiếp gay gắt tối thiểu 6-8 tiếng mỗi ngày.",
          "Vào mùa đông lạnh giá, cây đi vào trạng thái ngủ đông, gần như không cần phải tưới nước.",
          "Giá thể trồng phải thật thoáng xốp, chủ yếu là cát thô và sỏi nhỏ để đảm bảo không đọng nước.",
          "Cẩn thận không chạm trực tiếp tay vào các cụm gai mịn vì chúng rất dễ găm sâu vào da gây ngứa ngáy khó chịu."
        ],
        funFacts: [
          "Mặc dù trông các cụm gai vàng rất êm ái như nhung, nhưng thực chất chúng là các 'glochid' - loại gai có ngạnh siêu nhỏ cực kỳ khó gỡ nếu bám vào da người.",
          "Trong môi trường hoang mạc khô cằn khắc nghiệt, cây có thể chịu đựng nhiệt độ nóng lên tới trên 45°C."
        ],
        imageUrl: "https://images.unsplash.com/photo-1508847154043-be12a62861c1?auto=format&fit=crop&q=80&w=600",
        isTrending: false,
        isRare: false,
        temperature: "15°C - 40°C",
        badge: "Dễ trồng",
        humidity: "Rất thấp (15% - 30%)",
        toxicity: "Gai mịn gây tổn thương cơ học nhẹ nếu nuốt phải, cần để xa tầm tay trẻ nhỏ.",
        wateringIntervalDays: 14,
        wateringFrequencyLabel: "1 lần/2 tuần",
      },
      {
        name: "Ngũ Gia Bì",
        scientificName: "Schefflera arboricola",
        category: "Trong nhà",
        shortDescription: "Tán lá xanh tươi hình chân chim sum suê kết hợp khả năng xua đuổi muỗi tự nhiên.",
        description: "Ngũ Gia Bì là loài cây thân gỗ nhỏ cứng cáp, các lá mọc vòng xoay tròn tỏa ra xung quanh thành 7-8 thùy tựa như những chiếc chân chim nhỏ. Cây không chỉ mang vẻ đẹp xanh mướt đầy sức sống mà còn tỏa ra mùi hương nhẹ nhàng đặc trưng có tác dụng xua đuổi côn trùng và muỗi vô cùng hiệu quả.",
        lightLevel: "Trung bình",
        waterNeed: "Vừa phải",
        difficulty: "Dễ",
        careGuide: [
          "Thích nghi cực tốt với ánh sáng bán phần, có thể phát triển khỏe mạnh dưới ánh đèn phòng.",
          "Tưới nước khi lớp đất bề mặt đã se khô lại, chú ý xịt phun sương lên tán lá vào những ngày nóng.",
          "Cắt tỉa ngọn thường xuyên để kích thích cây đẻ nhiều nhánh phụ, tạo tán tròn sum suê đẹp mắt.",
          "Lau sạch bụi bẩn bám trên bề mặt lá định kỳ."
        ],
        funFacts: [
          "Trong y học cổ truyền Việt Nam, vỏ thân và rễ của cây Ngũ Gia Bì là một vị thuốc quý có tác dụng hoạt huyết, hỗ trợ chữa trị các bệnh đau nhức xương khớp đau lưng mỏi gối.",
          "Nhờ hương thơm tự nhiên nhẹ nhàng từ lá cây chứa các hợp chất tinh dầu giúp muỗi tránh xa khu vực trồng cây."
        ],
        imageUrl: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=600",
        isTrending: false,
        isRare: false,
        temperature: "15°C - 30°C",
        badge: "Đuổi muỗi",
        humidity: "Trung bình đến cao (50% - 70%)",
        toxicity: "Độc hại nhẹ đối với vật nuôi do chứa canxi oxalat gây rát lưỡi và khoang miệng.",
        wateringIntervalDays: 5,
        wateringFrequencyLabel: "1-2 lần/tuần",
      },
      {
        name: "Cây Hạnh Phúc",
        scientificName: "Radermachera sinica",
        category: "Trong nhà",
        shortDescription: "Các chùm lá xanh mướt bóng bẩy biểu trưng cho niềm vui, sự gắn kết gia đình.",
        description: "Cây Hạnh Phúc có dáng vẻ của một cây thân gỗ nhỏ sang trọng. Các lá kép mọc đối xứng nhau sở hữu màu xanh lục đậm vô cùng bóng bẩy, mép lá lượn sóng nhẹ nhàng tinh tế. Cây mang năng lượng tích cực ấm áp đúng như tên gọi, tượng trưng cho hạnh phúc ngập tràn và sự bình yên trong gia đình.",
        lightLevel: "Trung bình",
        waterNeed: "Vừa phải",
        difficulty: "Trung bình",
        careGuide: [
          "Đặt cây tại vị trí thông thoáng, đón ánh sáng khuếch tán từ cửa sổ hướng Nam hoặc hướng Đông.",
          "Giữ đất trồng luôn ở trạng thái ẩm nhẹ, tránh để đất bị khô hạn kéo dài hoặc quá sũng nước.",
          "Cây rất ghét sự thay đổi nhiệt độ đột ngột, hạn chế đặt sát cục nóng tản nhiệt hoặc dưới máy lạnh thổi trực tiếp.",
          "Bón phân hữu cơ vi sinh định kỳ mỗi 2 tháng để duy trì màu sắc xanh tươi bóng loáng của bộ lá."
        ],
        funFacts: [
          "Trong môi trường hoang dã tại vùng núi cao cận nhiệt đới châu Á, cây có thể cao tới 10 mét và nở ra những bông hoa màu vàng kem hình chuông thơm ngát quyến rũ.",
          "Lá của cây Hạnh Phúc mọc rất dày đặc, tạo thành một chiếc 'máy lọc bụi' tự nhiên hiệu quả cho phòng khách."
        ],
        imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=600",
        isTrending: true,
        isRare: false,
        temperature: "18°C - 28°C",
        badge: "Gia đình",
        humidity: "Trung bình (50% - 60%)",
        toxicity: "Hoàn toàn thân thiện và an toàn đối với các loài thú cưng.",
        wateringIntervalDays: 5,
        wateringFrequencyLabel: "2 lần/tuần",
      },
      {
        name: "Ngọc Ngân",
        scientificName: "Aglaonema",
        category: "Trong nhà",
        shortDescription: "Lá đốm trắng ngọc ngà trên nền xanh thẫm mang ý nghĩa tình yêu chung thủy sâu sắc.",
        description: "Cây Ngọc Ngân hút hồn bởi sự tương phản độc đáo giữa những đốm tuyết trắng tinh khôi lấm chấm dày đặc trên nền lá xanh lục mát mắt. Thân cây mọc thành bụi sum suê rậm rạp mang nét đẹp nhẹ nhàng tao nhã, tượng trưng cho tình yêu chân thành và sự thịnh vượng bền vững.",
        lightLevel: "Thấp đến trung bình",
        waterNeed: "Vừa phải",
        difficulty: "Dễ",
        careGuide: [
          "Sống tốt trong môi trường thiếu sáng tự nhiên, thậm chí chỉ với ánh sáng đèn huỳnh quang văn phòng.",
          "Tưới nước đều quanh gốc khi thấy lớp đất trên cùng của chậu se khô.",
          "Vào những ngày hè oi ả nên xịt nước phun sương mịn lên lá để tăng cường độ ẩm mát cho cây.",
          "Lau sạch bụi bẩn trên mặt lá thường xuyên bằng vải cotton mềm thấm nước ấm."
        ],
        funFacts: [
          "Trong tiếng Anh, Ngọc Ngân được gọi là 'Valentine Plant' - loài cây đại diện cho các cặp đôi yêu nhau, thường được làm quà tặng ý nghĩa vào ngày lễ tình nhân.",
          "Cây phát triển hệ thống rễ chùm rất khỏe, có khả năng trồng thủy sinh vô cùng đẹp mắt trong các bình thủy tinh trong suốt."
        ],
        imageUrl: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=600",
        isTrending: false,
        isRare: false,
        temperature: "16°C - 30°C",
        badge: "Tình yêu",
        humidity: "Cao (60% - 80%)",
        toxicity: "Chứa các tinh thể canxi oxalat có thể gây kích ứng niêm mạc lưỡi và miệng nếu nuốt phải.",
        wateringIntervalDays: 4,
        wateringFrequencyLabel: "2 lần/tuần",
      },
      {
        name: "Vạn Lộc",
        scientificName: "Aglaonema rotundum",
        category: "Trong nhà",
        shortDescription: "Lá đỏ rực rỡ mang sắc thái cát tường, đem lại vạn điều may mắn lộc tài.",
        description: "Vạn Lộc thu hút mọi ánh nhìn bởi màu sắc đỏ hồng rực rỡ bao phủ phần lớn bề mặt lá rộng, viền lá điểm xuyết những đường chỉ màu xanh lục tinh tế. Cây mang vẻ đẹp kiêu sa lộng lẫy và ấm áp, biểu trưng cho sự thăng tiến nhanh chóng, tài lộc dồi dào và cát tường như ý.",
        lightLevel: "Trung bình",
        waterNeed: "Vừa phải",
        difficulty: "Dễ",
        careGuide: [
          "Đặt cây nơi có ánh sáng tán xạ nhẹ để giữ sắc tố đỏ rực rỡ của lá không bị phai nhạt.",
          "Tưới nước khi lớp đất bề mặt khô khoảng 2 cm, tránh tưới quá sũng dễ gây úng gốc.",
          "Nên mang cây ra đón ánh nắng ban mai nhẹ (7h - 9h sáng) mỗi tuần một lần giúp lá lên màu sắc nét.",
          "Cắt bỏ sớm các lá già héo úa ở phần sát gốc để tránh lây lan nấm bệnh hại cây."
        ],
        funFacts: [
          "Sắc đỏ nổi bật của cây Vạn Lộc do lượng sắc tố anthocyanin dồi dào tự nhiên tạo nên nhằm hấp thụ ánh sáng hiệu quả dưới tán rừng rậm rạp.",
          "Trong văn hóa Á Đông, màu đỏ của cây tượng trưng cho sự may mắn hỷ sự, thường dùng làm quà chúc mừng tân gia hay khai trương hồng phát."
        ],
        imageUrl: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=600",
        isTrending: true,
        isRare: false,
        temperature: "16°C - 29°C",
        badge: "Đỏ may mắn",
        humidity: "Trung bình đến cao (55% - 75%)",
        toxicity: "Độc hại nhẹ cho chó và mèo do chứa chất canxi oxalat.",
        wateringIntervalDays: 5,
        wateringFrequencyLabel: "1-2 lần/tuần",
      },
      {
        name: "Phú Quý",
        scientificName: "Aglaonema Siam Aurora",
        category: "Trong nhà",
        shortDescription: "Viền lá đỏ hồng kiêu sa lộng lẫy, biểu tượng phong thủy của phú quý cát tường.",
        description: "Cây Phú Quý nổi tiếng với những chiếc lá thuôn dài mọc dày từ gốc, viền lá có dải màu hồng đỏ thắm bao quanh lòng lá xanh đậm láng mượt. Cây tạo nên điểm nhấn sắc màu đầy năng lượng ấm áp cho không gian nội thất, giúp thu hút tài lộc hanh thông cho gia chủ đúng như danh xưng phú quý cát tường.",
        lightLevel: "Trung bình",
        waterNeed: "Vừa phải",
        difficulty: "Dễ",
        careGuide: [
          "Thích nghi tốt với nhiều điều kiện ánh sáng, đẹp nhất khi ở gần cửa sổ đón nắng gián tiếp.",
          "Chỉ tưới nước khi đất đã se khô bề mặt. Tránh để chậu không có đường thoát nước tốt.",
          "Không đặt cây trực tiếp dưới luồng gió máy lạnh phả ra từ phía trên.",
          "Có thể trồng thủy sinh rất dễ dàng, chỉ cần định kỳ thay nước sạch mỗi tuần."
        ],
        funFacts: [
          "Cây Phú Quý nguyên bản được lai tạo thành công bởi một nhà thực vật học người Thái Lan vào năm 1982, từ một giống cây Aglaonema hoang dã có màu xanh thuần túy.",
          "Nằm trong danh sách các loài cây có khả năng loại bỏ các khí hữu cơ dễ bay hơi cực kỳ hiệu quả của NASA."
        ],
        imageUrl: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=600",
        isTrending: false,
        isRare: false,
        temperature: "16°C - 30°C",
        badge: "Tài lộc",
        humidity: "Trung bình đến cao (50% - 70%)",
        toxicity: "Độc nhẹ cho vật nuôi nếu nuốt phải, cần chú ý khu vực đặt chậu cây.",
        wateringIntervalDays: 5,
        wateringFrequencyLabel: "1-2 lần/tuần",
      },
      {
        name: "Dương Xỉ Ổ Phụng",
        scientificName: "Asplenium nidus",
        category: "Dương xỉ",
        shortDescription: "Tán lá bản to hình dải quạt dài uốn lượn như chiếc tổ chim phượng hoàng đầy kiêu hãnh.",
        description: "Dương Xỉ Ổ Phụng hay còn gọi là dương xỉ tổ chim, sở hữu những phiến lá to, rộng, dài, màu xanh non tươi tắn uốn lượn nhấp nhô nhẹ ở mép. Các lá mọc xòe tròn đều xung quanh từ trung tâm lõm sâu tạo thành một chiếc giỏ tròn trịa tựa như tổ của loài chim phượng hoàng quý phái.",
        lightLevel: "Trung bình",
        waterNeed: "Nhiều",
        difficulty: "Trung bình",
        careGuide: [
          "Cây cực kỳ ưa ẩm ướt và bóng râm nhẹ mát mẻ của các tầng tán rừng ẩm nhiệt đới.",
          "Tưới nước giữ ẩm cho đất thường xuyên, đồng thời tưới phun sương mịn lên lá hằng ngày.",
          "Tránh tưới nước đọng thẳng trực tiếp vào lõi trung tâm của 'tổ' cây để phòng ngừa úng thối mầm non.",
          "Đất trồng cần pha trộn xơ dừa, dớn mềm để giữ ẩm thật tốt nhưng thoát nước nhanh."
        ],
        funFacts: [
          "Trong tự nhiên, loài dương xỉ này thường sống bám phụ sinh (epiphytic) trên thân các cây cổ thụ lớn hay các vách đá rêu phong chứ không mọc trực tiếp dưới đất rừng.",
          "Mặt dưới của các lá già thường có các đường vân màu nâu sọc chéo đều đặn chính là các ổ túi bào tử giúp cây sinh sản tự nhiên."
        ],
        imageUrl: "https://images.unsplash.com/photo-1599880940080-ff9a29891b85?auto=format&fit=crop&q=80&w=600",
        isTrending: false,
        isRare: false,
        temperature: "15°C - 28°C",
        badge: "Ưa ẩm",
        humidity: "Rất cao (70% - 90%)",
        toxicity: "Hoàn toàn không có độc, vô cùng thân thiện với trẻ nhỏ và thú nuôi.",
        wateringIntervalDays: 2,
        wateringFrequencyLabel: "3-4 lần/tuần",
      },
      {
        name: "Trúc Bách Hợp",
        scientificName: "Dracaena reflexa",
        category: "Trong nhà",
        shortDescription: "Thân gỗ nhỏ cứng cáp với tán lá sọc vàng tươi tắn đem lại vạn sự tốt lành.",
        description: "Trúc Bách Hợp có thân gỗ khẳng khiu phân nhiều nhánh nghệ thuật, các cụm lá ngắn thuôn nhọn xếp so le ôm khít lấy thân mọc chếch lên như những đóa hoa xanh viền vàng rực rỡ. Cây mang vẻ đẹp sang trọng khỏe khoắn, biểu trưng cho sự vạn sự như ý và gắn kết vững bền.",
        lightLevel: "Trung bình",
        waterNeed: "Vừa phải",
        difficulty: "Dễ",
        careGuide: [
          "Thích hợp đặt ở sảnh lớn, phòng khách đón ánh sáng gián tiếp tốt mát mẻ.",
          "Chỉ tưới nước khi sờ thấy mặt đất trong chậu đã khô ráo hoàn toàn.",
          "Cắt tỉa các lá già vàng ở sát thân để giữ dáng cây thon gọn tao nhã sạch sẽ.",
          "Bón phân NPK định kỳ 2 tháng một lần giúp cây duy trì sọc lá vàng tươi rực rỡ."
        ],
        funFacts: [
          "Cây có nguồn gốc từ đảo Madagascar xinh đẹp nằm ở Ấn Độ Dương xa xôi hoang dã.",
          "Tên gọi 'Bách Hợp' mang ý nghĩa trăm điều hòa hợp tốt lành, rất thích hợp tặng mừng đám cưới hoặc kỷ niệm ngày cưới gia đình."
        ],
        imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=600",
        isTrending: false,
        isRare: false,
        temperature: "16°C - 30°C",
        badge: "Hòa hợp",
        humidity: "Trung bình (50% - 65%)",
        toxicity: "Độc hại nhẹ đối với chó, mèo nếu vô tình nhai lá cây.",
        wateringIntervalDays: 6,
        wateringFrequencyLabel: "1-2 lần/tuần",
      },
      {
        name: "Phát Tài Búp Sen",
        scientificName: "Dracaena deremensis",
        category: "Thủy sinh",
        shortDescription: "Lá mọc chụm so le như búp sen đang hé nở, biểu tượng của sự may mắn thịnh vượng.",
        description: "Phát Tài Búp Sen thu hút bởi các bẹ lá màu xanh đậm cứng cáp mọc chụm so le xếp vòng khít khao xoáy nhẹ từ gốc lên ngọn giống như đóa sen hồng chớm nở thanh tao. Cây có sức sống dẻo dai phi thường, đặc biệt rất dễ trồng thủy sinh mang vẻ đẹp nhẹ nhàng tĩnh tại.",
        lightLevel: "Trung bình",
        waterNeed: "Nhiều",
        difficulty: "Dễ",
        careGuide: [
          "Rất thích hợp trồng thủy sinh trong bình thủy tinh sạch sẽ ngắm nhìn bộ rễ trắng muốt.",
          "Thay nước bình định kỳ mỗi tuần một lần, chú ý dùng nước lọc tinh khiết không clo.",
          "Tránh đặt cây ở góc phòng quá tối om tăm tối lâu ngày làm lá mất màu xanh đậm rực rỡ.",
          "Khi trồng đất cần tưới ẩm đều đặn và đảm bảo đất tơi xốp giữ ẩm."
        ],
        funFacts: [
          "Với cấu trúc lá xếp tầng cuộn tròn thanh tịnh giống búp sen, cây biểu trưng cho may mắn cát tường bình an trong phong thủy phòng thờ hoặc phòng khách.",
          "Cây có khả năng thanh lọc bớt một lượng khí amoniac giải phóng ra từ các chất tẩy rửa trong nhà."
        ],
        imageUrl: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=600",
        isTrending: false,
        isRare: false,
        temperature: "15°C - 28°C",
        badge: "Thủy sinh dễ trồng",
        humidity: "Cao (60% - 75%)",
        toxicity: "Chất saponin chứa trong thân cây độc nhẹ đối với đường tiêu hóa vật nuôi.",
        wateringIntervalDays: 3,
        wateringFrequencyLabel: "2 lần/tuần (hoặc thay nước tuần/lần)",
      },
      {
        name: "Hồng Môn",
        scientificName: "Anthurium andraeanum",
        category: "Trong nhà",
        shortDescription: "Đóa hoa hình trái tim đỏ thắm nổi bật, đem lại ngập tràn tình yêu và may mắn cát tường.",
        description: "Hồng Môn quyến rũ bất kỳ ai bởi chiếc lá bắc hình trái tim đỏ rực rỡ, láng bóng như phủ nhựa, vươn cao cụm hoa vàng thẳng đứng độc đáo. Cây sở hữu những chiếc lá xanh thẫm dày cứng cáp mọc xòe sum suê, là hiện thân của lòng hiếu khách nồng nhiệt, tình yêu chân thành lãng mạn.",
        lightLevel: "Trung bình",
        waterNeed: "Vừa phải",
        difficulty: "Trung bình",
        careGuide: [
          "Đặt cây nơi thoáng gió, có nhiều ánh sáng khuếch tán nhẹ để kích thích cây ra hoa đỏ rực rỡ liên tục.",
          "Tưới nước khi lớp đất mặt se khô hoàn toàn. Hạn chế tưới sũng nước đọng dễ rụng hoa.",
          "Đất trồng cần trộn nhiều xơ dừa, vỏ thông nhỏ để đảm bảo rễ cây hô hấp tốt.",
          "Bổ sung phân bón kích hoa định kỳ mỗi tháng một lần vào mùa xuân hè hoạt động."
        ],
        funFacts: [
          "Tên tiếng Anh 'Anthurium' xuất phát từ hai từ tiếng Hy Lạp 'anthos' (hoa) và 'oura' (đuôi), tức là hoa có đuôi, mô tả chính xác hình dáng cụm hoa vươn dài đặc trưng.",
          "Bông hoa màu đỏ thắm rực rỡ thực chất có độ bền cực kỳ kinh ngạc, có thể tươi sắc từ 4 đến 6 tuần liên tiếp."
        ],
        imageUrl: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=600",
        isTrending: true,
        isRare: false,
        temperature: "16°C - 30°C",
        badge: "Được ưa chuộng",
        humidity: "Cao (60% - 80%)",
        toxicity: "Độc hại nhẹ cho thú cưng do chứa tinh thể canxi oxalat bám dính khoang miệng.",
        wateringIntervalDays: 4,
        wateringFrequencyLabel: "2 lần/tuần",
      },
      {
        name: "Trầu Bà Thanh Xuân",
        scientificName: "Philodendron selloum",
        category: "Trong nhà",
        shortDescription: "Tán lá xẻ thùy sâu uốn lượn bay bổng, đem lại vẻ phóng khoáng tự nhiên.",
        description: "Trầu Bà Thanh Xuân hay còn gọi là trầu bà tay phật, có những phiến lá to bản xẻ sâu độc đáo uốn lượn mềm mại uyển chuyển như những ngón tay vươn dài đầy sức sống. Cây mang nét phóng khoáng hoang dã của rừng rậm nhiệt đới Nam Mỹ, tượng trưng cho tuổi thanh xuân vĩnh cửu khí chất phóng khoáng.",
        lightLevel: "Trung bình",
        waterNeed: "Vừa phải",
        difficulty: "Dễ",
        careGuide: [
          "Yêu cầu không gian đặt chậu tương đối rộng rãi để tán lá có thể tự do xòe rộng khoe dáng.",
          "Cây ưa đất ẩm nhẹ tơi xốp chứa nhiều chất mùn hữu cơ giữ ẩm.",
          "Xịt nước phun sương mịn mát cho lá cây thường xuyên giúp duy trì vẻ xanh tươi mượt mà.",
          "Đặt cây cách xa tầm gió thổi mạnh trực tiếp từ quạt hay máy lạnh."
        ],
        funFacts: [
          "Trầu Bà Thanh Xuân có mùi thơm nhẹ thanh khiết từ nhựa cây tỏa ra khi lau lá hoặc vô tình cọ xát nhẹ.",
          "Hệ thống rễ khí sinh vươn dài của cây có khả năng hút ẩm không khí vô cùng xuất sắc giúp giảm bớt khí ẩm mốc trong nhà."
        ],
        imageUrl: "https://images.unsplash.com/photo-1597055181300-e3633a207518?auto=format&fit=crop&q=80&w=600",
        isTrending: false,
        isRare: false,
        temperature: "15°C - 32°C",
        badge: "Tán lá to",
        humidity: "Cao (60% - 80%)",
        toxicity: "Chất canxi oxalat trong nhựa có độc tính nhẹ gây rát và ngứa nhẹ ngoài da hoặc khoang miệng.",
        wateringIntervalDays: 5,
        wateringFrequencyLabel: "1-2 lần/tuần",
      },
      {
        name: "Trầu Bà Lá Xẻ",
        scientificName: "Monstera Deliciosa",
        category: "Trong nhà",
        shortDescription: "Vua của các loài cây cảnh nội thất hiện đại với những chiếc lá xẻ lỗ vô cùng nghệ thuật.",
        description: "Monstera Deliciosa (Trầu Bà Lá Xẻ Nam Mỹ) sở hữu chiếc lá cực to bản màu xanh lục thẫm, xẻ thùy sâu và tự tạo những lỗ tròn tự nhiên (fenestration) vô cùng độc đáo nghệ thuật. Cây là biểu tượng trường cửu của lối sống xanh hiện đại sang trọng bậc nhất trên khắp thế giới.",
        lightLevel: "Trung bình đến cao",
        waterNeed: "Vừa phải",
        difficulty: "Dễ",
        careGuide: [
          "Đặt cây nơi ngập tràn ánh sáng tán xạ tự nhiên để cây phát triển lỗ lá xẻ to và đẹp.",
          "Cần làm cọc leo bọc xơ dừa vững chắc để nâng đỡ thân cây to mập và bám rễ khí sinh leo cao.",
          "Tưới nước khi lớp đất bề mặt sâu khoảng 3 cm se khô ráo, tránh tưới đẫm quá mức làm đen đầu lá.",
          "Lau lá sạch mịn màng định kỳ giúp tăng tính thẩm mỹ và sức sống của cây."
        ],
        funFacts: [
          "Tên gọi 'Deliciosa' ám chỉ hương vị quả chín của cây trong tự nhiên ngọt ngào thơm ngon kết hợp giữa chuối dứa và xoài.",
          "Các lỗ rách tự nhiên trên lá cây giúp luồng gió bão nhiệt đới dễ dàng xuyên qua mà không làm rách gãy phiến lá khổng lồ."
        ],
        imageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=600",
        isTrending: true,
        isRare: true,
        temperature: "18°C - 30°C",
        badge: "Được săn đón",
        humidity: "Cao (60% - 85%)",
        toxicity: "Nhựa cây có chứa canxi oxalat bám dính khoang miệng, độc hại nhẹ với chó mèo.",
        wateringIntervalDays: 6,
        wateringFrequencyLabel: "1 lần/tuần",
      },
      {
        name: "Thiết Mộc Lan",
        scientificName: "Dracaena fragrans",
        category: "Trong nhà",
        shortDescription: "Thân cột to vững chãi bền bỉ với dải lá sọc vàng mang tài lộc sinh khí hanh thông.",
        description: "Thiết Mộc Lan sở hữu những dải lá thuôn dài mọc chụm ở đỉnh thân, nổi bật với sọc vàng chanh tươi rực rỡ chạy dọc chính giữa trên nền xanh bóng. Thân cây gỗ cột to mập mọc thẳng tắp mang dáng dấp khỏe khoắn hiên ngang khí chất, tượng trưng cho sức khỏe sung túc phú quý cát tường.",
        lightLevel: "Trung bình",
        waterNeed: "Ít",
        difficulty: "Dễ",
        careGuide: [
          "Có sức chống chịu và sống dai dẳng cực tốt trong văn phòng thiếu sáng yếu.",
          "Tưới nước rất hạn chế, chỉ tưới đều gốc khi sờ thấy đất sâu đã hoàn toàn se khô.",
          "Cây nhạy cảm cực cao với nước dư thừa tích tụ dễ gây thối vỏ gốc đen rễ cây.",
          "Bón phân chậm tan NPK định kỳ 3 tháng một lần để lá luôn có sọc vàng tươi tắn sắc nét."
        ],
        funFacts: [
          "Trong điều kiện chăm sóc hoàn hảo lâu năm đầy đủ sinh dưỡng cây sẽ nở hoa vào mùa đông lạnh, chùm hoa hình tròn nhỏ màu trắng ngà tỏa hương thơm ngát nồng nàn dịu ngọt vô cùng quyến rũ.",
          "Thiết Mộc Lan tượng trưng cho mệnh Mộc trong ngũ hành mang lại may mắn lớn về tiền bạc gia đạo cát tường."
        ],
        imageUrl: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=600",
        isTrending: false,
        isRare: false,
        temperature: "16°C - 35°C",
        badge: "Văn phòng",
        humidity: "Trung bình (40% - 60%)",
        toxicity: "Độc hại nhẹ cho chó mèo do chứa hàm lượng nhỏ chất saponin đường ruột.",
        wateringIntervalDays: 8,
        wateringFrequencyLabel: "1 lần/tuần",
      },
      {
        name: "Cau Tiểu Trâm",
        scientificName: "Chamaedorea elegans",
        category: "Trong nhà",
        shortDescription: "Vẻ đẹp nhỏ nhắn xanh mát đầy sức sống dẻo dai tựa như một cây cau thu nhỏ xinh xắn.",
        description: "Cau Tiểu Trâm tựa như một cây cau dừa mini thu nhỏ vô cùng duyên dáng đáng yêu với tán lá xanh mướt, mềm mại mảnh mai mọc xòe đều xung quanh từ gốc. Cây có khả năng hấp thụ độc chất trong không khí tốt, mang năng lượng bình yên thư thái dịu dàng cho bàn học góc làm việc.",
        lightLevel: "Trung bình",
        waterNeed: "Vừa phải",
        difficulty: "Dễ",
        careGuide: [
          "Rất ưa bóng râm hoặc ánh sáng gián tiếp nhẹ của ban công râm mát hay bàn sảnh.",
          "Đất trồng cần nhẹ thoáng xốp giữ ẩm tốt nhưng tuyệt đối tránh tích ẩm úng lâu ngày.",
          "Tưới nước giữ ẩm đều đặn cho đất ẩm nhẹ mềm mại mượt mà.",
          "Lá mảnh dễ cháy xém sần sùi nếu tiếp xúc trực tiếp luồng nắng gay gắt ngoài trời."
        ],
        funFacts: [
          "Ở các nước phương Tây cây được tôn vinh là 'Parlour Palm' vì từ thời đại Victoria xa xưa đã được trang trí trong các phòng khách quý tộc quý phái tinh tế.",
          "Một chậu Cau Tiểu Trâm để bàn có khả năng lọc bụi mịn li ti bay lơ lửng rất tốt từ không khí xung quanh."
        ],
        imageUrl: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=600",
        isTrending: false,
        isRare: false,
        temperature: "18°C - 30°C",
        badge: "Để bàn học",
        humidity: "Trung bình đến cao (55% - 75%)",
        toxicity: "Hoàn toàn lành tính, an toàn tuyệt đối với trẻ nhỏ và mọi loài thú nuôi.",
        wateringIntervalDays: 4,
        wateringFrequencyLabel: "2 lần/tuần",
      },
      {
        name: "Đa Búp Đỏ",
        scientificName: "Ficus elastica",
        category: "Trong nhà",
        shortDescription: "Lá oval to bóng láng màu xanh thẫm, búp non đỏ hồng rực rỡ nổi bật cá tính.",
        description: "Đa Búp Đỏ nổi tiếng với bộ lá tròn dày bóng láng như da, sở hữu gam màu xanh lục đen huyền bí vô cùng sang trọng cá tính. Búp non bọc lá mới của cây có màu đỏ hồng rực rỡ thuôn nhọn tựa như những chiếc bút lông vẽ đầy kiêu hãnh. Cây biểu trưng cho nghị lực vươn lên vượt qua mọi thử thách chông gai cuộc sống.",
        lightLevel: "Trung bình đến cao",
        waterNeed: "Vừa phải",
        difficulty: "Trung bình",
        careGuide: [
          "Đặt cây nơi tràn ngập ánh sáng tự nhiên khuếch tán để lá cây giữ được màu xanh đen láng bóng sẫm màu.",
          "Tưới đẫm quanh gốc đất khi lớp đất bề mặt sâu 3 cm đã se khô ráp hẳn.",
          "Dùng khăn bông mềm thấm nước ẩm lau sạch mặt lá thường xuyên giữ lá láng mịn mượt bóng bẩy.",
          "Cắt ngọn cây vào đầu xuân để khống chế chiều cao và kích thích cây mọc ra nhiều cành ngang sum suê."
        ],
        funFacts: [
          "Tên gọi 'Rubber Plant' (Cây Cao Su) do nhựa cây chứa chất latex cao su dẻo dai tự nhiên từng được người Ấn Độ sử dụng để chiết xuất lấy mủ làm bóng cao su tự chế.",
          "Cây lọc chất độc hóa học hữu cơ độc hại bay hơi cực tốt phát ra từ thảm lót hay nước sơn mới sơn tường."
        ],
        imageUrl: "https://images.unsplash.com/photo-1597055181300-e3633a207518?auto=format&fit=crop&q=80&w=600",
        isTrending: true,
        isRare: false,
        temperature: "16°C - 29°C",
        badge: "Đậm cá tính",
        humidity: "Trung bình (50% - 60%)",
        toxicity: "Nhựa mủ trắng đục của cây chứa chất kích ứng mạnh ngoài da người hoặc niêm mạc động vật.",
        wateringIntervalDays: 5,
        wateringFrequencyLabel: "1-2 lần/tuần",
      },
      {
        name: "Thường Xuân",
        scientificName: "Hedera helix",
        category: "Trong nhà",
        shortDescription: "Cây leo mềm mại thu hút mọi ánh nhìn bởi tán lá xanh xẻ thùy uốn lượn bay bổng dịu dàng.",
        description: "Cây Thường Xuân sở hữu những nhánh thân mảnh mai uốn lượn rủ xuống lãng mạn, tán lá nhỏ hình xẻ 3-5 thùy mềm mại màu xanh mướt mát thanh lịch. Cây mang vẻ đẹp lãng mạn lôi cuốn cổ điển châu Âu, tượng trưng cho tình bạn gắn bó khăng khít lâu dài và may mắn trường cửu bền lâu theo dòng thời gian.",
        lightLevel: "Trung bình",
        waterNeed: "Vừa phải",
        difficulty: "Trung bình",
        careGuide: [
          "Cực kỳ ưa mát mẻ thông thoáng gió lùa nhẹ, thích hợp treo ban công hay rủ trên kệ tủ.",
          "Tưới nước khi se khô đất, chú ý phun sương tán lá ẩm mát dịu nhẹ.",
          "Tránh tiếp xúc ánh nắng gắt nhiệt độ cao oi nóng làm héo úa và cháy xém lá cây.",
          "Cắt tỉa tạo dáng nhánh leo thường xuyên để giữ phom dáng gọn gàng bay bổng thanh lịch."
        ],
        funFacts: [
          "Ở các nước châu Âu cổ kính cổ điển cây thường bám phụ leo phủ kín toàn bộ mảng tường đá của những lâu đài cổ, giúp ngăn nhiệt độ bên ngoài và điều hòa không khí mát mẻ bên trong.",
          "Nghiên cứu khoa học chứng minh Thường Xuân loại bỏ nấm mốc cực tốt bơ lơ lửng trong không khí độ ẩm phòng tắm."
        ],
        imageUrl: "https://images.unsplash.com/photo-1599880940080-ff9a29891b85?auto=format&fit=crop&q=80&w=600",
        isTrending: false,
        isRare: false,
        temperature: "10°C - 25°C",
        badge: "Leo rủ mềm mại",
        humidity: "Cao (60% - 80%)",
        toxicity: "Lá cây có chứa chất saponin độc hại nhẹ đối với chó mèo khi nuốt phải.",
        wateringIntervalDays: 4,
        wateringFrequencyLabel: "2 lần/tuần",
      },
      {
        name: "Đuôi Công Táo",
        scientificName: "Calathea orbifolia",
        category: "Trong nhà",
        shortDescription: "Tác phẩm nghệ thuật sống động của thiên nhiên với tán lá to sọc bạc xám vô cùng quý phái.",
        description: "Calathea Orbifolia (Đuôi Công Táo) làm say đắm giới mộ điệu cây cảnh bởi những chiếc lá tròn to lớn xòe rộng sang trọng. Bề mặt lá được trang trí bằng những đường vân sọc bạc ánh xám chạy đối xứng hoàn hảo trên nền xanh ngọc vô cùng tinh tế tựa như chiếc đuôi xòe lộng lẫy của loài chim công quý phái.",
        lightLevel: "Thấp đến trung bình",
        waterNeed: "Nhiều",
        difficulty: "Khó",
        careGuide: [
          "Cần độ ẩm không khí rất cao liên tục để tránh mép lá bị cuộn lại khô cháy xơ xác.",
          "Chỉ sử dụng nước lọc sạch tinh khiết hoặc nước mưa đã lắng để tưới nước, tránh nước máy chứa hóa chất clo làm cháy rìa lá.",
          "Đất trồng cần giữ ẩm đều, không quá sũng nát thối rễ, đảm bảo thoát nước cực tốt.",
          "Đặt cây nơi ấm áp, tránh luồng gió phả trực tiếp từ máy lạnh máy quạt thổi vào tán lá."
        ],
        funFacts: [
          "Loài cây này thuộc nhóm 'Prayer Plants' (Cây Cầu Nguyện) có thói quen đặc trưng chuyển động lá kỳ diệu khép lại dựng thẳng hướng lên trời vào ban đêm như đang cầu nguyện bình yên và xòe rộng chào đón bình minh sáng sớm hôm sau.",
          "Lá bản to rộng giúp cây hấp thụ tối đa lượng ánh sáng yếu ớt xuyên qua dưới tầng đáy rừng rậm rạp Amazon hoang dã."
        ],
        imageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=600",
        isTrending: true,
        isRare: true,
        temperature: "18°C - 26°C",
        badge: "Quý tộc tinh tế",
        humidity: "Rất cao (65% - 85%)",
        toxicity: "Hoàn toàn lành tính, an toàn tuyệt đối với vật nuôi và trẻ nhỏ nghịch ngợm.",
        wateringIntervalDays: 3,
        wateringFrequencyLabel: "2-3 lần/tuần",
      },
      {
        name: "Cẩm Nhung",
        scientificName: "Fittonia albivenis",
        category: "Trong nhà",
        shortDescription: "Tán lá nhỏ li ti nổi bật mạng lưới gân lá màu hồng đỏ chi tiết bắt mắt đầy nghệ thuật.",
        description: "Cẩm Nhung hay còn có tên gọi rực rỡ Nerve Plant sở hữu bộ lá nhỏ bé mềm mại xinh xắn mọc bò sát đất. Điểm ấn tượng nhất là mạng lưới đường vân gân lá màu hồng đỏ rực rỡ hay màu trắng bạc chạy chi tiết đan chéo dày đặc bao phủ toàn diện phiến lá xanh. Cây biểu trưng cho tình bạn chân thành gắn kết khăng khít sâu sắc.",
        lightLevel: "Trung bình",
        waterNeed: "Nhiều",
        difficulty: "Trung bình",
        careGuide: [
          "Rất thích hợp trồng trong các bình thủy tinh tiểu cảnh bán kín Terrarium nhờ khả năng ưa độ ẩm cao mát mẻ.",
          "Giữ đất trồng luôn ở độ ẩm ẩm nhẹ tơi xốp, cây sẽ héo rũ nhanh chóng cảnh báo nếu thiếu nước.",
          "Tưới phun sương mịn lên lá hằng ngày giúp lá cây tươi tắn mịn màng mướt mát.",
          "Tránh nguồn nắng gay gắt trực tiếp làm cháy xém rụng hết những phiến lá bé bỏng mong manh."
        ],
        funFacts: [
          "Cẩm Nhung là một trong số ít loài cây cảnh có khả năng héo rũ gục ngã hoàn toàn giả vờ như đã chết khi thiếu nước và phục hồi vươn thẳng dựng lên xanh tươi khỏe mạnh thần tốc chỉ sau 1 tiếng được tưới nước đầy đủ trở lại.",
          "Cây có nguồn gốc hoang dã từ tầng mùn ẩm ướt mát mẻ của những khu rừng nhiệt đới Nam Mỹ bao la."
        ],
        imageUrl: "https://images.unsplash.com/photo-1520302630591-fd1c66ed11db?auto=format&fit=crop&q=80&w=600",
        isTrending: false,
        isRare: false,
        temperature: "16°C - 26°C",
        badge: "Đáng yêu",
        humidity: "Rất cao (65% - 85%)",
        toxicity: "Hoàn toàn lành tính và an toàn với các loài động vật chó mèo.",
        wateringIntervalDays: 2,
        wateringFrequencyLabel: "3-4 lần/tuần",
      },
      {
        name: "Hương Thảo",
        scientificName: "Salvia rosmarinus",
        category: "Gia vị",
        shortDescription: "Thảo mộc tỏa hương tinh dầu thơm ngát tự nhiên, kích thích trí não giảm căng thẳng mệt mỏi.",
        description: "Hương Thảo (Rosemary) là loài cây bụi nhỏ tỏa mùi thơm tinh dầu nồng nàn dịu mát thư thái tâm hồn. Lá cây nhỏ dẹt hình cây kim nhọn mọc um tùm bao quanh thân gỗ thẳng tắp đầy sức sống. Cây được ứng dụng rộng rãi trong chế biến các món Âu cao cấp và tinh dầu giảm stress hiệu quả.",
        lightLevel: "Cao",
        waterNeed: "Ít đến vừa",
        difficulty: "Khó",
        careGuide: [
          "Đặt cây nơi lộng gió thông thoáng đón nhiều nắng tự nhiên mát mẻ ít nhất 5-6 tiếng mỗi ngày.",
          "Sử dụng đất cát tơi xốp thoát nước cực nhanh, cây rất sợ đọng ẩm ngập úng thối rễ đen lá.",
          "Tưới nước sát gốc khi đất khô hoàn toàn, hạn chế tưới ướt sũng lá vào chiều tối ẩm mốc.",
          "Thường xuyên tỉa cành ngọn để cây tập trung dinh dưỡng đẻ cành mới sum suê rậm rạp."
        ],
        funFacts: [
          "Hương thơm thanh tao từ tinh dầu lá Hương Thảo chứa hợp chất cineole kích thích tuần hoàn máu não hoạt động giúp tăng cường trí nhớ học tập tập trung làm việc cực kỳ tuyệt vời.",
          "Người La Mã cổ đại coi Hương Thảo là loài thảo mộc thiêng liêng mang lại may mắn gắn kết tình yêu son sắt bền chặt."
        ],
        imageUrl: "https://images.unsplash.com/photo-1508847154043-be12a62861c1?auto=format&fit=crop&q=80&w=600",
        isTrending: true,
        isRare: false,
        temperature: "15°C - 30°C",
        badge: "Gia vị & Trị liệu",
        humidity: "Thấp đến trung bình (35% - 50%)",
        toxicity: "Hoàn toàn không độc hại, ăn uống gia vị lành tính tốt cho sức khỏe con người.",
        wateringIntervalDays: 4,
        wateringFrequencyLabel: "2 lần/tuần",
      },
      {
        name: "Tùng Bồng Lai",
        scientificName: "Podocarpus macrophyllus",
        category: "Bonsai",
        shortDescription: "Vẻ đẹp phong trần uy nghi cổ kính tựa như chốn bồng lai tiên cảnh tao nhã cát tường.",
        description: "Tùng Bồng Lai sở hữu vẻ đẹp cổ điển sang trọng tao nhã đặc trưng của dòng cây bonsai nghệ thuật. Lá cây dạng kim nhỏ xanh đậm cứng cáp mọc chen chúc dày đặc xếp tầng bồng bềnh uốn lượn xung quanh thân gỗ sần sùi góc cạnh đầy phong trần. Cây đại diện cho khí chất thanh tao, ý chí kiên cường trường thọ.",
        lightLevel: "Trung bình đến cao",
        waterNeed: "Vừa phải",
        difficulty: "Trung bình",
        careGuide: [
          "Thích hợp bày biện ở ban công có ánh sáng chan hòa nhẹ hoặc góc phòng làm việc trang trọng thoáng khí.",
          "Tưới nước khi se mặt đất khô, cây có khả năng chịu hạn tương đối khá tốt.",
          "Xịt phun sương mịn lên tán lá kim xanh mát mẻ để giữ màu xanh đậm quanh năm bóng khỏe.",
          "Uốn nắn tạo dáng chi cành bằng dây kẽm từ nhỏ để tạo dáng thế bonsai nghệ thuật ý nghĩa."
        ],
        funFacts: [
          "Cây Tùng Bồng Lai mang ý nghĩa phong thủy vô cùng tốt lành giúp trừ tà khí xấu mang bình an thịnh vượng may mắn trường thọ hanh thông cho gia đạo tuổi cao chí lớn.",
          "Loài tùng này sống rất bền bỉ dẻo dai hàng chục năm tuổi trong chậu cảnh bonsai đầy phong trần sương gió."
        ],
        imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=600",
        isTrending: false,
        isRare: false,
        temperature: "15°C - 30°C",
        badge: "Bonsai quý phái",
        humidity: "Trung bình (45% - 60%)",
        toxicity: "Không độc hại cho con người, vô cùng thân thiện mát mắt.",
        wateringIntervalDays: 5,
        wateringFrequencyLabel: "1-2 lần/tuần",
      },
      {
        name: "Trầu Bà Lá Xẻ Var",
        scientificName: "Monstera Deliciosa Variegata",
        category: "Trong nhà",
        shortDescription: "Cực phẩm sưu tầm hoàng gia với các mảng đột biến màu trắng ngọc ngà vô giá độc bản.",
        description: "Monstera Deliciosa Variegata (Trầu Bà Lá Xẻ Đột Biến Albino) là cực phẩm đắt đỏ thuộc hàng hoàng gia thế giới cây cảnh. Mỗi chiếc lá xẻ lỗ to lớn là một bức tranh độc bản kiêu sa, pha trộn ngẫu hứng nghệ thuật giữa sắc xanh thẫm tươi và những mảng đột biến màu trắng ngọc ngà loang lổ loang láng vô giá.",
        lightLevel: "Trung bình đến cao",
        waterNeed: "Vừa phải",
        difficulty: "Khó",
        careGuide: [
          "Đòi hỏi chế độ chăm sóc vô cùng tỉ mỉ khắt khe để duy trì các mảng đột biến màu trắng không bị thâm đen cháy lá.",
          "Cần ánh sáng tự nhiên khuếch tán thật nhiều để giúp phần lá xanh quang hợp tốt bù đắp cho phần lá trắng không có diệp lục.",
          "Tưới nước vô cùng cẩn trọng sát gốc khi bầu đất khô ráo se hẳn. Sử dụng giá thể thoát nước nhanh tốt nhất chứa sỏi pumice và dớn mềm.",
          "Cung cấp cọc rêu ẩm và giữ độ ẩm môi trường lý tưởng ổn định."
        ],
        funFacts: [
          "Giá trị một chậu Monstera Variegata đột biến có thể lên tới hàng chục triệu đồng tùy thuộc vào mức độ phối trộn màu trắng ngọc loang lổ đều đặn và kích thước to lớn của phiến lá.",
          "Các mảng trắng đột biến Albino hoàn toàn không chứa chất diệp lục nên không thể tự quang hợp nuôi cây, khiến cây phát triển tương đối chậm chạp tinh tế quý giá."
        ],
        imageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=600",
        isTrending: true,
        isRare: true,
        temperature: "18°C - 28°C",
        badge: "Siêu hiếm vô giá",
        humidity: "Cao (65% - 85%)",
        toxicity: "Độc hại nhẹ với vật nuôi tương tự dòng Monstera nguyên bản.",
        wateringIntervalDays: 6,
        wateringFrequencyLabel: "1 lần/tuần",
      }
    ];

    const generateSlug = (name) => {
      return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9\s-]/g, "")    // Remove special chars
        .replace(/\s+/g, "-")            // Replace spaces with -
        .replace(/-+/g, "-")             // Remove consecutive -
        .trim();
    };

    const mapCategory = (rawCategory) => {
      if (!rawCategory) return "Trong nhà";
      const cat = rawCategory.trim().toLowerCase();
      if (cat.includes("trong nhà") || cat.includes("dương xỉ") || cat.includes("thủy sinh") || cat.includes("nước") || cat.includes("phong thủy")) {
        return "Trong nhà";
      }
      if (cat.includes("mọng nước") || cat.includes("xương rồng") || cat.includes("sen đá") || cat.includes("ban công")) {
        return "Ban công";
      }
      if (cat.includes("gia vị") || cat.includes("bonsai") || cat.includes("ngoài trời") || cat.includes("sân vườn") || cat.includes("thảo mộc")) {
        return "Ngoài trời";
      }
      return "Trong nhà"; // Mặc định
    };

    const libraryPlantsDataWithIds = libraryPlantsData.map((plant, index) => ({
      ...plant,
      category: mapCategory(plant.category),
      id: generateSlug(plant.name) || `plant-${index}`,
    }));

    const libraryPlants = await LibraryPlant.bulkCreate(libraryPlantsDataWithIds, { returning: true });
    console.log(`Đã tạo thành công ${libraryPlants.length} cây mẫu trong thư viện.`);

    // 3. TẠO DANH MỤC CÂY
    const categoriesData = [
      { name: "Trong nhà" },
      { name: "Ngoài trời" },
      { name: "Ban công" },
    ];
    const categories = await Category.bulkCreate(categoriesData, { returning: true });
    console.log(`Đã tạo thành công ${categories.length} danh mục.`);

    const categoryMap = {};
    categories.forEach(c => {
      categoryMap[c.name] = c.id;
    });

    // 4. TẠO CÂY TRONG VƯỜN (10 MyGarden items mapped to GardenPlant, Plant, Reminder)
    const userAn = users[0];
    const userBinh = users[1];
    const userCuong = users[2];

    const myGardenData = [
      {
        userId: userAn.id,
        libraryPlantId: libraryPlants[0].id, // Trầu Bà Vàng
        nickname: "Bà Bà Vàng",
        healthStatus: "Khỏe mạnh",
        wateringFrequencyLabel: "2 lần/tuần",
        lastWateredLabel: "Vừa xong",
        imageUrl: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=600",
      },
      {
        userId: userAn.id,
        libraryPlantId: libraryPlants[1].id, // Lưỡi Hổ
        nickname: "Hổ Con",
        healthStatus: "Khỏe mạnh",
        wateringFrequencyLabel: "1 lần/10 ngày",
        lastWateredLabel: "3 ngày trước",
        imageUrl: "https://images.unsplash.com/photo-1593487568522-746db8894941?auto=format&fit=crop&q=80&w=600",
      },
      {
        userId: userAn.id,
        libraryPlantId: libraryPlants[20].id, // Trầu Bà Lá Xẻ
        nickname: "Bé Monstera",
        healthStatus: "Khỏe mạnh",
        wateringFrequencyLabel: "1 lần/tuần",
        lastWateredLabel: "Chưa tưới",
        imageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=600",
      },
      {
        userId: userBinh.id,
        libraryPlantId: libraryPlants[2].id, // Kim Tiền
        nickname: "Kim Phát Tài",
        healthStatus: "Khỏe mạnh",
        wateringFrequencyLabel: "1 lần/tuần",
        lastWateredLabel: "Vừa xong",
        imageUrl: "https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&q=80&w=600",
      },
      {
        userId: userBinh.id,
        libraryPlantId: libraryPlants[4].id, // Lan Ý
        nickname: "Ý Lam",
        healthStatus: "Hơi héo nhẹ",
        wateringFrequencyLabel: "2-3 lần/tuần",
        lastWateredLabel: "5 ngày trước",
        imageUrl: "https://images.unsplash.com/photo-1598880940080-ff9a29891b85?auto=format&fit=crop&q=80&w=600",
      },
      {
        userId: userBinh.id,
        libraryPlantId: libraryPlants[8].id, // Sen Đá Phật Bà
        nickname: "Đóa Sen Nhỏ",
        healthStatus: "Khỏe mạnh",
        wateringFrequencyLabel: "1 lần/tuần",
        lastWateredLabel: "4 ngày trước",
        imageUrl: "https://images.unsplash.com/photo-1520302630591-fd1c66ed11db?auto=format&fit=crop&q=80&w=600",
      },
      {
        userId: userCuong.id,
        libraryPlantId: libraryPlants[5].id, // Bàng Singapore
        nickname: "Bàng Béo",
        healthStatus: "Khỏe mạnh",
        wateringFrequencyLabel: "1-2 lần/tuần",
        lastWateredLabel: "Hôm qua",
        imageUrl: "https://images.unsplash.com/photo-1597055181300-e3633a207518?auto=format&fit=crop&q=80&w=600",
      },
      {
        userId: userCuong.id,
        libraryPlantId: libraryPlants[27].id, // Hương Thảo
        nickname: "Hương Thơm",
        healthStatus: "Khỏe mạnh",
        wateringFrequencyLabel: "2 lần/tuần",
        lastWateredLabel: "Vừa xong",
        imageUrl: "https://images.unsplash.com/photo-1508847154043-be12a62861c1?auto=format&fit=crop&q=80&w=600",
      },
      {
        userId: userCuong.id,
        libraryPlantId: libraryPlants[29].id, // Trầu Bà Lá Xẻ Var
        nickname: "Bé Var Triệu Đô",
        healthStatus: "Khỏe mạnh",
        wateringFrequencyLabel: "1 lần/tuần",
        lastWateredLabel: "2 ngày trước",
        imageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=600",
      },
      {
        userId: userCuong.id,
        libraryPlantId: libraryPlants[6].id, // Nha Đam
        nickname: "Nha Đam Thảo Dược",
        healthStatus: "Khỏe mạnh",
        wateringFrequencyLabel: "1 lần/2 tuần",
        lastWateredLabel: "Chưa tưới",
        imageUrl: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=600",
      }
    ];

    const getWateringDays = (label) => {
      if (!label) return 3;
      if (label.includes("10 ngày")) return 10;
      if (label.includes("2 tuần")) return 14;
      if (label.includes("3 tuần")) return 21;
      if (label.includes("1,5 tuần")) return 10;
      if (label.includes("1 lần/tuần") || label.includes("tuần/lần") || label.includes("Thay nước/tuần")) return 7;
      if (label.includes("1-2 lần")) return 5;
      if (label.includes("2 lần")) return 3;
      if (label.includes("2-3 lần")) return 3;
      if (label.includes("3-4 lần")) return 2;
      return 3;
    };

    console.log("=== BẮT ĐẦU TẠO CÂY TRONG VƯỜN THỰC TẾ ===");
    for (const item of myGardenData) {
      const libPlant = libraryPlants.find(lp => lp.id === item.libraryPlantId);
      
      const plant = await Plant.create({
        name: item.nickname || (libPlant ? libPlant.name : "Cây cảnh"),
        description: libPlant ? libPlant.shortDescription : "Cây trồng trong vườn",
        imageUrl: item.imageUrl || (libPlant ? libPlant.imageUrl : "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=600"),
      });

      const catName = libPlant ? libPlant.category : "Trong nhà";
      const categoryId = categoryMap[catName] || categories[0].id;

      const gardenPlant = await GardenPlant.create({
        userId: item.userId,
        plantId: plant.id,
        categoryId: categoryId,
        status: item.healthStatus === "Khỏe mạnh" ? "healthy" : (item.healthStatus === "Đang bệnh" ? "sick" : "thirsty"),
        imageUrl: plant.imageUrl,
        startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      });

      const wateringDays = getWateringDays(item.wateringFrequencyLabel);
      const reminders = [
        {
          gardenPlantId: gardenPlant.id,
          type: 'Tưới nước',
          frequencyDays: wateringDays,
          lastActionAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          isPushEnabled: true,
        },
        {
          gardenPlantId: gardenPlant.id,
          type: 'Bón phân',
          frequencyDays: 30,
          lastActionAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          isPushEnabled: true,
        }
      ];
      await Reminder.bulkCreate(reminders);
    }

    console.log(`Đã tạo thành công ${myGardenData.length} cây cảnh thực tế trong vườn người dùng.`);

    console.log("=== ĐÃ HOÀN THÀNH SEED DỮ LIỆU THÀNH CÔNG! ===");
    process.exit(0);
  } catch (error) {
    console.error("LỖI KHI NẠP DỮ LIỆU:", error);
    process.exit(1);
  }
};

runSeeder();
