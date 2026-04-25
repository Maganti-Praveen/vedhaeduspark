# 🎓 VedhaEduSpark (VES)

**All-in-One CSE Learning + Coding Platform** — A full-stack MERN application combining structured learning, coding practice, and course management.

![Tech Stack](https://img.shields.io/badge/React-Vite-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen) ![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4)

---

## ✨ Features

### 👤 User Features
- **Dashboard** — Stats overview, recent submissions, enrolled courses, streak tracking
- **Learning Hub** — Subject-based notes, videos, and roadmaps
- **My Courses** — Enrolled courses with section-by-section progress tracking
- **Practice IDE** — Monaco code editor with Judge0 integration (C, C++, Java, Python)
- **Profile** — Editable profile with avatar, bio, skills, difficulty breakdown
- **Progress Tracking** — Submission history, success rate, badges

### 🛡️ Admin Features
- **Admin Dashboard** — User/course/problem/submission stats
- **Course Builder** — Dynamic section builder with nested content (video/PDF/notes)
- **Problem Creator** — Full form with sample & hidden test cases
- **User Management** — Role toggle, delete users
- **Bulk Notifications** — Send emails to selected users via modal

### 🔐 Auth & Security
- JWT-based authentication with role-based access (user/admin)
- Forgot/Reset Password with 15-minute token expiry
- Welcome emails on registration via Brevo SMTP

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Code Editor | Monaco Editor |
| Code Execution | Judge0 API (free public) |
| Email | Brevo SMTP (Nodemailer) |
| File Storage | Cloudinary |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Brevo account (for emails)
- Cloudinary account (for uploads)

### 1. Clone the repo
```bash
git clone https://github.com/Maganti-Praveen/vedhaeduspark.git
cd vedhaeduspark
```

### 2. Install dependencies
```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 3. Configure environment
Create `server/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JUDGE0_API_URL=https://ce.judge0.com
NODE_ENV=development

# Brevo SMTP
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_brevo_user
BREVO_SMTP_PASS=your_brevo_pass
EMAIL_FROM_NAME=VedhaEduSpark
EMAIL_FROM_ADDRESS=your_email@example.com

CLIENT_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Run the app
```bash
# Terminal 1 — Backend
cd server && node server.js

# Terminal 2 — Frontend
cd client && npm run dev
```

Open **http://localhost:5173** 🎉

---

## 📁 Project Structure
```
VedhaEduSpark/
├── client/                  # React Frontend (Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # Auth context
│   │   ├── pages/           # All pages (auth, dashboard, admin, coding)
│   │   └── services/        # API service layer
│   └── index.html
├── server/                  # Node.js Backend
│   ├── models/              # Mongoose models
│   ├── routes/              # Express routes
│   ├── middleware/           # Auth middleware
│   └── utils/               # Email, Cloudinary, Judge0 utilities
└── README.md
```

---

## 👨‍💻 Author
**Maganti Praveen**

---

## 📄 License
This project is for educational purposes.
