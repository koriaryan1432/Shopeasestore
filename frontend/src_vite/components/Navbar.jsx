import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ShoppingCart, Inbox, Shield, LogOut, LogIn, UserPlus, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="navbar" style={{
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      borderBottom: '1px solid var(--color-border)',
      background: 'rgba(5, 5, 5, 0.75)',
      backdropFilter: 'blur(20px)'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ShoppingBag size={20} color="#fff" />
        </motion.div>
        <span className="logo" style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
          ShopEase
        </span>
      </Link>

      <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1.8rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          Home
        </Link>
        
        {user ? (
          <>
            <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
              <ShoppingCart size={18} />
              <span>Cart</span>
              {itemCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={itemCount}
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-12px',
                    background: 'var(--color-accent)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--color-bg)'
                  }}
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>
            
            <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Inbox size={18} />
              <span>Orders</span>
            </Link>
            
            {user.role === 'admin' && (
              <Link to="/admin" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                color: 'var(--color-accent)', 
                fontWeight: 600,
                background: 'rgba(219, 70, 239, 0.1)',
                padding: '4px 12px',
                borderRadius: '20px',
                border: '1px solid rgba(219, 70, 239, 0.2)'
              }}>
                <Shield size={16} />
                <span>Admin</span>
              </Link>
            )}

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              paddingLeft: '10px',
              borderLeft: '1px solid var(--color-border)',
              color: 'var(--color-muted)',
              fontSize: '0.9rem'
            }}>
              <User size={16} />
              <span className="nav-user" style={{ color: '#fff', fontWeight: 500 }}>{user.name}</span>
            </div>

            <button 
              onClick={handleLogout} 
              className="btn-link"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.9rem',
                color: 'var(--color-danger)'
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LogIn size={18} />
              <span>Login</span>
            </Link>
            <Link to="/register" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              color: '#fff',
              padding: '8px 18px',
              borderRadius: '20px',
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
            }}
            className="register-nav-btn"
            >
              <UserPlus size={18} />
              <span>Register</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
