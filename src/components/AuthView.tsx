import React, { useState, useEffect } from "react";
import { 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Building, 
  FileText,
  User,
  ShoppingBag
} from "lucide-react";
import { motion } from "motion/react";

interface AuthViewProps {
  onLoginSuccess: (user: { id: number; email: string; role: "user" | "supplier" | "admin"; phone?: string }) => void;
  onClose?: () => void;
}

export default function AuthView({ onLoginSuccess, onClose }: AuthViewProps) {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [role, setRole] = useState<"buyer" | "seller">("buyer");

  // Registration fields for Seller
  const [companyName, setCompanyName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [licenseUrl, setLicenseUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Clean numbers to English digits
  const toEnglishDigits = (str: string): string => {
    const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
    const arabicDigits = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
    let cleaned = str;
    for (let i = 0; i < 10; i++) {
      cleaned = cleaned.replace(persianDigits[i], String(i)).replace(arabicDigits[i], String(i));
    }
    return cleaned;
  };

  const handleSendOtp = async () => {
    const englishPhone = toEnglishDigits(phone).replace(/\D/g, "");
    if (!englishPhone || englishPhone.length < 10) {
      setError("لطفاً یک شماره موبایل معتبر وارد کنید (مانند ۰۹۳۵۹۷۲۵۷۶۵)");
      return;
    }

    setError(null);
    setInfoMsg(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: englishPhone }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در ارسال کد تایید.");
      }

      setOtpSent(true);
      setCountdown(120);

      if (data.devCode) {
        setInfoMsg(`کد تایید شبیه‌ساز: ${data.devCode}`);
        setOtpCode(data.devCode); // Auto-fill for supreme testing convenience
      } else {
        setInfoMsg("کد تایید با موفقیت از طریق پیامک ارسال شد.");
      }
    } catch (err: any) {
      setError(err.message || "خطایی در برقراری ارتباط رخ داد.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const englishPhone = toEnglishDigits(phone).replace(/\D/g, "");

    try {
      // Prepare endpoint and payload
      const payload: any = {
        phone: englishPhone,
        code: otpCode
      };

      // If user wants to register as seller
      if (role === "seller") {
        payload.role = "seller";
        payload.companyName = companyName;
        payload.taxId = taxId;
        payload.licenseUrl = licenseUrl;
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // If they need to register first, or if we want to try direct signup
        if (data.error && (data.error.includes("register") || data.error.includes("ثبت نام"))) {
          // Attempt automatic signup with these credentials
          const signUpResponse = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const signUpData = await signUpResponse.json();
          if (!signUpResponse.ok) {
            throw new Error(signUpData.error || "ثبت نام ناموفق بود.");
          }
          // Login successful via auto-signup
          const mappedRole = signUpData.user.role === "seller" || signUpData.user.role === "supplier" ? "supplier" : (signUpData.user.role === "admin" ? "admin" : "user");
          onLoginSuccess({
            id: signUpData.user.id,
            email: signUpData.user.email,
            role: mappedRole as any,
            phone: signUpData.user.phone
          });
          return;
        }
        throw new Error(data.error || "کد تایید اشتباه است.");
      }

      // Map backend role to client role
      // backend "admin" -> admin, "seller" -> supplier, "buyer" -> user
      const mappedRole = data.user.role === "seller" || data.user.role === "supplier" ? "supplier" : (data.user.role === "admin" ? "admin" : "user");

      onLoginSuccess({
        id: data.user.id,
        email: data.user.email,
        role: mappedRole as any,
        phone: data.user.phone
      });
    } catch (err: any) {
      setError(err.message || "خطایی رخ داد. مجدداً تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-6 text-right font-vazir"
    >
      <div className="flex flex-col items-center mb-6">
        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-3 shadow-sm">
          <Activity className="w-7 h-7 animate-pulse" />
        </div>
        <h2 className="text-lg font-black text-gray-900">ورود به سامانه هوشمند سان ۸ (sun8.ir)</h2>
        <p className="text-xs text-gray-400 mt-1 font-medium">اجاره آنلاین تجهیزات و ملزومات پزشکی کشور</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl p-3 mb-4 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {infoMsg && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl p-3 mb-4 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{infoMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Toggle for Registration */}
        {!otpSent && (
          <div className="space-y-2">
            <span className="text-[10px] font-black text-gray-400 block mr-1">نقش کاربری خود را انتخاب کنید:</span>
            <div className="flex gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
              <button
                type="button"
                onClick={() => setRole("buyer")}
                className={`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  role === "buyer"
                    ? "bg-white text-indigo-600 shadow-sm border border-indigo-100"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>پزشک / کلینیک (اجاره‌کننده)</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("seller")}
                className={`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  role === "seller"
                    ? "bg-white text-indigo-600 shadow-sm border border-indigo-100"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>تامین‌کننده (مالک دستگاه)</span>
              </button>
            </div>
          </div>
        )}

        {/* Phone Input */}
        <div>
          <label className="block text-xs font-black text-gray-700 mb-1.5 mr-1">شماره همراه شما</label>
          <div className="relative flex">
            <input
              type="tel"
              required
              disabled={otpSent}
              placeholder="مثال: ۰۹۳۵۹۷۲۵۷۶۵"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-800 outline-none focus:border-indigo-500 focus:bg-white transition-all text-left"
              dir="ltr"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">📱</span>
          </div>
        </div>

        {/* Supplier details if registering as seller */}
        {!otpSent && role === "seller" && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3 bg-indigo-50/30 p-3.5 rounded-xl border border-indigo-100"
          >
            <h4 className="text-[10px] font-black text-indigo-700 flex items-center gap-1 pb-1 border-b border-indigo-100/50">
              <Building className="w-3.5 h-3.5" />
              <span>مدارک تایید صلاحیت تامین‌کننده</span>
            </h4>
            
            <div className="space-y-2.5">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1">نام شرکت یا تجهیزات پزشکی</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تجهیز طب البرز"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">شناسه ملی / کد اقتصادی</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: ۱۴۰۰۷۶۴..."
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">لینک پروانه کسب (تایید صلاحیت)</label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={licenseUrl}
                    onChange={(e) => setLicenseUrl(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* OTP Input */}
        {otpSent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1.5"
          >
            <label className="block text-xs font-black text-gray-700 mr-1">کد تایید ۵ رقمی</label>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={5}
                placeholder="کد را وارد کنید"
                value={otpCode}
                onChange={(e) => setOtpCode(toEnglishDigits(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-black text-center tracking-[0.5em] text-indigo-600 outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🛡️</span>
            </div>
          </motion.div>
        )}

        {/* Actions Button */}
        {!otpSent ? (
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl text-xs transition-all shadow-md shadow-indigo-150 disabled:bg-gray-300 flex items-center justify-center gap-1.5"
          >
            {loading ? "در حال ارسال..." : "دریافت کد تایید یکبار مصرف"}
          </button>
        ) : (
          <div className="space-y-2.5">
            <button
              type="submit"
              disabled={loading || otpCode.length < 5}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl text-xs transition-all shadow-md shadow-indigo-150 disabled:bg-gray-300 flex items-center justify-center gap-1.5"
            >
              {loading ? "در حال تایید ورود..." : "تایید کد و ورود به سامانه"}
            </button>
            <div className="flex justify-between items-center px-1 text-[10px] font-bold text-gray-400">
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtpCode("");
                  setInfoMsg(null);
                }}
                className="text-indigo-600 hover:underline"
              >
                تغییر شماره همراه
              </button>
              <span>
                {countdown > 0 ? (
                  <span>ارسال مجدد تا {countdown} ثانیه دگر</span>
                ) : (
                  <button type="button" onClick={handleSendOtp} className="text-indigo-600 hover:underline">
                    ارسال مجدد کد تایید
                  </button>
                )}
              </span>
            </div>
          </div>
        )}
      </form>

      {onClose && (
        <button 
          onClick={onClose}
          className="w-full mt-4 bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-100 font-extrabold py-2.5 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1"
        >
          <span>بازگشت به برنامه</span>
        </button>
      )}
    </motion.div>
  );
}
