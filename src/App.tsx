import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  MapPin, 
  Star, 
  X, 
  Check, 
  ChevronLeft, 
  ChevronDown,
  Phone, 
  ShieldCheck, 
  HelpCircle, 
  LogOut, 
  FileText, 
  Layers,
  Ambulance,
  Home as HomeIcon,
  Home,
  ShoppingCart,
  User as UserIcon,
  User,
  Plus,
  Minus,
  CheckCircle2,
  Trash2,
  Calendar,
  MessageSquare,
  MessageCircle,
  ArrowLeft,
  Package,
  LayoutDashboard,
  Settings,
  PieChart,
  Bell,
  Users,
  ShoppingBag,
  Grid
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AuthView from "./components/AuthView.tsx";

// Types for Sun8 AliExpress-style Mobile App
interface Product {
  id: number;
  title: string;
  category: "dental" | "consumable" | "diagnostic" | "operating_room" | "traditional";
  categoryLabel: string;
  image: string;
  pricePerDay: number;
  rating: number;
  salesCount: number;
  purchaseCount: number;
  location: string;
  owner: string;
  ownerPhone: string;
  specs: string[];
  description: string;
  imedCode?: string;
}

interface CartItem {
  product: Product;
  days: number;
}

interface RentalContract {
  id: number;
  items: CartItem[];
  startDate?: string;
  endDate?: string;
  totalPrice?: number;
  status: "pending" | "active" | "completed";
  trackingCode: string;
  requestDate: string;
}

interface Message {
  id: number;
  sender: "doctor" | "supplier";
  text: string;
  time: string;
}

interface ChatThread {
  id: number;
  supplierName: string;
  supplierRole: string;
  productName: string;
  productImage: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: Message[];
}

