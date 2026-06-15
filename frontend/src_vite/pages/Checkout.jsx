import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { cartItems, fetchCart, clearCart } = useCart();
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/orders', { shipping_address: address });
      clearCart();
      await fetchCart();
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container">
        <h2>Checkout</h2>
        <p className="muted">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="container auth-form">
      <h2>Checkout</h2>
      {error && <p className="error">{error}</p>}

      <div className="order-summary">
        {cartItems.map((item) => (
          <div key={item.id} className="order-summary-row">
            <span>{item.name} x {item.quantity}</span>
            <span>₹{(Number(item.price) * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="order-summary-row total">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <textarea
          placeholder="Shipping address"
          rows={3}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Placing order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
