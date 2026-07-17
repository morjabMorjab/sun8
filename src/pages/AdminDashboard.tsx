import React, { useState, useEffect } from "react";
import { 
  Users, 
  Building, 
  ShoppingBag, 
  DollarSign, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Package, 
  ClipboardList, 
  BarChart, 
  Loader,
  BadgeAlert
} from "lucide-react";
import { SellerProfile, Product, User } from "../types";

interface AdminDashboardProps {
  user: User | null;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    userCount: 0,
    sellerCount: 0,
    pendingSellers: 0,
    productCount: 0,
    pendingProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<"sellers" | "products">("sellers");

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("medmarket_token");

      // 1. Fetch Stats
      const statsRes = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsRes.json();
      if (statsRes.ok) setStats(statsData);

      // 2. Fetch Sellers
      const sellersRes = await fetch("/api/admin/sellers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sellersData = await sellersRes.json();
      if (sellersRes.ok) setSellers(sellersData);

      // 3. Fetch Products
      const productsRes = await fetch("/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const productsData = await productsRes.json();
      if (productsRes.ok) setProducts(productsData);

    } catch (err: any) {
      console.error("Admin load error:", err);
      setError("Failed to load secure administrative data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      loadAdminData();
    }
  }, [user]);

  // Approve/Reject Seller Profile
  const handleVerifySeller = async (userId: number, status: "approved" | "rejected") => {
    try {
      const response = await fetch(`/api/admin/sellers/${userId}/verify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("medmarket_token")}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update seller verification status.");
      }

      loadAdminData();
    } catch (err: any) {
      alert(err.message || "Operation failed.");
    }
  };

  // Approve/Reject Product Listing
  const handleApproveProduct = async (productId: number, is_approved: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/approve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("medmarket_token")}`,
        },
        body: JSON.stringify({ is_approved }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update product approval status.");
      }

      loadAdminData();
    } catch (err: any) {
      alert(err.message || "Operation failed.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">Administrative Control Center</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1 uppercase tracking-wide">
          Role: <strong className="text-sky-600">Global Registry Auditor</strong> | Authorized Account: <strong className="text-slate-800">{user?.email}</strong>
        </p>
      </div>

      {/* Stats Board Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Total platform revenue */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ledger Cumulative Sales</span>
            <h3 className="mt-1 font-mono text-xl sm:text-2xl font-black text-slate-950">
              ${stats.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Total verified / pending sellers */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accredited Distributors</span>
            <h3 className="mt-1 font-mono text-xl sm:text-2xl font-black text-slate-950">
              {stats.sellerCount} registered
            </h3>
            {stats.pendingSellers > 0 && (
              <span className="text-[10px] text-amber-600 font-bold block mt-1 animate-pulse">
                {stats.pendingSellers} awaiting verification audits!
              </span>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Building className="h-5 w-5" />
          </div>
        </div>

        {/* Total registered users */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clearinghouse Accounts</span>
            <h3 className="mt-1 font-mono text-xl sm:text-2xl font-black text-slate-950">
              {stats.userCount} active users
            </h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Total orders placed */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ledger Contracts</span>
            <h3 className="mt-1 font-mono text-xl sm:text-2xl font-black text-slate-950">
              {stats.totalOrders} order events
            </h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Tabs list */}
      <div className="border-b border-slate-200 flex gap-4">
        <button
          onClick={() => setActiveSubTab("sellers")}
          className={`border-b-2 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
            activeSubTab === "sellers"
              ? "border-sky-600 text-sky-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Distributor Auditing Queue ({stats.pendingSellers} Pending)
        </button>
        <button
          onClick={() => setActiveSubTab("products")}
          className={`border-b-2 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
            activeSubTab === "products"
              ? "border-sky-600 text-sky-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Product Listing Approvals ({stats.pendingProducts} Pending)
        </button>
      </div>

      {/* Loader */}
      {loading && (
        <div className="py-20 text-center bg-white border border-slate-200 rounded-xl">
          <Loader className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600 mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-semibold">Decrypting global administrative vaults...</p>
        </div>
      )}

      {/* PANELS */}

      {/* Panel 1: Sellers auditing queue */}
      {!loading && activeSubTab === "sellers" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {sellers.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No sellers registered on the platform.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-5">Registered Distributor Name</th>
                    <th className="py-3 px-4">Contact email</th>
                    <th className="py-3 px-4">Tax ID / Business Code</th>
                    <th className="py-3 px-4">Uploaded Permit License</th>
                    <th className="py-3 px-4 text-center">Audit Status</th>
                    <th className="py-3 px-5 text-right">Approval Decisions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {sellers.map((p) => (
                    <tr key={p.user_id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-5">
                        <p className="font-bold text-slate-900">{p.company_name}</p>
                        <p className="text-[10px] text-slate-400">User ID: MM-S-10{p.user_id}</p>
                      </td>
                      <td className="py-4 px-4 font-mono font-semibold text-slate-700">
                        {p.user?.email || "Awaiting database join"}
                      </td>
                      <td className="py-4 px-4 font-mono">
                        {p.tax_id}
                      </td>
                      <td className="py-4 px-4">
                        <a
                          href={p.license_document_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 font-bold text-sky-600 hover:underline"
                        >
                          <span>Review Document PDF</span>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        </a>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {p.status === "approved" && (
                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">Accredited</span>
                        )}
                        {p.status === "pending" && (
                          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-100 animate-pulse">Awaiting Audit</span>
                        )}
                        {p.status === "rejected" && (
                          <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-100">Rejected / Blocked</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right space-x-1.5">
                        {p.status !== "approved" && (
                          <button
                            onClick={() => handleVerifySeller(p.user_id, "approved")}
                            className="inline-flex items-center gap-1 rounded bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-xs hover:bg-emerald-500 transition-all h-7"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Verify Accredit</span>
                          </button>
                        )}
                        {p.status !== "rejected" && (
                          <button
                            onClick={() => handleVerifySeller(p.user_id, "rejected")}
                            className="inline-flex items-center gap-1 rounded bg-rose-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-xs hover:bg-rose-500 transition-all h-7"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Reject License</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Panel 2: Products approval queue */}
      {!loading && activeSubTab === "products" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {products.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No product listings submitted.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-5">Medical Asset Description</th>
                    <th className="py-3 px-4">Submitting Manufacturer</th>
                    <th className="py-3 px-4">Accreditation tags</th>
                    <th className="py-3 px-4 text-right">Price (USD)</th>
                    <th className="py-3 px-4 text-right">Stock</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-5 text-right font-bold">List Decisions</th>
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
                            className="h-10 w-10 rounded object-cover border border-slate-200 shrink-0 bg-slate-50"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-[220px]">{prod.title}</p>
                            <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">
                              Condition: {prod.condition} | MOQ: {prod.moq}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-700">
                        {prod.seller?.sellerProfile?.company_name || prod.seller?.email}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block rounded bg-slate-100 text-slate-800 px-2 py-0.5 text-[9px] font-bold font-mono">
                          {prod.certifications}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-slate-900">
                        ${Number(prod.price).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-slate-800">
                        {prod.stock_quantity} units
                      </td>
                      <td className="py-4 px-4 text-center">
                        {prod.is_approved ? (
                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">Live in Catalog</span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-100 animate-pulse">Awaiting Audit</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right space-x-1.5">
                        {!prod.is_approved ? (
                          <button
                            onClick={() => handleApproveProduct(prod.id, true)}
                            className="inline-flex items-center gap-1 rounded bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-xs hover:bg-emerald-500 transition-all h-7"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Authorize List</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApproveProduct(prod.id, false)}
                            className="inline-flex items-center gap-1 rounded bg-rose-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-xs hover:bg-rose-500 transition-all h-7"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Suspend SKU</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