const PRODUCTS: Product[] = [
  // Category 1: تجهیزات دندانپزشکی (dental)
  {
    id: 1,
    title: "یونیت دندانپزشکی زیگر S30 دیجیتال آلمان",
    category: "dental",
    categoryLabel: "تجهیزات دندانپزشکی",
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 18500000,
    rating: 4.9,
    salesCount: 25,
    purchaseCount: 15,
    location: "تهران، خیابان آزادی",
    owner: "تجهیز طب آریا (Sun8)",
    ownerPhone: "۰۹۱۲۳۴۵۶۷۸۹",
    specs: ["سیستم اینسترومنت ۵ شلنگه از بالا", "موتور صندلی ۲۴ ولت بی‌صدا", "تابلت دستیار با سیستم سنسور نوری"],
    description: "یونیت دندانپزشکی لوکس زیگر آلمان با موتور قدرتمند، طراحی ارگونومیک صندلی و بالاترین استانداردهای ایمنی برای جراحی‌های دهان و دندان.",
    imedCode: "۷۷۴۸۱۹۰"
  },
  {
    id: 2,
    title: "دستگاه اتوکلاو دندانپزشکی کلاس B ظرفیت ۲۴ لیتر فیروز طب",
    category: "dental",
    categoryLabel: "تجهیزات دندانپزشکی",
    image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 4200000,
    rating: 4.8,
    salesCount: 42,
    purchaseCount: 28,
    location: "تهران، شادآباد",
    owner: "پیشرو تجهیز دندان (Sun8)",
    ownerPhone: "۰۹۱۲۹۸۷۶۵۴۳",
    specs: ["دارای پمپ وکیوم بسیار قوی", "برنامه‌های استریل متنوع و سریع", "نمایشگر هوشمند دیجیتال"],
    description: "اتوکلاو تمام اتوماتیک دیجیتالی کلاس بی، مناسب برای استریل کردن ابزارآلات بحرانی دندانپزشکی با کارایی و اطمینان فوق‌العاده بالا.",
    imedCode: "۷۷۴۸۱۲۳"
  },
  {
    id: 3,
    title: "رادیوگرافی تک دندان دیواری پروکس Prox ساخت کره",
    category: "dental",
    categoryLabel: "تجهیزات دندانپزشکی",
    image: "https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 1950000,
    rating: 4.7,
    salesCount: 19,
    purchaseCount: 11,
    location: "اصفهان، خیابان توحید",
    owner: "توسعه سلامت خورشید هشت",
    ownerPhone: "۰۹۳۵۹۷۲۵۷۶۵",
    specs: ["ولتاژ تیوب ۶۰ کیلوولت کالیبره", "فوکال اسپات بسیار دقیق ۰.۴ میلی‌متر", "ریموت کنترل از راه دور دیجیتال بی سیم"],
    description: "دستگاه رادیوگرافی پرتابل دندانی با بازوی مکانیکی منعطف و تشعشع بسیار کم با دوز کالیبره شده برای بیمار و پزشک.",
    imedCode: "۹۹۴۸۲۱۰"
  },
  {
    id: 4,
    title: "سنسور آر وی جی دندانپزشکی کداک مدل Carestream RVG 5200",
    category: "dental",
    categoryLabel: "تجهیزات دندانپزشکی",
    image: "https://images.unsplash.com/photo-1512223792601-592a9809eed4?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 3800000,
    rating: 4.9,
    salesCount: 31,
    purchaseCount: 18,
    location: "تهران، فاطمی",
    owner: "توسعه سلامت خورشید هشت",
    ownerPhone: "۰۹۳۵۹۷۲۵۷۶۵",
    specs: ["رزولوشن واقعی ۱۶ جفت خط بر میلی‌متر", "کاملاً ضد آب و مقاوم در برابر رطوبت بزاق", "نرم‌افزار مدیریت هوشمند تصاویر دندانپزشکی"],
    description: "سنسور تصویربرداری دیجیتال دندانپزشکی با کیفیت تصویر فوق‌العاده بالا و اتصال سریع USB بدون نیاز به جعبه رابط اضافی.",
    imedCode: "۸۸۳۹۲۱۰"
  },
  {
    id: 5,
    title: "موتور ایمپلنت ماریوتی به همراه آنگل اصل ایتالیا",
    category: "dental",
    categoryLabel: "تجهیزات دندانپزشکی",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 7800000,
    rating: 4.9,
    salesCount: 19,
    purchaseCount: 12,
    location: "تهران، میدان ونک",
    owner: "آریا دنت",
    ownerPhone: "۰۹۱۴۵۵۵۶۶۷۷",
    specs: ["گشتاور قابل تنظیم تا ۸۰ نیوتن", "پمپ آب بی‌صدا و کالیبره", "پدال پایی چندمنظوره ارگونومیک"],
    description: "موتور جراحی ایمپلنت حرفه‌ای با دقت بالا، ساخت کمپانی معتبر ماریوتی ایتالیا برای انواع جراحی‌های پیشرفته دهان.",
    imedCode: "۷۲۱۸۲۹۰"
  },

  // Category 2: لوازم مصرفی پزشکی (consumable)
  {
    id: 6,
    title: "سرنگ لوئر لاک هلال ۳ سی سی جعبه ۱۰۰ تایی هلال طب",
    category: "consumable",
    categoryLabel: "لوازم مصرفی پزشکی",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 180000,
    rating: 4.7,
    salesCount: 145,
    purchaseCount: 88,
    location: "تهران، کارگر شمالی",
    owner: "تجهیز درمان البرز",
    ownerPhone: "۰۹۱۲۹۸۷۶۵۴۳",
    specs: ["بدنه شفاف با درجات خوانا و غیرقابل پاک شدن", "اتصال پیچی لوئر لاک جهت عدم نشت سوزن", "سوزن استیل ضد زنگ سیلیکونایز با نفوذ آسان"],
    description: "سرنگ‌های تزریقی ایمن لوئر لاک که مانع از جدا شدن ناگهانی سوزن در حین تزریق داروهای غلیظ می‌شوند.",
    imedCode: "۱۱۲۰۲۹۰"
  },
  {
    id: 7,
    title: "دستکش نیتریل مشکی بدون پودر سایز متوسط ۱۰۰ تایی اپی‌مکس",
    category: "consumable",
    categoryLabel: "لوازم مصرفی پزشکی",
    image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 135000,
    rating: 4.9,
    salesCount: 210,
    purchaseCount: 145,
    location: "تهران، جمهوری",
    owner: "کالا طب ماندگار",
    ownerPhone: "۰۹۱۲۳۴۵۶۷۸۹",
    specs: ["مقاومت عالی در برابر پارگی و کشیدگی", "دارای عاج در قسمت سر انگشتان جهت عدم لغزش کالا", "کاملاً بدون پودر و ضد حساسیت پوستی"],
    description: "دستکش نیتریل درجه یک مقاوم، ایده‌آل برای جراحی، معاینه و مصارف آزمایشگاهی بدون ایجاد حساسیت پوستی.",
    imedCode: "۴۷۲۹۱۰۵"
  },
  {
    id: 8,
    title: "آنژیوکت صورتی ۲۰G هندی استریل جعبه ۵۰ تایی دکتر مد",
    category: "consumable",
    categoryLabel: "لوازم مصرفی پزشکی",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 250000,
    rating: 4.6,
    salesCount: 320,
    purchaseCount: 215,
    location: "تهران، ولیعصر",
    owner: "تجهیز گستر تهران",
    ownerPhone: "۰۹۱۱۴۴۴۵۵۶۶",
    specs: ["سوزن فولادی ضد زنگ با دیواره فوق‌العاده نازک", "دارای باله‌های منعطف برای فیکس شدن روی پوست بیمار", "پورت تزریق همرنگ استاندارد با درپوش سیلیکونی"],
    description: "آنژیوکت‌های باکیفیت و روان با تزریق بدون درد جهت رگ‌گیری طولانی‌مدت در بخش‌های بستری و اورژانس.",
    imedCode: "۳۸۴۷۲۹۰"
  },
  {
    id: 9,
    title: "ماسک سه لایه جراحی ملت بلون دار جعبه ۵۰ عددی آرمان",
    category: "consumable",
    categoryLabel: "لوازم مصرفی پزشکی",
    image: "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 45000,
    rating: 4.8,
    salesCount: 152,
    purchaseCount: 98,
    location: "تهران، ناصرخسرو",
    owner: "پخش عمده سلامت",
    ownerPhone: "۰۹۱۷۱۱۱۸۸۹۹",
    specs: ["دارای لایه ملت بلون با فیلتراسیون ذرات ۹۹٪", "ضد حساسیت و بدون بوی نامطبوع و الیاف شیشه", "پکینگ کاملاً استریل استاندارد بیمارستانی"],
    description: "ماسک‌های سه لایه پزشکی با کش نرم و راحت، ضد حساسیت پوستی و فیلتراسیون قوی در برابر ویروس‌ها و ذرات معلق.",
    imedCode: "۱۱۰۲۹۲۰"
  },
  {
    id: 10,
    title: "باند گچی فایبرگلاس ارتوپدی ۳ اینچ استریل آکوا کست",
    category: "consumable",
    categoryLabel: "لوازم مصرفی پزشکی",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 95000,
    rating: 4.8,
    salesCount: 95,
    purchaseCount: 62,
    location: "تهران، هفت تیر",
    owner: "درمان ابزار صبا",
    ownerPhone: "۰۹۱۳۲۲۲۳۳۴۴",
    specs: ["سبک و با استحکام فوق‌العاده بالا نسبت به کچ سنتی", "عبور عالی اشعه ایکس جهت رادیوگرافی مجدد استخوان", "سخت شدن سریع در کمتر از ۵ دقیقه پس از تماس با آب"],
    description: "باند گچی ارتوپدی مدرن فایبرگلاس جهت آتل‌بندی و گچ‌گیری شکستگی‌ها با مقاومت رطوبتی بالا.",
    imedCode: "۹۲۸۳۱۰۰"
  },
  {
    id: 11,
    title: "نخ بخیه نایلون ۳-۰ سوپا مجهز به سوزن کات جراحی",
    category: "consumable",
    categoryLabel: "لوازم مصرفی پزشکی",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 110000,
    rating: 4.7,
    salesCount: 140,
    purchaseCount: 90,
    location: "کرج، هفت تیر",
    owner: "توسعه سلامت خورشید هشت",
    ownerPhone: "۰۹۳۵۹۷۲۵۷۶۵",
    specs: ["نخ بخیه غیرقابل جذب تک رشته‌ای", "عبور روان از بافت پوست با کمترین کشیدگی", "دارای استانداردهای بین‌المللی USP جراحی عمومی"],
    description: "نخ بخیه باکیفیت و استریل سوپا جهت بستن بافت‌های نرم و پوست با حداقل واکنش التهابی بافت.",
    imedCode: "۲۷۱۹۲۰۰"
  },

  // Category 3: تجهیزات تصویربرداری و تشخیص (diagnostic)
  {
    id: 12,
    title: "دستگاه سونوگرافی پرتابل رنگی چیسون هوشمند مدل ECO6",
    category: "diagnostic",
    categoryLabel: "تجهیزات تصویربرداری و تشخیص",
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 22000000,
    rating: 4.9,
    salesCount: 14,
    purchaseCount: 8,
    location: "تهران، فاطمی",
    owner: "پارس تصویر طب",
    ownerPhone: "۰۹۱۴۵۵۵۶۶۷۷",
    specs: ["نمایشگر ال‌ای‌دی ۱۵ اینچ با رزولوشن فوق بالا", "دارای کانکتور دوگانه پروب فعال همزمان", "پشتیبانی از فناوری داپلر رنگی و تکنولوژی فیلتر نویز"],
    description: "دستگاه سونوگرافی قابل حمل پیشرفته کمپانی چیسون مناسب کلینیک‌های مامایی، قلب و اورژانس با تصویربرداری کریستالی.",
    imedCode: "۸۳۹۲۱۰۰"
  },
  {
    id: 13,
    title: "دستگاه الکتروکاردیوگراف ۳ کاناله مورتارا آمریکا Mortara ELI 150",
    category: "diagnostic",
    categoryLabel: "تجهیزات تصویربرداری و تشخیص",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 3500000,
    rating: 4.8,
    salesCount: 38,
    purchaseCount: 25,
    location: "تهران، سیدخندان",
    owner: "مهندسی پزشکی پویا",
    ownerPhone: "۰۹۱۷۱۱۱۸۸۹۹",
    specs: ["تفسیر خودکار و تحلیل پیشرفته آریتمی قلبی ECG", "پرینتر حرارتی سریع و باکیفیت بالا", "باتری داخلی قابل شارژ قوی جهت جابجایی آسان بیمارستانی"],
    description: "دستگاه نوار قلب حرفه‌ای مورتارا مجهز به الگوریتم هوشمند تحلیل داده‌های قلبی با بالاترین نرخ دقت تشخیصی.",
    imedCode: "۷۱۲۹۳۰۰"
  },
  {
    id: 14,
    title: "فشارسنج بازویی دیجیتال امرون مدل M3 اصلی ژاپن",
    category: "diagnostic",
    categoryLabel: "تجهیزات تصویربرداری و تشخیص",
    image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 290000,
    rating: 4.7,
    salesCount: 240,
    purchaseCount: 165,
    location: "تهران، امیرآباد",
    owner: "تندرستی مهرگان",
    ownerPhone: "۰۹۱۲۳۴۵۶۷۸۹",
    specs: ["سنسور هوشمند تشخیص آریتمی و ضربان نامنظم قلبی", "کاف هوشمند ۳۶۰ درجه راحت و دقیق بدون درد", "دارای حافظه ذخیره‌سازی داده‌ها برای دو کاربر مجزا"],
    description: "دقیق‌ترین فشارسنج دیجیتال خانگی و کلینیکی امرون ژاپن با قابلیت عیب‌یابی بستن نادرست کاف.",
    imedCode: "۹۲۱۰۳۹۰"
  },
  {
    id: 15,
    title: "پالس اکسی‌متر انگشتی چویس‌مد پایش مداوم اکسیژن ChoiceMMed",
    category: "diagnostic",
    categoryLabel: "تجهیزات تصویربرداری و تشخیص",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 85000,
    rating: 4.8,
    salesCount: 195,
    purchaseCount: 132,
    location: "تهران، پونک",
    owner: "پارس اکسیژن",
    ownerPhone: "۰۹۱۲۹۸۷۶۵۴۳",
    specs: ["صفحه نمایش دو رنگ باکیفیت عالی OLED", "سنجش همزمان ضربان قلب و اکسیژن خون SpO2", "خاموش شدن هوشمند اتوماتیک جهت ذخیره باتری"],
    description: "پالس اکسی‌متر معتبر پرتابل چویس‌مد با دقت سنجش بالا و مصرف بهینه باتری, عمیقا عالی برای پایش اکسیژن خون.",
    imedCode: "۴۷۱۹۲۰۰"
  },
  {
    id: 16,
    title: "اتوانالایزر بیوشیمی هوشمند دراکمد مدل Draka 300 آزمایشگاهی",
    category: "diagnostic",
    categoryLabel: "تجهیزات تصویربرداری و تشخیص",
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 14500000,
    rating: 4.9,
    salesCount: 12,
    purchaseCount: 7,
    location: "تهران، خیابان فاطمی",
    owner: "توسعه سلامت خورشید هشت",
    ownerPhone: "۰۹۳۵۹۷۲۵۷۶۵",
    specs: ["تست تمام اتوماتیک بیوشیمی خون", "سرعت اجرای ۳۰۰ تست در ساعت", "نرم‌افزار عیب‌یابی دقیق و کالیبراسیون اتوماتیک"],
    description: "دستگاه اتوانالایزر آزمایشگاهی پیشرفته برای پایش شاخص‌های بیوشیمیایی خون با حداقل مصرف ریجنت.",
    imedCode: "۱۰۲۹۳۱۰"
  },

  // Category 4: تجهیزات اتاق عمل و بیمارستانی (operating_room)
  {
    id: 17,
    title: "تخت جراحی تمام اتوماتیک ۵ شکن مدل Star جیمز طب",
    category: "operating_room",
    categoryLabel: "تجهیزات اتاق عمل و بیمارستانی",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 12500000,
    rating: 4.9,
    salesCount: 15,
    purchaseCount: 10,
    location: "تهران، شریعتی",
    owner: "تجهیزات پزشکی جیمز",
    ownerPhone: "۰۹۱۲۳۳۳۴۴۵۵",
    specs: ["کنترل برقی تمامی پوزیشن‌ها با ریموت دستی", "رویه تشک آنتی‌باکتریال، ضد تعریق و ضد اسید جراحی", "قابلیت تحمل وزن فوق‌العاده بالا تا ۳۰۰ کیلوگرم بدون افت سرعت"],
    description: "تخت جراحی فول اتوماتیک با قابلیت تنظیم پوزیشن‌های جراحی عمومی، قلب، اورولوژی و مغز و اعصاب.",
    imedCode: "۶۲۷۳۹۱۰"
  },
  {
    id: 18,
    title: "چراغ سیالیتیک سقفی اتاق عمل مدل LED 700 دنا طب",
    category: "operating_room",
    categoryLabel: "تجهیزات اتاق عمل و بیمارستانی",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 5800000,
    rating: 4.8,
    salesCount: 20,
    purchaseCount: 12,
    location: "تهران، میرداماد",
    owner: "دنا طب سیستم",
    ownerPhone: "۰۹۱۲۶۶۶۷۷۸۸",
    specs: ["شدت روشنایی ۱۶۰,۰۰۰ لوکس با عمق نفوذ عالی", "تکنولوژی حذف سایه پیشرفته زیر نور دست پزشک", "دمای رنگ قابل تنظیم بر اساس حساسیت چشم جراح"],
    description: "چراغ اتاق عمل پیشرفته LED با طول عمر بالا و کمترین میزان تولید گرما در ناحیه جراحی.",
    imedCode: "۹۱۸۲۳۰۰"
  },
  {
    id: 19,
    title: "دستگاه الکتروکوتر اتاق عمل متین مدل مکس ۸۰ وات جراحی",
    category: "operating_room",
    categoryLabel: "تجهیزات اتاق عمل و بیمارستانی",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 2800000,
    rating: 4.7,
    salesCount: 25,
    purchaseCount: 14,
    location: "تهران، خیابان ولیعصر",
    owner: "توسعه سلامت خورشید هشت",
    ownerPhone: "۰۹۳۵۹۷۲۵۷۶۵",
    specs: ["قابلیت برش و انعقاد دو قطبی و تک قطبی", "سیستم هشدار قطع اتصال الکترود خنثی بیمار", "حافظه پیش‌فرض هوشمند برنامه‌های جراحی مختلف"],
    description: "کوتر هوشمند جراحی پرقدرت با کنترل دیجیتال برای جراحی‌های زنان، دندانپزشکی، زیبایی و عمومی.",
    imedCode: "۸۲۹۱۰۳۰"
  },
  {
    id: 20,
    title: "ونتیلاتور ریوی اتاق عمل و آی‌سی‌یو همیلتون سوئیس مدل C1",
    category: "operating_room",
    categoryLabel: "تجهیزات اتاق عمل و بیمارستانی",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 9500000,
    rating: 4.9,
    salesCount: 18,
    purchaseCount: 9,
    location: "مشهد، احمدآباد",
    owner: "توسعه سلامت خورشید هشت",
    ownerPhone: "۰۹۳۵۹۷۲۵۷۶۵",
    specs: ["پشتیبانی از تمامی مدهای تنفسی پیشرفته تهاجمی و غیرتهاجمی", "توربین هواساز داخلی مستقل بدون نیاز به کپسول گاز هوای فشرده", "پایش هوشمند متغیرهای تنفسی با نمایشگر لمسی رنگی"],
    description: "ونتیلاتور فوق پیشرفته بیمارستانی ساخت سوئیس برای نوزادان، اطفال و بزرگسالان در شرایط بحرانی تنفسی.",
    imedCode: "۲۸۱۹۳۰۰"
  },

  // Category 5: طب سنتی و داروهای گیاهی (traditional)
  {
    id: 21,
    title: "پکیج کامل حجامت استریل و یکبار مصرف شعبان طب",
    category: "traditional",
    categoryLabel: "طب سنتی و داروهای گیاهی",
    image: "https://images.unsplash.com/photo-1512678018321-729215099394?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 450000,
    rating: 4.7,
    salesCount: 120,
    purchaseCount: 85,
    location: "تهران، شهر ری",
    owner: "گیاه گستر شرق",
    ownerPhone: "۰۹۱۲۴۴۴۹۹۰۰",
    specs: ["لیوان‌های استریل با سوپاپ اطمینان ضد نشت", "تیغ بیستوری استریل گرید پزشکی یکبار مصرف", "گاز استریل و دستکش و مواد ضدعفونی کننده کامل"],
    description: "پکیج‌های استاندارد و کاملاً بهداشتی جهت انجام حجامت در مراکز درمانی و کلینیک‌های طب سنتی.",
    imedCode: "۵۷۲۹۱۰۰"
  },
  {
    id: 22,
    title: "دستگاه روغن‌گیر پرس سرد خانگی و نیمه‌صنعتی بتین",
    category: "traditional",
    categoryLabel: "طب سنتی و داروهای گیاهی",
    image: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 1200000,
    rating: 4.9,
    salesCount: 35,
    purchaseCount: 22,
    location: "تهران، تجریش",
    owner: "سبزینه سلامت",
    ownerPhone: "۰۹۱۲۷۷۷۸۸۹۹",
    specs: ["تکنولوژی پرس سرد جهت حفظ کامل خواص ارگانیک روغن", "بدنه تمام استیل ضد زنگ غذایی درجه ۳۰۴", "قابلیت روغن‌گیری مداوم از تمامی دانه‌های سخت مانند کنجد و سیاه دانه"],
    description: "دستگاه روغن‌گیر پیشرفته جهت تولید روغن‌های گیاهی خالص و درمانی در حضور مشتری.",
    imedCode: "۳۸۱۹۲۰۰"
  },
  {
    id: 23,
    title: "دستگاه تقطیر و عرق‌گیری تمام استریل واشر دار پاسارگاد",
    category: "traditional",
    categoryLabel: "طب سنتی و داروهای گیاهی",
    image: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 850000,
    rating: 4.8,
    salesCount: 48,
    purchaseCount: 30,
    location: "شیراز، قصرالدشت",
    owner: "توسعه سلامت خورشید هشت",
    ownerPhone: "۰۹۳۵9۷۲۵۷۶۵",
    specs: ["دیگ آلومینیومی ضخیم با کندانسور استیل ۳۱۶", "سیستم واشر بندی سیلیکونی نسوز جهت عدم فرار اسانس", "عرق‌گیری شفاف و باکیفیت عالی در ظرفیت‌های مختلف"],
    description: "دستگاه عرق‌گیری سنتی و نیمه‌صنعتی مجهز به خنک‌کننده برقی جهت تولید انواع گلاب و عرقیات خالص طبیعی.",
    imedCode: "۱۹۲۸۳۱۰"
  },
  {
    id: 24,
    title: "مجموعه بادکش حرارتی شیشه‌ای پیرکس کلینیکی سوپا",
    category: "traditional",
    categoryLabel: "طب سنتی و داروهای گیاهی",
    image: "https://images.unsplash.com/photo-1512678018321-729215099394?auto=format&fit=crop&q=80&w=400",
    pricePerDay: 250000,
    rating: 4.7,
    salesCount: 92,
    purchaseCount: 54,
    location: "اصفهان، بزرگمهر",
    owner: "توسعه سلامت خورشید هشت",
    ownerPhone: "۰۹۳۵۹۷۲۵۷۶۵",
    specs: ["شیشه پیرکس مقاوم در برابر حرارت مستقیم مشعل", "لبه‌های صیقلی شده جهت عدم آسیب به پوست بیمار", "مقاوم در برابر شستشو و استریل‌سازی در اتوکلاو"],
    description: "کاپ‌های شیشه‌ای تخصصی بادکش حرارتی مناسب کلینیک‌های فیزیوتراپی و طب سنتی جهت بهبود گردش خون.",
    imedCode: "۸۲۹۱۰۲۰"
  }
];

