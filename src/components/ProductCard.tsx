import React from "react";
import { Link } from "react-router-dom";
import { Shield, Package, ShoppingCart, Calendar, BadgeCheck, Bookmark, Share2 } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, quantity: number) => void;
  key?: any;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  const certificationsList = product.certifications
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c && c.toLowerCase() !== "none");

  // Condition styling
  const conditionColors = {
    new: "bg-emerald-50 text-emerald-700 border-emerald-100",
    refurbished: "bg-sky-50 text-sky-700 border-sky-100",
    used: "bg-amber-50 text-amber-700 border-amber-100",
  };

  const sellerName = product.seller?.sellerProfile?.company_name || "Verified Medical Distributor";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-slate-300">
      
      {/* Product Image Stage */}
      <div className="relative aspect-[4/3] w-full bg-slate-50 overflow-hidden">
        <img
          src={product.images}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // Placeholder fallback on load fail
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600";
          }}
        />
        
        {/* Action Buttons */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsBookmarked(!isBookmarked);
            }}
            className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-slate-400 hover:text-sky-500 hover:bg-white transition-all shadow-sm focus:outline-none"
            title="نشان کردن"
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-sky-500 text-sky-500" : ""}`} />
          </button>
          
          <button
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              const shareUrl = window.location.origin + "/product/" + product.id;
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: product.title,
                    text: `مشاهده محصول ${product.title} در فروشگاه`,
                    url: shareUrl,
                  });
                } catch (err) {
                  if ((err as Error).name !== 'AbortError') {
                    console.error("Error sharing:", err);
                  }
                }
              } else {
                navigator.clipboard.writeText(shareUrl);
                alert("لینک کپی شد!");
              }
            }}
            className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-slate-400 hover:text-indigo-500 hover:bg-white transition-all shadow-sm focus:outline-none"
            title="اشتراک‌گذاری"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* Absolute Badges on Image */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider shadow-sm ${conditionColors[product.condition]}`}>
            {product.condition}
          </span>
          <span className="inline-flex items-center rounded-md border border-slate-200/80 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
            {product.category === "equipment" ? "Heavy Equipment" : "Consumable"}
          </span>
        </div>

        {/* Quality Certifications badge indicator */}
        {certificationsList.length > 0 && (
          <div className="absolute bottom-3 right-3 flex gap-1 bg-slate-900/85 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-bold text-white tracking-wide uppercase shadow-sm">
            <Shield className="h-3 w-3 text-emerald-400 self-center" />
            {certificationsList.join(" | ")}
          </div>
        )}
      </div>

      {/* Product Body Details */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        
        {/* Seller / Distributor Name */}
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 mb-1">
          <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate max-w-[180px]" title={sellerName}>
            {sellerName}
          </span>
          <BadgeCheck className="h-3.5 w-3.5 text-sky-500 shrink-0" />
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug tracking-tight group-hover:text-sky-600 transition-colors line-clamp-2 h-11">
          <Link to={`/products/${product.id}`} className="focus:outline-none">
            {product.title}
          </Link>
        </h3>

        {/* Description Snippet */}
        <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Clinical parameters (Expiry, MOQ) */}
        <div className="mt-4 border-t border-b border-slate-100 py-2 flex flex-wrap justify-between gap-y-1 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1 text-slate-500">
            <Package className="h-3.5 w-3.5 text-slate-400" />
            <span>MOQ: <strong className="text-slate-800">{product.moq} units</strong></span>
          </div>
          {product.category === "consumable" && product.expiry_date && (
            <div className="flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
              <Calendar className="h-3.5 w-3.5" />
              <span>Exp: {product.expiry_date}</span>
            </div>
          )}
        </div>

        {/* Pricing / CTA Section */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unit Price</span>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight">
              ${Number(product.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex gap-1.5">
            <Link
              to={`/products/${product.id}`}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              Details
            </Link>
            
            {onAddToCart && product.stock_quantity > 0 && (
              <button
                onClick={() => onAddToCart(product, product.moq)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white shadow-sm shadow-sky-100 hover:bg-sky-500 transition-all active:scale-95"
                title={`Add MOQ (${product.moq}) to Cart`}
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Stock Alert Label */}
        {product.stock_quantity <= 0 ? (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
            <span className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-bold text-white shadow-md uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        ) : product.stock_quantity <= 10 ? (
          <span className="text-[9px] text-right font-extrabold text-rose-600 mt-2 block animate-pulse">
            Only {product.stock_quantity} left in inventory!
          </span>
        ) : null}

      </div>
    </div>
  );
}

// Sub-component for Building Icon (using building from lucide is cleaner)
function Building(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M8 10h.01" />
      <path d="M16 10h.01" />
      <path d="M8 14h.01" />
      <path d="M16 14h.01" />
    </svg>
  );
}
