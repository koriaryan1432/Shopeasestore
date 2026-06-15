import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, phoneNumber);
      navigate('/verify');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          maxWidth: '440px',
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
          Create Account
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
            <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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

          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
            <input
              type="tel"
              placeholder="Phone number (e.g. +91XXXXXXXXXX)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
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
              placeholder="Password (min 6 characters)"
              minLength={6}
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
            <UserPlus size={18} />
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}>
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
