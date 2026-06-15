"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    } else if (user.role !== "admin") {
      router.replace("/");
    }
  }, [user, router]);

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory-50">
        <div className="w-8 h-8 border border-forestGreen/30 border-t-urbanCoral animate-spin"></div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
//
