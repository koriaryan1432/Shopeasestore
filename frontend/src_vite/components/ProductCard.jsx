import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tag, ArrowRight } from 'lucide-react';

const ProductCard = ({ product }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    whileHover={{ y: -8, transition: { duration: 0.2, ease: 'easeOut' } }}
    transition={{ duration: 0.4 }}
    style={{ height: '100%' }}
  >
    <Link to={`/products/${product.id}`} className="product-card" style={{ display: 'block', height: '100%' }}>
      <div className="product-card-image" style={{ overflow: 'hidden', position: 'relative', borderRadius: '12px' }}>
        <img 
          src={product.image_url} 
          alt={product.name} 
          style={{ 
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover' 
          }} 
          className="card-img"
        />
      </div>
      <div className="product-card-body">
        <span className="category-tag">
          <Tag size={12} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
          {product.category_name}
        </span>
        <h3 style={{ fontSize: '1.1rem', margin: '8px 0 4px', fontWeight: 600 }}>{product.name}</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <p className="price" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)' }}>
            ₹{Number(product.price).toFixed(2)}
          </p>
          <span style={{ 
            color: 'var(--color-primary)', 
            display: 'flex', 
            alignItems: 'center', 
            fontSize: '0.85rem', 
            fontWeight: 600,
            gap: '2px'
          }}
          className="view-link"
          >
            Explore <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default ProductCard;
