"use client";

import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.02,
    },
  },
};

const letterVariants = {
  hidden: { y: "110%", rotate: 4 },
  visible: {
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.8,
      ease: [0.76, 0, 0.24, 1],
    },
  },
};

export default function KineticHeading({ text, className = "" }) {
  const words = text.split(" ");

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      className={`inline-flex flex-wrap ${className}`}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-flex overflow-hidden mr-[0.25em] py-1 select-none">
          {word.split("").map((char, charIndex) => (
            <motion.span
              key={charIndex}
              variants={letterVariants}
              whileHover={{ 
                y: -6, 
                color: "var(--color-accent)",
                transition: { type: "spring", stiffness: 450, damping: 12 }
              }}
              className="inline-block origin-bottom transition-colors duration-150"
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
  );
}