const CAROUSEL_SLIDES = [
  {
    id: 1,
    title: "سامانه هوشمند اجاره تجهیزات دندانپزشکی",
    subtitle: "تامین سریع یونیت‌ها و ابزارهای استریل تخصصی در سراسر کشور",
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800",
    badge: "تخفیف ویژه آغازین"
  },
  {
    id: 2,
    title: "تامین فوری لوازم مصرفی استریل کلینیک",
    subtitle: "با تضمین انقضا، اصالت برند و تاییدیه رسمی وزارت بهداشت",
    image: "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&q=80&w=800",
    badge: "ارسال رایگان کارتن‌ها"
  },
  {
    id: 3,
    title: "تامین تخصصی تجهیزات اتاق عمل و هتلینگ",
    subtitle: "اجاره تخت‌های جراحی پیشرفته و چراغ‌های سیالیتیک با استانداردهای جهانی",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800",
    badge: "تجهیز کامل اتاق عمل"
  },
  {
    id: 4,
    title: "بخش ویژه طب سنتی و گیاهان دارویی ارگانیک",
    subtitle: "تامین لوازم استریل حجامت و دستگاه‌های روغن‌گیری تخصصی کلینیکی",
    image: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=800",
    badge: "اصالت و سلامت سنتی"
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ id: number; email: string; role: "user" | "supplier" | "admin"; phone?: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<"user" | "supplier" | "admin">("user");
  const [activeTab, setActiveTab] = useState<string>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("تهران و حومه");

  // Load cached user session on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem("sun8_user");
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser);
        setCurrentUser(parsed);
        setUserRole(parsed.role);
        if (parsed.role === "supplier") {
          setActiveTab("dashboard");
        } else if (parsed.role === "admin") {
          setActiveTab("overview");
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLoginSuccess = (user: { id: number; email: string; role: "user" | "supplier" | "admin"; phone?: string }) => {
    setCurrentUser(user);
    setUserRole(user.role);
    localStorage.setItem("sun8_user", JSON.stringify(user));
    
    // Redirect based on role
    if (user.role === "supplier") {
      setActiveTab("dashboard");
    } else if (user.role === "admin") {
      setActiveTab("overview");
    } else {
      setActiveTab("home");
    }
    setIsAuthModalOpen(false);
  };

  const handleLogOut = () => {
    setCurrentUser(null);
    setUserRole("user");
    localStorage.removeItem("sun8_user");
    setActiveTab("home");
  };
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState("");

  const IRAN_CITIES = [
    "تهران و حومه", "مشهد", "اصفهان", "کرج", "شیراز", "تبریز", "قم", "اهواز", 
    "کرمانشاه", "ارومیه", "رشت", "زاهدان", "همدان", "کرمان", "یزد", "اردبیل", 
    "بندرعباس", "قزوین", "زنجان", "سنندج", "خرم‌آباد", "گرگان", "ساری", "بجنورد", 
    "بوشهر", "بیرجند", "ایلام", "شهرکرد", "سمنان", "یاسوج"
  ];

  const filteredCities = IRAN_CITIES.filter(city => 
    city.includes(citySearchQuery)
  );
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [modalSlideIndex, setModalSlideIndex] = useState(0);
  const [showModalPhone, setShowModalPhone] = useState(false);

  // Cart & Booking states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingDays, setBookingDays] = useState(3);
  const [contracts, setContracts] = useState<RentalContract[]>([]);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [lastContractCode, setLastContractCode] = useState("");

  // Category Explore Bottom Sheet state
  const [selectedExploreCategory, setSelectedExploreCategory] = useState<string | null>(null);

  // Chat threads states for Messages tab
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [replyText, setReplyText] = useState("");
  const [threads, setThreads] = useState<ChatThread[]>([
    {
      id: 1,
      supplierName: "تجهیز طب آریا",
      supplierRole: "تامین‌کننده یونیت‌های زیگر آلمان",
      productName: "یونیت دندانپزشکی زیگر S30 دیجیتال",
      productImage: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=100",
      lastMessage: "سلام دکتر علوی عزیز، یونیت دندانپزشکی برای دوشنبه آماده تحویل است.",
      time: "۱۰:۳۰",
      unread: true,
      messages: [
        { id: 1, sender: "doctor", text: "درود بر شما، آیا امکان ارسال و نصب دستگاه در روز دوشنبه هست؟", time: "۰۹:۱۵" },
        { id: 2, sender: "supplier", text: "بله حتماً، تیم فنی ما برای دوشنبه صبح هماهنگ شده است.", time: "۰۹:۲۰" },
        { id: 3, sender: "doctor", text: "بسیار عالی. بیمه دستگاه هم کامل برقرار است دیگر؟", time: "۱۰:۱۵" },
        { id: 4, sender: "supplier", text: "سلام دکتر علوی عزیز، یونیت دندانپزشکی برای دوشنبه آماده تحویل است.", time: "۱۰:۳۰" },
      ]
    },
    {
      id: 2,
      supplierName: "پیشرو تجهیز دندان",
      supplierRole: "پخش تخصصی اتوکلاو دندانپزشکی",
      productName: "دستگاه اتوکلاو دندانپزشکی کلاس B",
      productImage: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=80&w=100",
      lastMessage: "تخفیف ۱۰ درصدی برای اجاره بالای ۱۰ روز اعمال شد.",
      time: "دیروز",
      unread: false,
      messages: [
        { id: 1, sender: "doctor", text: "سلام، هزینه اجاره اتوکلاو ۲۴ لیتری برای مدت طولانی‌تر تخفیف دارد؟", time: "دیروز" },
        { id: 2, sender: "supplier", text: "تخفیف ۱۰ درصدی برای اجاره بالای ۱۰ روز اعمال شد.", time: "دیروز" },
      ]
    },
    {
      id: 3,
      supplierName: "پارس تصویر طب",
      supplierRole: "پشتیبانی دستگاه‌های سونوگرافی و تصویربرداری",
      productName: "دستگاه سونوگرافی پرتابل رنگی چیسون",
      productImage: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=100",
      lastMessage: "قرارداد آنلاین توسط بخش فنی ما تایید شد.",
      time: "۱۶ تیر",
      unread: false,
      messages: [
        { id: 1, sender: "doctor", text: "سلام، دستگاه سونوگرافی چیسون کالیبره شده است؟", time: "۱۶ تیر" },
        { id: 2, sender: "supplier", text: "بله دکتر علوی عزیز، گواهی کالیبراسیون در جعبه دستگاه ضمیمه شده است.", time: "۱۶ تیر" },
        { id: 3, sender: "supplier", text: "قرارداد آنلاین توسط بخش فنی ما تایید شد.", time: "۱۶ تیر" },
      ]
    }
  ]);

  // WebSocket Chat Logic
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    
    ws.onopen = () => console.log("[Sun8] WebSocket Connected");
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "chat") {
          setThreads(prev => prev.map(t => {
            if (t.id === message.threadId) {
              // Idempotency check: avoid adding duplicates of the same message ID
              const msgExists = t.messages.some(m => m.id === message.payload.id);
              if (msgExists) return t;

              const updated = {
                ...t,
                messages: [...t.messages, message.payload],
                lastMessage: message.payload.text,
                time: message.payload.time,
                unread: message.payload.sender === "supplier"
              };
              if (selectedThread && selectedThread.id === t.id) {
                setSelectedThread(updated as any);
              }
              return updated as any;
            }
            return t;
          }));
        }
      } catch (e) {
        console.error("[Sun8] WS message error:", e);
      }
    };

    ws.onclose = () => {
      console.log("[Sun8] WebSocket Disconnected. Retrying in 5s...");
      setTimeout(() => {
        // Simple retry logic by re-triggering effect or simple reload if critical
        // window.location.reload(); // Avoid aggressive reload loops
      }, 5000);
    };

    setSocket(ws);
    return () => ws.close();
  }, [selectedThread?.id]);

  const handleSendMessage = (threadId: number) => {
    if (!replyText.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
    
    const newMsg = {
      id: Date.now(),
      sender: "doctor",
      text: replyText,
      time: timeStr
    };

    // Update local state immediately for responsiveness
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        const updated = {
          ...t,
          lastMessage: replyText,
          time: "اکنون",
          messages: [...t.messages, newMsg as any]
        };
        if (selectedThread && selectedThread.id === threadId) {
          setSelectedThread(updated as any);
        }
        return updated as any;
      }
      return t;
    }));

    // Send via WebSocket
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: "chat",
        threadId,
        payload: newMsg
      }));
    }

    setReplyText("");

    // Simulate supplier response via WebSocket (just for demo in this environment)
    setTimeout(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: "chat",
          threadId,
          payload: {
            id: Date.now() + 1,
            sender: "supplier",
            text: "پیام شما دریافت شد. در حال بررسی هستیم.",
            time: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
          }
        }));
      }
    }, 2000);
  };

  // Auto-rotate Carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Reset modal state variables on selected product change
  useEffect(() => {
    if (selectedProduct) {
      setModalSlideIndex(0);
      setShowModalPhone(false);
    }
  }, [selectedProduct]);

  // Numbers converter helper
  const toPersianDigits = (num: number | string): string => {
    const id = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/[0-9]/g, (w) => id[+w]);
  };

  // Toman currency formatter
  const formatToman = (amount: number): string => {
    const formatted = new Intl.NumberFormat("fa-IR").format(amount);
    return `${formatted} تومان`;
  };

  const totalCartCount = cart.length;

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setBookingSuccess(false);
  };

  const handleFinalizeContract = () => {
    const code = "EQ-" + Math.floor(100000 + Math.random() * 900000);
    const newContract: RentalContract = {
      id: Date.now(),
      trackingCode: code,
      items: cart.length > 0 ? [...cart] : selectedProduct ? [{ product: selectedProduct, days: bookingDays }] : [],
      status: "pending",
      requestDate: new Date().toLocaleDateString("fa-IR")
    };
    setContracts([newContract, ...contracts]);
    setLastContractCode(code);
    setBookingSuccess(true);
    if (cart.length > 0) setCart([]);
  };

  const handleCartCheckout = () => {
    if (cart.length === 0) return;
    setBookingDays(cart[0].days);
    setIsBookingModalOpen(true);
  };

  const renderHome = () => (
    <motion.div
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col gap-4"
    >
      <div className="px-2.5 mt-4">
        <div className="relative h-[180px] w-full rounded-[4px] overflow-hidden shadow-sm">
          <div className="absolute inset-0">
            <img 
              src={CAROUSEL_SLIDES[carouselIndex].image} 
              alt={CAROUSEL_SLIDES[carouselIndex].title}
              className="w-full h-full object-cover brightness-[0.4] transition-all duration-700 ease-in-out"
            />
          </div>
          <div className="absolute inset-0 p-5 flex flex-col justify-between text-right z-10">
            <span className="bg-indigo-600 text-white text-[8px] font-bold px-2 py-0.5 rounded self-start shadow-sm">
              {CAROUSEL_SLIDES[carouselIndex].badge}
            </span>
            <div>
              <h3 className="text-white text-xs font-black mb-1 leading-snug">
                {CAROUSEL_SLIDES[carouselIndex].title}
              </h3>
              <p className="text-gray-200 text-[10px] font-medium leading-relaxed">
                {CAROUSEL_SLIDES[carouselIndex].subtitle}
              </p>
            </div>
          </div>
          <div className="absolute bottom-3 left-4 flex gap-1 z-20">
            {CAROUSEL_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCarouselIndex(i)}
                className={`h-1 rounded-full transition-all duration-300 ${i === carouselIndex ? "w-3 bg-indigo-600" : "w-1 bg-white/50"}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col pb-6">
        {["dental", "consumable", "diagnostic", "operating_room", "traditional"].map((cat) => (
          <div key={cat} className="flex flex-col gap-1.5 mt-[10px]">
            <div className="flex justify-between items-center px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg mx-[3px]">
              <h3 className="text-[13px] font-black text-gray-800 uppercase tracking-wider">
                {cat === "dental" ? "تجهیزات دندانپزشکی" : 
                 cat === "consumable" ? "لوازم مصرفی پزشکی" :
                 cat === "diagnostic" ? "تجهیزات تصویربرداری و تشخیص" :
                 cat === "operating_room" ? "تجهیزات اتاق عمل و بیمارستانی" : "طب سنتی و داروهای گیاهی"}
              </h3>
              <button 
                onClick={() => setSelectedExploreCategory(cat as any)}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                مشاهده همه &gt;
              </button>
            </div>
            <div className="flex overflow-x-auto scrollbar-none gap-1 pr-[3px] pl-5 pb-4 snap-x snap-mandatory">
              {getFilteredByCategory(cat as any).map((product) => (
                <div 
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                    setIsDetailModalOpen(true);
                  }}
                  className="w-[143px] bg-white rounded-[5px] border border-indigo-500 shadow-[0_8px_24px_rgba(0,0,0,0.04)] shrink-0 snap-start overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-md active:scale-[0.98] transition-all duration-200 ease-out transform hover:-translate-y-0.5"
                >
                  <div className="relative h-[123px] w-full bg-gradient-to-tr from-indigo-50/30 to-teal-50/10 overflow-hidden flex items-center justify-center">
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 p-[2px] bg-gray-200" />
                    <span className={`absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                      product.id % 3 === 0 ? "bg-emerald-500 text-white shadow-sm" : 
                      product.id % 3 === 1 ? "bg-amber-500 text-white shadow-sm" : "bg-indigo-500 text-white shadow-sm"
                    }`}>
                      {product.id % 3 === 0 ? "موجود" : product.id % 3 === 1 ? "ویژه" : "تضمینی"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 pt-2">
                    <h4 className="text-[11px] font-semibold text-gray-800 px-2.5 leading-tight text-right w-full truncate">{product.title}</h4>
                  </div>
                  <div className="text-[9px] text-gray-400 px-2.5 pt-1 text-right font-medium flex items-center gap-1 whitespace-nowrap">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
                    <span>{toPersianDigits(product.rating)} ({toPersianDigits(product.salesCount)}+ اجاره)</span>
                    <span className="text-gray-200 mx-0.5">|</span>
                    <ShoppingCart className="w-2.5 h-2.5 text-gray-400" />
                    <span>{toPersianDigits(product.purchaseCount)}+</span>
                  </div>
                  <div className="px-2 pb-2 pt-1 flex items-center justify-center gap-0.5 mt-1">
                    <div className="bg-gray-100 px-2 py-1 rounded-md flex items-baseline gap-0.5 w-full justify-center">
                      <span className="font-black text-xs text-violet-600">{toPersianDigits(new Intl.NumberFormat("fa-IR").format(product.pricePerDay))}</span>
                      <span className="text-[8px] font-medium text-violet-400">تومان</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderMessages = () => (
    <motion.div
      key="messages"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="px-5 py-4 flex flex-col gap-4 text-right"
    >
      <div>
        <h2 className="text-sm font-black text-gray-900 mb-1">گفتگوها و پیام‌ها</h2>
        <p className="text-[10px] text-gray-400 font-bold">ارتباط مستقیم و بی‌واسطه با مالکان و تامین‌کنندگان ماشین‌آلات</p>
      </div>
      <div className="flex flex-col gap-3">
        {threads.map((thread) => (
          <div key={thread.id} onClick={() => { setSelectedThread(thread); setThreads(threads.map(t => t.id === thread.id ? { ...t, unread: false } : t)); }} className={`p-3.5 rounded-2xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.02)] border transition-all duration-300 cursor-pointer flex gap-3 items-center relative ${thread.unread ? "border-violet-100 bg-violet-50/10" : "border-gray-100 hover:border-gray-200"}`}>
            <div className="relative shrink-0">
              <img src={thread.productImage} alt={thread.supplierName} className="w-12 h-12 rounded-xl object-cover bg-gray-50 border border-gray-100" />
              {thread.unread && <span className="absolute -top-1 -right-1 bg-indigo-600 w-3 h-3 rounded-full border-2 border-white animate-pulse" />}
            </div>
            <div className="flex-1 min-w-0 text-right">
              <div className="flex justify-between items-center mb-0.5">
                <h4 className="text-xs font-black text-gray-950 truncate">{thread.supplierName}</h4>
                <span className="text-[8px] font-bold text-gray-400">{thread.time}</span>
              </div>
              <span className="text-[9px] text-gray-400 font-bold block mb-1 truncate">{thread.productName}</span>
              <p className={`text-[10px] truncate leading-tight ${thread.unread ? "text-gray-950 font-black" : "text-gray-500 font-semibold"}`}>{thread.lastMessage}</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-gray-300 shrink-0" />
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderCart = () => (
    <motion.div
      key="cart"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="px-5 py-4 flex flex-col gap-4 text-right"
    >
      <div>
        <h2 className="text-sm font-black text-gray-900 mb-1">سبد استعلام اجاره</h2>
        <p className="text-[10px] text-gray-400 font-bold">لیست دستگاه‌های انتخاب شده جهت عقد قرارداد نهایی و بیعانه</p>
      </div>
      {cart.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-400 flex flex-col items-center gap-3">
          <ShoppingCart className="w-10 h-10 text-gray-300" />
          <h4 className="text-xs font-black text-gray-800">سبد استعلام شما خالی است</h4>
          <button onClick={() => setActiveTab("home")} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-[10px] font-extrabold shadow-sm transition-all mt-1">بازگشت به کاتالوگ</button>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-3">
            {cart.map((item, index) => (
              <div key={item.product.id} className="bg-white border border-gray-150 rounded-xl p-3 flex gap-3 shadow-sm items-center relative">
                <img src={item.product.image} alt={item.product.title} className="w-14 h-14 rounded-lg object-cover bg-gray-50 shrink-0" />
                <div className="flex-1 text-right min-w-0">
                  <h4 className="text-[11px] font-bold text-gray-950 truncate">{item.product.title}</h4>
                  <span className="text-[10px] font-black text-indigo-600 block mt-1">{formatToman(item.product.pricePerDay)} <span className="text-[8px] text-gray-400">/ روزانه</span></span>
                </div>
                <div className="flex flex-col items-center gap-1.5 border-r border-gray-100 pr-3">
                  <span className="text-[8px] text-gray-400 font-bold">بازه (روز)</span>
                  <div className="flex items-center gap-2 bg-gray-50 px-1.5 py-0.5 rounded-lg border border-gray-200">
                    <button onClick={() => { const val = Math.max(1, item.days - 1); setCart(cart.map((c, i) => i === index ? { ...c, days: val } : c)); }} className="text-gray-500 hover:text-indigo-600 text-[11px] font-bold p-0.5"><Minus className="w-2.5 h-2.5" /></button>
                    <span className="text-[10px] font-bold text-gray-800 min-w-[12px] text-center">{toPersianDigits(item.days)}</span>
                    <button onClick={() => { setCart(cart.map((c, i) => i === index ? { ...c, days: item.days + 1 } : c)); }} className="text-gray-500 hover:text-indigo-600 text-[11px] font-bold p-0.5"><Plus className="w-2.5 h-2.5" /></button>
                  </div>
                </div>
                <button onClick={() => setCart(cart.filter((_, i) => i !== index))} className="p-1 rounded-full text-gray-300 hover:text-indigo-600 hover:bg-gray-50 absolute left-2 top-2"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
          <div className="bg-white border border-gray-150 rounded-2xl p-4 flex flex-col gap-3 mt-1 shadow-sm">
            <h3 className="text-[11px] font-black text-gray-900 border-b border-gray-50 pb-2">فاکتور تخمینی بیعانه و اجاره</h3>
            <div className="flex justify-between items-center text-xs text-gray-900 font-black pt-1 border-t border-gray-50">
              <span>جمع کل هزینه اجاره فاکتور:</span>
              <span className="text-indigo-600">{formatToman(cart.reduce((sum, item) => sum + (item.product.pricePerDay * item.days), 0))}</span>
            </div>
            <button onClick={handleCartCheckout} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-[11px] font-black shadow-md shadow-indigo-600/10 transition-all mt-2">تایید نهایی و صدور قرارداد آنلاین</button>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderInquiry = () => (
    <motion.div
      key="inquiry"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="px-5 py-4 flex flex-col gap-4 text-right"
    >
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-sm font-black text-gray-900">استعلام‌های خرید و اجاره</h2>
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-2 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-indigo-800 font-bold leading-relaxed">مراکز درمانی مورد تایید، به‌صورت ناشناس درخواست خود را ارسال می‌کنند.</p>
        </div>
      </div>
      {contracts.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-400 flex flex-col items-center gap-3">
          <FileText className="w-8 h-8" />
          <h4 className="text-xs font-black text-gray-800">لیست استعلام‌های شما خالی است</h4>
          <button onClick={() => setActiveTab("home")} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-[10px] font-extrabold shadow-sm transition-all mt-2">شروع اولین استعلام</button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {contracts.map((contract) => (
            <div key={contract.id} className="bg-white border border-gray-150 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <span className="text-[11px] font-black text-gray-800">{contract.trackingCode}</span>
                <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[8px] font-black px-2 py-1 rounded-lg">در انتظار بررسی</span>
              </div>
              {contract.items.map((it, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <img src={it.product.image} alt={it.product.title} className="w-10 h-5 rounded-xl object-cover" />
                  <h4 className="text-[10px] font-black text-gray-900 line-clamp-1 flex-1">{it.product.title}</h4>
                  <span className="text-[10px] font-black text-indigo-600">{toPersianDigits(it.days)} روز</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );

  const renderProfile = () => {
    if (!currentUser) {
      return (
        <div className="flex items-center justify-center min-h-[70vh] p-4 bg-slate-50">
          <AuthView onLoginSuccess={handleLoginSuccess} />
        </div>
      );
    }

    return (
      <motion.div
        key="profile"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="px-5 py-4 flex flex-col gap-4 text-right"
      >
        <div className="bg-white border border-gray-150 rounded-2xl p-5 flex flex-col gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 font-black text-lg">
              {currentUser.role === "admin" ? "مدیر" : currentUser.role === "supplier" ? "تأمین" : "پزشک"}
            </div>
            <div className="flex-1">
              <h3 className="font-black text-gray-950 text-sm">
                {currentUser.role === "admin" ? "مدیر کل سیستم" : currentUser.role === "supplier" ? "تامین‌کننده تجهیزات" : "کاربر گرامی سان ۸ (sun8.ir)"}
              </h3>
              <p className="text-[10px] text-gray-400 font-bold mt-1" dir="ltr">
                {currentUser.phone || currentUser.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-gray-50 pt-3">
            <div className="bg-gray-50 p-2.5 rounded-xl text-right">
              <span className="text-[8px] text-gray-400 font-bold block">نقش سیستم</span>
              <span className="text-[10px] font-black text-gray-800 mt-0.5 block">
                {currentUser.role === "admin" ? "مدیر ارشد" : currentUser.role === "supplier" ? "تامین‌کننده" : "پزشک / کلینیک"}
              </span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-xl text-right">
              <span className="text-[8px] text-gray-400 font-bold block">وضعیت حساب</span>
              <span className="text-[10px] font-black text-emerald-600 mt-0.5 block">✓ تایید شده</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-150 rounded-2xl p-2 shadow-sm space-y-1">
          <button 
            onClick={() => {
              if (currentUser.role === "supplier") {
                setActiveTab("dashboard");
              } else if (currentUser.role === "admin") {
                setActiveTab("overview");
              } else {
                setActiveTab("home");
              }
            }}
            className="w-full text-right px-4 py-2.5 rounded-xl text-[10.5px] font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-between"
          >
            <span>مشاهده داشبورد اختصاصی</span>
            <span className="text-gray-400 font-mono">&gt;</span>
          </button>
        </div>

        <button 
          onClick={handleLogOut}
          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 py-3 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1.5 w-full"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>خروج از حساب کاربری</span>
        </button>
      </motion.div>
    );
  };

  const renderSupplierDashboard = () => (
    <div className="flex flex-col gap-4 p-5 pb-24 text-right">
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-5 rounded-2xl text-white shadow-lg">
        <h2 className="text-lg font-black mb-1">پنل تامین‌کننده</h2>
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl"><span className="text-[9px] block opacity-70">درآمد</span><span className="text-sm font-black">{toPersianDigits("۴۵,۸۰۰,۰۰۰")}</span></div>
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl"><span className="text-[9px] block opacity-70">اجاره فعال</span><span className="text-sm font-black">{toPersianDigits("۱۲")}</span></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center gap-2">
          <Plus className="w-5 h-5 text-green-600" />
          <span className="text-[10px] font-bold text-gray-700">محصول جدید</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center gap-2">
          <Package className="w-5 h-5 text-indigo-600" />
          <span className="text-[10px] font-bold text-gray-700">مدیریت انبار</span>
        </div>
      </div>
    </div>
  );

  const renderAdminOverview = () => (
    <div className="flex flex-col gap-4 p-5 pb-24 text-right">
      <div className="bg-slate-900 p-5 rounded-2xl text-white shadow-lg">
        <h2 className="text-lg font-black mb-1">پنل مدیریت کل</h2>
        <div className="grid grid-cols-3 gap-2 mt-6">
          <div className="text-center"><span className="text-sm font-black block">{toPersianDigits("۱۵۶")}</span><span className="text-[8px] opacity-60">کاربر</span></div>
          <div className="text-center border-x border-white/10"><span className="text-sm font-black block">{toPersianDigits("۴۲")}</span><span className="text-[8px] opacity-60">تامین‌کننده</span></div>
          <div className="text-center"><span className="text-sm font-black block">{toPersianDigits("۸")}</span><span className="text-[8px] opacity-60">گزارش</span></div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-xs font-black text-gray-800 mb-3">تراکنش‌های اخیر</h3>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-[10px] font-bold text-gray-800">تراکنش #{i}</span>
              <button className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">بررسی</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (!currentUser && activeTab !== "home") {
      return (
        <div className="flex items-center justify-center min-h-[70vh] p-5 bg-slate-50">
          <AuthView onLoginSuccess={handleLoginSuccess} />
        </div>
      );
    }

    if (userRole === "supplier") {
      switch (activeTab) {
        case "dashboard": return renderSupplierDashboard();
        case "messages": return renderMessages();
        case "profile": return renderProfile();
        default: return renderSupplierDashboard();
      }
    }
    if (userRole === "admin") {
      switch (activeTab) {
        case "overview": return renderAdminOverview();
        case "profile": return renderProfile();
        default: return renderAdminOverview();
      }
    }
    switch (activeTab) {
      case "home": return renderHome();
      case "messages": return renderMessages();
      case "cart": return renderCart();
      case "profile": return renderProfile();
      case "inquiry": return renderInquiry();
      default: return renderHome();
    }
  };

  // Filtering products for AliExpress horizontal category lists
  const getFilteredByCategory = (category: "dental" | "consumable" | "diagnostic" | "operating_room" | "traditional") => {
    const filtered = PRODUCTS.filter((p) => p.category === category);
    if (!searchQuery) return filtered;
    return filtered.filter((p) => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.owner.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Add Item directly to cart or initialize checkout
  const handleAddToCart = (product: Product) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      setCart(cart.map((item) => item.product.id === product.id ? { ...item, days: item.days + 1 } : item));
    } else {
      setCart([...cart, { product, days: 3 }]);
    }
    // Show user a brief notification or go to cart tab
    setActiveTab("cart");
  };

  // Place quick contract order directly from details
  const handleQuickCheckout = (product: Product) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedProduct(product);
    setBookingDays(3);
    setIsBookingModalOpen(true);
  };

  // Contact Supplier helper that connects seamlessly with chat system
  const handleContactSupplier = (product: Product) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsDetailModalOpen(false);
    
    // Find or create a thread for this supplier
    const existingThread = threads.find((t) => t.supplierName === product.owner);
    if (existingThread) {
      setSelectedThread(existingThread);
    } else {
      const newThread: ChatThread = {
        id: Date.now(),
        supplierName: product.owner,
        supplierRole: "تامین‌کننده تجهیزات پزشکی",
        productName: product.title,
        productImage: product.image,
        lastMessage: "سلام دکتر عزیز، تمایل به استعلام و اجاره این دستگاه را دارید؟",
        time: "۱۰:۳۰",
        unread: false,
        messages: [
          { id: 1, sender: "supplier", text: `سلام دکتر علوی گرامی، دستگاه ${product.title} آماده اجاره است.`, time: "۱۰:۳۰" },
        ]
      };
      setThreads([newThread, ...threads]);
      setSelectedThread(newThread);
    }
    setActiveTab("messages");
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-16 font-vazir" dir="rtl">
      {/* Sun8 Premium Header */}
      <div className="sticky top-0 z-50 bg-indigo-600 bg-gradient-to-r from-indigo-700 to-violet-700 p-4 pb-3.5 shadow-lg">
        <div className="flex justify-between items-center gap-3">
          <h1 className="text-white text-xl font-black tracking-tighter shrink-0">SUN8.IR</h1>
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="جستجو..." 
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/60 pl-9 pr-3 py-1.5 rounded-[4px] text-sm focus:outline-none focus:bg-white/20 transition-all"
            />
            <Search className="w-4 h-4 text-white/60 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <button className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all shrink-0">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 -mt-3">
        <AnimatePresence mode="wait">
          {renderTabContent()}
        </AnimatePresence>
      </div>

      {/* Product specs details slider bottom sheet modal */}
      <AnimatePresence>
        {selectedProduct && isDetailModalOpen && !isBookingModalOpen && (
          <div 
            onClick={() => { setSelectedProduct(null); setIsDetailModalOpen(false); }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 240 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-sm w-full max-h-[80vh] flex flex-col overflow-hidden relative border border-gray-100 dir-rtl text-right"
            >
              
              {/* A. Compact Header (py-1.5, approx 36px total height) */}
              <div className="flex justify-between items-center px-4 py-1.5 border-b border-gray-50 shrink-0 h-9">
                <span className="font-bold text-[11px] text-gray-900">جزئیات دستگاه</span>
                <button 
                  onClick={() => { setSelectedProduct(null); setIsDetailModalOpen(false); }} 
                  className="p-1 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors text-xs"
                >
                  ✕
                </button>
              </div>

              {/* B. Scrollable Content Body with pt-[5px] for exactly 5px gap from header border */}
              <div className="flex-1 overflow-y-auto px-4 pb-4 pt-[5px] space-y-4">
                
                {/* Product Image Slider (Exactly 5px below header bottom border) */}
                <div className="w-full h-[124px] bg-gray-50 rounded-2xl overflow-hidden relative shrink-0">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                  </div>
                </div>

                {/* Product Title */}
                <div className="space-y-1">
                  <h2 className="font-bold text-xs text-gray-900 leading-tight">{selectedProduct.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md font-medium inline-flex items-center gap-0.5 text-right">
                      ✓ {selectedProduct.category === "diagnostic" ? "تضمین اصالت" : "تایید وزارت بهداشت"}
                    </span>
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 font-medium whitespace-nowrap">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
                      <span>{toPersianDigits(selectedProduct.rating)} ({toPersianDigits(selectedProduct.salesCount)}+ اجاره)</span>
                      <span className="text-gray-200 mx-0.5">|</span>
                      <ShoppingCart className="w-2.5 h-2.5 text-gray-400" />
                      <span>{toPersianDigits(selectedProduct.purchaseCount)}+</span>
                    </div>
                  </div>
                </div>

                {/* Supplier Info */}
                <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/50 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center border border-indigo-100 shadow-sm">
                    <span className="text-[8px] font-bold text-indigo-600">{selectedProduct.owner.slice(0, 2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-gray-400 font-medium">تامین‌کننده رسمی:</span>
                    <span className="text-[10px] font-black text-gray-900">{selectedProduct.owner}</span>
                  </div>
                </div>

                {/* Description Box */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100/60 space-y-1">
                  <h4 className="font-bold text-[9px] text-gray-700">توضیحات فنی:</h4>
                  <p className="text-[10px] text-gray-500 leading-relaxed text-justify">
                    {selectedProduct.description || "توضیحات و مشخصات فنی برای این کالا ثبت نشده است. جهت اطلاعات بیشتر با تامین‌کننده ارتباط برقرار کنید."}
                  </p>
                </div>

                {/* Specs Box */}
                {selectedProduct.specs && selectedProduct.specs.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100/60 space-y-1.5">
                    <h4 className="font-bold text-[9px] text-gray-700">ویژگی‌های کلیدی دستگاه:</h4>
                    <ul className="space-y-1">
                      {selectedProduct.specs.map((spec, idx) => (
                        <li key={idx} className="text-[9.5px] text-gray-500 leading-relaxed flex items-start gap-1.5">
                          <span className="text-indigo-500 select-none font-bold shrink-0">•</span>
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* IMED & Authenticity Box */}
                <div className="bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100/50 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="font-bold text-emerald-800">وضعیت اصالت در سامانه IMED:</span>
                    <span className="font-black text-emerald-600 bg-emerald-100/50 px-1.5 py-0.5 rounded-md">دارای تاییدیه وزارت بهداشت</span>
                  </div>
                  {selectedProduct.imedCode && (
                    <div className="flex justify-between items-center text-[8.5px] text-gray-500 font-medium">
                      <span>شناسه ملی ثبت تجهیزات (IMED):</span>
                      <span className="font-mono text-gray-700">{toPersianDigits(selectedProduct.imedCode)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[8.5px] text-gray-500 font-medium">
                    <span>مشاوره و اصالت فنی:</span>
                    <span className="text-indigo-600 font-bold">توسعه سلامت خورشید هشت (sun8.ir)</span>
                  </div>
                </div>

              </div>

              {/* C. Action Buttons Area (Fixed at the bottom - shrink-0) */}
              <div className="p-4 border-t border-gray-50 space-y-2 bg-gray-50/50 shrink-0">
                <div className="flex gap-2">
                  {/* Chat Button (Gradient Blue) */}
                  <button 
                    onClick={() => setIsChatOpen(true)}
                    className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-700 hover:to-indigo-700 text-white text-[10px] font-bold rounded-xl shadow-md shadow-indigo-500/10 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-white" />
                    <span>شروع گفتگو</span>
                  </button>
                  {/* Call Button (Gradient Emerald) */}
                  <button 
                    onClick={() => setShowModalPhone(true)}
                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-[10px] font-bold rounded-xl shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5 text-white" />
                    <span>{showModalPhone ? toPersianDigits(selectedProduct.ownerPhone) : "تماس تلفنی"}</span>
                  </button>
                </div>

                {/* More Products Button (Gradient Slate/Gray) */}
                <button 
                  onClick={() => {
                    setSearchQuery(selectedProduct.owner);
                    setSelectedProduct(null);
                    setIsDetailModalOpen(false);
                    setActiveTab("home");
                  }}
                  className="w-full py-2 bg-gradient-to-r from-gray-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 text-gray-700 border border-gray-200/80 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Grid className="w-3.5 h-3.5 text-gray-500" />
                  <span>مشاهده بقیه محصولات فروشگاه</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {isChatOpen && selectedProduct && (
          <div 
            onClick={() => setIsChatOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 240 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.2)] max-w-sm w-full h-[75vh] max-h-[600px] flex flex-col overflow-hidden relative border border-gray-100 dir-rtl text-right"
            >
              
              {/* 1. Chat Header (Fixed at the top - shrink-0) */}
              <div className="flex justify-between items-center px-4 py-2.5 border-b border-gray-100 bg-white shrink-0 h-14">
                <div className="flex items-center gap-2">
                  {/* Seller Profile & Online Status Indicator */}
                  <div className="relative w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                    <span className="text-xs font-bold text-indigo-600">{selectedProduct.owner.slice(0, 3)}</span>
                    <span className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-gray-900">پشتیبانی {selectedProduct.owner}</span>
                    <span className="text-[9px] text-emerald-500 font-semibold">پاسخگوی آنلاین</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)} 
                  className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors text-xs"
                >
                  ✕
                </button>
              </div>

              {/* 2. Scrollable Messages Body (Internally scrolls - flex-1) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/60">
                
                {/* System Message (Auto Help) */}
                <div className="flex justify-center">
                  <span className="text-[8px] bg-gray-200/70 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                    گفتگو با حفظ حریم خصوصی کاربران آغاز شد
                  </span>
                </div>

                {/* Message from Seller (Left aligned in RTL, coming from the counter-party) */}
                <div className="flex gap-2 items-start max-w-[85%]">
                  <div className="bg-white border border-gray-100 p-2.5 rounded-2xl rounded-tr-none text-[10px] text-gray-700 shadow-sm leading-relaxed">
                    سلام، وقت بخیر! چطور میتونم در مورد دستگاه <strong className="text-indigo-600">"{selectedProduct.title}"</strong> کمکتون کنم؟
                  </div>
                </div>

                {/* Default Contextual Message from Buyer (Right aligned in RTL) */}
                <div className="flex gap-2 items-start justify-end max-w-[85%] mr-auto">
                  <div className="bg-gradient-to-r from-indigo-600 to-indigo-600 text-white p-2.5 rounded-2xl rounded-tl-none text-[10px] shadow-sm leading-relaxed">
                    سلام، من مایل به خرید و استعلام قیمت دقیق نهایی این دستگاه هستم. لطفا راهنمایی بفرمایید.
                  </div>
                </div>

              </div>

              {/* 3. Message Input Area (Fixed at the bottom - shrink-0) */}
              <div className="p-3 border-t border-gray-100 bg-white flex items-center gap-2 shrink-0 h-14">
                <input 
                  type="text" 
                  placeholder="پیام خود را بنویسید..." 
                  className="flex-1 text-[10px] bg-gray-50 border border-gray-200 rounded-full py-2 px-4 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-gray-400"
                />
                {/* Send Button with gradient */}
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/10 hover:opacity-90 active:scale-95 transition-all"
                >
                  ✈️
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Calendar Dialog Modal */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-white rounded-t-[24px] w-full max-w-lg p-5 flex flex-col gap-4 text-right"
            >
              {!bookingSuccess ? (
                <>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <h3 className="text-xs font-black text-gray-900">تنظیمات اجاره و صدور فاکتور</h3>
                    <button onClick={closeBookingModal} className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {selectedProduct && (
                    <div className="bg-gray-50 p-3 rounded-xl flex gap-3 border border-gray-100 items-center">
                      <img src={selectedProduct.image} alt={selectedProduct.title} className="w-10 h-10 rounded object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[10px] font-bold text-gray-800 truncate">{selectedProduct.title}</h4>
                        <span className="text-[8px] text-gray-400 block mt-0.5">{selectedProduct.owner}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-900">مدت زمان اجاره (روز):</label>
                    <div className="flex items-center justify-between gap-4 border border-gray-200 p-2 rounded-xl bg-gray-50">
                      <button 
                        onClick={() => setBookingDays(prev => Math.max(1, prev - 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-700 font-extrabold text-base"
                      >
                        -
                      </button>
                      <span className="text-xs font-black text-gray-900">
                        {toPersianDigits(bookingDays)} روز کامل
                      </span>
                      <button 
                        onClick={() => setBookingDays(prev => prev + 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-700 font-extrabold text-base"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2 text-[10px] font-bold border border-gray-100">
                    <div className="flex justify-between items-center text-gray-500">
                      <span>نرخ روزانه اجاره:</span>
                      <span>{selectedProduct ? formatToman(selectedProduct.pricePerDay) : ""}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-500">
                      <span>مدت اجاره مطب:</span>
                      <span>{toPersianDigits(bookingDays)} روز</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-500">
                      <span>پشتیبانی فنی و بیمه تمام خطر:</span>
                      <span className="text-emerald-600">تحت پوشش رایگان سان ۸ (sun8.ir)</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-gray-900 font-black">
                      <span className="text-[11px]">مبلغ کل قرارداد اجاره:</span>
                      <span className="text-xs text-indigo-600">
                        {selectedProduct ? formatToman(selectedProduct.pricePerDay * bookingDays) : ""}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={handleFinalizeContract}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-[11px] font-black shadow-md shadow-indigo-600/15"
                  >
                    تایید نهایی و امضای قرارداد آنلاین
                  </button>
                </>
              ) : (
                <div className="py-6 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-gray-900 mb-1">درخواست با موفقیت ثبت شد</h3>
                    <p className="text-[9px] text-gray-400 font-bold px-4 leading-normal">
                      پیش‌فاکتور با کد رهگیری <span className="font-mono font-black text-gray-800">{lastContractCode}</span> جهت هماهنگی فیزیکی و امضا در بخش قراردادها صادر شد.
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      closeBookingModal();
                      setSelectedProduct(null);
                      setActiveTab("profile");
                    }}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl text-[10px] font-black mt-2"
                  >
                    برو به بخش قراردادهای من
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sliding Interactive Chat Drawer */}
      <AnimatePresence>
        {selectedThread && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 210 }}
              className="bg-white rounded-t-[24px] w-full max-w-lg p-5 flex flex-col gap-4 text-right border-t border-gray-100 h-[85vh]"
            >
              {/* Chat Header */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <img src={selectedThread.productImage} alt={selectedThread.supplierName} className="w-10 h-10 rounded-xl object-cover bg-gray-50 border border-gray-100" />
                  <div className="text-right">
                    <h3 className="text-xs font-black text-gray-950 leading-tight">{selectedThread.supplierName}</h3>
                    <span className="text-[8px] font-bold text-gray-400 block mt-0.5">{selectedThread.supplierRole}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedThread(null)} 
                  className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Messages List */}
              <div className="flex-1 overflow-y-auto space-y-3 p-1 scrollbar-none flex flex-col">
                <div className="bg-indigo-50/50 border border-indigo-100/30 rounded-xl p-2.5 text-center text-[9px] font-bold text-indigo-800 leading-normal mb-1">
                  شما در حال گفتگو درباره اجاره دستگاه <span className="font-black text-violet-600">«{selectedThread.productName}»</span> با مالک کالا هستید. جهت هرگونه واریزی یا امضا، فقط از درگاه آنلاین سان ۸ (sun8.ir) اقدام کنید تا شامل بیمه حوادث کامل شوید.
                </div>
                
                {selectedThread.messages.map((msg) => {
                  const isDoctor = msg.sender === "doctor";
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col max-w-[80%] ${isDoctor ? "self-start items-start" : "self-end items-end"}`}
                    >
                      <div 
                        className={`p-3 rounded-2xl text-[10.5px] leading-relaxed ${
                          isDoctor 
                            ? "bg-violet-600 text-white rounded-br-none shadow-sm font-semibold" 
                            : "bg-gray-100 text-gray-800 rounded-bl-none font-medium"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[8px] text-gray-400 mt-1 font-bold px-1">{msg.time}</span>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input Area */}
              <div className="border-t border-gray-100 pt-3 flex gap-2 items-center">
                <input 
                  type="text" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage(selectedThread.id);
                  }}
                  placeholder="پیام خود را بنویسید..."
                  className="flex-1 bg-gray-100/80 pr-4 pl-3 py-2.5 rounded-xl border-0 text-[10.5px] font-bold text-gray-800 placeholder:text-gray-400 text-right focus:outline-none focus:ring-1 focus:ring-violet-500/20 focus:bg-white transition-all"
                />
                <button 
                  onClick={() => handleSendMessage(selectedThread.id)}
                  className="bg-violet-600 hover:bg-violet-700 text-white p-2.5 rounded-xl shadow-md shadow-violet-500/10 transition-all shrink-0"
                >
                  <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Explore Bottom Sheet */}
      <AnimatePresence>
        {selectedExploreCategory && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-gray-50 rounded-t-[24px] w-full max-w-lg p-5 flex flex-col gap-4 text-right border-t border-gray-100 h-[85vh]"
            >
              <div className="flex justify-between items-center pb-2 border-b border-gray-100 bg-white -mx-5 px-5 -mt-5 pt-5 rounded-t-[24px] shadow-sm">
                <div>
                  <h3 className="text-[15px] font-black text-gray-900">
                    {selectedExploreCategory === "dental" 
                      ? "تجهیزات دندانپزشکی" 
                      : selectedExploreCategory === "consumable" 
                      ? "لوازم مصرفی پزشکی" 
                      : selectedExploreCategory === "diagnostic"
                      ? "تجهیزات تصویربرداری و تشخیص"
                      : selectedExploreCategory === "operating_room"
                      ? "تجهیزات اتاق عمل و بیمارستانی"
                      : "طب سنتی و داروهای گیاهی"}
                  </h3>
                  <span className="text-[8px] text-gray-400 font-bold block mt-0.5">لیست کامل تجهیزات آماده اجاره فوری</span>
                </div>
                <button onClick={() => setSelectedExploreCategory(null)} className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Grid of full category products */}
              <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 pb-6 pr-1 scrollbar-none">
                {PRODUCTS.filter(p => p.category === selectedExploreCategory).map((product) => (
                  <div 
                    key={product.id}
                    onClick={() => {
                      setSelectedExploreCategory(null);
                      setSelectedProduct(product);
                      setIsDetailModalOpen(true);
                    }}
                    className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-md active:scale-[0.98] transition-all duration-200 ease-out transform hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-square w-full bg-gradient-to-tr from-indigo-50/30 to-teal-50/10 overflow-hidden flex items-center justify-center">
                      <img 
                        src={product.image} 
                        alt={product.title} 
                        className="w-full h-full object-cover p-[2px] bg-gray-200"
                      />
                      <span className={`absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                        product.id % 3 === 0 
                          ? "bg-emerald-500 text-white shadow-sm" 
                          : product.id % 3 === 1 
                          ? "bg-amber-500 text-white shadow-sm" 
                          : "bg-indigo-500 text-white shadow-sm"
                      }`}>
                        {product.id % 3 === 0 ? "موجود" : product.id % 3 === 1 ? "ویژه" : "تضمینی"}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-1 pt-2">
                      <h4 className="text-[11px] font-semibold text-gray-800 line-clamp-2 h-[32px] px-2.5 leading-tight text-right">
                        {product.title}
                      </h4>

                      {/* Elegant Trust Badge */}
                      <div className="px-2.5 flex justify-start">
                        <span className="text-[8px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md font-medium inline-flex items-center gap-0.5 text-right">
                          ✓ {product.category === "diagnostic" ? "تضمین اصالت" : "تایید وزارت بهداشت"}
                        </span>
                      </div>

                      {/* Supplier mini-name */}
                      <span className="text-[9px] text-gray-400 px-2.5 text-right font-medium block truncate">
                        تامین‌کننده: {product.owner}
                      </span>
                    </div>
                    
                      <div className="text-[9px] text-gray-400 px-2.5 pt-1 text-right font-medium flex items-center gap-1 whitespace-nowrap">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
                        <span>{toPersianDigits(product.rating)} ({toPersianDigits(product.salesCount)}+ اجاره)</span>
                        <span className="text-gray-200 mx-0.5">|</span>
                        <ShoppingCart className="w-2.5 h-2.5 text-gray-400" />
                        <span>{toPersianDigits(product.purchaseCount)}+</span>
                      </div>
                    
                    <div className="px-2 pb-2 pt-1 flex items-center justify-center gap-0.5 mt-1">
                      <div className="bg-gray-100 px-2 py-1 rounded-md flex items-baseline gap-0.5 w-full justify-center">
                        <span className="font-black text-xs text-violet-600">
                          {toPersianDigits(new Intl.NumberFormat("fa-IR").format(product.pricePerDay))}
                        </span>
                        <span className="text-[8px] font-medium text-violet-400">تومان</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auth Modal Overlay */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md relative">
              <AuthView 
                onLoginSuccess={(user) => {
                  handleLoginSuccess(user);
                }} 
                onClose={() => setIsAuthModalOpen(false)}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Mobile Bottom Navigation (Fully Native Bottom Dock) */}
      <div className="fixed bottom-0 left-0 right-0 w-full h-11 bg-white/95 backdrop-blur-md border-t border-black flex justify-around items-center px-4 pb-2 pt-[10px] z-50 rounded-none shadow-[0_-4px_20px_rgba(0,0,0,0.03)] dir-rtl">
        {currentUser && currentUser.role === "admin" ? (
          <>
            {/* Overview / Admin Tab */}
            <button 
              onClick={() => setActiveTab("overview")}
              className={`flex flex-col items-center justify-center transition-all ${activeTab === "overview" ? "text-indigo-600 font-bold scale-105" : "text-gray-400 hover:text-gray-500"}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">مدیریت</span>
            </button>
            {/* Profile Tab */}
            <button 
              onClick={() => setActiveTab("profile")}
              className={`flex flex-col items-center justify-center transition-all ${activeTab === "profile" ? "text-indigo-600 font-bold scale-105" : "text-gray-400 hover:text-gray-500"}`}
            >
              <UserIcon className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">پروفایل</span>
            </button>
          </>
        ) : currentUser && currentUser.role === "supplier" ? (
          <>
            {/* Dashboard Tab */}
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={`flex flex-col items-center justify-center transition-all ${activeTab === "dashboard" ? "text-indigo-600 font-bold scale-105" : "text-gray-400 hover:text-gray-500"}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">داشبورد</span>
            </button>
            {/* Messages Tab */}
            <button 
              onClick={() => setActiveTab("messages")}
              className={`flex flex-col items-center justify-center relative transition-all ${activeTab === "messages" ? "text-indigo-600 font-bold scale-105" : "text-gray-400 hover:text-gray-500"}`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">پیامها</span>
              {threads.some(t => t.unread) && (
                <span className="absolute top-0 right-2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              )}
            </button>
            {/* Profile Tab */}
            <button 
              onClick={() => setActiveTab("profile")}
              className={`flex flex-col items-center justify-center transition-all ${activeTab === "profile" ? "text-indigo-600 font-bold scale-105" : "text-gray-400 hover:text-gray-500"}`}
            >
              <UserIcon className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">پروفایل</span>
            </button>
          </>
        ) : (
          <>
            {/* Home Tab */}
            <button 
              onClick={() => { setActiveTab("home"); setSearchQuery(""); }}
              className={`flex flex-col items-center justify-center transition-all ${activeTab === "home" ? "text-indigo-600 font-bold scale-105" : "text-gray-400 hover:text-gray-500"}`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">خانه</span>
            </button>
            {/* Messages Tab with Notification Dot */}
            <button 
              onClick={() => setActiveTab("messages")}
              className={`flex flex-col items-center justify-center relative transition-all ${activeTab === "messages" ? "text-indigo-600 font-bold scale-105" : "text-gray-400 hover:text-gray-500"}`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">پیامها</span>
              {threads.some(t => t.unread) && (
                <span className="absolute top-0 right-2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              )}
            </button>
            {/* Cart Tab */}
            <button 
              onClick={() => setActiveTab("cart")}
              className={`flex flex-col items-center justify-center relative transition-all ${activeTab === "cart" ? "text-indigo-600 font-bold scale-105" : "text-gray-400 hover:text-gray-500"}`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">سبد خرید</span>
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-indigo-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {toPersianDigits(totalCartCount)}
                </span>
              )}
            </button>
            {/* Inquiry Tab */}
            <button 
              onClick={() => setActiveTab("inquiry")}
              className={`flex flex-col items-center justify-center transition-all ${activeTab === "inquiry" ? "text-indigo-600 font-bold scale-105" : "text-gray-400 hover:text-gray-500"}`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">استعلام</span>
            </button>
            {/* Profile Tab */}
            <button 
              onClick={() => setActiveTab("profile")}
              className={`flex flex-col items-center justify-center transition-all ${activeTab === "profile" ? "text-indigo-600 font-bold scale-105" : "text-gray-400 hover:text-gray-500"}`}
            >
              <UserIcon className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">پروفایل</span>
            </button>
          </>
        )}
      </div>

    </div>
  );
}

