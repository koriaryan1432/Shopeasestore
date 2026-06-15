"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState("");
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    api
      .get("/auth/config")
      .then(({ data }) => {
        if (
          data.googleClientId &&
          !data.googleClientId.includes("placeholder")
        ) {
          setGoogleClientId(data.googleClientId);
          loadGoogleSDK(data.googleClientId);
        } else {
          setGoogleClientId("sandbox");
        }
      })
      .catch((err) => {
        console.error("Failed to load auth config:", err);
        setGoogleClientId("sandbox");
      });
  }, []);

  const loadGoogleSDK = (clientId) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCallback,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          {
            theme: "filled_black",
            size: "large",
            width: "340",
            shape: "square",
            text: "signin_with",
          }
        );
      }
    };
    document.body.appendChild(script);
  };

  const handleGoogleCallback = async (response) => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle(response.credential);
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.message || "Google Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleMockGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const mockCredential = JSON.stringify({
        email: "sandbox.oauth@example.com",
        name: "Sandbox OAuth User",
        googleId: "sandbox-google-id-12345",
      });
      await loginWithGoogle(mockCredential);
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.message || "Sandbox login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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
          Welcome Back
        </h2>

        {error && (
          <p className="mb-6 bg-red/5 border border-red/20 text-red text-[11px] uppercase tracking-wider py-3 px-4 text-center font-bold">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
              Secure Password
            </label>
            <div className="relative">
              <Lock
                size={14}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-forestGreen/60"
              />
              <input
                type="password"
                placeholder="Enter password"
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
            <LogIn size={14} className="inline-block mr-1.5 -mt-0.5" />
            {loading ? "Verifying Credentials..." : "Sign In"}
          </button>
        </form>

        <div className="my-6 flex items-center justify-center gap-4 text-stoneBrown-500 text-[9px] uppercase tracking-[0.2em]">
          <hr className="flex-1 border-forestGreen/10" />
          <span>or</span>
          <hr className="flex-1 border-forestGreen/10" />
        </div>

        {googleClientId === "sandbox" ? (
          <button
            onClick={handleMockGoogleLogin}
            disabled={loading}
            className="w-full py-4 bg-white border border-forestGreen/15 text-forestGreen font-display font-bold text-[10px] uppercase tracking-[0.25em] hover:border-forestGreen hover:bg-forestGreen/5 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-none disabled:opacity-50"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1.5"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#042d2b"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#f76c46"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-2.19-4.63z"
                fill="#042d2b"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#f76c46"
              />
            </svg>
            Google Identity
            <span className="text-[8px] bg-urbanCoral/20 px-2 py-0.5 text-urbanCoral font-bold ml-1.5 font-sans">
              Sandbox
            </span>
          </button>
        ) : (
          <div
            id="google-signin-button"
            className="w-full flex justify-center"
          ></div>
        )}

        <p className="mt-8 text-center text-xs text-stoneBrown-600 font-sans font-light">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-forestGreen font-display font-bold uppercase tracking-wider hover:text-urbanCoral transition-colors duration-300 ml-1.5"
          >
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
