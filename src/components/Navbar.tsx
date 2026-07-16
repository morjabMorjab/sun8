import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShoppingBag, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  PlusCircle, 
  Activity,
  Heart,
  ShieldCheck,
  Building
} from "lucide-react";
import { User, CartItem } from "../types";

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  cart: CartItem[];
  onOpenCart: () => void;
}

export default function Navbar({ user, onLogout, cart, onOpenCart }: NavbarProps) {
  const navigate = useNavigate();
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600 text-white shadow-sm shadow-sky-200">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="font-display text-xl font-bold tracking-tight text-slate-950">Med<span className="text-sky-600">Market</span></span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-teal-600 leading-none">Multi-Vendor B2B</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">
            Browse Medical Supplies
          </Link>
          <a href="#certifications" onClick={(e) => { e.preventDefault(); navigate("/?certifications=FDA"); }} className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">
            FDA Approved
          </a>
          <a href="#equipment" onClick={(e) => { e.preventDefault(); navigate("/?category=equipment"); }} className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">
            Heavy Equipment
          </a>
          <a href="#consumables" onClick={(e) => { e.preventDefault(); navigate("/?category=consumable"); }} className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">
            Consumables
          </a>
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-4">
          
          {/* Cart Icon */}
          <button
            onClick={onOpenCart}
            id="nav-cart-btn"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-bounce-short">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* User Auth Info */}
          {user ? (
            <div className="flex items-center gap-2">
              
              {/* Dashboard Link Based on Role */}
              <Link
                to={
                  user.role === "admin"
                    ? "/admin"
                    : user.role === "seller"
                    ? "/seller"
                    : "/buyer"
                }
                className="hidden sm:flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-sky-600" />
                <span>
                  {user.role === "admin" ? "Admin Portal" : user.role === "seller" ? "Seller Panel" : "My Orders"}
                </span>
                
                {/* Status Indicator */}
                {user.role === "seller" && (
                  <span className={`inline-block h-2 w-2 rounded-full ${user.is_verified ? "bg-emerald-500" : "bg-amber-400"}`} title={user.is_verified ? "Verified Distributor" : "Awaiting Verification"} />
                )}
              </Link>

              {/* User Account / Signout */}
              <div className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/50 px-2.5 py-1 text-slate-800">
                <div className="flex flex-col items-end hidden lg:block text-right">
                  <span className="text-[11px] font-medium block truncate max-w-[120px] text-slate-800 leading-none mb-0.5">{user.email}</span>
                  <span className="text-[9px] font-bold uppercase text-slate-400 leading-none">
                    {user.role === "admin" ? "Administrator" : user.role === "seller" ? "Medical Seller" : "Hosp. Procurement"}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth"
                className="text-xs font-semibold text-slate-600 hover:text-sky-600 px-3 py-2 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/auth?signup=true"
                className="rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-200 hover:bg-sky-500 hover:shadow-none transition-all"
              >
                Register
              </Link>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
