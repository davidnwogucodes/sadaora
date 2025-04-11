import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Header className="bg-white shadow-md border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center flex-1">
          <Link to="/feed" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 mr-8">
            Discover
          </Link>
          <Menu
            mode="horizontal"
            selectedKeys={[window.location.pathname.split('/')[1] || 'feed']}
            className="border-0 min-w-[200px]"
          >
            <Menu.Item key="feed" icon={<HomeOutlined />}>
              <Link to="/feed">Feed</Link>
            </Menu.Item>
            <Menu.Item key="profile" icon={<UserOutlined />}>
              <Link to="/profile">Profile</Link>
            </Menu.Item>
          </Menu>
        </div>
        <Button 
          type="default"
          icon={<LogoutOutlined />} 
          onClick={handleLogout}
          className="ml-4"
        >
          Logout
        </Button>
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
