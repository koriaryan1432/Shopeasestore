"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../lib/api";
import ProtectedRoute from "../components/ProtectedRoute";

function OrdersContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders")
      .then(({ data }) => setOrders(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-urbanCoral/10 text-urbanCoral border-urbanCoral/25";
      case "paid":
      case "delivered":
        return "bg-forestGreen/10 text-forestGreen border-forestGreen/25";
      case "shipped":
        return "bg-replasticVistaBlue/10 text-replasticVistaBlue border-replasticVistaBlue/25";
      case "cancelled":
      default:
        return "bg-red/10 text-red border-red/25";
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="w-8 h-8 border border-forestGreen/30 border-t-urbanCoral animate-spin mx-auto mb-4" />
        <p className="text-stoneBrown-600 font-sans font-light text-xs tracking-wider">Syncing order entries...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="bg-white/40 border border-forestGreen/15 p-8 md:p-12 shadow-none">
          <h2 className="font-display font-light text-2xl text-forestGreen mb-3">
            Your Orders
          </h2>
          <p className="text-stoneBrown-600 text-xs font-sans font-light mb-4">
            No order dispatch contexts associated with your account yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
      <h2 className="font-display font-light text-3xl md:text-4xl text-forestGreen mb-10">
        Your Order History
      </h2>
      
      <div className="flex flex-col gap-8">
        {orders.map((order, idx) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="bg-white/40 border border-forestGreen/15 p-6 md:p-8 shadow-none hover:border-forestGreen/30 transition-all flex flex-col gap-6"
          >
            <div className="flex justify-between items-baseline pb-4 border-b border-forestGreen/10">
              <span className="font-serif italic font-light text-xl text-forestGreen">
                Order Reference #{order.id}
              </span>
              <span
                className={`text-[9px] font-display font-bold uppercase tracking-[0.2em] px-3 py-1 border ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between gap-6">
              
              {/* Left Details list */}
              <div className="flex flex-col gap-4 flex-1">
                <span className="text-[9px] font-display font-bold uppercase tracking-[0.2em] text-stoneBrown-500">
                  Purchased Items
                </span>
                <ul className="flex flex-col gap-2.5">
                  {order.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between text-xs text-stoneBrown-700 font-sans font-light border-b border-forestGreen/5 pb-2 last:border-b-0"
                    >
                      <span>
                        {item.name} <strong className="font-semibold text-forestGreen font-sans">x {item.quantity}</strong>
                      </span>
                      <span className="font-semibold text-stoneBrown-800">
                        ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right metadata / Address block */}
              <div className="flex flex-col gap-4 md:w-64 bg-forestGreen/5 p-5 border border-forestGreen/10 justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-display font-bold uppercase tracking-[0.2em] text-urbanCoral">
                    Placed Date
                  </span>
                  <span className="text-[11px] font-sans font-light text-stoneBrown-800">
                    {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })}
                  </span>
                </div>
                
                <div className="flex flex-col gap-1 mt-3">
                  <span className="text-[8px] font-display font-bold uppercase tracking-[0.2em] text-urbanCoral">
                    Delivery Destination
                  </span>
                  <p className="text-[11px] font-sans font-light leading-snug text-stoneBrown-700 break-words line-clamp-3">
                    {order.shipping_address || "No address provided"}
                  </p>
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-forestGreen/10 flex justify-between items-baseline">
              <span className="text-[10px] font-display font-medium text-stoneBrown-600 uppercase tracking-widest">
                Total Transaction Amount
              </span>
              <span className="font-serif text-xl font-bold text-forestGreen">
                ₹{Number(order.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function Orders() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}
