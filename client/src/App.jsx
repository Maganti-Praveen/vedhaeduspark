import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ProtectedRoute, AdminRoute } from './components/common/ProtectedRoute';
import Navbar from './components/landing/Navbar';
import Footer from './components/landing/Footer';
import DashboardLayout from './components/dashboard/DashboardLayout';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/public/Home'));
const Courses = lazy(() => import('./pages/public/Courses'));
const About = lazy(() => import('./pages/public/About'));
const Contact = lazy(() => import('./pages/public/Contact'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const Learning = lazy(() => import('./pages/dashboard/Learning'));
const Practice = lazy(() => import('./pages/dashboard/Practice'));
const Progress = lazy(() => import('./pages/dashboard/Progress'));
const Resources = lazy(() => import('./pages/dashboard/Resources'));
const Profile = lazy(() => import('./pages/dashboard/Profile'));
const MyCourses = lazy(() => import('./pages/dashboard/MyCourses'));
const CourseView = lazy(() => import('./pages/dashboard/CourseView'));
const ProblemSolve = lazy(() => import('./pages/coding/ProblemSolve'));

// Admin — proper lazy imports (cached after first load = instant switching)
const AdminLayout = lazy(() => import('./pages/admin/Admin').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('./pages/admin/Admin').then(m => ({ default: m.AdminDashboard })));
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses'));
const AdminProblems = lazy(() => import('./pages/admin/AdminProblems'));
const AdminSubjects = lazy(() => import('./pages/admin/Admin').then(m => ({ default: m.AdminSubjects })));
const AdminUsers = lazy(() => import('./pages/admin/Admin').then(m => ({ default: m.AdminUsers })));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gray-50)' }}>
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center font-bold text-white text-lg animate-pulse"
        style={{ background: 'var(--gradient-orange)', boxShadow: 'var(--shadow-orange)' }}>V</div>
      <p className="text-sm" style={{ color: 'var(--gray-400)' }}>Loading...</p>
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
                <Route path="progress" element={<Progress />} />
                <Route path="resources" element={<Resources />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* IDE Route (Protected, full-screen) */}
              <Route path="/solve/:id" element={<ProtectedRoute><ProblemSolve /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="subjects" element={<AdminSubjects />} />
                <Route path="problems" element={<AdminProblems />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
