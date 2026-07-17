import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Search, 
  Heart, 
  ShoppingCart, 
  TrendingUp, 
  ShieldCheck, 
  Trash2, 
  Truck, 
  BadgeAlert, 
  BadgePercent,
  CheckCircle,
  Stethoscope
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import ProductFilters from "../components/ProductFilters";
import CheckoutModal from "../components/CheckoutModal";
import { Product, CartItem, User } from "../types";

interface CatalogProps {
  user: User | null;
  cart: CartItem[];
  onAddToCart: (product: Product, qty: number) => void;
  onUpdateCartQty: (productId: number, qty: number) => void;
  onRemoveFromCart: (productId: number) => void;
  onClearCart: () => void;
  isCartOpen: boolean;
  onCloseCart: () => void;
}

export default function Catalog({
  user,
  cart,
  onAddToCart,
  onUpdateCartQty,
  onRemoveFromCart,
  onClearCart,
  isCartOpen,
  onCloseCart,
}: CatalogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    condition: "all",
    certifications: "all",
    minPrice: "",
    maxPrice: "",
    moq: "",
  });

  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Fetch products with active filter parameters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        if (filters.search) queryParams.append("search", filters.search);
        if (filters.category && filters.category !== "all") queryParams.append("category", filters.category);
        if (filters.condition && filters.condition !== "all") queryParams.append("condition", filters.condition);
        if (filters.certifications && filters.certifications !== "all") queryParams.append("certifications", filters.certifications);
        if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
        if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
        if (filters.moq) queryParams.append("moq", filters.moq);

        const response = await fetch(`/api/products?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to load products from database ledger.");
        }
        const data = await response.json();
        setProducts(data);
      } catch (err: any) {
        console.error("Fetch products failed:", err);
        setError("Unable to connect to B2B registry. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const totalAmount = cart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);

  const handleCheckoutSuccess = () => {
    onClearCart();
    setCheckoutOpen(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 1. Clinically Trustworthy Banner */}
      <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 p-8 sm:p-12 shadow-md">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 border border-sky-400/20 px-3.5 py-1 text-xs font-semibold text-sky-400">
            <ShieldCheck className="h-4 w-4" />
            <span>FDA & CE Accredited Medical Manufacturers</span>
          </div>
          <h1 className="mt-4 font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Empowering Healthcare Logistics & Procurement
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
            Surgical tools, hospital instruments, bulk laboratory consumables, and specialized diagnostics. Verified credentials, structured B2B pricing grids, and live dispatch pipelines.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-sky-500" />
              <span>Full Seller Audits</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-sky-500" />
              <span>Bulk MOQ Discounts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-sky-500" />
              <span>Automated Invoicing Ledger</span>
            </div>
          </div>
        </div>

        {/* Decorative background visual */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:flex items-center justify-center opacity-10">
          <Stethoscope className="h-64 w-64 text-white" />
        </div>
      </div>

      {/* 2. Search bar with quick filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name, manufacturer, SKU, or regulatory parameters..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* 3. Catalog Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side Filters (1 Column) */}
        <div className="lg:col-span-1">
          <ProductFilters filters={filters} onChange={setFilters} />
        </div>

        {/* Right Side Grid (3 Columns) */}
        <div className="lg:col-span-3">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600 mb-4" />
              <p className="text-sm font-semibold text-slate-500">Querying verified distributor catalogs...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-6 text-center">
              <BadgeAlert className="h-10 w-10 text-rose-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-rose-900">{error}</p>
              <button
                onClick={() => setFilters({ ...filters })}
                className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 transition-all"
              >
                Retry Request
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white py-16 text-center shadow-sm">
              <Stethoscope className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No accredited products matched</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Try widening your price margins, loosening MOQ parameters, or searching for alternative medical conditions/certifications.
              </p>
              <button
                onClick={() => setFilters({
                  search: "",
                  category: "all",
                  condition: "all",
                  certifications: "all",
                  minPrice: "",
                  maxPrice: "",
                  moq: "",
                })}
                className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Displaying {products.length} audited catalog listings</span>
                <span className="text-teal-600 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Approved Manufacturers Only
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 4. Sliding Cart Drawer Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs">
          <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-slate-100">
              
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-sky-600" />
                  <h2 className="font-display text-base font-bold text-slate-900">Shopping Cart Ledger</h2>
                </div>
                <button
                  onClick={onCloseCart}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  Close
                </button>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-10 text-slate-400">
                    <ShoppingCart className="h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Cart is Empty</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">
                      Select medical hardware or protective consumables from the catalog. Remember to respect Minimum Order Quantities (MOQ).
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => {
                      const itemTotal = Number(item.product.price) * item.quantity;
                      return (
                        <div key={item.product.id} className="flex gap-4 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors relative">
                          <img
                            src={item.product.images}
                            alt={item.product.title}
                            referrerPolicy="no-referrer"
                            className="h-14 w-14 rounded-lg object-cover bg-white shrink-0 border border-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate pr-5">
                              {item.product.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                              {item.product.seller?.sellerProfile?.company_name || "Accredited Vendor"}
                            </p>
                            
                            {/* Quantity Editor with MOQ safeguard */}
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center border border-slate-200 bg-white rounded-md h-7 overflow-hidden">
                                <button
                                  onClick={() => onUpdateCartQty(item.product.id, Math.max(item.product.moq, item.quantity - 1))}
                                  className="px-2 text-slate-400 hover:bg-slate-50 h-full text-xs font-bold"
                                  title={`Quantity cannot drop below MOQ of ${item.product.moq}`}
                                >
                                  -
                                </button>
                                <span className="px-2.5 text-xs font-bold text-slate-800 font-mono">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => onUpdateCartQty(item.product.id, item.quantity + 1)}
                                  className="px-2 text-slate-400 hover:bg-slate-50 h-full text-xs font-bold"
                                >
                                  +
                                </button>
                              </div>

                              <span className="text-xs font-extrabold text-slate-900 font-mono">
                                ${itemTotal.toFixed(2)}
                              </span>
                            </div>

                            {/* Alert if exact MOQ is active */}
                            {item.quantity === item.product.moq && (
                              <p className="text-[9px] text-teal-600 font-semibold mt-1">
                                Minimum Order Quantity ({item.product.moq}) enforced.
                              </p>
                            )}
                          </div>

                          {/* Delete Item button */}
                          <button
                            onClick={() => onRemoveFromCart(item.product.id)}
                            className="absolute top-3.5 right-3.5 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subtotal Invoice:</span>
                    <span className="text-xl font-black text-slate-950 font-mono">
                      ${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    * Final clearance includes free clinical shipping. Duties and bulk certificates are handled securely upon checkout approval.
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={onClearCart}
                      className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Empty
                    </button>
                    <button
                      onClick={() => {
                        if (!user) {
                          alert("Please log in as a Hospital/Clinic buyer to checkout.");
                          return;
                        }
                        if (user.role !== "buyer") {
                          alert("Only registered buyers can place checkout transactions.");
                          return;
                        }
                        setCheckoutOpen(true);
                      }}
                      className="flex-2 rounded-lg bg-sky-600 py-2.5 text-xs font-bold text-white shadow-sm shadow-sky-100 hover:bg-sky-500 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Truck className="h-4 w-4" />
                      <span>Proceed to Checkout</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal Layer */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        user={user}
        onOrderSuccess={handleCheckoutSuccess}
      />

    </div>
  );
}
