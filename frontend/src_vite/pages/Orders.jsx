import { useEffect, useState } from 'react';
import api from '../api/axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container"><p className="muted">Loading orders...</p></div>;

  if (orders.length === 0) {
    return (
      <div className="container">
        <h2>Your Orders</h2>
        <p className="muted">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Your Orders</h2>
      {orders.map((order) => (
        <div key={order.id} className="order-card">
          <div className="order-header">
            <span>Order #{order.id}</span>
            <span className={`status status-${order.status}`}>{order.status}</span>
          </div>
          <p className="muted">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
          <ul className="order-items">
            {order.items.map((item, idx) => (
              <li key={idx}>
                <span>{item.name} x {item.quantity}</span>
                <span>₹{(Number(item.price) * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="order-total">Total: ₹{Number(order.total_amount).toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
};

export default Orders;
