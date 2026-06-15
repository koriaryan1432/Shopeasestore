"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function ShutterTransition() {
  const pathname = usePathname();
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayPath, setDisplayPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== displayPath) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayPath(pathname);
      }, 500); // Sync point for path state change

      const endTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 1100);

      return () => {
        clearTimeout(timer);
        clearTimeout(endTimer);
      };
    }
  }, [pathname, displayPath]);

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: ["100%", "0%", "-100%"] }}
          exit={{ y: "-100%" }}
          transition={{
            duration: 1.1,
            times: [0, 0.45, 1],
            ease: [0.76, 0, 0.24, 1],
          }}
          className="fixed inset-0 z-[9999] bg-forestGreen flex flex-col items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: [0, 1, 0], y: [15, 0, -15] }}
            transition={{ duration: 0.9, times: [0, 0.45, 1] }}
            className="flex flex-col items-center gap-3 text-creme"
          >
            <span className="font-serif italic text-4xl text-urbanCoral">ShopEase</span>
            <span className="text-[9px] font-display font-bold uppercase tracking-[0.3em] text-creme/50">
              Curating Integrity
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
