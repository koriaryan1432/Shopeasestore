import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, ShoppingBag, Users, Inbox, Edit, Trash2, Plus, UserCheck, ShieldCheck, DollarSign, Activity, Settings, RefreshCw } from 'lucide-react';
import api from '../api/axios';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // State
  const [stats, setStats] = useState({ total_users: 0, total_products: 0, total_orders: 0, total_revenue: 0 });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);

  // Forms/Modals State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null if adding new
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: '',
    category_id: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStats();
    fetchProducts();
    fetchOrders();
    fetchUsers();
    fetchCategories();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/orders/admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/admin/list');
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/admin/users');
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/products/categories');
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Open modal to add product
  const handleAddProductClick = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      stock: '',
      image_url: '',
      category_id: categories[0]?.id || ''
    });
    setError('');
    setShowProductModal(true);
  };

  // Open modal to edit product
  const handleEditProductClick = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      image_url: product.image_url || '',
      category_id: product.category_id || ''
    });
    setError('');
    setShowProductModal(true);
  };

  // Submit Product Add/Edit
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (editingProduct) {
        // Edit Product
        const { data } = await api.put(`/products/${editingProduct.id}`, productForm);
        setSuccess('Product updated successfully!');
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...data } : p));
      } else {
        // Add Product
        const { data } = await api.post('/products', productForm);
        setSuccess('Product created successfully!');
        setProducts([data, ...products]);
      }
      setShowProductModal(false);
      fetchStats(); // Update product count
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/products/${productId}`);
      setSuccess('Product deleted successfully!');
      setProducts(products.filter(p => p.id !== productId));
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  // Update Order Status
  const handleOrderStatusChange = async (orderId, newStatus) => {
    setError('');
    setSuccess('');
    try {
      await api.put('/orders/admin/status', { order_id: orderId, status: newStatus });
      setSuccess(`Order status updated to ${newStatus}`);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      fetchStats(); // Update total revenue if status changed from/to cancelled
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  // Toggle User Role
  const handleToggleUserRole = async (userToModify) => {
    const targetRole = userToModify.role === 'admin' ? 'customer' : 'admin';
    if (!window.confirm(`Are you sure you want to change ${userToModify.name}'s role to ${targetRole}?`)) return;
    setError('');
    setSuccess('');
    try {
      await api.put(`/auth/admin/users/${userToModify.id}/role`, { role: targetRole });
      setSuccess(`Updated ${userToModify.name}'s role to ${targetRole}`);
      setUsers(users.map(u => u.id === userToModify.id ? { ...u, role: targetRole } : u));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 700, margin: 0 }}>
          Admin Control Panel
        </h2>
        <motion.button 
          whileTap={{ rotate: 180 }}
          onClick={() => {
            fetchStats();
            fetchProducts();
            fetchOrders();
            fetchUsers();
          }}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '30px' }}
        >
          <RefreshCw size={16} /> Sync Data
        </motion.button>
      </div>

      {/* Tabs Selector */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: '2.5rem',
        overflowX: 'auto',
        paddingBottom: '1px'
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart3 size={18} /> },
          { id: 'products', label: 'Products', icon: <ShoppingBag size={18} /> },
          { id: 'orders', label: 'Orders', icon: <Inbox size={18} /> },
          { id: 'users', label: 'Users', icon: <Users size={18} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 22px',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : 'none',
              borderRadius: 0,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeAdminTab" 
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'var(--color-primary)'
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Messaging alerts */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              padding: '12px 20px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--color-danger)',
              color: 'var(--color-danger)',
              marginBottom: '1.5rem'
            }}
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              padding: '12px 20px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid var(--color-success)',
              color: 'var(--color-success)',
              marginBottom: '1.5rem'
            }}
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* ===================== OVERVIEW TAB ===================== */}
        {activeTab === 'overview' && (
          <div>
            {/* Metrics grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3rem'
            }}>
              <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <DollarSign size={24} />
                </div>
                <div>
                  <span style={{ color: 'var(--color-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Total Revenue</span>
                  <h3 style={{ fontSize: '1.6rem', color: '#10b981', margin: 0, fontWeight: 700 }}>₹{stats.total_revenue.toLocaleString('en-IN')}</h3>
                </div>
              </div>
              <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                  <Inbox size={24} />
                </div>
                <div>
                  <span style={{ color: 'var(--color-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Total Orders</span>
                  <h3 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 700 }}>{stats.total_orders}</h3>
                </div>
              </div>
              <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <span style={{ color: 'var(--color-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Products Catalog</span>
                  <h3 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 700 }}>{stats.total_products}</h3>
                </div>
              </div>
              <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(217, 70, 239, 0.15)', color: '#d946ef' }}>
                  <Users size={24} />
                </div>
                <div>
                  <span style={{ color: 'var(--color-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Registered Users</span>
                  <h3 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 700 }}>{stats.total_users}</h3>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <Activity size={18} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ fontSize: '1.4rem', margin: 0 }}>Recent Activity</h3>
            </div>
            
            <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '15px' }}>Order ID</th>
                    <th style={{ padding: '15px' }}>Customer</th>
                    <th style={{ padding: '15px' }}>Date</th>
                    <th style={{ padding: '15px' }}>Total Amount</th>
                    <th style={{ padding: '15px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border)', fontSize: '0.95rem' }}>
                      <td style={{ padding: '15px', fontWeight: 700 }}>#{order.id}</td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>{order.customer_email}</div>
                      </td>
                      <td style={{ padding: '15px', color: 'var(--color-muted)' }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '15px', fontWeight: 600 }}>₹{order.total_amount}</td>
                      <td style={{ padding: '15px' }}>
                        <span className={`badge badge-${order.status}`} style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)' }}>No orders placed yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== PRODUCTS TAB ===================== */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.4rem', margin: 0 }}>Products in Catalog ({products.length})</h3>
              <button 
                onClick={handleAddProductClick}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '30px' }}
              >
                <Plus size={16} /> Add Product
              </button>
            </div>

            <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '15px' }}>Image</th>
                    <th style={{ padding: '15px' }}>Product Details</th>
                    <th style={{ padding: '15px' }}>Category</th>
                    <th style={{ padding: '15px' }}>Price</th>
                    <th style={{ padding: '15px' }}>Stock</th>
                    <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} style={{ borderBottom: '1px solid var(--color-border)', fontSize: '0.95rem' }}>
                      <td style={{ padding: '15px' }}>
                        <img
                          src={product.image_url || 'https://via.placeholder.com/60'}
                          alt={product.name}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                        />
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: 600, fontSize: '1rem', color: '#fff' }}>{product.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {product.description || 'No description provided.'}
                        </div>
                      </td>
                      <td style={{ padding: '15px', color: 'var(--color-muted)' }}>
                        {product.category_name || 'Uncategorized'}
                      </td>
                      <td style={{ padding: '15px', fontWeight: 700 }}>₹{product.price}</td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          color: product.stock === 0 ? 'var(--color-danger)' : (product.stock < 10 ? '#fb923c' : '#10b981'),
                          fontWeight: product.stock <= 10 ? 600 : 'normal',
                          background: product.stock === 0 ? 'rgba(239, 68, 68, 0.1)' : (product.stock < 10 ? 'rgba(251, 146, 60, 0.1)' : 'rgba(16, 185, 129, 0.1)'),
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.85rem'
                        }}>
                          {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                        </span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleEditProductClick(product)}
                          >
                            <Edit size={12} /> Edit
                          </button>
                          <button
                            style={{ 
                              padding: '6px 12px', 
                              fontSize: '0.85rem', 
                              background: 'rgba(239, 68, 68, 0.1)', 
                              color: '#ef4444', 
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== ORDERS TAB ===================== */}
        {activeTab === 'orders' && (
          <div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>All System Orders ({orders.length})</h3>

            <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '15px' }}>Order Info</th>
                    <th style={{ padding: '15px' }}>Customer</th>
                    <th style={{ padding: '15px' }}>Items Purchased</th>
                    <th style={{ padding: '15px' }}>Shipping Address</th>
                    <th style={{ padding: '15px' }}>Total Amount</th>
                    <th style={{ padding: '15px' }}>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border)', verticalAlign: 'top', fontSize: '0.95rem' }}>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: 700 }}>#{order.id}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                          {new Date(order.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>{order.customer_email}</div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={{ fontSize: '0.85rem', color: '#fff' }}>
                              • {item.name} <strong style={{ color: 'var(--color-muted)' }}>x{item.quantity}</strong>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '15px', fontSize: '0.85rem', maxWidth: '200px', wordBreak: 'break-word', color: 'var(--color-muted)' }}>
                        {order.shipping_address || 'N/A'}
                      </td>
                      <td style={{ padding: '15px', fontWeight: 700, fontSize: '1.05rem' }}>
                        ₹{order.total_amount}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <select
                          value={order.status}
                          onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--color-border)',
                            color: '#fff',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            fontWeight: 600,
                            outline: 'none'
                          }}
                        >
                          <option value="pending" style={{ background: '#13131a', color: '#fb923c' }}>Pending</option>
                          <option value="paid" style={{ background: '#13131a', color: '#10b981' }}>Paid</option>
                          <option value="shipped" style={{ background: '#13131a', color: '#3b82f6' }}>Shipped</option>
                          <option value="delivered" style={{ background: '#13131a', color: '#8b5cf6' }}>Delivered</option>
                          <option value="cancelled" style={{ background: '#13131a', color: '#ef4444' }}>Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== USERS TAB ===================== */}
        {activeTab === 'users' && (
          <div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>User Profiles Management ({users.length})</h3>

            <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '15px' }}>Name & Role</th>
                    <th style={{ padding: '15px' }}>Email Address</th>
                    <th style={{ padding: '15px' }}>Phone Number</th>
                    <th style={{ padding: '15px' }}>Verifications</th>
                    <th style={{ padding: '15px' }}>Created At</th>
                    <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)', fontSize: '0.95rem' }}>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{u.name}</div>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: u.role === 'admin' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          color: u.role === 'admin' ? '#a78bfa' : 'var(--color-muted)',
                          border: `1px solid ${u.role === 'admin' ? 'rgba(139, 92, 246, 0.3)' : 'var(--color-border)'}`,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.02em',
                          display: 'inline-block',
                          marginTop: '4px'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        {u.email}
                        {u.google_id && (
                          <span style={{ marginLeft: '6px', fontSize: '0.7rem', color: '#4285F4', background: 'rgba(66, 133, 244, 0.1)', border: '1px solid rgba(66, 133, 244, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                            Google OAuth
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '15px', color: u.phone_number ? 'inherit' : 'var(--color-muted)' }}>
                        {u.phone_number || 'Not provided'}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>Email:</span>
                            {u.is_email_verified ? (
                              <span style={{ color: '#10b981', fontWeight: 600 }}>Verified</span>
                            ) : (
                              <span style={{ color: 'var(--color-danger)' }}>Pending</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>Phone:</span>
                            {u.is_phone_verified ? (
                              <span style={{ color: '#10b981', fontWeight: 600 }}>Verified</span>
                            ) : (
                              <span style={{ color: 'var(--color-danger)' }}>Pending</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '15px', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', margin: '0 auto' }}
                          onClick={() => handleToggleUserRole(u)}
                        >
                          <UserCheck size={12} /> Toggle Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* ===================== ADD/EDIT PRODUCT MODAL ===================== */}
      <AnimatePresence>
        {showProductModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="card" 
              style={{
                width: '100%',
                maxWidth: '550px',
                padding: '2.5rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                position: 'relative',
                backdropFilter: 'blur(20px)'
              }}
            >
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                {editingProduct ? `Edit ${editingProduct.name}` : 'Create New Catalog Item'}
              </h3>

              <form onSubmit={handleProductSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px', color: 'var(--color-muted)', fontWeight: 600 }}>Product Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Mechanical Keyboard"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                      style={{ padding: '10px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px', color: 'var(--color-muted)', fontWeight: 600 }}>Category</label>
                    <select
                      value={productForm.category_id}
                      onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--color-border)',
                        color: '#fff',
                        height: '42px',
                        outline: 'none'
                      }}
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id} style={{ background: '#1c1c24' }}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px', color: 'var(--color-muted)', fontWeight: 600 }}>Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 1999.00"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required
                      style={{ padding: '10px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px', color: 'var(--color-muted)', fontWeight: 600 }}>Inventory Stock</label>
                    <input
                      type="number"
                      placeholder="e.g. 20"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      required
                      style={{ padding: '10px' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px', color: 'var(--color-muted)', fontWeight: 600 }}>Image URL (Direct link)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                    style={{ padding: '10px' }}
                  />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px', color: 'var(--color-muted)', fontWeight: 600 }}>Description</label>
                  <textarea
                    placeholder="Enter description here..."
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--color-border)',
                      color: '#fff',
                      fontFamily: 'inherit',
                      resize: 'none'
                    }}
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowProductModal(false)}
                    style={{ padding: '12px 25px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: '12px 30px' }}
                  >
                    {loading ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
