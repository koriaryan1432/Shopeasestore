import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, ShieldCheck, Truck, Clock, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => setProduct(data));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) return navigate('/login');
    await addToCart(product.id, 1);
    setMessage('✓ Added to cart successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  if (!product) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '10rem 0' }}>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(139, 92, 246, 0.1)',
            borderTop: '3px solid var(--color-primary)',
            borderRadius: '50%'
          }}
        />
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1100px', padding: '2rem 1.5rem' }}>
      
      {/* Back Button */}
      <motion.button
        whileHover={{ x: -4 }}
        onClick={() => navigate(-1)}
        className="btn-secondary"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          borderRadius: '30px',
          marginBottom: '2rem',
          fontSize: '0.9rem',
          fontWeight: 600
        }}
      >
        <ArrowLeft size={16} /> Back to Catalog
      </motion.button>

      <div className="product-detail" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 1.1fr) 1fr',
        gap: '3rem',
        alignItems: 'start'
      }}>
        {/* Animated Image Wrapper */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="product-detail-image"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--color-border)',
            borderRadius: '20px',
            padding: '1rem',
            overflow: 'hidden',
            boxShadow: 'var(--shadow)'
          }}
        >
          <img 
            src={product.image_url} 
            alt={product.name} 
            style={{
              width: '100%',
              borderRadius: '16px',
              objectFit: 'cover',
              maxHeight: '500px',
              display: 'block'
            }}
          />
        </motion.div>

        {/* Animated Info Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="product-detail-info"
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <span className="category-tag" style={{ width: 'fit-content', marginBottom: '1rem' }}>
            {product.category_name}
          </span>
          
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.75rem', lineHeight: '1.2' }}>
            {product.name}
          </h2>
          
          <p className="price" style={{
            fontSize: '2rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #fff, var(--color-muted))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 1.5rem'
          }}>
            ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          
          <p className="description" style={{
            color: 'var(--color-muted)',
            fontSize: '1.05rem',
            lineHeight: '1.6',
            marginBottom: '2rem',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '2rem'
          }}>
            {product.description || 'No description provided for this product.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: product.stock > 0 ? 'var(--color-success)' : 'var(--color-danger)'
            }} />
            <span style={{
              fontWeight: 600,
              fontSize: '0.95rem',
              color: product.stock > 0 ? '#10b981' : '#ef4444'
            }}>
              {product.stock > 0 ? `${product.stock} units left in stock` : 'Out of stock'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
            <button 
              onClick={handleAddToCart} 
              disabled={product.stock === 0}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                background: product.stock === 0 ? 'rgba(255, 255, 255, 0.05)' : 'var(--gradient-primary)',
                color: product.stock === 0 ? 'var(--color-muted)' : '#fff',
                border: 'none',
                cursor: product.stock === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <ShoppingCart size={20} />
              {product.stock === 0 ? 'Temporarily Out of Stock' : 'Add to Shopping Cart'}
            </button>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid var(--color-success)',
                  color: 'var(--color-success)',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }}
              >
                {message}
              </motion.div>
            )}
          </div>

          {/* Secure Trust Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '2rem'
          }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <ShieldCheck size={20} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>100% Quality Assurance</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted)' }}>Genuine products sourced directly</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Truck size={20} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Secure Free Delivery</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted)' }}>Insured express dispatch options</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;
