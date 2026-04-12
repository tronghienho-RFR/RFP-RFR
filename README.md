# CV Updater Web App (FeeProX)

## Mở web app ở đâu? App nào?
Đây là **app web trong repo này** (`/workspace/RFP-RFR`) chạy bằng Vite + React.

## Tôi có thể chạy trực tiếp trên MacBook không?
**Có.** Bạn chạy trực tiếp trên macOS được, không cần máy chủ riêng.

### Điều kiện cần trên Mac
1. Cài **Node.js 18+** (khuyên dùng Node 20 LTS).
2. Có `npm` đi kèm theo Node.
3. Mở app bằng Chrome/Safari.

> Nếu chưa có Node: cài từ trang chính thức Node.js hoặc dùng Homebrew (`brew install node`).

### Cách mở app trên MacBook (từng bước)
1. Mở **Terminal**.
2. Di chuyển vào thư mục dự án:
   ```bash
   cd /workspace/RFP-RFR
   ```
3. Cài thư viện:
   ```bash
   npm install
   ```
4. Chạy web app:
   ```bash
   npm run dev
   ```
5. Mở trình duyệt và vào link được in ra ở Terminal (thường là):
   - `http://localhost:5173`
6. Mở đúng màn hình cập nhật CV:
   - `http://localhost:5173/cv-updater`


## Tôi không có thư mục `/workspace/RFP-RFR` thì làm sao?
Đúng rồi — đường dẫn `/workspace/RFP-RFR` là thư mục trong **môi trường kỹ thuật** (container), không phải mặc định trên Mac của bạn.

Bạn có 2 cách đơn giản:

### Cách 1 (khuyên dùng): Clone code về máy Mac
1. Mở Terminal.
2. Chọn nơi lưu dự án, ví dụ Desktop:
   ```bash
   cd ~/Desktop
   ```
3. Clone repo (thay `<repo-url>` bằng link Git của dự án):
   ```bash
   git clone <repo-url> RFP-RFR
   ```
4. Vào thư mục vừa tải về:
   ```bash
   cd RFP-RFR
   ```
5. Chạy app:
   ```bash
   npm install
   npm run dev
   ```

### Cách 2: Tải file ZIP từ Git
1. Tải ZIP source code từ Git platform (GitHub/GitLab/Bitbucket).
2. Giải nén, mở Terminal vào thư mục đã giải nén.
3. Chạy:
   ```bash
   npm install
   npm run dev
   ```

## Script có sẵn trong dự án
- Chạy môi trường dev: `npm run dev`
- Build production: `npm run build`
- Lint: `npm run lint`


## Luồng cập nhật CV theo yêu cầu mới
1. **Bước 1**: Upload file CV cũ (`.docx/.txt`) làm mẫu RFR (file `.doc` cần Save As sang `.docx`).
2. **Bước 2**: Upload file thông tin cập nhật (`.docx/.txt`) có tên dự án, quy mô, vai trò...
3. Hệ thống cho phép chọn nhanh dự án theo **tên dự án** từ file bước 2, rồi bấm **Copy toàn bộ vào CV mới**.
4. Sau khi copy, bạn có thể xoá/chỉnh sửa trực tiếp trong danh sách dự án CV mới.
5. Xuất ra file Word CV mới sau cập nhật (dựa trên CV cũ ở bước 1).

> Lưu ý: hệ thống đọc tự động tốt nhất với `.docx` và `.txt`. Với file `.doc` (Word cũ), vui lòng mở Word và **Save As `.docx`** rồi upload lại.

- File bước 2 có thể ở dạng danh sách gạch đầu dòng (`- Tên dự án ...`), hệ thống sẽ tự đưa tên vào dropdown chọn nhanh.

## Dùng màn hình CV Updater
1. Điền thông tin chung + dán CV cũ.
2. Dán mẫu dự án chuẩn của công ty.
3. Sửa dự án cũ, thêm dự án mới.
4. Bấm **Xuất ra Word (.doc)** để tải file.

## Nếu mở không được
- Kiểm tra Node: `node -v`
- Kiểm tra npm: `npm -v`
- Nếu cổng `5173` bận, Vite sẽ tự đổi cổng (ví dụ `5174`), hãy mở đúng URL mà Terminal in ra.
