import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getStore, saveStore, hashPassword, verifyPassword, sanitizePhoneNumber, User } from "../store.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "sun8_ultra_secure_secret_2026";

// In-memory OTP storage with expiration lifespan of 2 minutes
export const otpStorage: { [phone: string]: { code: string; expiresAt: number } } = {};

/**
 * Sends a real SMS using the configured multi-provider gateway logic.
 * Supports: ippanel, kavenegar, melipayamak, smsir.
 */
async function sendRealSMS(phone: string, code: string): Promise<boolean> {
  const provider = process.env.SMS_PROVIDER || "smsir";
  const apiKey = process.env.SMS_API_KEY;
  const secret = process.env.SMS_SECRET;
  const patternCode = process.env.SMS_PATTERN_CODE;

  if (!apiKey || !patternCode) {
    console.log(`[SMS SIMULATOR] Phone: ${phone}, OTP: ${code} (Missing SMS config variables)`);
    return false;
  }

  try {
    if (provider === "ippanel") {
      const response = await fetch("https://api2.ippanel.com/api/v1/sms/pattern/normal/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": apiKey
        },
        body: JSON.stringify({
          code: patternCode,
          sender: secret || "+983000505",
          recipient: phone,
          values: {
            code: code,
            otp: code,
            pin: code,
            verification_code: code
          }
        })
      });
      if (!response.ok) {
        throw new Error(`IPPanel API returned status ${response.status}: ${await response.text()}`);
      }
      return true;
    } else if (provider === "kavenegar") {
      const url = `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json?receptor=${phone}&token=${code}&template=${patternCode}`;
      const response = await fetch(url, { method: "POST" });
      if (!response.ok) {
        throw new Error(`Kavenegar API returned status ${response.status}: ${await response.text()}`);
      }
      return true;
    } else if (provider === "melipayamak") {
      const response = await fetch("https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: apiKey,
          password: secret || "",
          text: code,
          to: phone,
          bodyId: parseInt(patternCode) || patternCode
        })
      });
      if (!response.ok) {
        throw new Error(`Melipayamak API returned status ${response.status}: ${await response.text()}`);
      }
      return true;
    } else if (provider === "smsir") {
      const response = await fetch("https://api.sms.ir/v1/send/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey
        },
        body: JSON.stringify({
          mobile: phone,
          templateId: parseInt(patternCode) || patternCode,
          parameters: [
            { name: "Code", value: code },
            { name: "code", value: code },
            { name: "otp", value: code }
          ]
        })
      });
      if (!response.ok) {
        throw new Error(`Sms.ir API returned status ${response.status}: ${await response.text()}`);
      }
      return true;
    } else {
      console.log(`[SMS SIMULATOR] Unknown provider '${provider}'. Phone: ${phone}, OTP: ${code}`);
      return false;
    }
  } catch (error) {
    console.error(`[SMS ERROR] Failed to send real SMS via ${provider}:`, error);
    return false;
  }
}

// 1. Send OTP Endpoint
router.post("/auth/send-otp", async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required." });
    }

    let sanitizedPhone: string;
    try {
      sanitizedPhone = sanitizePhoneNumber(phone);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || "Invalid phone number formatting." });
    }

    // Generate secure 5-digit numeric verification code
    const otpCode = Math.floor(10000 + Math.random() * 90000).toString();

    // Cache the OTP in-memory for 2 minutes (120,000 milliseconds)
    otpStorage[sanitizedPhone] = {
      code: otpCode,
      expiresAt: Date.now() + 2 * 60 * 1000
    };

    console.log(`[OTP STORAGE] Cached OTP for ${sanitizedPhone}: ${otpCode}`);

    // Attempt real gateway delivery
    const sent = await sendRealSMS(sanitizedPhone, otpCode);

    if (sent) {
      return res.json({
        message: "Verification code sent successfully.",
        phone: sanitizedPhone
      });
    } else {
      // Simulator Fallback: Return devCode in JSON payload & print to console
      console.log(`\n========================================\n[SMS OTP SIMULATOR FALLBACK]\nRecipient: ${sanitizedPhone}\nCode: ${otpCode}\n========================================\n`);
      return res.json({
        message: "Verification code generated (Simulator Fallback).",
        phone: sanitizedPhone,
        devCode: otpCode
      });
    }
  } catch (error: any) {
    console.error("[OTP ROUTE ERROR]", error);
    return res.status(500).json({ error: "Failed to dispatch verification code." });
  }
});

