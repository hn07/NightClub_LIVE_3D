# NIGHT CLUB LIVE 3D

Ứng dụng sân khấu nightclub hoạt hình 3D và bảng điều khiển sự kiện TikTok LIVE, tối ưu để vận hành trên Windows và đưa hình ảnh sân khấu vào TikTok LIVE Studio.

## V2.0.0 – LIVE ENGINE FOUNDATION

### Đã triển khai
- Sân khấu 3D Three.js: sàn LED, bục DJ, vòng sân khấu, laser, đèn chuyển động, hạt sáng và nhân vật hoạt hình.
- Dashboard responsive, bảng TOP VIP sắp xếp tổng xu giảm dần; nếu bằng xu thì số lượng quà giảm dần.
- Backend Node.js riêng, Socket.IO chuyển sự kiện LIVE sang giao diện.
- Kết nối phòng LIVE công khai bằng username, không yêu cầu nhập mật khẩu/cookie.
- Nhận các sự kiện bình luận, người tham gia, lượt thích, follow, share, quà tặng và số người xem (tùy dữ liệu TikTok trả về).
- Theo dõi chuỗi quà (gift streak), chỉ ghi nhận khi chuỗi kết thúc để tránh cộng xu trùng.
- Endpoint kiểm tra tình trạng dịch vụ: `/api/health`, `/api/status`.

### Chạy trên Windows
1. Cài Node.js 22 LTS (hoặc Node.js 20.19+).
2. Mở thư mục dự án.
3. Chạy `INSTALL-AND-RUN.bat` hoặc chạy thủ công:
   ```bash
   npm install
   npm run dev
   ```
4. Mở `http://localhost:5173`.
5. Nhập username của tài khoản đang phát LIVE công khai rồi bấm **KẾT NỐI TIKTOK LIVE**.

Lệnh `npm run dev` chạy đồng thời Vite (giao diện) và backend (cổng 4174). Không đóng cửa sổ terminal khi đang vận hành.

### Build và chạy production
```bash
npm install
npm run build
npm start
```
Production server phục vụ giao diện đã build và API tại cổng 4174. Có thể đặt biến môi trường `PORT` để đổi cổng.

## Kết nối TikTok – lưu ý quan trọng
- `tiktok-live-connector` là thư viện reverse-engineering không chính thức, không thuộc ByteDance/TikTok. TikTok có thể thay đổi giao thức khiến kết nối tạm thời không hoạt động.
- Chỉ kết nối LIVE công khai; không nhập mật khẩu, session cookie hoặc mã xác thực TikTok vào ứng dụng.
- Không có cam kết uptime/SLA từ TikTok cho phương thức này. Cần thử nghiệm thực tế trên tài khoản và khu vực phát LIVE trước khi dùng chính thức.
- Thư viện connector hiện phát hành theo giấy phép AGPL-3.0-only. Cần rà soát nghĩa vụ giấy phép trước khi phân phối thương mại hoặc cung cấp bản sửa đổi cho bên thứ ba.
- Dữ liệu sự kiện hiện được xử lý trong bộ nhớ phiên chạy; chưa có database lưu lịch sử dài hạn.

## Tích hợp TikTok LIVE Studio
Bản V2 hiện là dashboard + sân khấu 3D trên trình duyệt. Để đưa sân khấu vào LIVE Studio:
1. Chạy ứng dụng trên máy phát LIVE.
2. Mở giao diện sân khấu trên trình duyệt ở chế độ toàn màn hình.
3. Trong TikTok LIVE Studio, thêm nguồn Browser/Window Capture trỏ tới cửa sổ sân khấu.
4. Cấu hình canvas dọc 1080×1920 trong LIVE Studio và kiểm tra tỷ lệ/khung hình trước khi phát.

Lưu ý: giao diện quản trị hiện chưa tách thành một cửa sổ điều khiển độc lập với sân khấu broadcast; đây là hạng mục tiếp theo để hoàn thiện trải nghiệm vận hành chuyên nghiệp.

