import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Clock, 
  Truck, 
  CheckCircle, 
  BadgeAlert, 
  FileText, 
  DollarSign, 
  MapPin, 
  HelpCircle 
} from "lucide-react";
import InvoiceModal from "../components/InvoiceModal";
import { Order, User } from "../types";
import { Link } from "react-router-dom";

interface BuyerDashboardProps {
  user: User | null;
}

export default function BuyerDashboard({ user }: BuyerDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  useEffect(() => {
    const fetchBuyerOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/orders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("medmarket_token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to load secure orders pipeline.");
        }
        const data = await response.json();
        setOrders(data);
      } catch (err: any) {
        console.error("Fetch orders failed:", err);
        setError("Unable to retrieve procurement orders ledger.");
      } finally {
        setLoading(false);
      }
    };

    fetchBuyerOrders();
  }, []);

  const openInvoice = (order: Order) => {
    setSelectedInvoiceOrder(order);
    setInvoiceOpen(true);
  };

  // Stats calculation
  const totalSpend = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "paid").length;
  const shippedOrders = orders.filter((o) => o.status === "shipped").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 border border-amber-150">Approval Pending</span>;
      case "paid":
        return <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700 border border-sky-150">Payment Cleared / Processing</span>;
      case "shipped":
        return <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 border border-indigo-150">In Transit / Shipped</span>;
      case "delivered":
        return <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 border border-emerald-150">Delivered</span>;
      case "cancelled":
        return <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 border border-rose-150">Cancelled</span>;
      default:
        return <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 border border-slate-150">Unknown</span>;
    }
  };

  const getItemStatusBadge = (status: "pending" | "shipped" | "delivered") => {
    switch (status) {
      case "pending":
        return <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-100">Pending Release</span>;
      case "shipped":
        return <span className="inline-flex items-center rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-100">Shipped</span>;
      case "delivered":
        return <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100 font-sans">Delivered</span>;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">Institutional Procurement Logs</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1 uppercase tracking-wide">
          Hospital ID: <strong className="text-slate-800">US-BUY-10{user?.id || "X"}</strong> | Contact: <strong className="text-slate-800">{user?.email}</strong>
        </p>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Cumulative Expenditure */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ledger Spending</span>
            <h3 className="mt-1 font-mono text-xl sm:text-2xl font-black text-slate-950">
              ${totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Processing items */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Awaiting Dispatch</span>
            <h3 className="mt-1 font-mono text-xl sm:text-2xl font-black text-slate-950">
              {pendingOrders} orders
            </h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Shipped / Transit */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Transit</span>
            <h3 className="mt-1 font-mono text-xl sm:text-2xl font-black text-slate-950">
              {shippedOrders} orders
            </h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Truck className="h-5 w-5 animate-pulse" />
          </div>
        </div>

        {/* Delivered / Completed */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fully Cleared</span>
            <h3 className="mt-1 font-mono text-xl sm:text-2xl font-black text-slate-950">
              {deliveredOrders} orders
            </h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Orders pipeline */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-sky-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Dispatch & Shipment Pipeline</h2>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
            {orders.length} unique ledger events
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600 mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-semibold">Decrypting transaction ledgers...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-rose-600 font-semibold px-4">{error}</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-slate-400 px-4">
            <ShoppingBag className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">No Orders Logged</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              When your hospital procurement officer approves shopping carts, transactions will clear and render a live tracking sheet.
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-500 transition-all"
            >
              Browse Products Catalog
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-150">
            {orders.map((order) => {
              const formattedDate = order.created_at
                ? new Date(order.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Just Now";

              return (
                <div key={order.id} className="p-6 space-y-4">
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black text-slate-950 font-mono">ORDER #MM-10{order.id}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Logged on: {formattedDate}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] block uppercase font-bold text-slate-400 leading-none">Settlement amount</span>
                        <span className="text-sm font-extrabold text-slate-950 font-mono leading-none mt-1 inline-block">
                          ${Number(order.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <button
                        onClick={() => openInvoice(order)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs shrink-0 h-9"
                      >
                        <FileText className="h-4 w-4 text-sky-600" />
                        <span>Invoice Certificate</span>
                      </button>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Products details */}
                    <div className="md:col-span-8 space-y-2.5">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex gap-4 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                          <img
                            src={item.product?.images}
                            alt={item.product?.title}
                            referrerPolicy="no-referrer"
                            className="h-12 w-12 rounded-md object-cover bg-white border border-slate-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600";
                            }}
                          />
                          <div className="flex-1 min-w-0 flex justify-between items-start gap-4">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 truncate max-w-[340px]">
                                {item.product?.title || "Medical Hardware SKU"}
                              </h4>
                              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                                SKU-M-{item.product_id} | Condition: {item.product?.condition?.toUpperCase() || "NEW"}
                              </p>
                              <div className="flex items-center gap-1.5 mt-2">
                                <span className="text-[10px] font-bold text-slate-500">Qty Ordered: <strong className="text-slate-800">{item.quantity}</strong></span>
                                <span className="text-slate-300 text-[10px]">•</span>
                                <span className="text-[10px] font-bold text-slate-500">Unit Price: <strong className="text-slate-800">${Number(item.unit_price).toFixed(2)}</strong></span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className="text-xs font-black text-slate-950 font-mono">
                                ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                              </span>
                              {getItemStatusBadge(item.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address details info */}
                    <div className="md:col-span-4 rounded-xl border border-slate-150 p-4 text-xs space-y-3 bg-slate-50/30">
                      <h4 className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 leading-none pb-2 border-b border-slate-100">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>Consignment Log</span>
                      </h4>
                      <pre className="font-sans text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {order.shipping_address}
                      </pre>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Invoice Modal Trigger */}
      <InvoiceModal
        isOpen={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        order={selectedInvoiceOrder}
      />

    </div>
  );
}
