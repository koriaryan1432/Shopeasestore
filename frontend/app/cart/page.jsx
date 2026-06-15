"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Minus, Plus, CreditCard, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import ProtectedRoute from "../components/ProtectedRoute";

function CartContent() {
  const { cartItems, fetchCart, updateQuantity, removeItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white/40 border border-forestGreen/15 p-8 md:p-12 shadow-none"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-forestGreen/5 border border-forestGreen/10 rounded-none text-forestGreen mb-6">
            <ShoppingBag size={24} />
          </div>
          <h2 className="font-display font-light text-2xl text-forestGreen mb-3">
            Your Cart is Empty
          </h2>
          <p className="text-stoneBrown-600 text-xs mb-8 font-light max-w-sm mx-auto">
            Explore our curated selection and find pieces selected with detail and intentions.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3.5 bg-forestGreen text-creme border border-forestGreen font-display font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-urbanCoral hover:border-urbanCoral transition-all duration-300 inline-flex items-center gap-2 cursor-pointer shadow-none"
          >
            <ArrowLeft size={12} /> Continue Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
      
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display font-light text-3xl md:text-4xl text-forestGreen mb-10"
      >
        Your Shopping Cart
      </motion.h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart items list - left panel */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -15 }}
                transition={{ duration: 0.3 }}
                className="flex items-center bg-white/40 border border-forestGreen/10 p-5 gap-5 shadow-none hover:border-forestGreen/25 transition-all"
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 object-cover border border-forestGreen/10 bg-ivory-100 flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="font-serif italic font-light text-lg text-forestGreen truncate mb-1">
                    {item.name}
                  </h4>
                  <p className="font-serif text-sm font-semibold text-stoneBrown-800">
                    ₹
                    {Number(item.price).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>

                {/* Quantity Controls - Editorial hard bordered look */}
                <div className="flex items-center gap-4 bg-white border border-forestGreen/15 px-3 py-1.5 text-forestGreen">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="text-stoneBrown-500 hover:text-forestGreen disabled:opacity-30 transition-colors p-0.5"
                  >
                    <Minus size={10} />
                  </button>
                  <span className="font-sans font-bold text-xs min-w-[16px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="text-stoneBrown-500 hover:text-forestGreen disabled:opacity-30 transition-colors p-0.5"
                  >
                    <Plus size={10} />
                  </button>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-3 border border-red/10 text-red hover:bg-red/5 hover:border-red/20 transition-all flex items-center justify-center cursor-pointer flex-shrink-0"
                  title="Remove Item"
                >
                  <Trash2 size={12} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary Panel - right panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="lg:col-span-4 bg-forestGreen text-creme p-8 shadow-none flex flex-col gap-8 relative overflow-hidden"
        >
          {/* Accent light highlight inside green block */}
          <div className="absolute -top-10 -right-10 w-[150px] h-[150px] bg-urbanCoral/10 rounded-full filter blur-[40px] pointer-events-none" />

          <h3 className="font-display font-bold text-[10px] uppercase tracking-[0.25em] text-urbanCoral pb-4 border-b border-creme/10">
            Order Summary
          </h3>

          <div className="flex flex-col gap-3 text-xs text-creme/80 font-sans font-light">
            <div className="flex justify-between">
              <span>Subtotal ({totalItems} items)</span>
              <span className="font-semibold text-creme">
                ₹
                {total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Context</span>
              <span className="text-urbanCoral font-bold uppercase tracking-wider">
                COMPLIMENTARY
              </span>
            </div>
          </div>

          <hr className="border-creme/10" />

          <div className="flex justify-between items-baseline">
            <span className="text-xs font-display font-medium text-creme/90 uppercase tracking-widest">
              Total Order Value
            </span>
            <span className="font-serif text-2xl font-bold text-urbanCoral">
              ₹
              {total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={() => router.push("/checkout")}
            className="w-full py-4 bg-urbanCoral text-creme border border-urbanCoral font-display font-bold text-[10px] uppercase tracking-[0.25em] hover:bg-creme hover:text-forestGreen hover:border-creme transition-all duration-500 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CreditCard size={14} /> Proceed to Secure Checkout
          </button>
        </motion.div>
        
      </div>
    </div>
  );
}

export default function Cart() {
  return (
    <ProtectedRoute>
      <CartContent />
    </ProtectedRoute>
  );
}
