"use client";

import { motion } from "framer-motion";

export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] select-none">
      {/* Blob 1: Urban Coral */}
      <motion.div
        animate={{
          x: [0, 120, -80, 0],
          y: [0, -90, 110, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[10%] left-[10%] w-[35vw] h-[35vw] rounded-full bg-urbanCoral/15 filter blur-[80px] lg:blur-[120px]"
      />

      {/* Blob 2: Golf Celadon */}
      <motion.div
        animate={{
          x: [0, -140, 80, 0],
          y: [0, 100, -120, 0],
          scale: [1, 0.85, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[15%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-golfCeladon/20 filter blur-[90px] lg:blur-[140px]"
      />

      {/* Blob 3: Replastic Vista Blue */}
      <motion.div
        animate={{
          x: [0, 90, -100, 0],
          y: [0, 110, 70, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[35%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-replasticVistaBlue/15 filter blur-[75px] lg:blur-[110px]"
      />
    </div>
  );
}