## Broadcast Overlay riêng cho TikTok LIVE Studio (V2.1)
- Mở trực tiếp URL: `http://localhost:5173/?view=stage`.
- Dashboard có liên kết **MỞ BROADCAST 9:16** để mở sân khấu ở cửa sổ/tab riêng.
- Overlay chạy toàn màn hình, hiển thị số người xem và ticker sự kiện LIVE (quà tặng, bình luận, follow...).
- Trong LIVE Studio, thêm Browser Source hoặc Window Capture trỏ tới URL overlay. Chọn canvas dọc 1080×1920 và kiểm tra crop/scale trong LIVE Studio.
- Overlay nhận sự kiện realtime qua Socket.IO; cần backend `npm run dev` đang chạy và phòng LIVE đã kết nối để có dữ liệu thật.

## V2.2 – Avatar, spotlight quà và cấu hình lưu trên máy
- Nhân vật sân khấu có tay/chân riêng và chuyển động nhảy theo nhịp, không chỉ nhún cả khối.
- Khi có quà tặng LIVE: hiển thị gift spotlight trên Broadcast, nhấn sáng sân khấu và nêu tên người tặng.
- TTS trình duyệt tiếng Việt (`vi-VN`) đọc lời cảm ơn quà, chào người mới và cảm ơn người follow; bật/tắt trong Cài đặt. Giọng đọc phụ thuộc voice tiếng Việt có trên Windows/trình duyệt.
- Bảng TOP, tên kênh và tùy chọn TTS được lưu trong localStorage trên máy chạy Dashboard. Đây là lưu cục bộ theo trình duyệt, chưa phải đồng bộ cloud.

## V2.3 – Gift tiers, lịch sử sự kiện và phục hồi overlay
- Backend phân loại quà theo tổng xu của một event: common dưới 100 xu, rare từ 100, epic từ 1.000, legendary từ 10.000 xu. Ngưỡng này có thể tinh chỉnh sau khi thử LIVE thật.
- Hiệu ứng spotlight trên Broadcast thay đổi theo cấp quà; quà epic/legendary có hiệu ứng sáng mạnh hơn.
- Backend lưu lịch sử sự kiện LIVE dạng JSON Lines trong thư mục `data/`, giới hạn lịch sử trong bộ nhớ/API ở 1.000 sự kiện gần nhất.
- API `GET /api/history?limit=100` trả về lịch sử gần đây; Broadcast và Dashboard nạp lại hoạt động gần nhất khi mở trang.
- File lịch sử nằm trên máy chủ ứng dụng. Cần sao lưu thư mục `data/` nếu muốn giữ lịch sử khi chuyển máy.

## V2.4 – Chào mừng thành viên mới vào LIVE
- Khi có người mới tham gia phòng LIVE, backend gửi kèm nickname, username và URL ảnh đại diện (nếu TikTok cung cấp).
- Broadcast 9:16 hiển thị thẻ chào mừng gồm avatar thật, tên người vừa vào và meme mặt hài nhảy disco.
- Hiệu ứng tự động biến mất sau khoảng 5 giây; nếu không lấy được avatar thì dùng chữ cái đầu tên làm ảnh dự phòng.

## Lộ trình hoàn thiện tiếp theo
- V2.0.x: kiểm thử kết nối LIVE thực tế, độ ổn định reconnect, xử lý lỗi API và tối ưu hiệu năng 3D.
- V2.1: tách Broadcast Overlay 1080×1920 khỏi Dashboard, URL overlay riêng cho LIVE Studio.
- V2.2: nâng cấp avatar 3D, chuyển động đa dạng, hiệu ứng quà theo giá trị và spotlight VIP.
- V2.3: TTS tiếng Việt, lời chào người mới, đọc bình luận theo bộ lọc và điều khiển âm thanh.
- V2.4: lưu cấu hình, lịch sử phiên LIVE, xuất bảng xếp hạng và khôi phục dữ liệu.
- V2.5: kiểm thử soak-test nhiều giờ và đóng gói Windows installer.

Repository Đi Chùa Online được giữ nguyên, không chỉnh sửa.
