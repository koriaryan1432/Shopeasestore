"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  ShoppingBag,
  Users,
  Inbox,
  Edit,
  Trash2,
  Plus,
  UserCheck,
  DollarSign,
  Activity,
  RefreshCw,
} from "lucide-react";
import api from "../lib/api";
import AdminRoute from "../components/AdminRoute";

function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState("overview");

  // State
  const [stats, setStats] = useState({
    total_users: 0,
    total_products: 0,
    total_orders: 0,
    total_revenue: 0,
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);

  // Forms/Modals State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null if adding new
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image_url: "",
    category_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchStats();
    fetchProducts();
    fetchOrders();
    fetchUsers();
    fetchCategories();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/orders/admin/stats");
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders/admin/list");
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/auth/admin/users");
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/products/categories");
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleAddProductClick = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      image_url: "",
      category_id: categories[0]?.id || "",
    });
    setError("");
    setShowProductModal(true);
  };

  const handleEditProductClick = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      image_url: product.image_url || "",
      category_id: product.category_id || "",
    });
    setError("");
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (editingProduct) {
        const { data } = await api.put(
          `/products/${editingProduct.id}`,
          productForm
        );
        setSuccess("Product updated successfully!");
        setProducts(
          products.map((p) =>
            p.id === editingProduct.id ? { ...p, ...data } : p
          )
        );
      } else {
        const { data } = await api.post("/products", productForm);
        setSuccess("Product created successfully!");
        setProducts([data, ...products]);
      }
      setShowProductModal(false);
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    setError("");
    setSuccess("");
    try {
      await api.delete(`/products/${productId}`);
      setSuccess("Product deleted successfully!");
      setProducts(products.filter((p) => p.id !== productId));
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product");
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    setError("");
    setSuccess("");
    try {
      await api.put("/orders/admin/status", {
        order_id: orderId,
        status: newStatus,
      });
      setSuccess(`Order status updated to ${newStatus}`);
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      fetchStats();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update order status"
      );
    }
  };

  const handleToggleUserRole = async (userToModify) => {
    const targetRole = userToModify.role === "admin" ? "customer" : "admin";
    if (
      !window.confirm(
        `Are you sure you want to change ${userToModify.name}'s role to ${targetRole}?`
      )
    )
      return;
    setError("");
    setSuccess("");
    try {
      await api.put(`/auth/admin/users/${userToModify.id}/role`, {
        role: targetRole,
      });
      setSuccess(`Updated ${userToModify.name}'s role to ${targetRole}`);
      setUsers(
        users.map((u) => (u.id === userToModify.id ? { ...u, role: targetRole } : u))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user role");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-urbanCoral/10 text-urbanCoral border border-urbanCoral/20";
      case "paid":
      case "delivered":
        return "bg-forestGreen/10 text-forestGreen border border-forestGreen/20";
      case "shipped":
        return "bg-replasticVistaBlue/10 text-replasticVistaBlue border border-replasticVistaBlue/20";
      case "cancelled":
      default:
        return "bg-red/10 text-red border border-red/20";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-10">
      
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-forestGreen/15 pb-6">
        <h2 className="font-display font-light text-3xl text-forestGreen">
          Admin Control Panel
        </h2>
        <motion.button
          whileTap={{ rotate: 180 }}
          onClick={() => {
            fetchStats();
            fetchProducts();
            fetchOrders();
            fetchUsers();
          }}
          className="w-fit flex items-center gap-2.5 px-5 py-2.5 border border-forestGreen/15 bg-white/30 text-[10px] font-display font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-none"
        >
          <RefreshCw size={12} className="text-forestGreen" /> Sync Data
        </motion.button>
      </div>

      {/* Tabs Selector - Editorial thin borders */}
      <div className="flex border border-forestGreen/15 bg-white/30 overflow-x-auto gap-0 shadow-none">
        {[
          { id: "overview", label: "Overview", icon: <BarChart3 size={14} /> },
          { id: "products", label: "Products", icon: <ShoppingBag size={14} /> },
          { id: "orders", label: "Orders", icon: <Inbox size={14} /> },
          { id: "users", label: "Users", icon: <Users size={14} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-6 py-4 text-[9px] font-display font-bold uppercase tracking-[0.2em] relative transition-colors border-r border-forestGreen/15 last:border-r-0 ${
              activeTab === tab.id
                ? "bg-forestGreen text-creme"
                : "text-stoneBrown-600 hover:text-forestGreen hover:bg-forestGreen/5"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Messages */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red/5 border border-red/20 text-red text-[10px] font-display font-bold uppercase tracking-wider py-3.5 px-4 text-center"
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-forestGreen/5 border border-forestGreen/20 text-forestGreen text-[10px] font-display font-bold uppercase tracking-wider py-3.5 px-4 text-center"
          >
            {success}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* ===================== OVERVIEW TAB ===================== */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-10">
            {/* Metrics grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-forestGreen text-creme border border-forestGreen/10 p-6 flex items-center gap-4 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-[100px] h-[100px] bg-urbanCoral/20 rounded-full filter blur-[30px]" />
                <div className="p-3.5 bg-creme/10 text-urbanCoral">
                  <DollarSign size={18} />
                </div>
                <div>
                  <span className="text-creme/70 text-[9px] font-display font-bold uppercase tracking-widest block mb-1">
                    Total Revenue
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-urbanCoral">
                    ₹{stats.total_revenue.toLocaleString("en-IN")}
                  </h3>
                </div>
              </div>

              <div className="bg-white/40 border border-forestGreen/15 p-6 flex items-center gap-4">
                <div className="p-3.5 bg-forestGreen/5 text-forestGreen">
                  <Inbox size={18} />
                </div>
                <div>
                  <span className="text-stoneBrown-600 text-[9px] font-display font-bold uppercase tracking-widest block mb-1">
                    Total Orders
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-forestGreen">
                    {stats.total_orders}
                  </h3>
                </div>
              </div>

              <div className="bg-white/40 border border-forestGreen/15 p-6 flex items-center gap-4">
                <div className="p-3.5 bg-forestGreen/5 text-forestGreen">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <span className="text-stoneBrown-600 text-[9px] font-display font-bold uppercase tracking-widest block mb-1">
                    Products Catalog
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-forestGreen">
                    {stats.total_products}
                  </h3>
                </div>
              </div>

              <div className="bg-white/40 border border-forestGreen/15 p-6 flex items-center gap-4">
                <div className="p-3.5 bg-forestGreen/5 text-forestGreen">
                  <Users size={18} />
                </div>
                <div>
                  <span className="text-stoneBrown-600 text-[9px] font-display font-bold uppercase tracking-widest block mb-1">
                    Registered Users
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-forestGreen">
                    {stats.total_users}
                  </h3>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-b border-forestGreen/10 pb-4">
              <Activity size={16} className="text-forestGreen" />
              <h3 className="font-serif italic font-light text-xl text-forestGreen">
                Recent Transaction logs
              </h3>
            </div>

            <div className="bg-white/40 border border-forestGreen/15 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-forestGreen/15 text-[9px] font-display font-bold uppercase tracking-[0.2em] text-stoneBrown-600 bg-forestGreen/5">
                      <th className="p-4">Reference ID</th>
                      <th className="p-4">Customer context</th>
                      <th className="p-4">Date stamp</th>
                      <th className="p-4">Total Value</th>
                      <th className="p-4">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forestGreen/10 text-xs text-stoneBrown-700 font-sans font-light">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-forestGreen/5 transition-colors">
                        <td className="p-4 font-bold text-forestGreen font-sans">
                          #{order.id}
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-forestGreen font-sans">
                            {order.customer_name}
                          </div>
                          <div className="text-[10px] text-stoneBrown-500 font-sans">
                            {order.customer_email}
                          </div>
                        </td>
                        <td className="p-4 text-stoneBrown-500 font-sans">
                          {new Date(order.created_at).toLocaleDateString("en-IN")}
                        </td>
                        <td className="p-4 font-semibold text-stoneBrown-800 font-sans">
                          ₹{Number(order.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-[8px] font-display font-bold uppercase tracking-[0.2em] px-2.5 py-1 border ${getStatusStyle(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-8 text-center text-stoneBrown-600 font-serif italic text-sm"
                        >
                          No orders recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== PRODUCTS TAB ===================== */}
        {activeTab === "products" && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-forestGreen/10 pb-4">
              <h3 className="font-serif italic font-light text-xl text-forestGreen">
                Catalog Inventory ({products.length})
              </h3>
              <button
                onClick={handleAddProductClick}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-forestGreen text-creme hover:bg-urbanCoral hover:text-creme transition-all duration-300 font-display font-bold text-[9px] uppercase tracking-wider"
              >
                <Plus size={12} /> Add New Item
              </button>
            </div>

            <div className="bg-white/40 border border-forestGreen/15 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-forestGreen/15 text-[9px] font-display font-bold uppercase tracking-[0.2em] text-stoneBrown-600 bg-forestGreen/5">
                      <th className="p-4">Visual</th>
                      <th className="p-4">Product Specs</th>
                      <th className="p-4">Section</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock Context</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forestGreen/10 text-xs text-stoneBrown-700 font-sans font-light">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-forestGreen/5 transition-colors">
                        <td className="p-4">
                          <img
                            src={
                              product.image_url || "https://via.placeholder.com/60"
                            }
                            alt={product.name}
                            className="w-12 h-12 object-cover border border-forestGreen/10 bg-ivory-100"
                          />
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-forestGreen text-sm">
                            {product.name}
                          </div>
                          <div className="text-[10px] text-stoneBrown-500 max-w-[260px] truncate mt-0.5 font-sans font-light">
                            {product.description || "No description provided."}
                          </div>
                        </td>
                        <td className="p-4 text-stoneBrown-600 font-sans">
                          {product.category_name || "Uncategorized"}
                        </td>
                        <td className="p-4 font-bold text-stoneBrown-800 font-sans">
                          ₹{Number(product.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-[8px] font-display font-bold uppercase tracking-[0.18em] px-2.5 py-1 border ${
                              product.stock === 0
                                ? "bg-red/10 text-red border-red/25"
                                : product.stock < 10
                                ? "bg-urbanCoral/10 text-urbanCoral border-urbanCoral/25"
                                : "bg-forestGreen/10 text-forestGreen border-forestGreen/25"
                            }`}
                          >
                            {product.stock === 0
                              ? "Out of stock"
                              : `${product.stock} units`}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEditProductClick(product)}
                              className="px-3 py-1.5 border border-forestGreen/15 text-forestGreen font-display font-bold text-[9px] uppercase tracking-wider hover:bg-forestGreen hover:text-creme transition-all flex items-center gap-1 bg-white/50"
                            >
                              <Edit size={10} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="px-3 py-1.5 border border-red/20 text-red font-display font-bold text-[9px] uppercase tracking-wider hover:bg-red hover:text-white transition-all flex items-center gap-1 bg-white/50"
                            >
                              <Trash2 size={10} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== ORDERS TAB ===================== */}
        {activeTab === "orders" && (
          <div className="flex flex-col gap-6">
            <h3 className="font-serif italic font-light text-xl text-forestGreen border-b border-forestGreen/10 pb-4">
              All System Dispatch Orders ({orders.length})
            </h3>

            <div className="bg-white/40 border border-forestGreen/15 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-forestGreen/15 text-[9px] font-display font-bold uppercase tracking-[0.2em] text-stoneBrown-600 bg-forestGreen/5">
                      <th className="p-4">Reference</th>
                      <th className="p-4">Customer Specs</th>
                      <th className="p-4">Items Context</th>
                      <th className="p-4">Shipping Destination</th>
                      <th className="p-4">Value</th>
                      <th className="p-4">Status Transition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forestGreen/10 text-xs text-stoneBrown-700 font-sans font-light">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-forestGreen/5 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-forestGreen font-sans">
                            #{order.id}
                          </div>
                          <div className="text-[9px] text-stoneBrown-500 mt-0.5 font-sans">
                            {new Date(order.created_at).toLocaleString("en-IN")}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-forestGreen font-sans">
                            {order.customer_name}
                          </div>
                          <div className="text-[10px] text-stoneBrown-500 font-sans">
                            {order.customer_email}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1 text-[11px] max-w-[200px] font-sans font-light">
                            {order.items.map((item, idx) => (
                              <div key={idx}>
                                • {item.name}{" "}
                                <strong className="text-forestGreen">
                                  x{item.quantity}
                                </strong>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-stoneBrown-500 text-[11px] leading-snug max-w-[180px] break-words font-sans font-light">
                          {order.shipping_address || "N/A"}
                        </td>
                        <td className="p-4 font-bold text-stoneBrown-800 text-sm font-sans">
                          ₹{Number(order.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleOrderStatusChange(order.id, e.target.value)
                            }
                            className="px-3 py-1.5 border border-forestGreen/15 focus:border-forestGreen outline-none transition-all text-[9px] font-display font-bold uppercase tracking-wider bg-white cursor-pointer rounded-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== USERS TAB ===================== */}
        {activeTab === "users" && (
          <div className="flex flex-col gap-6">
            <h3 className="font-serif italic font-light text-xl text-forestGreen border-b border-forestGreen/10 pb-4">
              Registered Profile Contexts ({users.length})
            </h3>

            <div className="bg-white/40 border border-forestGreen/15 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-forestGreen/15 text-[9px] font-display font-bold uppercase tracking-[0.2em] text-stoneBrown-600 bg-forestGreen/5">
                      <th className="p-4">Profile context</th>
                      <th className="p-4">Auth Email</th>
                      <th className="p-4">Mobile Specs</th>
                      <th className="p-4">Verification State</th>
                      <th className="p-4">Registry Date</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forestGreen/10 text-xs text-stoneBrown-700 font-sans font-light">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-forestGreen/5 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-forestGreen font-sans">
                            {u.name}
                          </div>
                          <span
                            className={`text-[8px] font-display font-bold uppercase tracking-[0.2em] px-2 py-0.5 border mt-1.5 inline-block ${
                              u.role === "admin"
                                ? "bg-urbanCoral/10 border-urbanCoral/25 text-urbanCoral"
                                : "bg-forestGreen/5 border-transparent text-stoneBrown-500"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 font-sans font-light">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{u.email}</span>
                            {u.google_id && (
                              <span className="text-[8px] font-display font-bold text-urbanCoral bg-urbanCoral/5 border border-urbanCoral/20 px-2 py-0.5">
                                Google Identity
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-stoneBrown-600 font-sans font-light">
                          {u.phone_number || "N/A"}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1 text-[9px] font-display font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-1 text-stoneBrown-500">
                              <span>Email:</span>
                              {u.is_email_verified ? (
                                <span className="text-forestGreen font-bold">Verified</span>
                              ) : (
                                <span className="text-urbanCoral font-bold">Pending</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-stoneBrown-500">
                              <span>Phone:</span>
                              {u.is_phone_verified ? (
                                <span className="text-forestGreen font-bold">Verified</span>
                              ) : (
                                <span className="text-urbanCoral font-bold">Pending</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-stoneBrown-500 font-sans font-light">
                          {new Date(u.created_at).toLocaleDateString("en-IN")}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleUserRole(u)}
                            className="px-3 py-1.5 border border-forestGreen/15 text-forestGreen font-display font-bold text-[9px] uppercase tracking-wider hover:bg-forestGreen hover:text-creme transition-all bg-white/50 mx-auto flex items-center gap-1"
                          >
                            <UserCheck size={10} /> Toggle Role
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* ===================== ADD/EDIT PRODUCT MODAL ===================== */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 bg-forestGreen/70 backdrop-blur-sm flex justify-center items-center z-[100] p-6">
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 15 }}
              className="bg-white border border-forestGreen/15 p-8 max-w-lg w-full shadow-none"
            >
              <h3 className="font-serif italic font-light text-xl text-forestGreen mb-6 pb-3 border-b border-forestGreen/10">
                {editingProduct
                  ? `Edit ${editingProduct.name}`
                  : "Create Catalog Record"}
              </h3>

              <form onSubmit={handleProductSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-display font-bold uppercase tracking-[0.2em] text-stoneBrown-600 mb-0.5">
                      Product Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Curated Leather Bag"
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm({ ...productForm, name: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 border border-forestGreen/15 focus:border-forestGreen outline-none text-xs bg-white rounded-none font-sans font-light"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-display font-bold uppercase tracking-[0.2em] text-stoneBrown-600 mb-0.5">
                      Section Category
                    </label>
                    <select
                      value={productForm.category_id}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          category_id: e.target.value,
                        })
                      }
                      required
                      className="w-full px-3 py-2 border border-forestGreen/15 focus:border-forestGreen outline-none text-xs bg-white rounded-none h-[34px] font-display font-bold uppercase tracking-wider cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-display font-bold uppercase tracking-[0.2em] text-stoneBrown-600 mb-0.5">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 1999.00"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: e.target.value,
                        })
                      }
                      required
                      className="w-full px-3 py-2 border border-forestGreen/15 focus:border-forestGreen outline-none text-xs bg-white rounded-none font-sans font-light"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-display font-bold uppercase tracking-[0.2em] text-stoneBrown-600 mb-0.5">
                      Inventory Stock
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 25"
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          stock: e.target.value,
                        })
                      }
                      required
                      className="w-full px-3 py-2 border border-forestGreen/15 focus:border-forestGreen outline-none text-xs bg-white rounded-none font-sans font-light"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-display font-bold uppercase tracking-[0.2em] text-stoneBrown-600 mb-0.5">
                    Product Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={productForm.image_url}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        image_url: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-forestGreen/15 focus:border-forestGreen outline-none text-xs bg-white rounded-none font-sans font-light"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-display font-bold uppercase tracking-[0.2em] text-stoneBrown-600 mb-0.5">
                    Description details
                  </label>
                  <textarea
                    placeholder="Write detailed design specifications..."
                    rows={4}
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-forestGreen/15 focus:border-forestGreen outline-none text-xs bg-white rounded-none resize-none font-sans font-light"
                  />
                </div>

                <div className="flex gap-3 justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-5 py-2.5 border border-forestGreen/15 text-stoneBrown-600 hover:border-forestGreen font-display font-bold text-[9px] uppercase tracking-wider bg-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-forestGreen text-creme border border-forestGreen hover:bg-urbanCoral hover:border-urbanCoral transition-all font-display font-bold text-[9px] uppercase tracking-wider disabled:opacity-50"
                  >
                    {loading ? "Saving Item..." : "Save Catalog Record"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminRoute>
      <AdminDashboardContent />
    </AdminRoute>
  );
}
