"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShoppingCart,
  ShieldCheck,
  Truck,
  Tag,
} from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function ProductDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      api
        .get(`/products/${id}`)
        .then(({ data }) => setProduct(data))
        .catch((err) => console.error(err));
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) return router.push("/login");
    try {
      await addToCart(product.id, 1);
      setMessage("✓ Added to cart successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to add to cart");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (!product) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border border-forestGreen/30 border-t-urbanCoral animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
      
      {/* Back Button */}
      <motion.button
        whileHover={{ x: -6 }}
        onClick={() => router.back()}
        className="flex items-center gap-2.5 px-5 py-2.5 border border-forestGreen/15 hover:border-forestGreen bg-white/30 text-[10px] font-display font-bold uppercase tracking-[0.2em] transition-all duration-300 mb-10"
      >
        <ArrowLeft size={12} className="text-forestGreen" /> Back to Catalog
      </motion.button>

      {/* Product Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-forestGreen/15 bg-white/40 shadow-none">
        
        {/* Left column - Image showcase */}
        <div className="lg:col-span-6 p-6 md:p-10 border-b lg:border-b-0 lg:border-r border-forestGreen/15 bg-white/20 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="border border-forestGreen/10 p-4 bg-white/50 relative"
          >
            {/* Gallery badge */}
            <div className="absolute top-8 left-8 text-[9px] font-display font-bold uppercase tracking-[0.25em] text-urbanCoral bg-white px-2.5 py-1 border border-forestGreen/10">
              Selected Edition
            </div>
            
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-auto max-h-[480px] object-cover block mx-auto"
            />
          </motion.div>
        </div>

        {/* Right column - Editorial metadata & details */}
        <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-between gap-10">
          
          <div className="flex flex-col gap-6">
            <span className="w-fit text-[9px] font-display font-bold uppercase tracking-[0.25em] text-urbanCoral border border-urbanCoral/20 px-3 py-1 bg-urbanCoral/5">
              {product.category_name}
            </span>

            <h2 className="font-display font-light text-3xl md:text-5xl text-forestGreen leading-tight tracking-tight">
              {product.name}
            </h2>

            <p className="font-serif italic font-normal text-3xl text-forestGreen">
              ₹
              {Number(product.price).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </p>

            <p className="text-stoneBrown-700 text-xs md:text-sm leading-relaxed font-sans font-light border-t border-forestGreen/10 pt-6">
              {product.description || "Every item in our collection is curated with attention to craftsmanship and premium longevity. This product embodies our design philosophy, delivering both functionality and an elevated tactile experience."}
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  product.stock > 0 ? "bg-forestGreen" : "bg-red"
                }`}
              />
              <span
                className={`font-display font-bold text-[10px] uppercase tracking-[0.18em] ${
                  product.stock > 0 ? "text-forestGreen" : "text-red"
                }`}
              >
                {product.stock > 0
                  ? `[ ${product.stock} units available in stock ]`
                  : "[ Temporarily Out of Stock ]"}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-4 text-[10px] font-display font-bold uppercase tracking-[0.25em] transition-all duration-500 border ${
                product.stock === 0
                  ? "bg-forestGreen/5 text-stoneBrown-400 border-forestGreen/10 cursor-not-allowed"
                  : "bg-forestGreen text-creme border-forestGreen hover:bg-urbanCoral hover:border-urbanCoral hover:text-creme shadow-none"
              }`}
            >
              <ShoppingCart size={14} className="inline-block mr-2 -mt-0.5" />
              {product.stock === 0
                ? "Out of Stock"
                : "Add to Shopping Cart"}
            </button>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-forestGreen/5 border border-forestGreen/20 text-forestGreen p-3 text-center font-display font-bold text-[9px] uppercase tracking-[0.2em]"
              >
                {message}
              </motion.div>
            )}
          </div>

          {/* Secure Trust Grid */}
          <div className="grid grid-cols-2 gap-6 border-t border-forestGreen/10 pt-8">
            <div className="flex gap-3">
              <ShieldCheck
                size={18}
                className="text-forestGreen flex-shrink-0 mt-0.5"
              />
              <div>
                <h4 className="font-serif italic text-sm text-forestGreen mb-1">
                  100% Quality Assurance
                </h4>
                <p className="text-[11px] text-stoneBrown-500 leading-snug font-sans font-light">
                  Direct sourcing and authenticated warranty contexts.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Truck
                size={18}
                className="text-urbanCoral flex-shrink-0 mt-0.5"
              />
              <div>
                <h4 className="font-serif italic text-sm text-forestGreen mb-1">
                  Secure Free Delivery
                </h4>
                <p className="text-[11px] text-stoneBrown-500 leading-snug font-sans font-light">
                  Insured express shipping, complete dual verification.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-32">
          <div className="w-8 h-8 border border-forestGreen/30 border-t-urbanCoral animate-spin" />
        </div>
      }
    >
      <ProductDetailContent />
    </Suspense>
  );
}
