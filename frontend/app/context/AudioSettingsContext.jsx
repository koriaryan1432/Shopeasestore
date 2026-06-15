"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AudioSettingsContext = createContext({
  isAudioEnabled: false,
  toggleAudio: () => {},
});

export const AudioSettingsProvider = ({ children }) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  useEffect(() => {
    // Load preference from localStorage
    const saved = localStorage.getItem("shopEase_audio_enabled");
    if (saved === "true") {
      setIsAudioEnabled(true);
    }
  }, []);

  const toggleAudio = () => {
    setIsAudioEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("shopEase_audio_enabled", String(next));
      return next;
    });
  };

  return (
    <AudioSettingsContext.Provider value={{ isAudioEnabled, toggleAudio }}>
      {children}
    </AudioSettingsContext.Provider>
  );
};

export const useAudioSettings = () => useContext(AudioSettingsContext);
