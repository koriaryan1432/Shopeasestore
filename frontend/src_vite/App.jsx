import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Verify from './pages/Verify';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();
  const showVerificationBanner = user && (user.is_email_verified === 0 || (user.phone_number && user.is_phone_verified === 0));

  return (
    <>
      <Navbar />
      {showVerificationBanner && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.15), rgba(217, 70, 239, 0.15))',
          backdropFilter: 'var(--glass-blur)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '12px 20px',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: '#f3f4f6',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          animation: 'fadeIn 0.3s ease-out',
          zIndex: 90,
          position: 'relative'
        }}>
          <span>⚠️ Your account is not fully verified. Please verify your email/phone number to secure your account.</span>
          <Link to="/verify" style={{
            color: 'var(--color-accent)',
            fontWeight: 600,
            textDecoration: 'underline',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '0.8'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Verify Now
          </Link>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/verify"
          element={
            <ProtectedRoute>
              <Verify />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;

