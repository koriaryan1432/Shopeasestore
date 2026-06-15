"use client";

import { motion } from "framer-motion";
import { useAudioSettings } from "../context/AudioSettingsContext";
import Magnetic from "./Magnetic";

const barVariants = {
  active: (i) => ({
    scaleY: [1, 2.5, 1],
    transition: {
      duration: 0.6 + i * 0.15,
      repeat: Infinity,
      ease: "easeInOut",
    },
  }),
  inactive: {
    scaleY: 0.4,
  },
};

export default function AudioToggle() {
  const { isAudioEnabled, toggleAudio } = useAudioSettings();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Magnetic>
        <button
          onClick={toggleAudio}
          className="flex items-center gap-3 bg-white/60 backdrop-blur-md border border-forestGreen/10 hover:border-forestGreen/35 hover:bg-white transition-all duration-300 py-2.5 px-4 rounded-full shadow-none group"
        >
          <div className="flex gap-[3px] items-center justify-center h-4 w-5">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                custom={i}
                variants={barVariants}
                animate={isAudioEnabled ? "active" : "inactive"}
                style={{ originY: 1 }}
                className="w-[2px] h-2.5 bg-forestGreen rounded-full"
              />
            ))}
          </div>
          <span className="text-[9px] font-display font-bold uppercase tracking-[0.25em] text-forestGreen pr-1">
            Sound {isAudioEnabled ? "ON" : "OFF"}
          </span>
        </button>
      </Magnetic>
    </div>
  );
}
