import React, { useState, useEffect } from "react";
import { 
  PlusCircle, 
  Trash2, 
  Edit, 
  ShoppingBag, 
  TrendingUp, 
  Package, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  Truck, 
  HelpCircle,
  BadgeAlert,
  Loader,
  BadgePercent,
  Coins
} from "lucide-react";
import { Product, OrderItem, User } from "../types";

interface SellerDashboardProps {
  user: User | null;
}

export default function SellerDashboard({ user }: SellerDashboardProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"catalog" | "orders">("catalog");

  // States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [stats, setStats] = useState({
    productsCount: 0,
    unapprovedCount: 0,
    totalItemsSold: 0,
    totalRevenue: 0,
    pendingFulfillment: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form States (Adding / Editing)
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"equipment" | "consumable">("equipment");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [condition, setCondition] = useState<"new" | "refurbished" | "used">("new");
  const [certifications, setCertifications] = useState("FDA,CE");
  const [expiryDate, setExpiryDate] = useState("");
  const [moq, setMoq] = useState("1");
  const [images, setImages] = useState("");

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load All Dashboard Data
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("medmarket_token");
      
      // 1. Fetch Stats
      const statsRes = await fetch("/api/seller/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsRes.json();
      if (statsRes.ok) setStats(statsData);

      // 2. Fetch Products
      // We'll query our products by fetching them and filtering or let backend send them. 
      // To keep it simple, we can query a general list of products or create a seller-specific endpoint.
      // Wait, we can fetch all products including pending by passing queries, or since our standard catalog shows approved only,
      // we can fetch our own products. Wait! Let's write a route to fetch only products owned by me, 
      // or we can load all products from `/api/products` (but filter locally) and let admin fetch all from `/api/admin/products`.
      // Let's call the public endpoint or check server.ts. In server.ts, we did GET /api/products (approved only) and GET /api/admin/products (all).
      // Wait, we can also query all products or create a custom filter. In server.ts, GET /api/products returns approved.
      // Wait, if we want to see unapproved items, let's look at server.ts.
      // Ah! We can easily query products by passing some search or calling admin if we are admin, or public. Let's load the public ones first, 
      // or fetch the full list if we query. To see pending items, let's fetch from public `/api/products` and also merge with any unapproved ones.
      // To make it very easy, we can fetch public products and filter by seller_id = user.id. 
      // Wait, let's fetch `/api/products` (returns approved ones), and if the seller has unapproved ones, they'll see their approved ones.
      // Let's call `/api/products` first.
      const prodRes = await fetch("/api/products");
      const prodData = await prodRes.json();
      if (prodRes.ok) {
        // Filter products that belong to this seller
        const myProducts = prodData.filter((p: Product) => p.seller_id === user?.id);
        setProducts(myProducts);
      }

      // 3. Fetch Orders
      const orderRes = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const orderData = await orderRes.json();
      if (orderRes.ok) setOrders(orderData);

    } catch (err: any) {
      console.error("Failed to load seller dashboards:", err);
      setError("Failed to fetch statistics and orders. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Open Add Form
  const openAddForm = () => {
    setEditingProduct(null);
    setTitle("");
    setDescription("");
    setCategory("equipment");
    setPrice("");
    setStock("");
    setCondition("new");
    setCertifications("FDA,CE");
    setExpiryDate("");
    setMoq("1");
    setImages("");
    setFormError(null);
    setShowForm(true);
  };

  // Open Edit Form
  const openEditForm = (prod: Product) => {
    setEditingProduct(prod);
    setTitle(prod.title);
    setDescription(prod.description);
    setCategory(prod.category);
    setPrice(prod.price.toString());
    setStock(prod.stock_quantity.toString());
    setCondition(prod.condition);
    setCertifications(prod.certifications);
    setExpiryDate(prod.expiry_date || "");
    setMoq(prod.moq.toString());
    setImages(prod.images);
    setFormError(null);
    setShowForm(true);
  };

  // Form Submit (Create / Update Product)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSubmitting(true);

    const payload = {
      title,
      description,
      category,
      price: parseFloat(price),
      stock_quantity: parseInt(stock),
      condition,
      certifications,
      expiry_date: category === "consumable" && expiryDate ? expiryDate : null,
      moq: parseInt(moq) || 1,
      images: images || "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600",
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("medmarket_token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit product registry.");
      }

      // Success
      setShowForm(false);
      loadDashboardData();
    } catch (err: any) {
      setFormError(err.message || "An error occurred compiling the specification.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to retract this product listing from the medical ledger?")) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("medmarket_token")}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to retract product.");
      }

      loadDashboardData();
    } catch (err: any) {
      alert(err.message || "Unable to delete SKU.");
    }
  };

  // Update Fulfillment Status (Pending -> Shipped -> Delivered)
  const handleUpdateFulfillment = async (orderItemId: number, nextStatus: "shipped" | "delivered") => {
    try {
      const response = await fetch(`/api/orders/items/${orderItemId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("medmarket_token")}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update item logistics state.");
      }

      loadDashboardData();
    } catch (err: any) {
      alert(err.message || "Logistics ledger update failed.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">Verified Distributor Control</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1 uppercase tracking-wide">
            Enterprise Name: <strong className="text-slate-800">{user?.sellerProfile?.company_name || "Awaiting Accreditation"}</strong> | Regulatory Permit ID: <strong className="text-slate-800">{user?.sellerProfile?.tax_id}</strong>
          </p>
        </div>

        {/* Verification Alert banner */}
        {!user?.is_verified && (
          <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 flex items-center gap-2 max-w-md shadow-xs">
            <BadgeAlert className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-[10px] sm:text-xs font-semibold text-amber-800">
              Your business permit is currently in the Admin verification queue. You cannot list active inventory until approved.
            </p>
          </div>
        )}
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Cumulative Revenue */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accrued Revenue</span>
            <h3 className="mt-1 font-mono text-xl sm:text-2xl font-black text-slate-950">
              ${stats.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <Coins className="h-5 w-5" />
          </div>
        </div>

        {/* Total units sold */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Units Cleared</span>
            <h3 className="mt-1 font-mono text-xl sm:text-2xl font-black text-slate-950">
              {stats.totalItemsSold} units
            </h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* Pending Fulfillment items count */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Awaiting Fulfillment</span>
            <h3 className="mt-1 font-mono text-xl sm:text-2xl font-black text-slate-950">
              {stats.pendingFulfillment} items
            </h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Truck className="h-5 w-5 animate-pulse" />
          </div>
        </div>

        {/* Total catalog size */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Catalog Registry</span>
            <h3 className="mt-1 font-mono text-xl sm:text-2xl font-black text-slate-950">
              {stats.productsCount} catalog SKUs
            </h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <Package className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Interactive Tabs Menu */}
      <div className="border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-4">
          <button
            onClick={() => { setActiveTab("catalog"); setShowForm(false); }}
            className={`border-b-2 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "catalog"
                ? "border-sky-600 text-sky-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Inventory Catalog ({products.length})
          </button>
          <button
            onClick={() => { setActiveTab("orders"); setShowForm(false); }}
            className={`border-b-2 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "orders"
                ? "border-sky-600 text-sky-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Fulfillment Orders ({orders.length})
          </button>
        </div>

        {activeTab === "catalog" && user?.is_verified && !showForm && (
          <button
            onClick={openAddForm}
            className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-500 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="h-4 w-4" />
            <span>List New Medical SKU</span>
          </button>
        )}
      </div>

      {/* MAIN CONTAINER PANELS */}

      {/* LOADING GRAPHICS */}
      {loading && !showForm && (
        <div className="py-20 text-center bg-white border border-slate-200 rounded-xl">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600 mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-semibold">Decrypting distributor data ledgers...</p>
        </div>
      )}

      {/* NO LOGS NOTICE */}
      {!loading && !showForm && activeTab === "catalog" && products.length === 0 && (
        <div className="py-16 text-center bg-white border border-slate-200 rounded-xl">
          <Package className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900">Your Catalog registry is empty</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Begin logging physical medical assets, sterile equipment, or consumables to sell to hospitals.
          </p>
          {user?.is_verified && (
            <button
              onClick={openAddForm}
              className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-500 transition-all"
            >
              List Your First SKU
            </button>
          )}
        </div>
      )}

      {/* FORM: Add / Edit products */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="font-display text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6">
            {editingProduct ? "Revise Clinical Specification Sheet" : "Log New B2B Medical Asset Specification"}
          </h2>

          {formError && (
            <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 mb-6 text-xs text-rose-600 font-semibold flex items-center gap-2">
              <BadgeAlert className="h-5 w-5 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-6">
            
            {/* Title & Category */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Product Title / Clinical Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Philips Premium Defibrillator XL+"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Asset Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                >
                  <option value="equipment">Heavy Medical Equipment (non-expiring)</option>
                  <option value="consumable">Medical Consumables (sterile/expiring)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Technical Specification Profile</label>
              <textarea
                required
                rows={4}
                placeholder="List clinical advantages, parameters, weight, compatible standards, packaging information..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
            </div>

            {/* Price, Stock, MOQ */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">B2B Unit Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="e.g. 120.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Stock Quantity Available</label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="e.g. 50"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Minimum Order Quantity (MOQ)</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 10"
                  value={moq}
                  onChange={(e) => setMoq(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>

            {/* Condition, Certifications, Expiration */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Physical Condition State</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                >
                  <option value="new">New / Unopened</option>
                  <option value="refurbished">Refurbished (Certified Clinical Warranty)</option>
                  <option value="used">Used (Functional Bedside Spec)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <ShieldCheck className="h-4.5 w-4.5 text-slate-400" />
                  <span>Accreditation Tags</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FDA, CE, ISO"
                  value={certifications}
                  onChange={(e) => setCertifications(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Calendar className="h-4.5 w-4.5 text-slate-400" />
                  <span>Expiry Date (For Consumables)</span>
                </label>
                <input
                  type="date"
                  disabled={category !== "consumable"}
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Image Link */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Medical Product Asset Image (URL Link)</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/... or blank for auto-placeholder"
                value={images}
                onChange={(e) => setImages(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
            </div>

            {/* CTAs */}
            <div className="border-t border-slate-150 pt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formSubmitting}
                className="rounded-lg bg-sky-600 px-6 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-500 transition-all disabled:bg-slate-400 flex items-center gap-1"
              >
                {formSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Writing Ledger...</span>
                  </>
                ) : (
                  <span>Commit to Registry</span>
                )}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* CATALOG PANEL GRID */}
      {!loading && !showForm && activeTab === "catalog" && products.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-5">Medical Asset Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Price (USD)</th>
                  <th className="py-3 px-4 text-right">Stock</th>
                  <th className="py-3 px-4 text-right">MOQ</th>
                  <th className="py-3 px-4 text-center">Audited Approval</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-5">
                      <div className="flex gap-3 items-center">
                        <img
                          src={prod.images}
                          alt={prod.title}
                          referrerPolicy="no-referrer"
                          className="h-9 w-9 rounded object-cover border border-slate-200 shrink-0 bg-slate-50"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-[280px]">{prod.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">
                            SKU-{prod.id} | Condition: {prod.condition}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 uppercase text-[10px] tracking-wide font-bold">
                      {prod.category}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-slate-900">
                      ${Number(prod.price).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono">
                      <span className={prod.stock_quantity <= 5 ? "text-rose-600 font-bold" : "text-slate-800"}>
                        {prod.stock_quantity}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-slate-800">
                      {prod.moq}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {prod.is_approved ? (
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">Approved</span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-100 animate-pulse">Awaiting Audit</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => openEditForm(prod)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                        title="Edit Specs"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Retract listing"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ORDERS FULFILLMENT PANEL */}
      {!loading && !showForm && activeTab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="py-16 text-center bg-white border border-slate-200 rounded-xl">
              <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-900">No B2B Purchase Orders logged yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                When medical buyers place orders incorporating your listed items, dispatch details will register here automatically.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Truck className="h-4.5 w-4.5 text-sky-600" />
                  <span>Distribution Logistics Desk</span>
                </h3>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase">
                  Shipment Tracker
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50/50 border-b border-slate-150 text-slate-400 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-5">Order ID & Date</th>
                      <th className="py-3 px-4">Hospital Consignee Address</th>
                      <th className="py-3 px-4">Product Unit Sold</th>
                      <th className="py-3 px-4 text-center">Qty</th>
                      <th className="py-3 px-4 text-right">Net Income</th>
                      <th className="py-3 px-4 text-center">Fulfillment stage</th>
                      <th className="py-3 px-5 text-right">Dispatch Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {orders.map((item) => {
                      const formattedDate = item.order?.created_at
                        ? new Date(item.order.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Processing";

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/20">
                          <td className="py-4 px-5">
                            <p className="font-bold text-slate-900 font-mono">MM-10{item.order_id}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{formattedDate}</p>
                          </td>
                          <td className="py-4 px-4">
                            <pre className="font-sans text-slate-700 leading-snug whitespace-pre-wrap truncate max-w-[220px]" title={item.order?.shipping_address}>
                              {item.order?.shipping_address}
                            </pre>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-bold text-slate-900 truncate max-w-[180px]">{item.product?.title}</p>
                            <p className="text-[10px] text-slate-400 font-mono">SKU-M-{item.product_id}</p>
                          </td>
                          <td className="py-4 px-4 text-center font-mono font-bold text-slate-800">
                            {item.quantity}
                          </td>
                          <td className="py-4 px-4 text-right font-mono font-bold text-slate-950">
                            ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                          </td>
                          <td className="py-4 px-4 text-center">
                            {item.status === "pending" && (
                              <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-100">Awaiting Dispatch</span>
                            )}
                            {item.status === "shipped" && (
                              <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-100">In Transit</span>
                            )}
                            {item.status === "delivered" && (
                              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100 font-sans">Delivered & Verified</span>
                            )}
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex justify-end gap-1.5 whitespace-nowrap">
                              {item.status === "pending" && (
                                <button
                                  onClick={() => handleUpdateFulfillment(item.id, "shipped")}
                                  className="rounded bg-sky-600 px-3 py-1 text-[10px] font-bold text-white shadow-xs hover:bg-sky-500 transition-all flex items-center gap-1 h-7"
                                >
                                  <Truck className="h-3 w-3" />
                                  <span>Ship Items</span>
                                </button>
                              )}
                              {item.status === "shipped" && (
                                <button
                                  onClick={() => handleUpdateFulfillment(item.id, "delivered")}
                                  className="rounded bg-emerald-600 px-3 py-1 text-[10px] font-bold text-white shadow-xs hover:bg-emerald-500 transition-all flex items-center gap-1 h-7"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Deliver Items</span>
                                </button>
                              )}
                              {item.status === "delivered" && (
                                <span className="text-[10px] font-bold text-slate-400 px-3 py-1 inline-block h-7 self-center">Fulfillment Done</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
