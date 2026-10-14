import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import SearchPhotoPage from './pages/SearchPhotoPage';
import AddDesignPage from './pages/AddDesignPage';
import DesignListPage from './pages/DesignListPage';
import DesignDetailPage from './pages/DesignDetailPage';
import EditDesignPage from './pages/EditDesignPage';
import UserManagementPage from './pages/UserManagementPage';
import api from './api/client';

function getStoredUser() {
  try {
    const savedUser = localStorage.getItem('narang-user');
    const user = savedUser ? JSON.parse(savedUser) : null;
    return user?.authMethod === 'email-otp' ? user : null;
  } catch {
    return null;
  }
}

function AuthenticatedApp({ user, onLogout }) {
  return (
    <Layout user={user} onLogout={onLogout}>
      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/search-photo" element={<SearchPhotoPage />} />
        <Route
          path="/add-design"
          element={['admin', 'staff'].includes(user.role) ? <AddDesignPage /> : <Navigate to="/" replace />}
        />
        <Route path="/designs" element={<DesignListPage />} />
        <Route path="/designs/:id" element={<DesignDetailPage user={user} />} />
        <Route
          path="/designs/:id/edit"
          element={['admin', 'staff'].includes(user.role) ? <EditDesignPage /> : <Navigate to="/designs" replace />}
        />
        <Route
          path="/users"
          element={user.role === 'admin' ? <UserManagementPage /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  const [user, setUser] = useState(getStoredUser);

  useEffect(() => {
    if (user) {
      localStorage.setItem('narang-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('narang-user');
    }
  }, [user]);

  const handleLogin = async (email, otp) => {
    const { data } = await api.post('/auth/verify-otp', { email, otp });
    const authenticatedUser = { ...data.data, authMethod: 'email-otp' };
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />}
        />
        <Route
          path="/*"
          element={user ? <AuthenticatedApp user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