// Helper validation & execution for registration
const handleRegister = (req: Request, res: Response) => {
  try {
    const { 
      phone, 
      code, 
      email, 
      password, 
      role, 
      companyName, 
      company_name,
      taxId, 
      tax_id,
      licenseUrl,
      license_document_url
    } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: "شماره موبایل و کد تایید الزامی است." });
    }

    let sanitizedPhone: string;
    try {
      sanitizedPhone = sanitizePhoneNumber(phone);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || "شماره موبایل نامعتبر است." });
    }

    // Enforce OTP verification
    const record = otpStorage[sanitizedPhone];
    if (!record || record.code !== code || record.expiresAt < Date.now()) {
      return res.status(400).json({ error: "کد تایید نامعتبر یا منقضی شده است." });
    }

    // Automatically delete OTP once verification succeeds
    delete otpStorage[sanitizedPhone];

    const store = getStore();
    const existingUser = store.users.find(u => u.phone === sanitizedPhone);
    if (existingUser) {
      return res.status(400).json({ error: "این شماره موبایل قبلاً ثبت‌نام شده است." });
    }

    const finalEmail = email || `${sanitizedPhone}@sun8.ir`;
    const finalPassword = password || "otp_login_default";
    const finalRole = sanitizedPhone === "09359725765" ? "admin" : (role || "buyer");

    // Create new User profile
    const newUser: User = {
      id: store.users.length > 0 ? Math.max(...store.users.map(u => u.id)) + 1 : 1,
      email: finalEmail,
      passwordHash: hashPassword(finalPassword),
      role: finalRole,
      isVerified: finalRole === "admin" ? true : (role === "seller" ? false : true),
      phone: sanitizedPhone,
      companyName: companyName || company_name || "",
      taxId: taxId || tax_id || "",
      licenseUrl: licenseUrl || license_document_url || ""
    };

    store.users.push(newUser);
    saveStore(store);

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({
      message: "ثبت نام با موفقیت انجام شد",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone
      }
    });
  } catch (error: any) {
    console.error("[REGISTER ROUTE ERROR]", error);
    return res.status(500).json({ error: "خطای سرور در ثبت نام." });
  }
};

// Helper validation & execution for login
const handleLogin = (req: Request, res: Response) => {
  try {
    const { email, password, phone, code } = req.body;

    const store = getStore();

    // Support Login via Phone & OTP (Standard Iranian workflow)
    if (phone && code) {
      let sanitizedPhone: string;
      try {
        sanitizedPhone = sanitizePhoneNumber(phone);
      } catch (err: any) {
        return res.status(400).json({ error: err.message || "شماره موبایل نامعتبر است." });
      }

      // Enforce OTP verification
      const record = otpStorage[sanitizedPhone];
      if (!record || record.code !== code || record.expiresAt < Date.now()) {
        return res.status(400).json({ error: "کد تایید نامعتبر یا منقضی شده است." });
      }

      // Automatically delete OTP once verification succeeds
      delete otpStorage[sanitizedPhone];

      let user = store.users.find(u => u.phone === sanitizedPhone);
      
      // Dynamic sign up / fallback registration (Frictionless flow)
      if (!user) {
        const finalRole = sanitizedPhone === "09359725765" ? "admin" : "buyer";
        user = {
          id: store.users.length > 0 ? Math.max(...store.users.map(u => u.id)) + 1 : 1,
          email: `${sanitizedPhone}@sun8.ir`,
          passwordHash: hashPassword("otp_login_default"),
          role: finalRole,
          isVerified: true,
          phone: sanitizedPhone
        };
        store.users.push(user);
        saveStore(store);
        console.log(`[AUTH] Auto-registered user ${sanitizedPhone} with role ${finalRole}`);
      } else {
        // Enforce admin role if user has the admin phone number
        if (sanitizedPhone === "09359725765" && user.role !== "admin") {
          user.role = "admin";
          saveStore(store);
        }
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({
        token,
        user: { id: user.id, email: user.email, role: user.role, phone: user.phone }
      });
    }

    // Support standard Email/Password verification (with optional OTP if phone is registered)
    if (email && password) {
      const user = store.users.find(u => u.email === email);
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ error: "نام کاربری یا رمز عبور اشتباه است." });
      }

      // If user has a registered phone, we enforce OTP verification if a code is provided,
      // or if we decide to allow direct credential access (e.g., for default admin@sun8.ir/tests)
      if (user.phone) {
        if (!code) {
          return res.status(400).json({ error: "وارد کردن کد تایید الزامی است." });
        }
        
        let sanitizedPhone = user.phone;
        const record = otpStorage[sanitizedPhone];
        if (!record || record.code !== code || record.expiresAt < Date.now()) {
          return res.status(400).json({ error: "کد تایید نامعتبر یا منقضی شده است." });
        }
        
        // Automatically delete OTP once verification succeeds
        delete otpStorage[sanitizedPhone];
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({
        token,
        user: { id: user.id, email: user.email, role: user.role, phone: user.phone }
      });
    }

    return res.status(400).json({ error: "پارامترهای ورود نامعتبر است." });
  } catch (error: any) {
    console.error("[LOGIN ROUTE ERROR]", error);
    return res.status(500).json({ error: "خطای سرور در ایجاد نشست." });
  }
};

// Replicate endpoints for both standard /api and /api/auth namespaces to match frontend options perfectly
router.post("/register", handleRegister);
router.post("/auth/signup", handleRegister);

router.post("/login", handleLogin);
router.post("/auth/login", handleLogin);

export default router;
