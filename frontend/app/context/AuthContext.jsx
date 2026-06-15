"use client";

import { createContext, useContext, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password, phone_number) => {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
      phone_number,
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const loginWithGoogle = async (credential) => {
    const { data } = await api.post("/auth/google", { credential });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const sendOTP = async (identifier, type) => {
    await api.post("/auth/otp/send", { identifier, type });
  };

  const verifyOTP = async (identifier, code, type) => {
    const { data } = await api.post("/auth/otp/verify", {
      identifier,
      code,
      type,
    });

    setUser((prevUser) => {
      if (!prevUser) return null;
      const updated = {
        ...prevUser,
        is_email_verified: type === "email" ? 1 : prevUser.is_email_verified,
        is_phone_verified: type === "phone" ? 1 : prevUser.is_phone_verified,
      };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });

    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        loginWithGoogle,
        sendOTP,
        verifyOTP,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
