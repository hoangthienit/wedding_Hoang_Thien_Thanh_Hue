/* =========================================================
   CẤU HÌNH THIỆP CƯỚI — chỉ cần sửa file này
   ========================================================= */
window.WEDDING = {
  groom: {
    shortName: "Hoàng Thiện",
    saint: "Micae",
    fullName: "Nguyễn Phan Hoàng Thiện",
    rank: "Trưởng Nam",
    photo: "ima/web/avatar-chu-re.jpg",
    photoPos: "50% 50%", // vị trí cắt ảnh tròn (ngang dọc)
    father: "Phêro Nguyễn Văn Luyến",
    mother: "Maria Phan Thị Nhung",
    address: "Thôn 1 (thôn 6 cũ), xã Ea Hiao, Đắk Lắk",
    map: "https://maps.app.goo.gl/AfTNArYWyav91SLA8",
  },
  bride: {
    shortName: "Thanh Huế",
    saint: "Maria",
    fullName: "Vũ Thị Thanh Huế",
    rank: "Thứ Nữ",
    photo: "ima/web/avatar-co-dau.jpg",
    photoPos: "50% 50%",
    father: "Vũ Trọng Kha",
    mother: "Đỗ Thị Mùi",
    address: "Thôn Đắk Tin, xã Đắk Ui, Quảng Ngãi",
    // TODO: thay link bản đồ nhà gái
    map: "https://maps.app.goo.gl/Zk5SgpajA4G8Uq8K6",
  },

  // Đếm ngược mặc định: "groom" (Nhà Trai) hoặc "bride" (Nhà Gái)
  // Có thể ép theo link: ...?ben=gai hoặc ...?ben=trai
  defaultSide: "groom",

  // Ngày chính hiển thị trên bìa (ngày cưới nhà trai)
  mainDate: "2026-12-16",

  // Các sự kiện — "date" dạng YYYY-MM-DDTHH:mm (giờ Việt Nam)
  // Mỗi thẻ là một ngày; "times" có thể có nhiều mốc giờ trong ngày (label để trống = "Vào lúc")
  events: [
    {
      title: "Lễ Hôn Phối",
      date: "2026-10-28",
      times: [{ label: "", time: "05:00" }],
      lunar: "Nhằm ngày 19 tháng 09 năm Bính Ngọ",
      place: "Nhà thờ Giáo xứ Ea H’leo",
      address: "Ea H’leo, Đắk Lắk",
      map: "https://maps.app.goo.gl/TCobCUWUi61ake8D6",
      icon: "church",
    },
    {
      title: "Lễ Cưới Nhà Gái",
      side: "bride",
      date: "2026-12-12",
      times: [
        { label: "Lễ Tư Gia", time: "09:00" },
        { label: "Tiệc Cưới", time: "11:30" },
      ],
      lunar: "Nhằm ngày 04 tháng 11 năm Bính Ngọ",
      place: "Tư gia Nhà Gái",
      address: "Thôn Đắk Tin, xã Đắk Ngọk, Quảng Ngãi",
      map: "bride", // dùng link bản đồ nhà gái ở trên
      icon: "home",
    },
    {
      title: "Lễ Cưới Nhà Trai",
      side: "groom",
      date: "2026-12-16",
      times: [
        { label: "Lễ Tư Gia", time: "09:00" },
        { label: "Tiệc Cưới", time: "11:30" },
      ],
      lunar: "Nhằm ngày 08 tháng 11 năm Bính Ngọ",
      place: "Tư gia Nhà Trai",
      address: "Thôn 1 (Thôn 6 cũ), xã Ea Hiao, Đắk Lắk",
      map: "groom",
      icon: "home",
    },
  ],

  verse: {
    text: "Sự gì Thiên Chúa đã kết hợp, loài người không được phân ly.",
    ref: "Mc 10, 9",
  },

  openerPhoto: "ima/web/anh-2.jpg", // ảnh màn hình "Mở thiệp"
  cover: "ima/album/2aoborbue1efksnzhaa26umsyfzkp3aza46nze007.jpg", // ảnh bìa bên trong
  thanksPhoto: "ima/album/2aoborbue1ozy0kzksdi0irvhrd7mw5umatoalwu2.jpg",
  // Album: dùng js/gallery.js (tạo bằng ./them-anh.sh). Danh sách dưới chỉ dùng dự phòng.
  gallery: [
    "ima/web/anh-1.jpg",
    "ima/web/anh-2.jpg",
    "ima/web/anh-3.jpg",
    "ima/web/anh-5.jpg",
    "ima/web/anh-6.jpg",
    "ima/web/anh-7.jpg",
  ],

  /* Nhạc: chép file mp3 vào thư mục music/ đúng tên bên dưới.
     Bài nào thiếu file sẽ tự bỏ qua. Hết bài tự chuyển bài kế. */
  playlist: [
    { file: "music/hon-ca-yeu.mp3", title: "Hơn Cả Yêu – Đức Phúc" },
    { file: "music/mot-nha.mp3", title: "Một Nhà – Da LAB" },
    { file: "music/anh-nang-cua-anh.mp3", title: "Ánh Nắng Của Anh – Đức Phúc" },
  ],
  shuffle: true, // true = phát ngẫu nhiên, mỗi lần mở thiệp bắt đầu bằng bài khác

  /* Danh sách khách mời: file guests.txt, mỗi dòng "1. Anh A" */
  guestsFile: "guests.txt",
  defaultGuest: "Quý Khách",

  /* Link Google Apps Script (xem HUONG_DAN.md) để lưu xác nhận tham dự & lời chúc.
     Để trống thì form vẫn chạy nhưng không lưu lên Google Sheets. */
  sheetApi: "https://script.google.com/macros/s/AKfycbyMCRP1P_CqTeceBPzr240eZkmowLk2pbHyiaM5qfCPaoeaURmXi9i4tybrsVDVp-8a/exec",

  /* Nhắn lời chúc trực tiếp cho cô dâu / chú rể
     phone:     số điện thoại (dùng cho SMS), vd "0912345678"
     zalo:      số điện thoại đăng ký Zalo, vd "0912345678"
     messenger: tên người dùng Facebook (phần sau facebook.com/), vd "hoangthien.nguyen"
     Để trống mục nào thì nút đó sẽ ẩn. */
  contacts: [
    { label: "Chú Rể", name: "Hoàng Thiện", photo: "ima/web/avatar-chu-re.jpg", photoPos: "50% 50%", phone: "0339.195.193", zalo: "0339.195.193", messenger: "HoangThienJasonTee" },
    { label: "Cô Dâu", name: "Thanh Huế", photo: "ima/web/avatar-co-dau.jpg", photoPos: "50% 50%", phone: "085.743.0009", zalo: "085.743.0009", messenger: "thanhhue.hoangthien" },
  ],
  // Lời chúc gợi ý (khách có thể sửa trước khi gửi)
  blessing: "Chúc mừng hạnh phúc Hoàng Thiện & Thanh Huế! Chúc hai bạn trăm năm hạnh phúc, sớm có thiên thần nhỏ và luôn tràn đầy ơn lành của Chúa. 💕",
};
