# NIGHT CLUB LIVE 3D

Ứng dụng sân khấu vũ trường hoạt hình 3D dành cho TikTok LIVE Studio.

## V1.0.0 Foundation
- Sân khấu procedural 3D bằng Three.js: sàn nhảy, sân khấu VIP, LED, laser, nhân vật nhảy.
- Giao diện quản trị responsive.
- Mô phỏng quà tặng và spotlight.
- TOP VIP: tổng xu giảm dần; nếu bằng xu, số lượng quà giảm dần.

## Chạy trên Windows
1. Cài Node.js LTS (khuyến nghị Node 22).
2. Tải ZIP hoặc clone repository.
3. Chạy `INSTALL-AND-RUN.bat`.
4. Mở `http://localhost:5173`.

## Build
`npm install` rồi `npm run build`.

## Trạng thái
Đây là bản Foundation Demo. Nút nhập username hiện chỉ lưu trạng thái demo, KHÔNG kết nối TikTok. Tích hợp connector TikTok LIVE, avatar người xem thật, xác thực quà/coin, TTS và nhạc sẽ thực hiện ở giai đoạn tiếp theo.

Không nhập mật khẩu TikTok hoặc cookie vào ứng dụng. Connector không chính thức có thể ngừng hoạt động khi TikTok thay đổi. Chỉ dùng nhạc, model và hình ảnh có quyền sử dụng phù hợp.

Repository Đi Chùa Online được giữ nguyên, chỉ dùng làm dự án tham khảo.