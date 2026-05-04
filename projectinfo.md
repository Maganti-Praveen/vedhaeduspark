# VedhaEduSpark — Complete Project Reference

> **Last Updated:** May 2026  
> **Version:** 2.0  
> This document provides exhaustive context about the VedhaEduSpark platform so any LLM or developer can understand the entire system without reading the codebase.

---

## 1. Overview

**VedhaEduSpark** is a full-stack **MERN** (MongoDB, Express.js, React, Node.js) **Learning Management System (LMS)** built for **Vedha EduSpark Centre**, a training institute focused on practical, job-ready skills for Computer Science students.

### Core Purpose
- Course enrollment & video-based learning with progress tracking
- Coding practice environment (LeetCode-style) with Judge0 integration
- AI-powered tools (Chat Assistant, Resume Builder, ATS Checker)
- Admin dashboard for managing all platform content
- Gamification (leaderboard, streaks, badges)

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, React Router v6, Framer Motion, react-hot-toast, react-icons |
| Styling | Vanilla CSS with CSS custom properties (design tokens), utility classes |
| Backend | Express.js, Node.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| AI | Groq SDK (Llama/Mixtral models) via `utils/aiService.js` |
| Code Judge | Judge0 CE API for code execution |
| Email | Brevo SMTP (Nodemailer) |
| File Upload | Cloudinary (images, PDFs) |
| PDF Gen | PDFKit (certificates, resumes) |
| Auth | JWT (jsonwebtoken), bcryptjs, Google OAuth (Identity Services) |

---

## 2. Project Structure

```
VedhaEduSpark/
├── assets/              # Brand assets (logo.png)
├── client/              # React frontend (Vite)
│   ├── public/          # Static files (logo.png, manifest.json, sw.js, icons/)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/      # ErrorBoundary, ProtectedRoute, Skeleton
│   │   │   ├── dashboard/   # DashboardLayout (sidebar + outlet)
│   │   │   └── landing/     # Navbar, Footer
│   │   ├── contexts/        # AuthContext (login, register, googleLogin, logout)
│   │   ├── services/        # api.js (axios instance + all API functions)
│   │   ├── pages/
│   │   │   ├── public/      # Home, Courses, About, Contact, NotFound
│   │   │   ├── auth/        # Login, Register, ForgotPassword, ResetPassword, CreateAdmin
│   │   │   ├── dashboard/   # All user dashboard pages (18 pages)
│   │   │   │   └── resume/  # ATSChecker, ResumeBuilder, ATSOptimizer
│   │   │   ├── coding/      # ProblemSolve (Monaco editor IDE)
│   │   │   └── admin/       # Admin.jsx, AdminCourses, AdminProblems, etc.
│   │   ├── App.jsx          # All routes, lazy loading, PageLoader
│   │   ├── main.jsx         # Entry point, Google Fonts
│   │   └── index.css        # Design system (CSS custom properties, utilities)
│   └── index.html           # Favicon = logo.png
├── server/
│   ├── config/db.js         # MongoDB connection
│   ├── middleware/auth.js   # protect (JWT), admin (role check)
│   ├── models/              # 17 Mongoose models
│   ├── routes/              # 22 route files
│   ├── utils/
│   │   ├── aiService.js     # Groq AI with system prompts
│   │   ├── emailService.js  # 5 email templates with logo header
│   │   └── notificationHelper.js
│   ├── seed.js              # Database seeder
│   ├── server.js            # Express app, route mounting, error handling
│   └── .env                 # Environment variables (NEVER commit)
```

---

## 3. Database Models (17 total)

