"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Shield, Truck, CreditCard, ArrowDownRight } from "lucide-react";
import api from "./lib/api";
import ProductCard from "./components/ProductCard";
import Marquee from "./components/Marquee";
import KineticHeading from "./components/KineticHeading";
import Magnetic from "./components/Magnetic";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products/categories")
      .then(({ data }) => setCategories(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;

    setLoading(true);
    api
      .get("/products", { params })
      .then(({ data }) => setProducts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-16 md:gap-24">
      
      {/* 1. HERO SECTION: Asymmetric split grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 border border-forestGreen/15 bg-white/40 shadow-none">
        
        {/* Left side panel - Ivory details and heading */}
        <div className="lg:col-span-8 p-8 md:p-16 border-b lg:border-b-0 lg:border-r border-forestGreen/15 flex flex-col justify-between gap-12">
          
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 text-[10px] font-display font-bold uppercase tracking-[0.25em] text-urbanCoral">
              <Sparkles size={11} /> 
              <span>ShopEase Curated Catalog</span>
            </div>

            <h1 className="font-display font-light text-4xl md:text-6xl text-forestGreen leading-[1.05] tracking-tight flex flex-col gap-1 items-start">
              <KineticHeading text="Discover Next-Level" />
              <KineticHeading 
                text="Premium Goods" 
                className="font-serif italic font-normal text-urbanCoral"
              />
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <p className="text-stoneBrown-700 text-xs md:text-sm leading-relaxed font-sans font-light">
              Curated collections selected with perfection. Unlock lightning-fast express delivery, dual OTP verification security, and secure checkout. Designed for modern life.
            </p>
            <div className="hidden md:flex justify-end pr-4 text-forestGreen/30">
              <ArrowDownRight size={48} strokeWidth={1} />
            </div>
          </div>

        </div>

        {/* Right side panel - High contrast color blocking */}
        <div className="lg:col-span-4 p-8 md:p-12 flex flex-col justify-between gap-10 bg-forestGreen text-creme relative overflow-hidden">
          {/* Subtle noise pattern or color glow */}
          <div className="absolute -top-10 -right-10 w-[200px] h-[200px] bg-urbanCoral/10 rounded-full filter blur-[50px] pointer-events-none" />
          
          <div className="flex flex-col gap-3">
            <span className="text-[9px] font-display font-bold uppercase tracking-[0.3em] text-urbanCoral">
              Identity Statement
            </span>
            <p className="font-serif italic font-light text-lg md:text-xl text-creme/90 leading-snug">
              "Perfection is attained not when there is nothing more to add, but when there is nothing left to take away."
            </p>
          </div>

          {/* Minimalist Trust list */}
          <div className="flex flex-col border-t border-creme/10 pt-6 gap-4 font-display text-[9px] font-bold uppercase tracking-[0.2em]">
            <div className="flex items-center justify-between pb-3 border-b border-creme/10 text-creme/80">
              <span className="flex items-center gap-2">
                <Shield size={12} className="text-urbanCoral" /> OTP SECURE ACCOUNTS
              </span>
              <span className="text-[8px] text-urbanCoral font-sans">01</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-creme/10 text-creme/80">
              <span className="flex items-center gap-2">
                <Truck size={12} className="text-urbanCoral" /> EXPRESS DELIVERY
              </span>
              <span className="text-[8px] text-urbanCoral font-sans">02</span>
            </div>
            <div className="flex items-center justify-between text-creme/80">
              <span className="flex items-center gap-2">
                <CreditCard size={12} className="text-urbanCoral" /> SEAMLESS PAYMENTS
              </span>
              <span className="text-[8px] text-urbanCoral font-sans">03</span>
            </div>
          </div>

        </div>

      </section>

      {/* TYPOGRAPHIC INFINITE MARQUEE */}
      <Marquee />

      {/* 2. FILTERS & SEARCH SECTION */}
      <section className="flex flex-col lg:flex-row lg:items-stretch justify-between gap-8 border-b border-forestGreen/15 pb-8">
        
        {/* Search Input wrapper */}
        <Magnetic>
          <div className="relative max-w-md w-full flex items-center border border-forestGreen/15 bg-white/40 px-4 py-1.5">
            <Search size={14} className="text-forestGreen/60 mr-3" />
            <input
              type="text"
              placeholder="Search our curated catalog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-2 bg-transparent text-stoneBrown-800 text-xs font-sans font-light placeholder-stoneBrown-500 focus:outline-none"
            />
          </div>
        </Magnetic>

        {/* Category tabs */}
        <div className="flex flex-col justify-center gap-2.5">
          <span className="text-[9px] font-display font-bold uppercase tracking-[0.22em] text-stoneBrown-500">
            Browse By Section
          </span>
          <div className="flex flex-wrap gap-2">
            <Magnetic>
              <button
                onClick={() => setCategory("")}
                className={`px-4 py-2 border text-[9px] font-display font-bold uppercase tracking-[0.15em] transition-all duration-300 relative ${
                  category === ""
                    ? "bg-forestGreen border-forestGreen text-creme"
                    : "border-forestGreen/15 hover:border-forestGreen/40 text-stoneBrown-600 bg-white/30"
                }`}
              >
                All Items
              </button>
            </Magnetic>
            {categories.map((c) => (
              <Magnetic key={c.id}>
                <button
                  onClick={() => setCategory(String(c.id))}
                  className={`px-4 py-2 border text-[9px] font-display font-bold uppercase tracking-[0.15em] transition-all duration-300 relative ${
                    category === String(c.id)
                      ? "bg-forestGreen border-forestGreen text-creme"
                      : "border-forestGreen/15 hover:border-forestGreen/40 text-stoneBrown-600 bg-white/30"
                  }`}
                >
                  {c.name}
                </button>
              </Magnetic>
            ))}
          </div>
        </div>

      </section>

      {/* 3. PRODUCTS CATALOG WITH STAGGERED BROKEN GRID */}
      <section>
        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-8 h-8 border border-forestGreen/30 border-t-urbanCoral animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 border border-dashed border-forestGreen/15 bg-white/20"
          >
            <p className="font-serif italic text-lg text-stoneBrown-600">
              No items match your catalog filter query.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          >
            <AnimatePresence>
              {products.map((p, idx) => (
                <div 
                  key={p.id}
                  className={idx % 2 === 1 ? "lg:translate-y-10" : "lg:translate-y-0"}
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
      
      {/* Decorative spacer for bottom of broken grid */}
      <div className="h-10 hidden lg:block" />

    </div>
  );
}
