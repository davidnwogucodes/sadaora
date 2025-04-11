import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ConfigProvider, Layout, Menu, Button, message, App as AntApp } from 'antd';
import { UserOutlined, LogoutOutlined, HomeOutlined } from '@ant-design/icons';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/profile/Profile';
import Feed from './components/feed/Feed';
import './App.css';

const { Header } = Layout;

// Configure message globally
message.config({
  top: 60,
  duration: 2,
  maxCount: 3,
});

// Navigation component
const Navigation = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const menuItems = [
    {
      key: 'feed',
      icon: <HomeOutlined />,
      label: <Link to="/feed">Feed</Link>,
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">Profile</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
      className: 'ml-auto',
      style: { marginLeft: 'auto' }
    }
  ];

  return (
    <Header className="bg-white shadow-md border-b px-4">
      <div className="max-w-6xl mx-auto flex items-center h-full">
        <Link to="/feed" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 mr-8">
          Discover
        </Link>
        <Menu
          mode="horizontal"
          selectedKeys={[window.location.pathname.split('/')[1] || 'feed']}
          items={menuItems}
          className="border-0 flex-1"
        />
      </div>
    </Header>
  );
};

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Layout className="min-h-screen">
      <Navigation />
      <Layout.Content className="bg-gray-50">
        {children}
      </Layout.Content>
    </Layout>
  );
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#4F46E5',
          borderRadius: 6,
        },
      }}
    >
      <AntApp>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/feed"
                element={
                  <ProtectedRoute>
                    <Feed />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/feed" />} />
            </Routes>
          </Router>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
