import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, ShieldCheck, RefreshCw, Key, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Verify = () => {
  const { user, sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [newPhone, setNewPhone] = useState('');
  
  const [emailLoading, setEmailLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneUpdateLoading, setPhoneUpdateLoading] = useState(false);

  const [emailMessage, setEmailMessage] = useState({ text: '', type: '' });
  const [phoneMessage, setPhoneMessage] = useState({ text: '', type: '' });

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleEmailVerify = async (e) => {
    e.preventDefault();
    setEmailMessage({ text: '', type: '' });
    setEmailLoading(true);
    try {
      await verifyOTP(user.email, emailCode, 'email');
      setEmailMessage({ text: 'Email verified successfully!', type: 'success' });
      setEmailCode('');
    } catch (err) {
      setEmailMessage({ text: err.response?.data?.message || 'Email verification failed', type: 'error' });
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePhoneVerify = async (e) => {
    e.preventDefault();
    setPhoneMessage({ text: '', type: '' });
    setPhoneLoading(true);
    try {
      await verifyOTP(user.phone_number, phoneCode, 'phone');
      setPhoneMessage({ text: 'Phone verified successfully!', type: 'success' });
      setPhoneCode('');
    } catch (err) {
      setPhoneMessage({ text: err.response?.data?.message || 'Phone verification failed', type: 'error' });
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleResendOTP = async (type, identifier) => {
    const setMessage = type === 'email' ? setEmailMessage : setPhoneMessage;
    setMessage({ text: '', type: '' });
    try {
      await sendOTP(identifier, type);
      setMessage({ text: `New OTP code sent to your ${type === 'email' ? 'email' : 'phone'}!`, type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || `Failed to resend OTP to your ${type}`, type: 'error' });
    }
  };

  const handleAddPhone = async (e) => {
    e.preventDefault();
    setPhoneMessage({ text: '', type: '' });
    setPhoneUpdateLoading(true);
    try {
      await api.post('/auth/otp/send', { identifier: newPhone, type: 'phone' });
      const updatedUser = { ...user, phone_number: newPhone, is_phone_verified: 0 };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.location.reload(); 
    } catch (err) {
      setPhoneMessage({ text: err.response?.data?.message || 'Failed to send OTP code to new phone', type: 'error' });
    } finally {
      setPhoneUpdateLoading(false);
    }
  };

  const isEmailVerified = user.is_email_verified === 1;
  const isPhoneVerified = user.is_phone_verified === 1;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '50%',
            color: 'var(--color-primary)',
            marginBottom: '1rem'
          }}>
            <Lock size={28} />
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 700, margin: 0 }}>
            Security & Verification
          </h2>
          <p style={{ color: 'var(--color-muted)', marginTop: '8px' }}>
            Verify your credentials to secure your ShopEase account.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {/* Email Verification Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card" 
            style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={20} style={{ color: 'var(--color-primary)' }} />
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Email Verification</h3>
              </div>
              <span className={`badge ${isEmailVerified ? 'badge-success' : 'badge-danger'}`} style={{
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: isEmailVerified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: isEmailVerified ? '#10b981' : '#ef4444',
                border: `1px solid ${isEmailVerified ? '#10b981' : '#ef4444'}`
              }}>
                {isEmailVerified ? 'Verified' : 'Pending'}
              </span>
            </div>

            <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem', flexGrow: 1 }}>
              Your registered email is: <strong style={{ color: '#fff' }}>{user.email}</strong>. 
              We send invoices and security updates to this inbox.
            </p>

            {emailMessage.text && (
              <p style={{
                color: emailMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                padding: '8px 12px',
                borderRadius: '8px',
                background: emailMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${emailMessage.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
              }}>
                {emailMessage.text}
              </p>
            )}

            {!isEmailVerified ? (
              <form onSubmit={handleEmailVerify} style={{ marginTop: 'auto' }}>
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                  <Key size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                  <input
                    type="text"
                    placeholder="6-digit Email OTP"
                    maxLength={6}
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 42px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--color-border)',
                      color: '#fff',
                      textAlign: 'center',
                      fontSize: '1.2rem',
                      letterSpacing: '4px',
                      fontWeight: 700
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" disabled={emailLoading} style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} />
                    {emailLoading ? 'Verifying...' : 'Verify'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => handleResendOTP('email', user.email)}
                    style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Resend Code"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ marginTop: 'auto', textAlign: 'center', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px dashed rgba(16, 185, 129, 0.2)' }}>
                <p style={{ color: 'var(--color-success)', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} /> Email Verified
                </p>
              </div>
            )}
          </motion.div>

          {/* Phone Verification Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card" 
            style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={20} style={{ color: 'var(--color-accent)' }} />
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Phone Verification</h3>
              </div>
              <span className={`badge ${isPhoneVerified ? 'badge-success' : 'badge-danger'}`} style={{
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: isPhoneVerified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: isPhoneVerified ? '#10b981' : '#ef4444',
                border: `1px solid ${isPhoneVerified ? '#10b981' : '#ef4444'}`
              }}>
                {isPhoneVerified ? 'Verified' : 'Pending'}
              </span>
            </div>

            {user.phone_number ? (
              <>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem', flexGrow: 1 }}>
                  Your registered phone number is: <strong style={{ color: '#fff' }}>{user.phone_number}</strong>.
                  We send real-time SMS delivery notifications to this number.
                </p>

                {phoneMessage.text && (
                  <p style={{
                    color: phoneMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: phoneMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${phoneMessage.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                  }}>
                    {phoneMessage.text}
                  </p>
                )}

                {!isPhoneVerified ? (
                  <form onSubmit={handlePhoneVerify} style={{ marginTop: 'auto' }}>
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                      <Key size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                      <input
                        type="text"
                        placeholder="6-digit Phone OTP"
                        maxLength={6}
                        value={phoneCode}
                        onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, ''))}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 12px 12px 42px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--color-border)',
                          color: '#fff',
                          textAlign: 'center',
                          fontSize: '1.2rem',
                          letterSpacing: '4px',
                          fontWeight: 700
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button type="submit" disabled={phoneLoading} style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <ShieldCheck size={18} />
                        {phoneLoading ? 'Verifying...' : 'Verify'}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleResendOTP('phone', user.phone_number)}
                        style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Resend Code"
                      >
                        <RefreshCw size={16} />
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ marginTop: 'auto', textAlign: 'center', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px dashed rgba(16, 185, 129, 0.2)' }}>
                    <p style={{ color: 'var(--color-success)', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} /> Phone Verified
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem', flexGrow: 1 }}>
                  You have not registered a phone number yet. Add your phone number below to enable SMS notifications and verify your device.
                </p>

                {phoneMessage.text && (
                  <p style={{
                    color: phoneMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: phoneMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${phoneMessage.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                  }}>
                    {phoneMessage.text}
                  </p>
                )}

                <form onSubmit={handleAddPhone} style={{ marginTop: 'auto' }}>
                  <input
                    type="tel"
                    placeholder="e.g. +91XXXXXXXXXX"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--color-border)',
                      color: '#fff',
                      marginBottom: '1rem',
                      fontSize: '1rem'
                    }}
                  />
                  <button type="submit" disabled={phoneUpdateLoading} style={{ width: '100%', padding: '12px' }}>
                    {phoneUpdateLoading ? 'Sending OTP...' : 'Add & Verify Phone'}
                  </button>
                </form>
              </>
            )}
          </motion.div>

        </div>

        {isEmailVerified && (isPhoneVerified || !user.phone_number) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ marginTop: '3.5rem', textAlign: 'center' }}
          >
            <button 
              onClick={() => navigate('/')} 
              style={{ 
                padding: '14px 40px', 
                fontSize: '1.1rem',
                borderRadius: '30px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600,
                background: 'var(--gradient-primary)'
              }}
            >
              Continue to ShopEase <ArrowRight size={18} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Verify;
