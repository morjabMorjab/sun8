import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Package, 
  Calendar, 
  AlertTriangle, 
  Building, 
  ShoppingCart, 
  BadgeCheck,
  Stethoscope,
  Lock
} from "lucide-react";
import { Product, CartItem, User } from "../types";

interface ProductDetailsProps {
  user: User | null;
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function ProductDetails({ user, onAddToCart }: ProductDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error("Medical product SKU not found in public registries.");
        }
        const data = await response.json();
        setProduct(data);
        // Initialize quantity to MOQ
        setQuantity(data.moq || 1);
      } catch (err: any) {
        console.error("Fetch product failed:", err);
        setError(err.message || "Unable to download medical catalog entry.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600 mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-500">Retrieving full clinical specification ledger...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-8 max-w-md mx-auto">
          <AlertTriangle className="h-10 w-10 text-rose-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wider">SKU Not Found</h3>
          <p className="text-xs text-rose-600 mt-1">{error || "The medical specification could not be located."}</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-500 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleIncrement = () => {
    if (quantity < product.stock_quantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > product.moq) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    navigate("/"); // Redirect or stay, redirecting to catalog encourages checking out
  };

  const certificationsList = product.certifications
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c && c.toLowerCase() !== "none");

  const sellerProfile = product.seller?.sellerProfile;
  const sellerCompany = sellerProfile?.company_name || "Certified Medical Distributor";
  const sellerTaxId = sellerProfile?.tax_id || "Awaiting Verification";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Medical Catalog</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
        
        {/* Left: Image display & Certifications */}
        <div className="space-y-6">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
            <img
              src={product.images}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600";
              }}
            />
            
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              <span className="inline-flex items-center rounded-md bg-sky-600/90 backdrop-blur-xs px-3 py-1 text-xs font-bold text-white uppercase tracking-wider shadow-sm">
                {product.condition} Condition
              </span>
              <span className="inline-flex items-center rounded-md bg-slate-900/90 backdrop-blur-xs px-3 py-1 text-xs font-bold text-white uppercase tracking-wider shadow-sm">
                {product.category === "equipment" ? "Heavy Equipment" : "Consumable Supply"}
              </span>
            </div>
          </div>

          {/* Certifications Block */}
          {certificationsList.length > 0 && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Audited Quality Certifications</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {certificationsList.map((cert) => (
                  <span
                    key={cert}
                    className="inline-flex items-center rounded-lg border border-emerald-200/80 bg-white px-3.5 py-1 text-xs font-extrabold text-emerald-800 shadow-xs"
                  >
                    {cert} Certified
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-2.5 font-medium leading-relaxed">
                Manufacturer accreditation has been double-verified against FDA registration logs and European CE clearance databases.
              </p>
            </div>
          )}
        </div>

        {/* Right: Pricing, Specs, Order forms */}
        <div className="flex flex-col justify-between">
          <div>
            
            {/* Seller Stamp */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-2">
              <Building className="h-4 w-4 text-slate-400 shrink-0" />
              <span>DISTRIBUTED BY:</span>
              <span className="text-slate-600 underline font-extrabold truncate max-w-[200px]" title={sellerCompany}>
                {sellerCompany}
              </span>
              <BadgeCheck className="h-4 w-4 text-sky-500 shrink-0" />
            </div>

            {/* Title */}
            <h1 className="font-display text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-tight">
              {product.title}
            </h1>

            {/* Category / Specifications Mini Tags */}
            <div className="mt-4 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                MOQ constraint: {product.moq} Units
              </span>
              {product.category === "consumable" && product.expiry_date && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                  <Calendar className="h-3.5 w-3.5" />
                  Expiry: {product.expiry_date}
                </span>
              )}
            </div>

            {/* Price Box */}
            <div className="mt-6 border-t border-b border-slate-100 py-4 flex items-baseline gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">B2B Unit Rate:</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                ${Number(product.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-slate-500 font-medium">USD / unit</span>
            </div>

            {/* Description */}
            <div className="mt-6 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Clinical Profile & Scope</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

            {/* Detailed technical attributes */}
            <div className="mt-6 rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3.5 text-xs">
              <div className="flex justify-between font-medium">
                <span className="text-slate-400">Inventory Available</span>
                <span className={`font-bold ${product.stock_quantity > 10 ? "text-slate-900" : "text-rose-600"}`}>
                  {product.stock_quantity} units in stock
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-400">Manufacturer Code</span>
                <span className="font-mono text-slate-800 uppercase font-semibold">SKU-{product.category === "equipment" ? "EQ" : "CO"}-99{product.id}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-400">Distributor License ID</span>
                <span className="font-mono text-slate-800 font-semibold">{sellerTaxId}</span>
              </div>
            </div>

          </div>

          {/* Add to Cart Control Block */}
          <div className="mt-8 border-t border-slate-100 pt-6 space-y-4">
            {product.stock_quantity <= 0 ? (
              <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-center">
                <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">Out of stock</p>
                <p className="text-[11px] text-rose-600 mt-1 font-medium">
                  This item has depleted from distribution hub. Notify procurement once restocked.
                </p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                
                {/* Quantity selector with MOQ lock */}
                <div className="flex flex-col gap-1 shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Order quantity</span>
                  <div className="flex items-center border border-slate-200 rounded-lg h-11 bg-white overflow-hidden w-full sm:w-32 justify-between">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={quantity <= product.moq}
                      className="px-3.5 text-slate-400 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:hover:bg-transparent h-full text-sm font-bold transition-colors"
                      title={`Cannot drop below Minimum Order Quantity of ${product.moq}`}
                    >
                      -
                    </button>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncrement}
                      disabled={quantity >= product.stock_quantity}
                      className="px-3.5 text-slate-400 hover:bg-slate-50 hover:text-slate-800 h-full text-sm font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Main CTA */}
                <div className="flex-1 flex flex-col justify-end">
                  <button
                    onClick={handleAddToCart}
                    className="w-full rounded-lg bg-sky-600 text-white font-bold text-xs uppercase tracking-wider py-3.5 shadow-sm shadow-sky-100 hover:bg-sky-500 hover:shadow-none transition-all flex items-center justify-center gap-2 h-11 self-end active:scale-95"
                  >
                    <ShoppingCart className="h-4.5 w-4.5" />
                    <span>Add {quantity} Units to Cart</span>
                  </button>
                </div>

              </div>
            )}

            {/* Safeguard text */}
            <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1 text-center font-medium">
              <Lock className="h-3.5 w-3.5 text-slate-300" />
              <span>Payments cleared securely. Platform handles multi-vendor logistics.</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
