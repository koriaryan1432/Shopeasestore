"use client";

import { motion } from "framer-motion";

const MarqueeRow = ({ reverse = false }) => {
  const content = (
    <div className="flex flex-row shrink-0 items-center gap-8 pr-8">
      {Array(6).fill(null).map((_, i) => (
        <span key={i} className="flex items-center gap-8">
          <span>CURATED INTEGRITY</span>
          <span className="text-forestGreen/20 font-light">—</span>
          <span>CHOREOGRAPHED CODES</span>
          <span className="text-forestGreen/20 font-light">—</span>
          <span className="font-serif italic text-urbanCoral font-normal">LUXURY MATERIALITY</span>
          <span className="text-forestGreen/20 font-light">—</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="w-full overflow-hidden flex py-4 md:py-6">
      <motion.div
        animate={{
          x: reverse ? ["-50%", "0%"] : ["0%", "-50%"]
        }}
        transition={{
          ease: "linear",
          duration: 35,
          repeat: Infinity
        }}
        className="flex whitespace-nowrap text-xl md:text-3xl font-display font-light uppercase tracking-[0.2em] text-forestGreen"
      >
        {content}
        {content}
      </motion.div>
    </div>
  );
};

export default function Marquee() {
  return (
    <div className="w-full border-y border-forestGreen/15 flex flex-col my-6 md:my-12 overflow-hidden select-none bg-white/20">
      <MarqueeRow reverse={false} />
      <div className="h-[1px] w-full bg-forestGreen/15" />
      <MarqueeRow reverse={true} />
    </div>
  );
}
