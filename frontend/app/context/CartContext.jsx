"use client";

import { createContext, useContext, useState, useCallback } from "react";
import api from "../lib/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    try {
      const { data } = await api.get("/cart");
      setCartItems(data);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    await api.post("/cart", { product_id: productId, quantity });
    await fetchCart();
  };

  const updateQuantity = async (cartItemId, quantity) => {
    await api.put(`/cart/${cartItemId}`, { quantity });
    await fetchCart();
  };

  const removeItem = async (cartItemId) => {
    await api.delete(`/cart/${cartItemId}`);
    await fetchCart();
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
