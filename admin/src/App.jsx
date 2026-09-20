import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { isFirebaseConfigured } from './firebase';
import { AuthProvider } from './context/AuthContext';
import FirebaseSetup from './components/FirebaseSetup';
import Layout from './components/Layout';
import LoginPage, { ProtectedRoute } from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/CoursesPage';
import UnitsPage from './pages/UnitsPage';
import LessonsPage from './pages/LessonsPage';
import CommunityPage from './pages/CommunityPage';
import UsersPage from './pages/UsersPage';
import TranslationsPage from './pages/TranslationsPage';

function AdminApp() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="units" element={<UnitsPage />} />
            <Route path="lessons" element={<LessonsPage />} />
            <Route path="community" element={<CommunityPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="translations" element={<TranslationsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default function App() {
  if (!isFirebaseConfigured()) {
    return <FirebaseSetup />;
  }

  return <AdminApp />;
}
