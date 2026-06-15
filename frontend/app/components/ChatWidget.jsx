"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import api from "../lib/api";
import { useAudioSettings } from "../context/AudioSettingsContext";
import { playClick } from "../lib/audio";
import Magnetic from "./Magnetic";

const Typewriter = ({ text, isAudioEnabled, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    let index = 0;
    const interval = 10; // 10ms per char

    const tick = () => {
      setDisplayedText((prev) => prev + text.charAt(index));
      
      // Play extremely subtle click sound for typing rhythm
      if (isAudioEnabled && index % 3 === 0) {
        playClick();
      }

      index++;
      if (index < text.length) {
        timerRef.current = setTimeout(tick, interval);
      } else {
        if (onComplete) onComplete();
      }
    };

    timerRef.current = setTimeout(tick, interval);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, isAudioEnabled, onComplete]);

  return <span>{displayedText}</span>;
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const { isAudioEnabled } = useAudioSettings();
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Welcome to ShopEase Luxury Gallery. I am your personal digital stylist. How may I assist you today? Ask me about product recommendations or catalog sections.",
      isNew: false,
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg = inputText.trim();
    setInputText("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg, isNew: false }]);
    setLoading(true);

    try {
      // Map history context to send to API
      const historyContext = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const { data } = await api.post("/chat", {
        message: userMsg,
        history: historyContext,
      });

      setMessages((prev) => [
        ...prev,
        { role: "model", text: data.text, isNew: true },
      ]);
    } catch (err) {
      console.error("Chat widget error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "I apologize, but I am unable to connect to the luxury server node at this moment.",
          isNew: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageComplete = (index) => {
    setMessages((prev) =>
      prev.map((msg, i) => (i === index ? { ...msg, isNew: false } : msg))
    );
  };

  return (
    <>
      {/* Floating Chat Toggle */}
      <div className="fixed bottom-24 right-6 z-50">
        <Magnetic>
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center w-12 h-12 bg-forestGreen hover:bg-urbanCoral text-creme rounded-full shadow-lg border border-forestGreen/25 transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
          </motion.button>
        </Magnetic>
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="fixed bottom-[154px] right-6 z-50 w-[350px] sm:w-[380px] h-[500px] bg-white/85 backdrop-blur-md border border-forestGreen/15 flex flex-col justify-between overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-forestGreen/10 flex items-center justify-between bg-white/40">
              <div className="flex items-center gap-2">
                <Sparkles size={13} className="text-urbanCoral" />
                <span className="text-[10px] font-display font-bold uppercase tracking-[0.25em] text-forestGreen">
                  ShopEase Concierge
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-forestGreen animate-pulse" />
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-forestGreen/60 hover:text-urbanCoral transition-colors duration-300"
              >
                <X size={14} />
              </button>
            </div>

            {/* Messages Area */}
            <div data-lenis-prevent className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-forestGreen">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 text-xs leading-relaxed font-sans ${
                      msg.role === "user"
                        ? "bg-forestGreen text-creme rounded-none"
                        : "bg-ivory-100 text-stoneBrown-800 border border-forestGreen/5 rounded-none"
                    }`}
                  >
                    {msg.role === "model" && msg.isNew ? (
                      <Typewriter
                        text={msg.text}
                        isAudioEnabled={isAudioEnabled}
                        onComplete={() => handleMessageComplete(idx)}
                      />
                    ) : (
                      <div className="whitespace-pre-line">{msg.text}</div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-ivory-100 border border-forestGreen/5 px-4 py-3 flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-forestGreen/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-forestGreen/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-forestGreen/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSubmit}
              className="px-6 py-4 border-t border-forestGreen/10 flex items-center gap-3 bg-white/40"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask our concierge..."
                className="flex-1 bg-transparent text-stoneBrown-800 text-xs font-sans font-light placeholder-stoneBrown-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className={`p-2 rounded-full transition-colors duration-300 ${
                  inputText.trim() && !loading
                    ? "text-urbanCoral hover:text-forestGreen"
                    : "text-forestGreen/30"
                }`}
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
