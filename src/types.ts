export interface SellerProfile {
  user_id: number;
  company_name: string;
  tax_id: string;
  license_document_url: string;
  status: "pending" | "approved" | "rejected";
  user?: {
    email: string;
  };
}

export interface User {
  id: number;
  email: string;
  role: "admin" | "seller" | "buyer";
  is_verified: boolean;
  created_at?: string;
  sellerProfile?: SellerProfile;
}

export interface Product {
  id: number;
  seller_id: number;
  title: string;
  description: string;
  category: "equipment" | "consumable";
  price: number;
  stock_quantity: number;
  condition: "new" | "refurbished" | "used";
  certifications: string; // Comma-separated e.g., "FDA,CE,ISO"
  expiry_date: string | null;
  moq: number;
  images: string;
  is_approved: boolean;
  seller?: {
    id: number;
    email: string;
    sellerProfile?: {
      company_name: string;
      tax_id?: string;
    };
  };
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  status: "pending" | "shipped" | "delivered";
  product: Product;
  order?: Order;
}

export interface Order {
  id: number;
  buyer_id: number;
  total_amount: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  shipping_address: string;
  created_at: string;
  items?: OrderItem[];
  buyer?: {
    id: number;
    email: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}
