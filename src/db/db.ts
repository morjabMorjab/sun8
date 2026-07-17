import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import bcrypt from "bcryptjs";
import path from "path";

// Locate DB in workspace root
const dbPath = path.join(process.cwd(), "database.sqlite");

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: false, // Set to console.log to debug queries
});

// ==========================================
// User Model
// ==========================================
export interface UserAttributes {
  id: number;
  email: string;
  password_hash: string;
  role: "admin" | "seller" | "buyer";
  is_verified: boolean;
  created_at?: Date;
}
export interface UserCreationAttributes extends Optional<UserAttributes, "id" | "is_verified"> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password_hash!: string;
  public role!: "admin" | "seller" | "buyer";
  public is_verified!: boolean;
  public readonly created_at!: Date;
  public sellerProfile?: any;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "seller", "buyer"),
      allowNull: false,
      defaultValue: "buyer",
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "Users",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

// ==========================================
// SellerProfile Model
// ==========================================
export interface SellerProfileAttributes {
  user_id: number;
  company_name: string;
  tax_id: string;
  license_document_url: string;
  status: "pending" | "approved" | "rejected";
}

export class SellerProfile extends Model<SellerProfileAttributes> implements SellerProfileAttributes {
  public user_id!: number;
  public company_name!: string;
  public tax_id!: string;
  public license_document_url!: string;
  public status!: "pending" | "approved" | "rejected";
}

SellerProfile.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tax_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    license_document_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    tableName: "Seller_Profiles",
    timestamps: false,
    underscored: true,
  }
);

// ==========================================
// Product Model
// ==========================================
export interface ProductAttributes {
  id: number;
  seller_id: number;
  title: string;
  description: string;
  category: "equipment" | "consumable";
  price: number;
  stock_quantity: number;
  condition: "new" | "refurbished" | "used";
  certifications: string; // Comma-separated or JSON string, e.g., "FDA,CE,ISO"
  expiry_date: string | null; // For consumables, e.g., "2028-12-31" or null
  moq: number; // Minimum Order Quantity
  images: string; // Comma-separated URLs or single placeholder
  is_approved: boolean;
}
export interface ProductCreationAttributes extends Optional<ProductAttributes, "id" | "is_approved" | "expiry_date"> {}

export class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: number;
  public seller_id!: number;
  public title!: string;
  public description!: string;
  public category!: "equipment" | "consumable";
  public price!: number;
  public stock_quantity!: number;
  public condition!: "new" | "refurbished" | "used";
  public certifications!: string;
  public expiry_date!: string | null;
  public moq!: number;
  public images!: string;
  public is_approved!: boolean;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM("equipment", "consumable"),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    condition: {
      type: DataTypes.ENUM("new", "refurbished", "used"),
      allowNull: false,
      defaultValue: "new",
    },
    certifications: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "None",
    },
    expiry_date: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    moq: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "Products",
    underscored: true,
    timestamps: false,
  }
);

// ==========================================
// Order Model
// ==========================================
export interface OrderAttributes {
  id: number;
  buyer_id: number;
  total_amount: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  shipping_address: string;
  created_at?: Date;
}
export interface OrderCreationAttributes extends Optional<OrderAttributes, "id" | "status"> {}

export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public buyer_id!: number;
  public total_amount!: number;
  public status!: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  public shipping_address!: string;
  public readonly created_at!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    buyer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "paid", "shipped", "delivered", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Orders",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

// ==========================================
// OrderItem Model
// ==========================================
export interface OrderItemAttributes {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  status: "pending" | "shipped" | "delivered";
}
export interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, "id" | "status"> {}

export class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public id!: number;
  public order_id!: number;
  public product_id!: number;
  public quantity!: number;
  public unit_price!: number;
  public status!: "pending" | "shipped" | "delivered";
  public product!: any;
  public order!: any;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Orders",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Products",
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "shipped", "delivered"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    tableName: "Order_Items",
    underscored: true,
    timestamps: false,
  }
);

// ==========================================
// Define Relationships
// ==========================================

