import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_PATH = path.join(process.cwd(), "storage", "data.json");

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  role: string;
  isVerified: boolean;
  phone?: string;
  companyName?: string;
  taxId?: string;
  licenseUrl?: string;
}

export interface ChatMessage {
  id: number;
  sender: string;
  text: string;
  time: string;
}

export interface ChatThread {
  id: number;
  supplierName: string;
  supplierRole: string;
  productName: string;
  productImage: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: ChatMessage[];
}

interface StoreData {
  users: User[];
  threads: ChatThread[];
}

const initialData: StoreData = {
  users: [],
  threads: []
};

// PBKDF2 Password Hashing
export const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
};

export const verifyPassword = (password: string, storedHash: string): boolean => {
  const [salt, hash] = storedHash.split(":");
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return hash === verifyHash;
};

export const getStore = (): StoreData => {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  const data = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

export const getUsers = (): User[] => {
  return getStore().users;
};

export const saveStore = (data: StoreData) => {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
};

export const initDb = async () => {
  console.log("[Sun8 Store] Initializing persistence layer...");
  const store = getStore();
  
  // Safe validation - no destructive queries as per instructions
  if (store.users.length === 0) {
    console.warn("Warning: No users found in storage. Seeding default admin.");
    store.users.push({
      id: 1,
      email: "admin@sun8.ir",
      passwordHash: hashPassword("admin123"),
      role: "admin",
      isVerified: true,
      phone: "09359725765"
    });
    saveStore(store);
  }
  
  console.log("[Sun8 Store] Verification complete.");
};

export const sanitizePhoneNumber = (phone: string): string => {
  if (!phone) {
    throw new Error("Phone number is required");
  }
  
  // 1. Convert Persian/Arabic digits to English digits
  const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  const arabicDigits = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
  
  let cleaned = phone;
  for (let i = 0; i < 10; i++) {
    cleaned = cleaned.replace(persianDigits[i], String(i)).replace(arabicDigits[i], String(i));
  }
  
  // 2. Remove any non-numeric characters
  cleaned = cleaned.replace(/\D/g, "");
  
  // 3. Standardize prefixes (converting country code "98" to "09")
  if (cleaned.startsWith("0098")) {
    cleaned = cleaned.substring(4);
  }
  if (cleaned.startsWith("98") && cleaned.length > 10) {
    cleaned = "0" + cleaned.substring(2);
  } else if (!cleaned.startsWith("0") && cleaned.length === 10) {
    cleaned = "0" + cleaned;
  }
  
  // 4. Enforce that a valid Iranian mobile number must start with "09" and be exactly 11 digits long
  if (!cleaned.startsWith("09") || cleaned.length !== 11) {
    throw new Error("Invalid Iranian mobile number. Must start with 09 and be exactly 11 digits long.");
  }
  
  return cleaned;
};
