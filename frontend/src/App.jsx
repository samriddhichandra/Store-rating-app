import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import BackgroundEffects from './components/BackgroundEffects';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UpdatePassword from './pages/UpdatePassword';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAddUser from './pages/admin/AdminAddUser';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminStores from './pages/admin/AdminStores';
import AdminAddStore from './pages/admin/AdminAddStore';

import StoreList from './pages/user/StoreList';
import OwnerDashboard from './pages/owner/OwnerDashboard';

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-paper text-ink antialiased transition-colors duration-300 relative">
      {/* Global background effects: grid patterns, decorative shapes, noise texture */}
      <BackgroundEffects />
      {user && <Navbar />}
      <main className="relative z-10">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/update-password"
          element={
            <ProtectedRoute>
              <UpdatePassword />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/new"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminAddUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminUserDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stores"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminStores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stores/new"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminAddStore />
            </ProtectedRoute>
          }
        />

        {/* Normal user */}
        <Route
          path="/stores"
          element={
            <ProtectedRoute roles={['NORMAL_USER']}>
              <StoreList />
            </ProtectedRoute>
          }
        />

        {/* Store owner */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute roles={['STORE_OWNER']}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </main>
    </div>
  );
}