// User -> SellerProfile
User.hasOne(SellerProfile, { foreignKey: "user_id", as: "sellerProfile" });
SellerProfile.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Seller User -> Products
User.hasMany(Product, { foreignKey: "seller_id", as: "products" });
Product.belongsTo(User, { foreignKey: "seller_id", as: "seller" });

// Buyer User -> Orders
User.hasMany(Order, { foreignKey: "buyer_id", as: "orders" });
Order.belongsTo(User, { foreignKey: "buyer_id", as: "buyer" });

// Order -> OrderItems
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });

// OrderItem -> Product
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Product.hasMany(OrderItem, { foreignKey: "product_id" });

// ==========================================
// Database Sync and Seeding function
// ==========================================
export async function initDatabase() {
  await sequelize.sync({ force: false }); // set to true only to clear out and start fresh

  // Seed default items if empty
  const userCount = await User.count();
  if (userCount === 0) {
    console.log("Database empty. Seeding initial marketplace data...");

    // 1. Create Users
    const passwordHash = await bcrypt.hash("password123", 10);
    
    // Admins
    const admin = await User.create({
      email: "admin@medmarket.com",
      password_hash: passwordHash,
      role: "admin",
      is_verified: true,
    });

    // Buyers (Hospitals / Procurement)
    const buyer1 = await User.create({
      email: "procurement@stjudehospital.org",
      password_hash: passwordHash,
      role: "buyer",
      is_verified: true,
    });
    
    const buyer2 = await User.create({
      email: "dr.smith@clinic.com",
      password_hash: passwordHash,
      role: "buyer",
      is_verified: true,
    });

    // Sellers (Verified and Pending)
    const sellerVerified1 = await User.create({
      email: "sales@apexmedicals.com",
      password_hash: passwordHash,
      role: "seller",
      is_verified: true,
    });

    const sellerVerified2 = await User.create({
      email: "contact@globalpharma.com",
      password_hash: passwordHash,
      role: "seller",
      is_verified: true,
    });

    const sellerPending = await User.create({
      email: "newdistributor@gmail.com",
      password_hash: passwordHash,
      role: "seller",
      is_verified: false,
    });

    // 2. Create Seller Profiles
    await SellerProfile.create({
      user_id: sellerVerified1.id,
      company_name: "Apex Medical Distributors Ltd",
      tax_id: "TX-APEX-998877",
      license_document_url: "https://example.com/licenses/apex_permit.pdf",
      status: "approved",
    });

    await SellerProfile.create({
      user_id: sellerVerified2.id,
      company_name: "Global Pharma and Consumables Inc.",
      tax_id: "TX-GLB-554433",
      license_document_url: "https://example.com/licenses/global_permit.pdf",
      status: "approved",
    });

    await SellerProfile.create({
      user_id: sellerPending.id,
      company_name: "BioShield Medical Supplies",
      tax_id: "TX-BIOS-112233",
      license_document_url: "https://example.com/licenses/bioshield_license.pdf",
      status: "pending",
    });

    // 3. Create Products
    // A. Apex Medicals: Heavy Medical Equipment
    const p1 = await Product.create({
      seller_id: sellerVerified1.id,
      title: "Mindray ePM 10M Professional Patient Monitor",
      description: "Advanced ergonomic modular patient monitor designed for critical care units, operating rooms, and emergency response. Provides continuous, accurate monitoring of ECG, SpO2, temperature, and respiration rate. Features a 10-inch high-resolution touchscreen, customizable user layouts, and up to 48 hours of tabular and graphical trend display.",
      category: "equipment",
      price: 2450.00,
      stock_quantity: 15,
      condition: "new",
      certifications: "FDA,CE,ISO",
      expiry_date: null,
      moq: 1,
      images: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600",
      is_approved: true,
    });

    const p2 = await Product.create({
      seller_id: sellerVerified1.id,
      title: "Philips ClearVue 350 Ultrasound Machine (Refurbished)",
      description: "High-quality, cost-effective ultrasound system with elegant design and exceptional image quality. Best-in-class spatial and contrast resolution with active array technology. Fully refurbished to original manufacturer specifications, including a 12-month warranty, linear probe, and convex probe.",
      category: "equipment",
      price: 18500.00,
      stock_quantity: 3,
      condition: "refurbished",
      certifications: "CE,ISO",
      expiry_date: null,
      moq: 1,
      images: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=600",
      is_approved: true,
    });

    // B. Global Pharma: Consumables
    const p3 = await Product.create({
      seller_id: sellerVerified2.id,
      title: "Sterile Disposable Syringes with Luer Lock (3ml, 23G)",
      description: "Medical-grade sterile syringes designed with clear barrels and bold scale markings for ultra-precise dosing. Features secure Luer Lock connection preventing needle slippage. Single-use only. Individual blister pack wrapping guarantees safety. Box of 100.",
      category: "consumable",
      price: 18.50,
      stock_quantity: 250,
      condition: "new",
      certifications: "FDA,CE",
      expiry_date: "2029-06-30",
      moq: 10,
      images: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600",
      is_approved: true,
    });

    const p4 = await Product.create({
      seller_id: sellerVerified2.id,
      title: "3M N95 Particulate Respirator Masks (Model 1860)",
      description: "Standard NIOSH-approved surgical respirator designed to provide reliable respiratory protection against certain non-oil-based particles. Meets CDC guidelines for tuberculosis control. Fluid resistant to splash and spatter of blood and other infectious materials. Box of 20.",
      category: "consumable",
      price: 35.00,
      stock_quantity: 500,
      condition: "new",
      certifications: "FDA,NIOSH",
      expiry_date: "2028-11-15",
      moq: 5,
      images: "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&q=80&w=600",
      is_approved: true,
    });

    const p5 = await Product.create({
      seller_id: sellerVerified2.id,
      title: "Microshield Nitrile Examination Gloves (Powder-Free)",
      description: "High tensile strength medical examination gloves featuring textured fingertips for superb tactile sensitivity. Latex-free and powder-free to eliminate allergy risks. Ambidextrous fit with beaded cuffs for easy donning. Box of 100.",
      category: "consumable",
      price: 12.99,
      stock_quantity: 800,
      condition: "new",
      certifications: "FDA,CE,ISO",
      expiry_date: "2028-04-01",
      moq: 20,
      images: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=80&w=600",
      is_approved: true,
    });

    // Unapproved Product (Pending approval from Apex)
    await Product.create({
      seller_id: sellerVerified1.id,
      title: "Portable Electrocardiograph ECG-1200T",
      description: "Portable 12-channel digital ECG machine with interactive color touchscreen and built-in thermal printer. Ideal for fast bedside diagnosis.",
      category: "equipment",
      price: 1200.00,
      stock_quantity: 8,
      condition: "new",
      certifications: "FDA,CE",
      expiry_date: null,
      moq: 1,
      images: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600",
      is_approved: false, // Pending Approval
    });

    // 4. Create Order & Items
    const order1 = await Order.create({
      buyer_id: buyer1.id,
      total_amount: 114.48,
      status: "paid",
      shipping_address: "Procurement Dept, Wing B, St. Jude Research Hospital, 1200 Medical Center Parkway, Memphis, TN 38105",
    });

    await OrderItem.create({
      order_id: order1.id,
      product_id: p4.id,
      quantity: 2,
      unit_price: 35.00,
      status: "shipped",
    });

    await OrderItem.create({
      order_id: order1.id,
      product_id: p5.id,
      quantity: 2,
      unit_price: 12.99,
      status: "pending",
    });

    const order2 = await Order.create({
      buyer_id: buyer2.id,
      total_amount: 2450.00,
      status: "pending",
      shipping_address: "Smith Family Practice, Suite 402, 45 Medical Plaza, Boston, MA 02111",
    });

    await OrderItem.create({
      order_id: order2.id,
      product_id: p1.id,
      quantity: 1,
      unit_price: 2450.00,
      status: "pending",
    });

    console.log("Database seeded successfully!");
  }
}
