import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ProtectedRoute, AdminRoute } from './components/common/ProtectedRoute';
import Navbar from './components/landing/Navbar';
import Footer from './components/landing/Footer';
import DashboardLayout from './components/dashboard/DashboardLayout';

// Retry wrapper for lazy imports — handles Vite chunk loading failures
const lazyRetry = (importFn) =>
  lazy(() =>
    importFn().catch(() =>
      new Promise((resolve) => {
        // Wait and retry once before giving up
        setTimeout(() => resolve(importFn()), 1500);
      })
    )
  );

// Lazy-loaded pages
const Home = lazyRetry(() => import('./pages/public/Home'));
const Courses = lazyRetry(() => import('./pages/public/Courses'));
const About = lazyRetry(() => import('./pages/public/About'));
const Contact = lazyRetry(() => import('./pages/public/Contact'));
const NotFound = lazyRetry(() => import('./pages/public/NotFound'));
const Login = lazyRetry(() => import('./pages/auth/Login'));
const Register = lazyRetry(() => import('./pages/auth/Register'));
const ForgotPassword = lazyRetry(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazyRetry(() => import('./pages/auth/ResetPassword'));
const DashboardHome = lazyRetry(() => import('./pages/dashboard/DashboardHome'));
const Learning = lazyRetry(() => import('./pages/dashboard/Learning'));
const Practice = lazyRetry(() => import('./pages/dashboard/Practice'));
const Progress = lazyRetry(() => import('./pages/dashboard/Progress'));
const Resources = lazyRetry(() => import('./pages/dashboard/Resources'));
const Profile = lazyRetry(() => import('./pages/dashboard/Profile'));
const MyCourses = lazyRetry(() => import('./pages/dashboard/MyCourses'));
const CourseView = lazyRetry(() => import('./pages/dashboard/CourseView'));
const Community = lazyRetry(() => import('./pages/dashboard/Community'));
const AIAssistant = lazyRetry(() => import('./pages/dashboard/AIAssistant'));
const Notifications = lazyRetry(() => import('./pages/dashboard/Notifications'));
const MyCertificates = lazyRetry(() => import('./pages/dashboard/MyCertificates'));
const Jobs = lazyRetry(() => import('./pages/dashboard/Jobs'));
const Leaderboard = lazyRetry(() => import('./pages/dashboard/Leaderboard'));
const Quizzes = lazyRetry(() => import('./pages/dashboard/Quizzes'));
const Events = lazyRetry(() => import('./pages/dashboard/Events'));
const Ebooks = lazyRetry(() => import('./pages/dashboard/Ebooks'));
const ResumeTools = lazyRetry(() => import('./pages/dashboard/ResumeTools'));
const ProblemSolve = lazyRetry(() => import('./pages/coding/ProblemSolve'));

// Admin — proper lazy imports (cached after first load = instant switching)
const AdminLayout = lazyRetry(() => import('./pages/admin/Admin').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazyRetry(() => import('./pages/admin/Admin').then(m => ({ default: m.AdminDashboard })));
const AdminCourses = lazyRetry(() => import('./pages/admin/AdminCourses'));
const AdminProblems = lazyRetry(() => import('./pages/admin/AdminProblems'));
const AdminAnalytics = lazyRetry(() => import('./pages/admin/AdminAnalytics'));
const AdminEbooks = lazyRetry(() => import('./pages/admin/Admin').then(m => ({ default: m.AdminEbooks })));
const AdminUsers = lazyRetry(() => import('./pages/admin/Admin').then(m => ({ default: m.AdminUsers })));
const AdminJobs = lazyRetry(() => import('./pages/admin/AdminJobs'));
const AdminResources = lazyRetry(() => import('./pages/admin/AdminResources'));
const AdminCoupons = lazyRetry(() => import('./pages/admin/AdminCoupons'));
const AdminQuizzes = lazyRetry(() => import('./pages/admin/AdminQuizzes'));
const AdminEvents = lazyRetry(() => import('./pages/admin/AdminEvents'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gray-50)' }}>
    <div className="text-center">
      <img src="/logo.png" alt="VedhaEduSpark" className="w-14 h-14 mx-auto mb-4 rounded-xl object-contain animate-pulse" />
      <p className="text-sm font-medium" style={{ color: 'var(--gray-400)' }}>Loading...</p>
    </div>
  </div>
);

// Public layout wrapper
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <Suspense fallback={<PageLoader />}>{children}</Suspense>
    <Footer />
  </>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#ffffff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                fontFamily: "'Poppins', sans-serif",
              },
              success: { iconTheme: { primary: '#16a34a', secondary: '#ffffff' } },
              error: { iconTheme: { primary: '#dc2626', secondary: '#ffffff' } },
            }}
          />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/courses" element={<PublicLayout><Courses /></PublicLayout>} />
              <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Dashboard Routes (Protected) */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<DashboardHome />} />
                <Route path="learning" element={<Learning />} />
                <Route path="my-courses" element={<MyCourses />} />
                <Route path="course/:id" element={<CourseView />} />
                <Route path="practice" element={<Practice />} />
                <Route path="community" element={<Community />} />
                <Route path="ai-assistant" element={<AIAssistant />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="certificates" element={<MyCertificates />} />
                <Route path="jobs" element={<Jobs />} />
                <Route path="progress" element={<Progress />} />
                <Route path="resources" element={<Resources />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="quizzes" element={<Quizzes />} />
                <Route path="events" element={<Events />} />
                <Route path="ebooks" element={<Ebooks />} />
                <Route path="resume-tools" element={<ResumeTools />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* IDE Route (Protected, full-screen) */}
              <Route path="/solve/:id" element={<ProtectedRoute><ProblemSolve /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="ebooks" element={<AdminEbooks />} />
                <Route path="problems" element={<AdminProblems />} />
                <Route path="jobs" element={<AdminJobs />} />
                <Route path="resources" element={<AdminResources />} />
                <Route path="quizzes" element={<AdminQuizzes />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
