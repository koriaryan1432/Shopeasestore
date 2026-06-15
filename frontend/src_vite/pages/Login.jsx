import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch google auth configuration
    api.get('/auth/config')
      .then(({ data }) => {
        if (data.googleClientId && !data.googleClientId.includes('placeholder')) {
          setGoogleClientId(data.googleClientId);
          loadGoogleSDK(data.googleClientId);
        } else {
          setGoogleClientId('sandbox');
        }
      })
      .catch(err => {
        console.error('Failed to load auth config:', err);
        setGoogleClientId('sandbox');
      });
  }, []);

  const loadGoogleSDK = (clientId) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCallback,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          { 
            theme: 'filled_black', 
            size: 'large', 
            width: '100%', 
            shape: 'pill',
            text: 'signin_with' 
          }
        );
      }
    };
    document.body.appendChild(script);
  };

  const handleGoogleCallback = async (response) => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(response.credential);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMockGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const mockCredential = JSON.stringify({
        email: 'sandbox.oauth@example.com',
        name: 'Sandbox OAuth User',
        googleId: 'sandbox-google-id-12345'
      });
      await loginWithGoogle(mockCredential);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Sandbox login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '5rem 1.5rem' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="auth-form"
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '20px',
          padding: '2.5rem',
          backdropFilter: 'var(--glass-blur)',
          boxShadow: 'var(--shadow)',
          margin: 0
        }}
      >
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>
          Welcome Back
        </h2>
        
        {error && (
          <p className="error" style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--color-danger)',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            textAlign: 'center'
          }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 12px 12px 42px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--color-border)',
                color: '#fff',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 12px 12px 42px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--color-border)',
                color: '#fff',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'var(--gradient-primary)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <LogIn size={18} />
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
        
        <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <hr style={{ flex: 1, border: 0, borderTop: '1px solid var(--color-border)' }} />
          <span style={{ padding: '0 10px', color: 'var(--color-muted)', fontSize: '0.85rem' }}>or</span>
          <hr style={{ flex: 1, border: 0, borderTop: '1px solid var(--color-border)' }} />
        </div>

        {googleClientId === 'sandbox' ? (
          <button 
            onClick={handleMockGoogleLogin} 
            disabled={loading}
            style={{
              width: '100%',
              background: '#24292e',
              color: '#fff',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'background 0.2s',
              fontWeight: 500
            }}
            onMouseEnter={(e) => e.target.style.background = '#2f363d'}
            onMouseLeave={(e) => e.target.style.background = '#24292e'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-2.19-4.63z" fill="#FBBC05"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Sign in with Google <span style={{ fontSize: '0.75rem', background: 'rgba(139, 92, 246, 0.2)', padding: '2px 6px', borderRadius: '4px', color: '#8b5cf6', marginLeft: '4px' }}>Sandbox</span>
          </button>
        ) : (
          <div id="google-signin-button" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
        )}

        <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}>
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