| Model | Collection | Key Fields | Purpose |
|-------|-----------|------------|---------|
| **User** | users | name, email, password, role (user/admin), googleId, authProvider, avatar, bio, college, branch, year, skills, solvedProblems, progressStats, streak, lastActive, badges, rank | Core user model |
| **Course** | courses | title, description, price, image, sections[{title, contents[{title, type, url, duration}]}], category, level | Course with nested sections/contents |
| **Enrollment** | enrollments | userId, courseId, progress, completedContents[] | Tracks user progress in courses |
| **Problem** | problems | title, description, difficulty, category, examples[], constraints, starterCode{}, testCases[], solution | Coding problems |
| **Submission** | submissions | userId, problemId, code, language, status, runtime, memory | Code submissions |
| **Discussion** | discussions | userId, content, parentId, likes[], courseId | Threaded discussions |
| **Coupon** | coupons | code, courseId, discount, isUsed, userId, expiresAt | Course enrollment coupons |
| **Job** | jobs | title, company, location, type, salary, description, requirements[], applyUrl | Job listings |
| **Resource** | resources | title, description, url, category, type | Learning resources |
| **Notification** | notifications | userId, type, title, message, link, read | In-app notifications |
| **EBook** | ebooks | title, author, description, price, coverImage, pdfUrl, qrCodeUrl, category | Digital books marketplace |
| **Quiz** | quizzes | title, description, courseId, questions[{question, options[], correctAnswer}], duration | Course-linked quizzes |
| **QuizAttempt** | quizattempts | userId, quizId, answers[], score, completedAt | Quiz attempt records |
| **Event** | events | title, description, date, location, type, registrationUrl, image | Events/hackathons |
| **Review** | reviews | userId, courseId, rating, comment | Course reviews |
| **Resume** | resumes | userId (unique), name, title, email, phone, etc., selectedTemplate | Persisted resume data |
| **Subject** | subjects | name, semester, branch, resources[] | Academic subjects |

---

## 4. API Routes (22 route files)

### Authentication (`/api/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /register | ❌ | Register new user |
| POST | /login | ❌ | Email/password login |
| POST | /google | ❌ | Google OAuth login/register |
| POST | /create-admin | ❌ | Create admin account (requires ADMIN_SECRET) |
| GET | /me | ✅ | Get current user |
| PUT | /profile | ✅ | Update profile |
| POST | /forgot-password | ❌ | Send reset email |
| POST | /reset-password/:token | ❌ | Reset password |

### Courses (`/api/courses`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | ❌ | List all courses |
| GET | /:id | ❌ | Get single course |

### Enrollments (`/api/enrollments`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | ✅ | User's enrollments |
| POST | / | ✅ | Enroll (with coupon) |
| PUT | /:id/complete-content | ✅ | Mark content done |
| PUT | /:id/uncomplete-content | ✅ | Unmark content |
| PUT | /:id/progress | ✅ | Update progress |

### Problems & Judge (`/api/problems`, `/api/judge`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /problems | ❌ | List problems |
| GET | /problems/:id | ❌ | Get problem |
| POST | /judge/submit | ✅ | Submit code to Judge0 |
| POST | /judge/run | ✅ | Run code (no save) |

### Resume Tools (`/api/resume`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /saved | ✅ | Get saved resume |
| PUT | /saved | ✅ | Save/update resume |
| POST | /ats-check | ✅ | ATS compatibility check |
| POST | /optimize | ✅ | AI optimize resume |
| POST | /generate-summary | ✅ | AI generate summary |
| POST | /generate-pdf | ✅ | Generate resume PDF |

### Admin (`/api/admin`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /stats | Admin | Dashboard stats |
| GET | /users | Admin | List all users |
| PUT | /users/:id/role | Admin | Change user role |
| DELETE | /users/:id | Admin | Delete user |
| POST | /notify | Admin | Send email to users |

### Other Routes
| Route | Description |
|-------|-------------|
| `/api/coupons` | CRUD coupons (admin), verify/redeem (user) |
| `/api/ebooks` | CRUD ebooks (admin), list/purchase (user) |
| `/api/quizzes` | CRUD quizzes (admin), attempt/results (user) |
| `/api/events` | CRUD events (admin), list (user) |
| `/api/jobs` | CRUD jobs (admin), list (user) |
| `/api/resources` | CRUD resources (admin), list (user) |
| `/api/reviews` | Create/list course reviews |
| `/api/discussions` | Threaded discussions (CRUD, likes) |
| `/api/ai` | AI chat assistant |
| `/api/certificates` | Generate course completion PDF certificates |
| `/api/notifications` | User notifications (list, mark read) |
| `/api/leaderboard` | Top users by solved problems |
| `/api/upload` | Cloudinary file upload |
| `/api/subjects` | Academic subjects CRUD |
| `/api/submissions` | User code submissions |

---

## 5. Frontend Pages & Routes

### Public Pages (no auth required)
| Route | Page | Layout |
|-------|------|--------|
| `/` | Home | PublicLayout (Navbar + Footer) |
| `/courses` | Course Catalog | PublicLayout |
| `/about` | About Us | PublicLayout |
| `/contact` | Contact Form | PublicLayout |

