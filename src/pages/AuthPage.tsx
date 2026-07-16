import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { 
  Lock, 
  Mail, 
  Building, 
  FileText, 
  ArrowRight, 
  Activity, 
  BadgeCheck, 
  ShieldAlert, 
  UserPlus, 
  LogIn,
  Key
} from "lucide-react";
import { User } from "../types";

interface AuthPageProps {
  onLoginSuccess: (token: string, user: User) => void;
  currentUser: User | null;
}

export default function AuthPage({ onLoginSuccess, currentUser }: AuthPageProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Parse initial state from URL parameters (e.g. ?signup=true)
  const params = new URLSearchParams(location.search);
  const isSignupParam = params.get("signup") === "true";

  const [isSignup, setIsSignup] = useState(isSignupParam);
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  
  // Shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // OTP Verification fields
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isOtpLoginMode, setIsOtpLoginMode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Seller-specific fields
  const [companyName, setCompanyName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [licenseUrl, setLicenseUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsSignup(isSignupParam);
    setError(null);
    setSuccessMsg(null);
    setOtpSent(false);
    setOtpCode("");
  }, [isSignupParam]);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!phone) {
      setError("Please enter a valid mobile number first.");
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send verification code.");
      }
      setOtpSent(true);
      setCountdown(120);
      if (data.devCode) {
        setSuccessMsg(`[SIMULATOR] Your verification OTP is: ${data.devCode}`);
        setOtpCode(data.devCode); // Auto-fill for ultra-smooth development and manual testing!
      } else {
        setSuccessMsg("Verification code dispatched via SMS successfully.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while sending code.");
    } finally {
      setLoading(false);
    }
  };

  // If user is already authenticated, redirect
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "admin") navigate("/admin");
      else if (currentUser.role === "seller") navigate("/seller");
      else navigate("/");
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isSignup) {
        if (!phone) {
          throw new Error("Phone number is required for verification.");
        }
        if (!otpSent || !otpCode) {
          throw new Error("Please request and verify your phone number using the OTP verification code first.");
        }

        // Sign Up Flow
        const payload: any = {
          email,
          password,
          role,
          phone,
          code: otpCode
        };

        if (role === "seller") {
          if (!companyName || !taxId || !licenseUrl) {
            throw new Error("Sellers must complete all medical credentials to submit verification permits.");
          }
          payload.company_name = companyName;
          payload.tax_id = taxId;
          payload.license_document_url = licenseUrl;
        }

        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Signup failed.");
        }

        setSuccessMsg("Registration completed successfully! You can now log in.");
        
        // Switch to login tab
        setIsSignup(false);
        setPassword("");
        setOtpSent(false);
        setOtpCode("");
      } else {
        // Sign In Flow
        let payload: any = {};
        if (isOtpLoginMode) {
          if (!phone || !otpSent || !otpCode) {
            throw new Error("Please request and enter your SMS OTP code to sign in.");
          }
          payload = { phone, code: otpCode };
        } else {
          payload = { email, password };
          if (phone && otpSent && otpCode) {
            payload.phone = phone;
            payload.code = otpCode;
          }
        }

        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Authentication credentials invalid.");
        }

        onLoginSuccess(data.token, data.user);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:py-20 flex justify-center">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200/80 shadow-lg p-6 sm:p-10">
        
        {/* Visual Brand header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md shadow-sky-100 mb-4">
            <Activity className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
            {isSignup ? "Create B2B Network Account" : "Access Procurement Portal"}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 font-medium">
            {isSignup 
              ? "Join as a healthcare procurement buyer or verified distributor manufacturer." 
              : "Sign in with your verified credentials to access medical logistics ledgers."}
          </p>
        </div>

        {/* Notices */}
        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 mb-6 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider">System Exception</h4>
              <p className="text-xs text-rose-600 mt-0.5 leading-relaxed font-medium">{error}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 mb-6 flex items-start gap-3">
            <BadgeCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Record Submitted</h4>
              <p className="text-xs text-emerald-600 mt-0.5 leading-relaxed font-medium">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* TAB: Register Roles (Only on Signup) */}
          {isSignup && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">My Institution Profile</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRole("buyer")}
                  className={`flex-1 rounded-xl border p-3 text-left transition-all relative ${
                    role === "buyer"
                      ? "border-sky-600 bg-sky-50/20 text-sky-950 shadow-sm"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50/50"
                  }`}
                >
                  <span className="block text-xs font-bold leading-none mb-1">Clinic / Hospital Buyer</span>
                  <span className="block text-[10px] text-slate-400">Immediate access to order consumables and equipment.</span>
                  {role === "buyer" && <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-sky-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => setRole("seller")}
                  className={`flex-1 rounded-xl border p-3 text-left transition-all relative ${
                    role === "seller"
                      ? "border-teal-600 bg-teal-50/20 text-teal-950 shadow-sm"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50/50"
                  }`}
                >
                  <span className="block text-xs font-bold leading-none mb-1">Medical Seller</span>
                  <span className="block text-[10px] text-slate-400">Distributors require manual verification audits from admin.</span>
                  {role === "seller" && <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-teal-600" />}
                </button>
              </div>
            </div>
          )}

          {/* TAB: Login Mode (Only on Login) */}
          {!isSignup && (
            <div className="flex bg-slate-100 rounded-xl p-1 mb-2">
              <button
                type="button"
                onClick={() => {
                  setIsOtpLoginMode(false);
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  !isOtpLoginMode
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Password Access
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOtpLoginMode(true);
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  isOtpLoginMode
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Instant OTP Sign In
              </button>
            </div>
          )}

          {/* Email & Password fields (Shown for Signup or standard Login) */}
          {(isSignup || !isOtpLoginMode) && (
            <>
              {/* Email field */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>Institutional Email</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="procurement@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Key className="h-3.5 w-3.5 text-slate-400" />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>
            </>
          )}

          {/* Phone number field (Shown for Signup or OTP Login Mode) */}
          {(isSignup || isOtpLoginMode) && (
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                <span className="text-slate-400">📱</span>
                <span>Mobile Number (Iran format)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  required
                  placeholder="e.g. 09359725765"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || countdown > 0}
                  className="rounded-lg bg-slate-100 border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-all disabled:opacity-50 min-w-[95px] text-center"
                >
                  {countdown > 0 ? `${countdown}s` : otpSent ? "Resend" : "Send Code"}
                </button>
              </div>
            </div>
          )}

          {/* OTP Verification code field */}
          {(isSignup || isOtpLoginMode) && otpSent && (
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                <span className="text-slate-400">🛡️</span>
                <span>Verification OTP Code</span>
              </label>
              <input
                type="text"
                required
                maxLength={5}
                placeholder="5-Digit Verification Code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-mono tracking-widest text-center"
              />
            </div>
          )}

          {/* Seller verification details block (Only on Signup as Seller) */}
          {isSignup && role === "seller" && (
            <div className="rounded-xl border border-teal-100 bg-teal-50/10 p-4 space-y-4">
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-teal-700 flex items-center gap-1.5 border-b border-teal-100 pb-2">
                <Building className="h-4 w-4" />
                <span>Regulatory Manufacturer Auditing</span>
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Company Registered Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Medical Distributors Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Tax ID / Clearance Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TX-APEX-9988"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">License Permit Document (URL)</label>
                  <input
                    type="url"
                    required
                    placeholder="https://license.com/permit.pdf"
                    value={licenseUrl}
                    onChange={(e) => setLicenseUrl(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                * Our administration team will manually audit your uploaded permit link against healthcare registry logs before authorizing catalog sales.
              </p>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky-600 py-3 text-xs font-bold text-white shadow-sm shadow-sky-100 hover:bg-sky-500 transition-all flex items-center justify-center gap-1.5 disabled:bg-slate-400 disabled:shadow-none"
          >
            {loading ? (
              <span>Decrypting secure ledger...</span>
            ) : isSignup ? (
              <>
                <UserPlus className="h-4.5 w-4.5" />
                <span>Submit Registration Permit</span>
              </>
            ) : (
              <>
                <LogIn className="h-4.5 w-4.5" />
                <span>Establish Session</span>
              </>
            )}
          </button>
        </form>

        {/* Footnotes */}
        <div className="mt-8 border-t border-slate-100 pt-5 text-center text-xs">
          {isSignup ? (
            <p className="text-slate-500">
              Already have an institutional license?{" "}
              <button
                onClick={() => navigate("/auth")}
                className="font-bold text-sky-600 hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-slate-500">
              Need to license a medical institution?{" "}
              <button
                onClick={() => navigate("/auth?signup=true")}
                className="font-bold text-sky-600 hover:underline"
              >
                Register Here
              </button>
            </p>
          )}

          {/* Quick Demo Accounts Helper */}
          <div className="mt-6 border border-slate-150 rounded-xl p-3 bg-slate-50/50 text-left space-y-1.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sandbox Demo Accounts (Password: <strong className="text-slate-700">password123</strong>)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] text-slate-600 font-medium">
              <div>
                <span className="text-slate-400 block">Hospital Procurement (Buyer):</span>
                <span className="font-mono block truncate text-slate-700">procurement@stjudehospital.org</span>
              </div>
              <div>
                <span className="text-slate-400 block">Heavy Equipment Seller:</span>
                <span className="font-mono block truncate text-slate-700">sales@apexmedicals.com</span>
              </div>
              <div>
                <span className="text-slate-400 block">Consumables Seller:</span>
                <span className="font-mono block truncate text-slate-700">contact@globalpharma.com</span>
              </div>
              <div>
                <span className="text-slate-400 block">Platform Administrator:</span>
                <span className="font-mono block truncate text-slate-700">admin@medmarket.com</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
