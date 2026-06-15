"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Tag, ArrowRight } from "lucide-react";

const ProductCard = ({ product }) => {
  const cardRef = useRef(null);
  
  // Track scroll progress of the card within viewport
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  // Calculate subtle translation offset for parallax effect
  const y = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  // 3D Card Tilt setup
  const x = useMotionValue(0.5);
  const yVal = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(yVal, [0, 1], [8, -8]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-8, 8]), { stiffness: 150, damping: 20 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width);
    yVal.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    yVal.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      className="h-full group"
    >
      <Link
        href={`/product?id=${product.id}`}
        className="flex flex-col h-full bg-white/40 border border-forestGreen/10 hover:border-forestGreen/25 hover:bg-white transition-all duration-500 p-5 relative"
        style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}
      >
        {/* Editorial design number decoration on hover */}
        <div className="absolute top-4 right-4 text-[10px] font-display font-medium tracking-widest text-forestGreen/20 group-hover:text-urbanCoral/80 transition-colors duration-300">
          ED.0{product.id % 9 || 9}
        </div>

        {/* Shutter Reveal with clipping path & image parallax */}
        <motion.div
          initial={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
          whileInView={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          className="aspect-[4/5] bg-ivory-100 overflow-hidden relative border border-forestGreen/5"
          style={{ transform: "translateZ(30px)" }}
        >
          <motion.img
            src={product.image_url}
            alt={product.name}
            style={{ y }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
            className="absolute -top-[10%] -left-[5%] w-[110%] h-[120%] object-cover"
          />
          <div className="absolute inset-0 bg-forestGreen/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </motion.div>

        <div className="pt-5 flex flex-col flex-1" style={{ transform: "translateZ(40px)" }}>
          <span className="inline-flex items-center text-[9px] font-display font-bold uppercase tracking-[0.2em] text-urbanCoral mb-2">
            <Tag size={9} className="mr-1.5" />
            {product.category_name}
          </span>
          <h3 className="font-serif italic font-light text-xl leading-snug text-stoneBrown-800 group-hover:text-forestGreen transition-colors duration-300 mb-3">
            {product.name}
          </h3>
          <div className="mt-auto pt-4 flex items-baseline justify-between border-t border-forestGreen/10">
            <p className="font-serif text-lg font-bold text-forestGreen">
              ₹{Number(product.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <span className="flex items-center gap-1.5 text-[9px] font-display font-bold uppercase tracking-[0.15em] text-stoneBrown-600 group-hover:text-urbanCoral transition-colors duration-300">
              Explore <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
