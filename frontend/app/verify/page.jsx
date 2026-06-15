"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  ShieldCheck,
  RefreshCw,
  Key,
  Lock,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import ProtectedRoute from "../components/ProtectedRoute";

function VerifyContent() {
  const { user, sendOTP, verifyOTP } = useAuth();
  const router = useRouter();

  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const [emailLoading, setEmailLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneUpdateLoading, setPhoneUpdateLoading] = useState(false);

  const [emailMessage, setEmailMessage] = useState({ text: "", type: "" });
  const [phoneMessage, setPhoneMessage] = useState({ text: "", type: "" });

  if (!user) return null;

  const handleEmailVerify = async (e) => {
    e.preventDefault();
    setEmailMessage({ text: "", type: "" });
    setEmailLoading(true);
    try {
      await verifyOTP(user.email, emailCode, "email");
      setEmailMessage({
        text: "Email verified successfully!",
        type: "success",
      });
      setEmailCode("");
    } catch (err) {
      setEmailMessage({
        text: err.response?.data?.message || "Email verification failed",
        type: "error",
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePhoneVerify = async (e) => {
    e.preventDefault();
    setPhoneMessage({ text: "", type: "" });
    setPhoneLoading(true);
    try {
      await verifyOTP(user.phone_number, phoneCode, "phone");
      setPhoneMessage({
        text: "Phone verified successfully!",
        type: "success",
      });
      setPhoneCode("");
    } catch (err) {
      setPhoneMessage({
        text: err.response?.data?.message || "Phone verification failed",
        type: "error",
      });
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleResendOTP = async (type, identifier) => {
    const setMessage = type === "email" ? setEmailMessage : setPhoneMessage;
    setMessage({ text: "", type: "" });
    try {
      await sendOTP(identifier, type);
      setMessage({
        text: `New OTP code sent to your ${
          type === "email" ? "email" : "phone"
        }!`,
        type: "success",
      });
    } catch (err) {
      setMessage({
        text:
          err.response?.data?.message || `Failed to resend OTP to your ${type}`,
        type: "error",
      });
    }
  };

  const handleAddPhone = async (e) => {
    e.preventDefault();
    setPhoneMessage({ text: "", type: "" });
    setPhoneUpdateLoading(true);
    try {
      await api.post("/auth/otp/send", { identifier: newPhone, type: "phone" });
      const updatedUser = {
        ...user,
        phone_number: newPhone,
        is_phone_verified: 0,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.location.reload();
    } catch (err) {
      setPhoneMessage({
        text:
          err.response?.data?.message ||
          "Failed to send OTP code to new phone",
        type: "error",
      });
    } finally {
      setPhoneUpdateLoading(false);
    }
  };

  const isEmailVerified = user.is_email_verified === 1;
  const isPhoneVerified = user.is_phone_verified === 1;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16 flex flex-col items-center gap-4"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 bg-forestGreen/5 border border-forestGreen/10 text-forestGreen">
          <Lock size={20} />
        </div>
        <h2 className="font-display font-light text-3xl md:text-4xl text-forestGreen">
          Security & Credentials Verification
        </h2>
        <p className="text-stoneBrown-600 text-xs md:text-sm font-sans font-light max-w-md">
          ShopEase requires dual validation context inputs to ensure strict transaction safety.
        </p>
      </motion.div>

      {/* Grid wrapper with thin dividing lines */}
      <div className="grid grid-cols-1 md:grid-cols-2 border border-forestGreen/15 bg-white/40 gap-0 shadow-none">
        
        {/* Email Verification Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-forestGreen/15 flex flex-col justify-between h-full gap-8"
        >
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-forestGreen" />
                <h3 className="font-serif italic font-light text-xl text-forestGreen">
                  Email Inbox Verification
                </h3>
              </div>
              <span
                className={`text-[8px] font-display font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 border ${
                  isEmailVerified
                    ? "bg-forestGreen/10 border-forestGreen/20 text-forestGreen"
                    : "bg-urbanCoral/10 border-urbanCoral/20 text-urbanCoral"
                }`}
              >
                {isEmailVerified ? "Verified" : "Pending"}
              </span>
            </div>

            <p className="text-stoneBrown-600 text-xs leading-relaxed font-sans font-light">
              We send transaction invoices, dispatch codes, and configuration notices to: <strong className="text-forestGreen font-semibold">{user.email}</strong>.
            </p>

            {emailMessage.text && (
              <p
                className={`text-[10px] font-display font-bold uppercase tracking-wider p-3 text-center border ${
                  emailMessage.type === "success"
                    ? "bg-forestGreen/5 border-forestGreen/20 text-forestGreen"
                    : "bg-red/5 border-red/20 text-red"
                }`}
              >
                {emailMessage.text}
              </p>
            )}
          </div>

          {!isEmailVerified ? (
            <form onSubmit={handleEmailVerify} className="flex flex-col gap-4">
              <div className="relative">
                <Key
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-forestGreen/60"
                />
                <input
                  type="text"
                  placeholder="Verification Code"
                  maxLength={6}
                  value={emailCode}
                  onChange={(e) =>
                    setEmailCode(e.target.value.replace(/\D/g, ""))
                  }
                  required
                  className="w-full pl-12 pr-4 py-3 border border-forestGreen/15 focus:border-forestGreen outline-none transition-all duration-300 text-stoneBrown-800 text-center text-lg tracking-[8px] font-bold bg-white/80 rounded-none"
                />
              </div>
              <div className="flex gap-2.5">
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="flex-1 py-3 bg-forestGreen text-creme border border-forestGreen font-display font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-urbanCoral hover:border-urbanCoral hover:text-creme transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-none disabled:opacity-50"
                >
                  <ShieldCheck size={13} />
                  {emailLoading ? "Verifying..." : "Verify Code"}
                </button>
                <button
                  type="button"
                  onClick={() => handleResendOTP("email", user.email)}
                  className="px-4.5 py-3 bg-white border border-forestGreen/15 text-forestGreen hover:bg-forestGreen/5 transition-all duration-300 flex items-center justify-center cursor-pointer shadow-none"
                  title="Resend Code"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
            </form>
          ) : (
            <div className="py-5 text-center bg-forestGreen/5 border border-dashed border-forestGreen/20">
              <p className="text-forestGreen font-display font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                <ShieldCheck size={14} /> Email Secure & Verified
              </p>
            </div>
          )}
        </motion.div>

        {/* Phone Verification Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-8 md:p-12 flex flex-col justify-between h-full gap-8"
        >
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-forestGreen" />
                <h3 className="font-serif italic font-light text-xl text-forestGreen">
                  Phone SMS Verification
                </h3>
              </div>
              <span
                className={`text-[8px] font-display font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 border ${
                  isPhoneVerified
                    ? "bg-forestGreen/10 border-forestGreen/20 text-forestGreen"
                    : "bg-urbanCoral/10 border-urbanCoral/20 text-urbanCoral"
                }`}
              >
                {isPhoneVerified ? "Verified" : "Pending"}
              </span>
            </div>

            {user.phone_number ? (
              <>
                <p className="text-stoneBrown-600 text-xs leading-relaxed font-sans font-light">
                  SMS alerts, immediate checkout confirmations, and delivery codes are routed to: <strong className="text-forestGreen font-semibold">{user.phone_number}</strong>.
                </p>

                {phoneMessage.text && (
                  <p
                    className={`text-[10px] font-display font-bold uppercase tracking-wider p-3 text-center border ${
                      phoneMessage.type === "success"
                        ? "bg-forestGreen/5 border-forestGreen/20 text-forestGreen"
                        : "bg-red/5 border-red/20 text-red"
                    }`}
                  >
                    {phoneMessage.text}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-stoneBrown-600 text-xs leading-relaxed font-sans font-light">
                  No mobile context registered. Link your phone number to enable two-factor OTP confirmations during ordering.
                </p>

                {phoneMessage.text && (
                  <p
                    className={`text-[10px] font-display font-bold uppercase tracking-wider p-3 text-center border ${
                      phoneMessage.type === "success"
                        ? "bg-forestGreen/5 border-forestGreen/20 text-forestGreen"
                        : "bg-red/5 border-red/20 text-red"
                    }`}
                  >
                    {phoneMessage.text}
                  </p>
                )}
              </>
            )}
          </div>

          {user.phone_number ? (
            !isPhoneVerified ? (
              <form onSubmit={handlePhoneVerify} className="flex flex-col gap-4">
                <div className="relative">
                  <Key
                    size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-forestGreen/60"
                  />
                  <input
                    type="text"
                    placeholder="Verification Code"
                    maxLength={6}
                    value={phoneCode}
                    onChange={(e) =>
                      setPhoneCode(e.target.value.replace(/\D/g, ""))
                    }
                    required
                    className="w-full pl-12 pr-4 py-3 border border-forestGreen/15 focus:border-forestGreen outline-none transition-all duration-300 text-stoneBrown-800 text-center text-lg tracking-[8px] font-bold bg-white/80 rounded-none"
                  />
                </div>
                <div className="flex gap-2.5">
                  <button
                    type="submit"
                    disabled={phoneLoading}
                    className="flex-1 py-3 bg-forestGreen text-creme border border-forestGreen font-display font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-urbanCoral hover:border-urbanCoral hover:text-creme transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-none disabled:opacity-50"
                  >
                    <ShieldCheck size={13} />
                    {phoneLoading ? "Verifying..." : "Verify Code"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleResendOTP("phone", user.phone_number)
                    }
                    className="px-4.5 py-3 bg-white border border-forestGreen/15 text-forestGreen hover:bg-forestGreen/5 transition-all duration-300 flex items-center justify-center cursor-pointer shadow-none"
                    title="Resend Code"
                  >
                    <RefreshCw size={13} />
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-5 text-center bg-forestGreen/5 border border-dashed border-forestGreen/20">
                <p className="text-forestGreen font-display font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                  <ShieldCheck size={14} /> Phone Secure & Verified
                </p>
              </div>
            )
          ) : (
            <form onSubmit={handleAddPhone} className="flex flex-col gap-4">
              <input
                type="tel"
                placeholder="Phone number e.g. +91XXXXXXXXXX"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                required
                className="w-full px-4 py-3 border border-forestGreen/15 focus:border-forestGreen outline-none transition-all duration-300 text-stoneBrown-800 text-xs font-sans font-light bg-white/80 rounded-none"
              />
              <button
                type="submit"
                disabled={phoneUpdateLoading}
                className="w-full py-3 bg-forestGreen text-creme border border-forestGreen font-display font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-urbanCoral hover:border-urbanCoral hover:text-creme transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-none disabled:opacity-50"
              >
                {phoneUpdateLoading ? "Sending OTP..." : "Add & Verify Phone"}
              </button>
            </form>
          )}
        </motion.div>
        
      </div>

      {isEmailVerified && (isPhoneVerified || !user.phone_number) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <button
            onClick={() => router.push("/")}
            className="px-8 py-4 bg-forestGreen text-creme border border-forestGreen font-display font-bold text-[10px] uppercase tracking-[0.25em] hover:bg-urbanCoral hover:border-urbanCoral hover:text-creme transition-all duration-300 inline-flex items-center gap-2.5 cursor-pointer shadow-none"
          >
            Continue to ShopEase <ArrowRight size={13} />
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default function Verify() {
  return (
    <ProtectedRoute>
      <VerifyContent />
    </ProtectedRoute>
  );
}
