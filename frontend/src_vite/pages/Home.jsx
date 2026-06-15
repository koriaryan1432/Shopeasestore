import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Shield, Truck, CreditCard } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/categories').then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;

    setLoading(true);
    api.get('/products', { params })
      .then(({ data }) => setProducts(data))
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
      
      {/* Hero Banner Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(217, 70, 239, 0.05) 50%, rgba(5, 5, 5, 0) 100%)',
          border: '1px solid var(--color-border)',
          borderRadius: '24px',
          padding: '4rem 3rem',
          textAlign: 'center',
          marginBottom: '4rem',
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'var(--glass-blur)'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          right: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(217, 70, 239, 0.15) 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#a78bfa',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.5rem'
            }}
          >
            <Sparkles size={14} /> ShopEase Exclusive Collection
          </motion.div>

          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '1rem',
            letterSpacing: '-0.04em'
          }}>
            Discover Next-Level{' '}
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa, #f472b6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Premium Products
            </span>
          </h1>

          <p style={{
            color: 'var(--color-muted)',
            fontSize: '1.15rem',
            maxWidth: '600px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6
          }}>
            Curated collections selected with perfection. Unlock lightning-fast express delivery, dual OTP verification security, and secure checkout.
          </p>

          {/* Feature Badges */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2.5rem',
            flexWrap: 'wrap',
            fontSize: '0.9rem',
            color: '#d1d5db'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} style={{ color: '#8b5cf6' }} />
              <span>OTP Secure Accounts</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} style={{ color: '#d946ef' }} />
              <span>Express Delivery</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} style={{ color: '#10b981' }} />
              <span>Seamless Payments</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters & Tabs Section */}
      <div className="filters" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {/* Search Input wrapper */}
        <div style={{ position: 'relative', maxWidth: '500px', width: '100%' }}>
          <Search 
            size={18} 
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-muted)'
            }}
          />
          <input
            type="text"
            placeholder="Search our catalog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            style={{
              paddingLeft: '48px',
              width: '100%',
              borderRadius: '30px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--color-border)',
              color: '#fff',
              fontSize: '1rem',
              height: '50px',
              transition: 'all 0.3s ease'
            }}
          />
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Filter by Category
          </span>
          <div className="category-tabs" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              className={`tab-btn ${category === '' ? 'active' : ''}`}
              onClick={() => setCategory('')}
              style={{
                borderRadius: '30px',
                padding: '10px 24px',
                fontWeight: 500,
                fontSize: '0.9rem',
                position: 'relative'
              }}
            >
              All Items
              {category === '' && (
                <motion.div 
                  layoutId="activeTabUnderline" 
                  className="active-tab-underline"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '20%',
                    right: '20%',
                    height: '2px',
                    background: 'var(--color-primary)'
                  }}
                />
              )}
            </button>
            {categories.map((c) => (
              <button 
                key={c.id}
                className={`tab-btn ${category === String(c.id) ? 'active' : ''}`}
                onClick={() => setCategory(String(c.id))}
                style={{
                  borderRadius: '30px',
                  padding: '10px 24px',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  position: 'relative'
                }}
              >
                {c.name}
                {category === String(c.id) && (
                  <motion.div 
                    layoutId="activeTabUnderline" 
                    className="active-tab-underline"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: '20%',
                      right: '20%',
                      height: '2px',
                      background: 'var(--color-primary)'
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products list section */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
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
      ) : products.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '5rem 0' }}
        >
          <p className="muted" style={{ fontSize: '1.2rem' }}>No products match your criteria.</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="product-grid"
        >
          <AnimatePresence>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default Home;
