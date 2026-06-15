"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password, phoneNumber);
      router.push("/verify");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/40 border border-forestGreen/15 p-8 md:p-12 shadow-none max-w-md w-full"
      >
        <h2 className="font-display font-light text-3xl text-forestGreen text-center mb-8">
          Create Account
        </h2>

        {error && (
          <p className="mb-6 bg-red/5 border border-red/20 text-red text-[11px] uppercase tracking-wider py-3 px-4 text-center font-bold">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-display font-bold uppercase tracking-[0.2em] text-stoneBrown-600 mb-0.5">
              Full Name
            </label>
            <div className="relative">
              <User
                size={14}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-forestGreen/60"
              />
              <input
                type="text"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 border border-forestGreen/15 focus:border-forestGreen outline-none transition-all duration-300 text-stoneBrown-800 text-xs font-sans font-light bg-white/80 rounded-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-display font-bold uppercase tracking-[0.2em] text-stoneBrown-600 mb-0.5">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={14}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-forestGreen/60"
              />
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 border border-forestGreen/15 focus:border-forestGreen outline-none transition-all duration-300 text-stoneBrown-800 text-xs font-sans font-light bg-white/80 rounded-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-display font-bold uppercase tracking-[0.2em] text-stoneBrown-600 mb-0.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone
                size={14}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-forestGreen/60"
              />
              <input
                type="tel"
                placeholder="e.g. +91XXXXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-forestGreen/15 focus:border-forestGreen outline-none transition-all duration-300 text-stoneBrown-800 text-xs font-sans font-light bg-white/80 rounded-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-display font-bold uppercase tracking-[0.2em] text-stoneBrown-600 mb-0.5">
              Secure Password
            </label>
            <div className="relative">
              <Lock
                size={14}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-forestGreen/60"
              />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 border border-forestGreen/15 focus:border-forestGreen outline-none transition-all duration-300 text-stoneBrown-800 text-xs font-sans font-light bg-white/80 rounded-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-forestGreen text-creme border border-forestGreen font-display font-bold text-[10px] uppercase tracking-[0.25em] hover:bg-urbanCoral hover:border-urbanCoral hover:text-creme transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-none disabled:opacity-50"
          >
            <UserPlus size={14} className="inline-block mr-1.5 -mt-0.5" />
            {loading ? "Creating Credentials..." : "Register"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-stoneBrown-600 font-sans font-light">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-forestGreen font-display font-bold uppercase tracking-wider hover:text-urbanCoral transition-colors duration-300 ml-1.5"
          >
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
