export type Role = 'admin' | 'staff';

export type ProductCategory =
  | 'Chargers & Adapters'
  | 'Audio & Earbuds'
  | 'Cables & Data'
  | 'Power Banks'
  | 'Cases & Protection'
  | 'Car Accessories'
  | 'Mounts & Stands'
  | 'Smart Wearables'
  | 'Gaming Accessories'
  | 'Other Accessories';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: ProductCategory;
  buyingPrice: number; // PKR (Hidden from Staff)
  sellingPrice: number; // PKR
  stockQuantity: number;
  reorderLevel: number;
  image?: string;
  description: string;
  brand: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number; // discount amount in PKR per unit or fixed total
  discountType: 'fixed' | 'percent';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  totalPurchases: number;
  totalSpent: number;
  lastPurchaseDate: string;
  createdAt: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  sku: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
  buyingPrice: number; // used to calculate COGS & gross profit accurately
  discount: number;
  total: number;
  returnedQuantity?: number;
}

export type PaymentMethod = 'Cash' | 'Card' | 'Bank Transfer';

export interface Invoice {
  id: string;
  date: string; // ISO string
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  cashier: string;
  cashierRole: Role;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  discountType: 'fixed' | 'percent';
  tax: number;
  total: number;
  costOfGoodsSold: number;
  grossProfit: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeDue: number;
  status: 'Paid' | 'Partially Returned' | 'Returned';
}

export interface StockEntryItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  buyingCost: number;
  total: number;
}

export interface StockEntry {
  id: string;
  date: string;
  supplierName: string;
  referenceNumber: string;
  items: StockEntryItem[];
  totalCost: number;
  notes?: string;
  receivedBy: string;
}

export type ReturnReason =
  | 'Defective product'
  | 'Wrong product'
  | 'Customer changed mind'
  | 'Damaged packaging'
  | 'Other';

export type RefundMethod = 'Cash' | 'Card' | 'Bank Transfer' | 'Store Credit';

export interface ReturnItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  refundAmount: number;
  reason: ReturnReason;
  restockable: boolean;
}

export interface ReturnRecord {
  id: string;
  invoiceId: string;
  customerId: string;
  customerName: string;
  date: string;
  items: ReturnItem[];
  refundTotal: number;
  refundMethod: RefundMethod;
  processedBy: string;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  role: Role;
  action: string;
  record: string;
  timestamp: string;
  details: string;
  type: 'sale' | 'inventory' | 'return' | 'stock_entry' | 'customer' | 'system';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'alert' | 'success' | 'info' | 'warning';
  link?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  invoicePrefix: string;
  startingInvoiceNumber: number;
  footerMessage: string;
  thermalReceiptWidth: string;
  defaultLowStockThreshold: number;
  taxRate: number;
  currency: string;
  paymentMethodsEnabled: {
    cash: boolean;
    card: boolean;
    bankTransfer: boolean;
  };
}

