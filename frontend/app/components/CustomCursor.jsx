"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hoveredType, setHoveredType] = useState(null);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 30, stiffness: 350, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    setEnabled(true);
    document.documentElement.classList.add("custom-cursor-active");

    const moveMouse = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target.closest(
        "a, button, select, [role='button'], input, textarea"
      );
      if (target) {
        const isProductCard =
          e.target.closest(".product-card-hover-marker") ||
          target.closest("a[href^='/product?']");
        const isRemove =
          target.classList.contains("text-red") || target.closest(".text-red");
        if (isProductCard) {
          setHoveredType("explore");
        } else if (isRemove) {
          setHoveredType("remove");
        } else {
          setHoveredType("link");
        }
      } else {
        setHoveredType(null);
      }
    };

    window.addEventListener("mousemove", moveMouse);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveMouse);
      window.removeEventListener("mouseover", handleMouseOver);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* Outer cursor ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[99999] border flex items-center justify-center text-center overflow-hidden"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width:
            hoveredType === "explore"
              ? 70
              : hoveredType === "link"
              ? 35
              : hoveredType === "remove"
              ? 40
              : 14,
          height:
            hoveredType === "explore"
              ? 70
              : hoveredType === "link"
              ? 35
              : hoveredType === "remove"
              ? 40
              : 14,
          backgroundColor:
            hoveredType === "explore"
              ? "rgba(247, 108, 70, 0.95)"
              : hoveredType === "remove"
              ? "rgba(239, 68, 68, 0.95)"
              : "transparent",
          borderColor:
            hoveredType === "explore"
              ? "#f76c46"
              : hoveredType === "remove"
              ? "#ef4444"
              : "#042d2b",
        }}
        transition={{ type: "spring", stiffness: 450, damping: 30 }}
      >
        {hoveredType === "explore" && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[9px] font-display font-bold uppercase tracking-[0.2em] text-creme"
          >
            Explore
          </motion.span>
        )}
        {hoveredType === "remove" && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[8px] font-display font-bold uppercase tracking-[0.2em] text-white"
          >
            Delete
          </motion.span>
        )}
      </motion.div>

      {/* Inner cursor dot */}
      <motion.div
        className="fixed top-0 left-0 w-1 h-1 bg-forestGreen rounded-full pointer-events-none z-[99999]"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: hoveredType ? 0 : 1,
        }}
      />
    </>
  );
}
