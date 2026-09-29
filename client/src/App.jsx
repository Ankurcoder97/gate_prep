import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Authenticated Pages
import { DashboardPage } from './pages/DashboardPage';
import { TestSetupPage } from './pages/TestSetupPage';
import { TestInterfacePage } from './pages/TestInterfacePage';
import { TestResultPage } from './pages/TestResultPage';
import { PerformanceAnalyticsPage } from './pages/PerformanceAnalyticsPage';
import { TestHistoryPage } from './pages/TestHistoryPage';

// Admin Pages
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminPapersPage } from './pages/AdminPapersPage';
import { AdminQuestionsPage } from './pages/AdminQuestionsPage';
import { AdminBranchesPage } from './pages/AdminBranchesPage';
import { AdminBlueprintsPage } from './pages/AdminBlueprintsPage';

export const App = () => {
  const { fetchMe, isAuthenticated } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMe();
    }
  }, [isAuthenticated, fetchMe]);

  // Hide standard Navbar & Footer during live examination
  const isLiveExam = location.pathname.includes('/live');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {!isLiveExam && <Navbar />}

      <div className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-test"
            element={
              <ProtectedRoute>
                <TestSetupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests/:id/live"
            element={
              <ProtectedRoute>
                <TestInterfacePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests/:id/result"
            element={
              <ProtectedRoute>
                <TestResultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <PerformanceAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <TestHistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/papers"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPapersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/questions"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminQuestionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/branches"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminBranchesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blueprints"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminBlueprintsPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </div>

      {!isLiveExam && <Footer />}
    </div>
  );
};

export default App;
