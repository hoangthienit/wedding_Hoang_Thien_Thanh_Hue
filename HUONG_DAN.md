# Thiệp cưới online: Hoàng Thiện & Thanh Huế

## Cấu trúc thư mục
```
index.html            Trang thiệp
css/style.css         Giao diện (tone hồng)
js/config.js          ⭐ TOÀN BỘ THÔNG TIN, chỉ cần sửa file này
js/main.js            Xử lý (nhạc, tên khách, đếm ngược, form...)
ima/web/              Ảnh bìa, ảnh cô dâu chú rể (anh-1 → anh-7)
ima/album/            Ảnh album (tự tạo bởi them-anh.sh)
js/gallery.js         Danh sách album (tự tạo bởi them-anh.sh)
them-anh.sh           Script thêm ảnh vào album
music/                Bỏ file mp3 vào đây (xem music/README.txt)
404.html, _redirects, vercel.json, .htaccess   Để link dạng .../1 chạy được trên mọi hosting
google-apps-script.gs Code lưu xác nhận & lời chúc vào Google Sheets
```

## 1. Sửa thông tin
Mở `js/config.js`:
- **Bản đồ nhà gái:** sửa `bride.map`.
- **Ảnh:** đổi đường dẫn `cover`, `gallery`, `groom.photo`, `bride.photo`. `photoPos` chỉnh vị trí cắt ảnh tròn.
- **Nhắn lời chúc:** trong `contacts`, điền `zalo` (số điện thoại Zalo), `messenger` (tên người dùng Facebook), `phone` (số điện thoại cho SMS). Mục nào để trống thì nút đó tự ẩn. Sửa lời chúc gợi ý ở `blessing`.

## Album ảnh (thêm bao nhiêu ảnh cũng được)
1. Chép ảnh vào thư mục `ima/` (jpg, png, heic đều được). Muốn sắp thứ tự thì đặt tên `01-...`, `02-...`
2. Mở Terminal và chạy:
   ```
   cd /Volumes/Data/Code/Thiep_cuoi_online && ./them-anh.sh
   ```
3. Script tự nén ảnh (ảnh lớn 1600px, ảnh nhỏ 640px để tải nhanh) và cập nhật `js/gallery.js`.
- Muốn gỡ ảnh: xoá ảnh trong `ima/` rồi chạy lại script.
- Thiệp hiện 8 ảnh trên điện thoại, 12 ảnh trên máy tính, rồi có nút "Xem thêm".

## 2. Nhạc
Chép các file mp3 vào `music/` đúng tên trong `music/README.txt`, hoặc sửa danh sách `playlist` trong `config.js`.
- Trình duyệt không cho phát nhạc khi khách chưa chạm vào trang, nên nhạc bắt đầu khi khách bấm **"Mở thiệp"**.
- Hết bài sẽ tự chuyển bài kế, bài thiếu file thì tự bỏ qua. Đặt `shuffle: true` nếu muốn phát ngẫu nhiên.

## 3. Tên khách mời (lấy từ Google Sheet)
Cần làm xong mục 4 trước. Danh sách khách nằm ở tab **KhachMoi** trong Google Sheet (tab này tự tạo lần đầu có người mở link khách):

| Mã | Tên khách | Link |
|---|---|---|
| 1 | Anh A | (tự tính) |
| 2 | Chị B | (tự tính) |

- Thêm khách: điền **Mã** (số, không trùng) và **Tên khách**, rồi kéo công thức cột **Link** xuống dòng mới.
- `https://ten-mien/thiepcuoi/1` hiện **"Kính mời Anh A"**
- `https://ten-mien/thiepcuoi/` hiện **"Kính mời Quý Khách"**
- Cũng dùng được dạng `.../?g=1` hoặc `.../#1`.
- Sửa tên trong Sheet là có hiệu lực ngay, không cần đẩy code lại.

Hỗ trợ link dạng `/1`:
| Hosting | Cách |
|---|---|
| GitHub Pages | Dùng sẵn `404.html` |
| Netlify | Dùng sẵn `_redirects` |
| Vercel | Dùng sẵn `vercel.json` |
| Hosting Apache/cPanel | Dùng sẵn `.htaccess` |

## 4. Lưu Xác nhận tham dự & Lời chúc vào Google Sheets
1. Tạo một Google Sheet mới, vào **Tiện ích mở rộng → Apps Script**.
2. Xoá code mẫu, dán toàn bộ nội dung `google-apps-script.gs`, rồi bấm Lưu.
3. Chọn **Triển khai → Triển khai mới → Loại: Ứng dụng web**:
   - Thực thi dưới dạng: **Tôi**
   - Người có quyền truy cập: **Bất kỳ ai**
4. Copy URL (dạng `https://script.google.com/macros/s/.../exec`) rồi dán vào `sheetApi` trong `config.js`.
5. Dữ liệu sẽ nằm ở 2 tab: **XacNhanThamDu** và **LoiChuc**. Muốn ẩn một lời chúc, đổi cột "Hiển thị" thành `FALSE`.

Khi chưa cài bước này, form vẫn hiện thông báo cảm ơn nhưng dữ liệu không được lưu.