### Auth Pages (standalone, no Navbar/Footer)
| Route | Page |
|-------|------|
| `/login` | Login (email + Google OAuth) |
| `/register` | Register (email + Google OAuth) |
| `/forgot-password` | Forgot Password |
| `/reset-password/:token` | Reset Password |
| `/create-admin` | Admin Account Creation (secret code gated) |

### Dashboard (Protected — requires login)
| Route | Page | Sidebar Label |
|-------|------|---------------|
| `/dashboard` | Dashboard Home (stats, quick links) | Home |
| `/dashboard/learning` | Browse & learn courses | Learning |
| `/dashboard/my-courses` | Enrolled courses | My Courses |
| `/dashboard/course/:id` | Course viewer (video player + sidebar) | — |
| `/dashboard/practice` | Coding problems list | Practice |
| `/dashboard/community` | Discussion forum | Community |
| `/dashboard/ai-assistant` | AI Chat (Groq-powered) | AI Assistant |
| `/dashboard/certificates` | Download course certificates | Certificates |
| `/dashboard/jobs` | Job listings | Jobs |
| `/dashboard/resume-tools` | Resume Builder + ATS tools | Resume Tools |
| `/dashboard/progress` | Stats & progress charts | Progress |
| `/dashboard/resources` | Study resources | Resources |
| `/dashboard/ebooks` | E-Book marketplace | E-Books |
| `/dashboard/leaderboard` | Coding leaderboard | Leaderboard |
| `/dashboard/quizzes` | Quiz taking | Quizzes |
| `/dashboard/events` | Events listing | Events |
| `/dashboard/profile` | User profile editor | Profile |
| `/dashboard/notifications` | Notifications list | — |

### Admin Panel (requires admin role)
| Route | Page |
|-------|------|
| `/admin` | Admin Dashboard (stats overview) |
| `/admin/analytics` | Charts & analytics |
| `/admin/courses` | Manage courses (full CRUD) |
| `/admin/coupons` | Manage coupons |
| `/admin/ebooks` | Manage e-books |
| `/admin/problems` | Manage coding problems |
| `/admin/jobs` | Manage job listings |
| `/admin/resources` | Manage resources |
| `/admin/quizzes` | Manage quizzes |
| `/admin/events` | Manage events |
| `/admin/users` | Manage users (role toggle, delete) |

### Full-Screen Route
| Route | Page |
|-------|------|
| `/solve/:id` | Problem solving IDE (Monaco Editor) |

---

## 6. Authentication System

### Methods
1. **Email/Password** — Standard registration with bcrypt hashing (12 rounds)
2. **Google OAuth** — Google Identity Services (GSI), token decoded server-side, auto-creates account
3. **Admin Creation** — Secret code gated (`/create-admin`) — verifies `ADMIN_SECRET` env var

### JWT Flow
- Token generated with `jsonwebtoken`, expires in 30 days
- Stored in `localStorage` as `ves_user` (entire user object + token)
- Attached to requests via Axios interceptor (`Authorization: Bearer <token>`)
- 401 responses auto-redirect to `/login` (except on auth routes)

### Roles
- `user` — Default role, access to dashboard features
- `admin` — Full access to admin panel + all user features

---

## 7. AI Integration

### Provider: Groq SDK
- Model: `llama-3.3-70b-versatile` (or configured model)
- Located in `server/utils/aiService.js`

### System Prompts
| Prompt Key | Purpose |
|------------|---------|
| `general` | General AI assistant for students |
| `codingMentor` | Code help, debugging, DSA |
| `atsChecker` | Resume ATS scoring (returns JSON) |
| `resumeOptimizer` | Bullet point optimization |
| `resumeSummary` | Professional summary generation |

### Resume AI Features
- **ATS Checker**: Scores 0-100, section feedback, keyword analysis
- **Resume Builder**: 7-step wizard, 4 templates, AI summary generation, PDF export
- **ATS Optimizer**: Side-by-side bullet comparison, keyword matching

---

## 8. Email System

5 email templates in `server/utils/emailService.js`, all share a branded header with logo:

| Email | Trigger |
|-------|---------|
| **Welcome** | User registration |
| **Coupon** | Payment verified, coupon generated |
| **Reset Password** | Forgot password request |
| **Notification** | Admin sends mass notification |
| **E-Book** | E-book purchase/delivery |

**SMTP**: Brevo (formerly Sendinblue), configured via env vars.

---

## 9. Design System

All design tokens in `client/src/index.css`:

