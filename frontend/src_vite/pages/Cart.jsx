import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Minus, Plus, CreditCard, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cartItems, fetchCart, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const total = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', maxWidth: '600px' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '24px',
            padding: '4rem 2rem',
            boxShadow: 'var(--shadow)',
            backdropFilter: 'var(--glass-blur)'
          }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '50%',
            color: 'var(--color-primary)',
            marginBottom: '1.5rem'
          }}>
            <ShoppingBag size={36} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your Cart is Empty</h2>
          <p style={{ color: 'var(--color-muted)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '12px 30px',
              borderRadius: '30px',
              fontWeight: 600,
              fontSize: '0.95rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--gradient-primary)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer'
            }}>
              <ArrowLeft size={16} /> Continue Shopping
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '950px', padding: '2rem 1.5rem 5rem' }}>
      <motion.h2 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2.5rem' }}
      >
        Your Shopping Cart
      </motion.h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.8fr) 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Cart items list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div 
                key={item.id} 
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ duration: 0.3 }}
                className="cart-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  gap: '1.5rem',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  backdropFilter: 'var(--glass-blur)'
                }}
              >
                <img 
                  src={item.image_url} 
                  alt={item.name} 
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--color-border)' }}
                />
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>{item.name}</h4>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.1rem' }}>
                    ₹{Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: '25px', padding: '4px 10px' }}>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: item.quantity <= 1 ? 'var(--color-muted)' : '#fff',
                      cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: item.quantity >= item.stock ? 'var(--color-muted)' : '#fff',
                      cursor: item.quantity >= item.stock ? 'not-allowed' : 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Delete Button */}
                <motion.button 
                  whileHover={{ scale: 1.05, background: 'rgba(239, 68, 68, 0.15)' }}
                  onClick={() => removeItem(item.id)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: 'var(--color-danger)',
                    padding: '10px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  title="Remove Item"
                >
                  <Trash2 size={16} />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="card"
          style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '20px',
            boxShadow: 'var(--shadow)',
            backdropFilter: 'var(--glass-blur)'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
            Order Summary
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--color-muted)' }}>
              <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--color-muted)' }}>
              <span>Shipping cost</span>
              <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>FREE</span>
            </div>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid var(--color-border)', margin: 0 }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Total Order Value</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
              ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button 
            onClick={() => navigate('/checkout')}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'var(--gradient-primary)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
            }}
          >
            <CreditCard size={18} /> Proceed to Secure Checkout
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default Cart;
