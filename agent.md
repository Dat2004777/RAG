# 🤖 AI RAG System Agent Documentation

Tài liệu này mô tả chi tiết về cấu trúc, luồng hoạt động, công nghệ và cách xử lý của hệ thống **Retrieval-Augmented Generation (RAG)** này sau khi đã được nâng cấp.

---

## 🚀 1. Tổng quan hệ thống
Hệ thống là một ứng dụng RAG nâng cấp cho phép người dùng tải lên các tài liệu (PDF, Text), sau đó đặt câu hỏi dựa trên nội dung của các tài liệu đó. Hệ thống sử dụng AI để tìm kiếm các đoạn văn bản có liên quan nhất từ cơ sở dữ liệu Vector và trả lời dựa trên ngữ cảnh được cung cấp.

---

## 🛠 2. Công nghệ sử dụng (Tech Stack)

### 🔹 Backend (Node.js & NestJS)
- **Framework:** NestJS (TypeScript, Module-driven architecture)
- **Database:** MongoDB (Sử dụng `@nestjs/mongoose` và Mongoose) - Tận dụng tính năng **Atlas Vector Search**.
- **AI SDK:**
  - `@google/generative-ai`: Giao tiếp trực tiếp với Google Gemini API.
  - `@langchain/google-genai`: Sử dụng LangChain để quản lý flow AI và Embeddings.
- **File Processing:** 
  - Multer (Sử dụng `FileInterceptor` của NestJS) - Xử lý upload file trực tiếp trong bộ nhớ (Memory Buffer).
  - `pdf-parse`: Trích xuất văn bản trực tiếp từ PDF file buffer.
- **Environment:** `@nestjs/config` để quản lý các biến cấu hình từ `.env`.

### 🔹 Frontend (Next.js)
- **Framework:** Next.js (App Router, React 19, TypeScript)
- **Styling:** Tailwind CSS (v4.x) & Lucide React Icons
- **HTTP Client:** Axios

---

## 🧠 3. Các Model AI sử dụng

1.  **Embedding Model:** `gemini-embedding-001`
    - Dùng để chuyển đổi văn bản thành các vector số (embeddings) kích thước 768 chiều.
    - Được sử dụng cho cả lúc lưu tài liệu và lúc người dùng đặt câu hỏi.
2.  **Chat/LLM Model:** `gemma-4-31b-it` (Thông qua Google Generative AI)
    - Chịu trách nhiệm đọc ngữ cảnh (Context) và trả lời câu hỏi của người dùng một cách tự nhiên.

---

## 📂 4. Cấu trúc thư mục (Directory Structure)

```text
/
├── backend/                  # NestJS Server-side logic
│   ├── src/
│   │   ├── document/         # Schema, Service, Controller xử lý file tài liệu
│   │   │   ├── document.schema.ts
│   │   │   ├── document.service.ts
│   │   │   ├── document.controller.ts
│   │   │   └── document.module.ts
│   │   ├── embedding/        # Service tạo vector embedding qua Gemini API
│   │   │   ├── embedding.service.ts
│   │   │   └── embedding.module.ts
│   │   ├── rag/              # Controller & Service quản lý luồng RAG và gọi LLM
│   │   │   ├── rag.service.ts
│   │   │   ├── rag.controller.ts
│   │   │   └── rag.module.ts
│   │   ├── app.module.ts     # Root module của NestJS
│   │   └── main.ts           # Entry point khởi chạy server (CORS, PORT 5000)
│   ├── tsconfig.json         # Cấu hình TypeScript
│   └── .env                  # Cấu hình môi trường (API Keys, DB Uri)
├── frontend/                 # Next.js Client-side UI
│   ├── app/
│   │   ├── layout.tsx        # Cấu hình layout chính và SEO metadata
│   │   ├── globals.css       # Import Tailwind CSS v4.x
│   │   └── page.tsx          # Trang chủ chính tích hợp các UI components
│   ├── components/           # Các UI Components
│   │   ├── ChatWindow.tsx    # Giao diện chat hỏi đáp RAG
│   │   └── DocumentUploader.tsx # Giao diện kéo thả upload file
│   └── tsconfig.json         # Cấu hình TypeScript cho Next.js
└── agent.md                  # (Tài liệu này)
```

---

## 🔄 5. Luồng hoạt động (Workflow)

### 📤 A. Luồng tải tài liệu (Ingestion Phase)
1. **Upload:** Người dùng kéo thả hoặc chọn file `.pdf` hoặc `.txt` từ Frontend Next.js.
2. **Extraction:** Backend NestJS nhận file thông qua `FileInterceptor`, dùng `pdf-parse` để lấy text thô trực tiếp từ file buffer lưu trong bộ nhớ (không lưu file tạm ở đĩa).
3. **Chunking:** Văn bản được chia nhỏ thành các đoạn (chunks) khoảng 500 từ (với độ chồng lấp 100 từ) để đảm bảo không mất ngữ cảnh giữa các đoạn (sliding window).
4. **Embedding:** Mỗi đoạn văn bản được gửi đến Google Gemini API (`gemini-embedding-001`) thông qua `EmbeddingService` để tạo Vector Embedding.
5. **Storage:** Lưu trữ đối tượng Document vào MongoDB Atlas, bao gồm tên file và một mảng các `chunks` (mỗi chunk chứa `text` và `embedding` vector).

### 💬 B. Luồng hỏi đáp (Query Phase - RAG Flow)
1. **User Question:** Người dùng nhập câu hỏi từ Frontend Next.js.
2. **Question Embedding:** Backend tạo vector cho câu hỏi bằng model `gemini-embedding-001`.
3. **Vector Search:** Sử dụng toán tử `$vectorSearch` của MongoDB Atlas để tìm ra 5 đoạn văn bản có độ tương đồng (Cosine Similarity) cao nhất với câu hỏi.
4. **Context Construction:** Gộp 5 đoạn văn bản đó thành một khối văn bản gọi là "Context".
5. **Prompt Engineering:** Tạo một System Prompt yêu cầu AI chỉ trả lời dựa trên Context được cung cấp.
6. **LLM Generation:** Gửi Prompt + Câu hỏi đến model `gemma-4-31b-it`.
7. **Response:** Trả kết quả về cho người dùng kèm theo danh sách các tài liệu nguồn (sources).

---

## ⚙️ 6. Cách xử lý đặc biệt (Specific Handling)

- **Memory Buffer Parsing:** Xử lý file trực tiếp từ RAM bằng memory buffer, loại bỏ nguy cơ rò rỉ hoặc quá tải ổ cứng do lưu trữ file tạm.
- **Strict Typing:** Cả hai dự án Next.js và NestJS được viết 100% bằng TypeScript, giúp kiểm soát dữ liệu đầu vào chặt chẽ và an toàn.
- **Vector Search Index:** MongoDB yêu cầu tạo một index tên là `vector_index` trên trường `chunks.embedding` để có thể thực hiện tìm kiếm vector.
- **Validation:** Nếu AI không tìm thấy thông tin trong Context, nó được yêu cầu trả lời: *"Tôi không tìm thấy thông tin này trong tài liệu được cung cấp."* để tránh tình trạng "ảo giác" (hallucination).

---

## 📝 7. Ghi chú cấu hình
Cần có file `.env` ở thư mục `backend/` với các biến:
- `MONGODB_URI`: Đường dẫn kết nối MongoDB Atlas.
- `GEMINI_API_KEY`: API Key từ Google AI Studio.
- `PORT`: Cổng chạy server (mặc định 5000).