### Colors (CSS Custom Properties)
- Primary: Blue scale (`--blue-50` through `--blue-900`)
- Accent: Orange scale (`--orange-50` through `--orange-600`)
- Neutral: Gray scale (`--gray-50` through `--gray-900`)
- Semantic: Success green, Error red, Warning amber

### Gradients
- `--gradient-blue`: `135deg, #1a56db → #7c3aed`
- `--gradient-orange`: `135deg, #f97316 → #ef4444`
- `--hero-gradient`: Multi-layer background for landing page

### Component Classes
- `.btn-primary` — Blue gradient button
- `.input-light` — Styled input with border
- `.card-glass` — Glassmorphism card
- `.hero-bg` — Gradient background for auth pages

### Typography
- Font: **Poppins** (Google Fonts), loaded in `main.jsx`

---

## 10. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | ✅ | Server port (default: 5000) |
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | JWT signing secret |
| `JUDGE0_API_URL` | ✅ | Judge0 CE endpoint |
| `NODE_ENV` | ❌ | development / production |
| `BREVO_SMTP_HOST` | ✅ | SMTP host |
| `BREVO_SMTP_PORT` | ✅ | SMTP port (587) |
| `BREVO_SMTP_USER` | ✅ | SMTP user |
| `BREVO_SMTP_PASS` | ✅ | SMTP password |
| `EMAIL_FROM_NAME` | ❌ | Sender name |
| `EMAIL_FROM_ADDRESS` | ❌ | Sender email |
| `CLIENT_URL` | ✅ | Frontend URL (for email links) |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `GROQ_API_KEY` | ✅ | Groq AI API key |
| `ADMIN_SECRET` | ✅ | Secret code for admin creation |
| `LOGO_URL` | ❌ | Logo URL for emails |
| `VITE_API_URL` | ❌ | Client-side API base URL |
| `VITE_GOOGLE_CLIENT_ID` | ❌ | Google OAuth Client ID |

---

## 11. Key Architectural Patterns

### Frontend
- **Lazy Loading**: All pages use `lazyRetry()` wrapper with retry logic
- **Error Boundary**: Global catch for React render errors
- **Auth Context**: Centralized auth state (`useAuth()` hook)
- **API Layer**: Single `api.js` file with Axios instance + interceptors
- **Layout Pattern**: PublicLayout (Navbar+Footer), DashboardLayout (sidebar+outlet), AdminLayout (sidebar+outlet)
- **Protected Routes**: `<ProtectedRoute>` and `<AdminRoute>` HOCs

### Backend
- **Middleware Chain**: `protect` → `admin` for admin routes
- **Error Handling**: Global error middleware in server.js
- **File Upload**: Multer → Cloudinary pipeline
- **Rate Limiting**: `express-rate-limit` on AI/resume endpoints
- **PDF Generation**: PDFKit with branded headers

---

## 12. Deployment

### Production Build
```bash
cd client && npm run build    # outputs to client/dist/
```

### Server Serves Frontend
In `server.js`, when `NODE_ENV=production`:
```js
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => res.sendFile(...));
```

### PWA Support
- `manifest.json` in `client/public/`
- `sw.js` (service worker) for offline caching
- Icons in `client/public/icons/` (192px, 512px)

---

## 13. Admin Creation Flow

1. Navigate to `/create-admin`
2. **Step 1**: Enter the `ADMIN_SECRET` code
3. **Step 2**: Fill name, email, password
4. Backend verifies secret code against `process.env.ADMIN_SECRET`
5. If user exists → upgrades to admin role
6. If new → creates user with `role: 'admin'`
7. Auto-login and redirect to `/admin`

---

## 14. Common Patterns

### Adding a New Dashboard Page
1. Create `client/src/pages/dashboard/NewPage.jsx`
2. Add lazy import in `App.jsx`
3. Add `<Route>` under `/dashboard`
4. Add sidebar link in `DashboardLayout.jsx`

### Adding a New Admin CRUD
1. Create model in `server/models/`
2. Create route in `server/routes/`
3. Mount in `server/server.js`
4. Add API methods in `client/src/services/api.js`
5. Create admin page in `client/src/pages/admin/`
6. Add to Admin sidebar in `Admin.jsx`

### Adding a New API
1. Add method to appropriate object in `api.js` (e.g., `courseAPI.newMethod`)
2. Create/update route handler in `server/routes/`
3. If new route file: mount in `server.js`
