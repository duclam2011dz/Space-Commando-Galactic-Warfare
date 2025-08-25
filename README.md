# 🚀 Space Commando: Galactic Warfare

**Space Commando: Galactic Warfare** là một tựa game bắn súng không gian **multiplayer realtime** được xây dựng bằng:

- **Frontend:** HTML, CSS (Tailwind), JavaScript, Phaser.js  
- **Backend:** Node.js, Express.js, Socket.io  
- **Database:** MongoDB Atlas  
- **Authentication:** JWT + bcrypt  
- **Debug/Logging:** Chalk + AI logger (Gemini/Sentry optional)

---

## 🎮 Tính năng chính
- Multiplayer realtime (đồng bộ chuyển động Player & Bullet qua Socket.io).
- Authentication (Login / Register) với validate cả **client + server-side**.
- Hệ thống chọn **Skin** và **Grid Toggle**, có thể lưu vào database.
- Log hệ thống nhiều cấp độ, có thể bật/tắt từng loại log ngay trong console.
- Hỗ trợ generate password mạnh cho Register.
- Codebase tách module rõ ràng (OOP + MVC).

---

## 🛠 Cấu trúc thư mục

Space-Commando-Galactic-Warfare/
│── public/ # Frontend (HTML, CSS, JS)
│ ├── index.html
│ ├── auth.html
│ ├── js/
│ │ ├── auth/
│ │ ├── MainScene.js
│ │ ├── SpaceCommandoGame.js
│ │ └── ...
│ └── style.css
│
│── server/ # Backend (Node.js + Express + Socket.io)
│ ├── index.js
│ ├── routes/
│ ├── models/
│ ├── utils/
│ └── ...
│
│── .env # Config (PORT, MONGODB_URI, JWT_SECRET, v.v.)
│── .gitignore
│── package.json
│── README.md

---

## 🚀 Cách chạy project

### 1. Clone repo
```bash
git clone https://github.com/<your-username>/Space-Commando-Galactic-Warfare.git
cd Space-Commando-Galactic-Warfare
```

### 2. Cài đặt dependencies
Client (chỉ cần file tĩnh, không cần build).

Server:
```bash
cd server
npm install
```

### 3. Thêm file .env
```env
PORT=3000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_super_strong_secret_key
```

### 4. Chạy server
```bash
npm start
```
→ Mở trình duyệt: http://localhost:3000

---

### 👨‍💻 Development

Linting: ESLint (strict mode, custom config).

Debugger: Logger tùy chỉnh + Chalk (bật/tắt log qua CLI).

AI Debugging: Tích hợp Gemini AI để phân tích runtime error (optional).

---

### 📜 License

MIT License © 2025 Nguyễn Đức Lâm