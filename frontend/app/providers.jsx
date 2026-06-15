"use client";

import { useEffect } from "react";
import { ReactLenis } from "lenis/react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { AudioSettingsProvider, useAudioSettings } from "./context/AudioSettingsContext";
import Navbar from "./components/Navbar";
import Link from "next/link";
import CustomCursor from "./components/CustomCursor";
import AudioToggle from "./components/AudioToggle";
import ShutterTransition from "./components/ShutterTransition";
import ChatWidget from "./components/ChatWidget";
import AmbientBackground from "./components/AmbientBackground";
import { playClick } from "./lib/audio";

const VerificationBanner = () => {
  const { user } = useAuth();
  const showVerificationBanner =
    user &&
    (user.is_email_verified === 0 ||
      (user.phone_number && user.is_phone_verified === 0));

  if (!showVerificationBanner) return null;

  return (
    <div className="bg-urbanCoral text-creme py-3 px-5 text-center text-[10px] font-display font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 sticky top-[57px] z-40 shadow-none border-b border-forestGreen/10">
      <span>
        ⚠️ SECURITY ALERT: Account verification is pending.
      </span>
      <Link
        href="/verify"
        className="underline hover:text-forestGreen transition-colors duration-300 font-black"
      >
        Verify Now
      </Link>
    </div>
  );
};

const AudioHoverListener = () => {
  const { isAudioEnabled } = useAudioSettings();

  useEffect(() => {
    let lastHovered = null;
    const handleMouseOver = (e) => {
      if (!isAudioEnabled) return;
      const target = e.target.closest(
        "a, button, select, [role='button'], input[type='submit']"
      );
      if (target) {
        if (target !== lastHovered) {
          playClick();
          lastHovered = target;
        }
      } else {
        lastHovered = null;
      }
    };
    window.addEventListener("mouseover", handleMouseOver);
    return () => {
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [isAudioEnabled]);

  return null;
};

export function Providers({ children }) {
  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.2, smoothTouch: true }}>
      <AudioSettingsProvider>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col text-stoneBrown-800 relative">
              <div className="noise-overlay" />
              <AmbientBackground />
              <CustomCursor />
              <ShutterTransition />
              <AudioHoverListener />
              <AudioToggle />
              <ChatWidget />
              <Navbar />
              <VerificationBanner />
              <main className="flex-1 w-full">{children}</main>
            </div>
          </CartProvider>
        </AuthProvider>
      </AudioSettingsProvider>
    </ReactLenis>
  );
}

