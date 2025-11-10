# AI Recruitment Pipeline

Ứng dụng tuyển dụng thông minh sử dụng AI để tự động hóa quy trình tuyển dụng từ A-Z.

## Tính năng

- 📝 **Phase 0**: Mô tả công việc (Job Description)
- 📄 **Phase 1**: Quét và phân tích CV
- 🤖 **Phase 2**: Sàng lọc ứng viên bằng AI
- ❓ **Phase 3**: Tạo câu hỏi phỏng vấn
- 💬 **Phase 4**: Phỏng vấn với AI
- 📊 **Phase 5**: Báo cáo đánh giá chi tiết

## Công nghệ sử dụng

- React 19
- TypeScript
- Vite
- Google Gemini AI
- Recharts

## Chạy ở Local

**Yêu cầu:** Node.js (phiên bản 18 trở lên)

1. Clone repository:
   ```bash
   git clone <repository-url>
   cd ai-recruitment-pipeline
   ```

2. Cài đặt dependencies:
   ```bash
   npm install
   ```

3. Tạo file `.env` và thêm API key của Gemini:
   ```bash
   cp env.example .env
   ```
   Sau đó mở file `.env` và thêm API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   Lấy API key tại: https://makersuite.google.com/app/apikey

4. Chạy ứng dụng:
   ```bash
   npm run dev
   ```

5. Mở trình duyệt và truy cập: http://localhost:3000

## Deploy lên Vercel

### Cách 1: Deploy qua Vercel Dashboard (Khuyến nghị)

1. Push code lên GitHub repository của bạn
2. Truy cập [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import repository từ GitHub
5. Vercel sẽ tự động phát hiện cấu hình Vite
6. Thêm Environment Variable:
   - Key: `GEMINI_API_KEY`
   - Value: API key của bạn
7. Click "Deploy"

### Cách 2: Deploy qua Vercel CLI

1. Cài đặt Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login vào Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Thêm environment variable:
   ```bash
   vercel env add GEMINI_API_KEY
   ```

### Lưu ý khi deploy

- Đảm bảo đã thêm `GEMINI_API_KEY` vào Environment Variables trong Vercel
- Build command mặc định: `npm run build`
- Output directory: `dist`
- Node version: 18.x hoặc mới hơn

## Build cho Production

```bash
npm run build
```

Build output sẽ được tạo trong thư mục `dist/`.

## License

MIT
