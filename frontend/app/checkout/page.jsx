"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import api from "../lib/api";
import { useCart } from "../context/CartContext";
import ProtectedRoute from "../components/ProtectedRoute";

function CheckoutContent() {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { cartItems, fetchCart, clearCart } = useCart();
  const router = useRouter();

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/orders", { shipping_address: address });
      clearCart();
      await fetchCart();
      router.push("/orders");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display font-light text-3xl text-forestGreen mb-4">
          Checkout
        </h2>
        <p className="text-stoneBrown-600 font-sans font-light">Your catalog cart contains no items.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/45 border border-forestGreen/15 p-8 md:p-12 shadow-none max-w-lg w-full"
      >
        <h2 className="font-display font-light text-3xl text-forestGreen text-center mb-8">
          Secure Checkout
        </h2>

        {error && (
          <p className="mb-6 bg-red/5 border border-red/20 text-red text-[11px] uppercase tracking-wider py-3 px-4 text-center font-bold">
            {error}
          </p>
        )}

        <div className="bg-forestGreen text-creme border border-forestGreen/10 p-6 mb-8 flex flex-col gap-4 relative overflow-hidden">
          {/* Subtle glow accent */}
          <div className="absolute -top-10 -right-10 w-[120px] h-[120px] bg-urbanCoral/15 rounded-full filter blur-[35px] pointer-events-none" />

          <h3 className="font-display font-bold text-[9px] uppercase tracking-[0.25em] text-urbanCoral pb-2.5 border-b border-creme/10">
            Order Verification list
          </h3>
          
          <div className="flex flex-col gap-3 max-h-[160px] overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-xs text-creme/80 font-sans font-light"
              >
                <span>
                  {item.name} <strong className="font-semibold text-creme">x {item.quantity}</strong>
                </span>
                <span className="font-semibold text-creme">
                  ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-baseline pt-4 border-t border-creme/10">
            <span className="text-[10px] font-display font-medium text-creme/90 uppercase tracking-widest">
              Total Order Value
            </span>
            <span className="font-serif text-xl font-bold text-urbanCoral">
              ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-display font-bold uppercase tracking-[0.2em] text-stoneBrown-600 mb-0.5">
              Complete Delivery Address
            </label>
            <textarea
              placeholder="Provide street address, suite, city, state, postal code..."
              rows={4}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full px-4 py-3 border border-forestGreen/15 focus:border-forestGreen focus:ring-0 outline-none transition-all duration-300 text-stoneBrown-800 text-xs font-sans font-light bg-white/80 resize-none rounded-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-forestGreen text-creme border border-forestGreen font-display font-bold text-[10px] uppercase tracking-[0.25em] hover:bg-urbanCoral hover:border-urbanCoral hover:text-creme transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Placing Secure Order..." : "Place Insured Order"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function Checkout() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
