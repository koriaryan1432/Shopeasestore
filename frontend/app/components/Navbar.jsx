"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Inbox,
  Shield,
  LogOut,
  LogIn,
  UserPlus,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Magnetic from "./Magnetic";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b bg-ivory-50/90 backdrop-blur-md border-forestGreen/15">
      <Magnetic>
        <Link href="/" className="flex items-baseline gap-1 group block">
          <span className="font-serif italic font-light text-[26px] tracking-tight text-forestGreen group-hover:text-urbanCoral transition-colors duration-500">
            Shop
          </span>
          <span className="font-display font-black text-xs uppercase tracking-[0.3em] text-forestGreen">
            Ease
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-urbanCoral ml-1 opacity-80 group-hover:scale-125 transition-transform duration-300" />
        </Link>
      </Magnetic>

      <div className="flex items-center gap-6 md:gap-8 text-[11px] font-display font-semibold uppercase tracking-[0.18em] text-stoneBrown-600">
        <Magnetic>
          <Link href="/" className="relative py-1 group/item transition-colors hover:text-forestGreen block">
            <span>Home</span>
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-urbanCoral transition-all duration-300 group-hover/item:w-full" />
          </Link>
        </Magnetic>

        {user ? (
          <>
            <Magnetic>
              <Link
                href="/cart"
                className="relative py-1 flex items-center gap-1.5 group/item transition-colors hover:text-forestGreen block"
              >
                <ShoppingCart size={13} className="text-forestGreen inline" />
                <span>Cart</span>
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={itemCount}
                    className="ml-1 px-1.5 py-0.5 text-[9px] font-bold text-creme rounded-none bg-urbanCoral inline-block"
                  >
                    {itemCount}
                  </motion.span>
                )}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-urbanCoral transition-all duration-300 group-hover/item:w-full" />
              </Link>
            </Magnetic>

            <Magnetic>
              <Link
                href="/orders"
                className="relative py-1 flex items-center gap-1.5 group/item transition-colors hover:text-forestGreen block"
              >
                <Inbox size={13} className="text-forestGreen inline" />
                <span>Orders</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-urbanCoral transition-all duration-300 group-hover/item:w-full" />
              </Link>
            </Magnetic>

            {user.role === "admin" && (
              <Magnetic>
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-1 bg-urbanCoral text-creme hover:bg-forestGreen hover:text-creme transition-colors duration-300 border border-urbanCoral block"
                >
                  <Shield size={11} className="inline" />
                  <span className="font-display font-bold text-[9px]">Admin Panel</span>
                </Link>
              </Magnetic>
            )}

            <div className="flex items-center gap-1.5 pl-4 border-l border-forestGreen/15 text-stoneBrown-800 font-sans font-medium normal-case tracking-normal">
              <User size={13} className="text-forestGreen inline" />
              <span className="hidden sm:inline">{user.name}</span>
            </div>

            <Magnetic>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-red/90 hover:text-red transition-colors font-display font-bold uppercase tracking-[0.18em] bg-transparent border-none p-0 cursor-pointer block"
              >
                <LogOut size={13} className="inline" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </Magnetic>
          </>
        ) : (
          <>
            <Magnetic>
              <Link
                href="/login"
                className="relative py-1 flex items-center gap-1.5 group/item transition-colors hover:text-forestGreen block"
              >
                <LogIn size={13} className="text-forestGreen inline" />
                <span>Login</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-urbanCoral transition-all duration-300 group-hover/item:w-full" />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link
                href="/register"
                className="flex items-center gap-1.5 px-4 py-2 bg-forestGreen text-creme hover:bg-urbanCoral hover:text-creme transition-all duration-300 border border-forestGreen hover:border-urbanCoral shadow-none block"
              >
                <UserPlus size={13} className="inline" />
                <span>Register</span>
              </Link>
            </Magnetic>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
