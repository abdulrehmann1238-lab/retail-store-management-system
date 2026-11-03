'use client';

import { create } from 'zustand';
import {
  Product,
  Customer,
  Invoice,
  StockEntry,
  ReturnRecord,
  ActivityLog,
  NotificationItem,
  StoreSettings,
  Role,
  CartItem,
  PaymentMethod,
} from '../types';
import {
  INITIAL_STORE_SETTINGS,
  generateProducts,
  generateCustomers,
  generateInvoices,
  generateStockEntries,
  generateReturnRecords,
  generateActivityLogs,
  generateNotifications,
} from './mockData';

interface StockroomStore {
  // Authentication & Role
  currentRole: Role;
  currentUser: {
    name: string;
    email: string;
    avatar: string;
  };
  setRole: (role: Role) => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  importProducts: (newProducts: Product[]) => void;
  addStock: (productId: string, quantity: number, buyingCost?: number, notes?: string) => void;

  // Cart & POS
  cart: CartItem[];
  selectedCustomer: Customer;
  cartDiscount: number;
  cartDiscountType: 'fixed' | 'percent';
  addToCart: (product: Product, quantity?: number) => { success: boolean; message?: string };
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setCartDiscount: (discount: number, type: 'fixed' | 'percent') => void;
  setSelectedCustomer: (customer: Customer) => void;
  completeSale: (paymentMethod: PaymentMethod, amountPaid: number) => Invoice;

  // Invoices
  invoices: Invoice[];
  getInvoiceById: (id: string) => Invoice | undefined;

  // Purchases / Stock Entries
  stockEntries: StockEntry[];
  addStockEntry: (entry: Omit<StockEntry, 'id' | 'date'>) => StockEntry;

  // Returns
  returnRecords: ReturnRecord[];
  processReturn: (returnData: Omit<ReturnRecord, 'id' | 'date'>) => ReturnRecord;

  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases' | 'totalSpent' | 'lastPurchaseDate'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Activity Logs
  activityLogs: ActivityLog[];
  logActivity: (action: string, record: string, details: string, type: ActivityLog['type']) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Settings
  settings: StoreSettings;
  updateSettings: (updates: Partial<StoreSettings>) => void;

  // Demo state management
  isInitialized: boolean;
  initialize: () => void;
  resetDemoData: () => void;
}

const STORAGE_KEY = 'stockroom_app_state_v1';

export const useStore = create<StockroomStore>((set, get) => ({
  currentRole: 'admin',
  currentUser: {
    name: 'Bilal Farooq',
    email: 'admin@stockroom.pk',
    avatar: 'BF',
  },
  products: [],
  customers: [],
  invoices: [],
  stockEntries: [],
  returnRecords: [],
  activityLogs: [],
  notifications: [],
  settings: INITIAL_STORE_SETTINGS,

  cart: [],
  selectedCustomer: {
    id: 'CUST-000',
    name: 'Walk-in Customer',
    phone: '+92 300 0000000',
    email: 'walkin@store.pk',
    address: 'In-Store Counter',
    city: 'Multan',
    totalPurchases: 284,
    totalSpent: 489500,
    lastPurchaseDate: new Date().toISOString(),
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  cartDiscount: 0,
  cartDiscountType: 'fixed',
  isInitialized: false,

  initialize: () => {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        set({
          ...parsed,
          isInitialized: true,
          // ensure customer default exists
          selectedCustomer: parsed.selectedCustomer || parsed.customers?.[0] || get().selectedCustomer,
        });
        return;
      }
    } catch (e) {
      console.error('Failed to load local state, generating fresh dataset', e);
    }

    // Generate fresh initial mock dataset
    const products = generateProducts();
    const customers = generateCustomers();
    const invoices = generateInvoices(products, customers);
    const stockEntries = generateStockEntries(products);
    const returnRecords = generateReturnRecords(invoices);
    const activityLogs = generateActivityLogs();
    const notifications = generateNotifications();

    const initialState = {
      currentRole: 'admin' as Role,
      currentUser: {
        name: 'Bilal Farooq',
        email: 'admin@stockroom.pk',
        avatar: 'BF',
      },
      products,
      customers,
      invoices,
      stockEntries,
      returnRecords,
      activityLogs,
      notifications,
      settings: INITIAL_STORE_SETTINGS,
      cart: [],
      selectedCustomer: customers[0],
      cartDiscount: 0,
      cartDiscountType: 'fixed' as const,
      isInitialized: true,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
    } catch (e) {
      console.warn('LocalStorage save failed on init', e);
    }

    set(initialState);
  },

  setRole: (role: Role) => {
    set(state => {
      const currentUser = role === 'admin'
        ? { name: 'Bilal Farooq', email: 'admin@stockroom.pk', avatar: 'BF' }
        : { name: 'Hamza Tariq', email: 'cashier@stockroom.pk', avatar: 'HT' };
      const updated = { ...state, currentRole: role, currentUser };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  },

  addToCart: (product: Product, quantity = 1) => {
    const { cart } = get();
    const existing = cart.find(item => item.product.id === product.id);
    const currentQty = existing ? existing.quantity : 0;
    const requestedQty = currentQty + quantity;

    if (requestedQty > product.stockQuantity) {
      return {
        success: false,
        message: `Only ${product.stockQuantity} units in stock. Cannot add ${requestedQty}.`,
      };
    }

    if (existing) {
      set({
        cart: cart.map(item =>
          item.product.id === product.id ? { ...item, quantity: requestedQty } : item
        ),
      });
    } else {
      set({
        cart: [...cart, { product, quantity, discount: 0, discountType: 'fixed' }],
      });
    }

    return { success: true };
  },

  updateCartQuantity: (productId: string, quantity: number) => {
    const { cart, products } = get();
    if (quantity <= 0) {
      set({ cart: cart.filter(item => item.product.id !== productId) });
      return;
    }

    const prod = products.find(p => p.id === productId);
    if (prod && quantity > prod.stockQuantity) {
      return; // prevent exceeding stock
    }

    set({
      cart: cart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    });
  },

  removeFromCart: (productId: string) => {
    set(state => ({
      cart: state.cart.filter(item => item.product.id !== productId),
    }));
  },

  clearCart: () => {
    set({ cart: [], cartDiscount: 0 });
  },

  setCartDiscount: (discount: number, type: 'fixed' | 'percent') => {
    set({ cartDiscount: discount, cartDiscountType: type });
  },

  setSelectedCustomer: (customer: Customer) => {
    set({ selectedCustomer: customer });
  },

  completeSale: (paymentMethod: PaymentMethod, amountPaid: number) => {
    const state = get();
    const { cart, selectedCustomer, products, cartDiscount, cartDiscountType, settings, currentRole, currentUser } = state;

    if (cart.length === 0) {
      throw new Error('Cart is empty');
    }

    // Calculate totals
    let subtotal = 0;
    let totalCogs = 0;

    const invoiceItems = cart.map(item => {
      const lineTotal = item.product.sellingPrice * item.quantity;
      const lineCost = item.product.buyingPrice * item.quantity;
      subtotal += lineTotal;
      totalCogs += lineCost;

      return {
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku,
        barcode: item.product.barcode,
        quantity: item.quantity,
        unitPrice: item.product.sellingPrice,
        buyingPrice: item.product.buyingPrice,
        discount: 0,
        total: lineTotal,
      };
    });

    const discountAmount =
      cartDiscountType === 'percent'
        ? Math.round((subtotal * cartDiscount) / 100)
        : cartDiscount;

    const grandTotal = Math.max(0, subtotal - discountAmount);
    const grossProfit = grandTotal - totalCogs;
    const finalAmountPaid = paymentMethod === 'Cash' ? amountPaid : grandTotal;
    const changeDue = Math.max(0, finalAmountPaid - grandTotal);

    const invoiceId = `${settings.invoicePrefix}${settings.startingInvoiceNumber + state.invoices.length + 1}`;

    const newInvoice: Invoice = {
      id: invoiceId,
      date: new Date().toISOString(),
      customer: {
        id: selectedCustomer.id,
        name: selectedCustomer.name,
        phone: selectedCustomer.phone,
      },
      cashier: `${currentUser.name} (${currentRole})`,
      cashierRole: currentRole,
      items: invoiceItems,
      subtotal,
      discount: discountAmount,
      discountType: cartDiscountType,
      tax: 0,
      total: grandTotal,
      costOfGoodsSold: totalCogs,
      grossProfit,
      paymentMethod,
      amountPaid: finalAmountPaid,
      changeDue,
      status: 'Paid',
    };

    // Update products stock
    const updatedProducts = products.map(prod => {
      const soldItem = cart.find(c => c.product.id === prod.id);
      if (soldItem) {
        return {
          ...prod,
          stockQuantity: Math.max(0, prod.stockQuantity - soldItem.quantity),
          updatedAt: new Date().toISOString(),
        };
      }
      return prod;
    });

    // Update customer stats
    const updatedCustomers = state.customers.map(cust => {
      if (cust.id === selectedCustomer.id) {
        return {
          ...cust,
          totalPurchases: cust.totalPurchases + 1,
          totalSpent: cust.totalSpent + grandTotal,
          lastPurchaseDate: new Date().toISOString(),
        };
      }
      return cust;
    });

    // Create activity log
    const newLog: ActivityLog = {
      id: `ACT-${Date.now().toString().slice(-6)}`,
      user: currentUser.name,
      role: currentRole,
      action: 'Sale Completed',
      record: invoiceId,
      timestamp: new Date().toISOString(),
      details: `Completed ${paymentMethod.toLowerCase()} sale of ${cart.length} item(s) for PKR ${grandTotal.toLocaleString()} (${selectedCustomer.name}).`,
      type: 'sale',
    };

    // Low stock notification checks
    const lowStockNotifs: NotificationItem[] = [];
    cart.forEach(item => {
      const remaining = item.product.stockQuantity - item.quantity;
      if (remaining <= item.product.reorderLevel && remaining > 0) {
        lowStockNotifs.push({
          id: `NOTIF-${Date.now()}-${item.product.id}`,
          title: 'Low Stock Alert',
          message: `${item.product.name} is low on stock (${remaining} left).`,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'warning',
          link: '/app/inventory',
        });
      } else if (remaining <= 0) {
        lowStockNotifs.push({
          id: `NOTIF-${Date.now()}-${item.product.id}`,
          title: 'Out of Stock Alert',
          message: `${item.product.name} has run out of stock (0 left).`,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'alert',
          link: '/app/inventory',
        });
      }
    });

    const updatedState = {
      ...state,
      invoices: [newInvoice, ...state.invoices],
      products: updatedProducts,
      customers: updatedCustomers,
      activityLogs: [newLog, ...state.activityLogs],
      notifications: [...lowStockNotifs, ...state.notifications],
      cart: [],
      cartDiscount: 0,
      selectedCustomer: updatedCustomers.find(c => c.id === 'CUST-000') || updatedCustomers[0],
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
    }

    set(updatedState);
    return newInvoice;
  },

  addProduct: productData => {
    const state = get();
    const id = `PRD-${String(state.products.length + 1).padStart(4, '0')}`;
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    const newLog: ActivityLog = {
      id: `ACT-${Date.now().toString().slice(-6)}`,
      user: state.currentUser.name,
      role: state.currentRole,
      action: 'Product Created',
      record: newProduct.sku,
      timestamp: now,
      details: `Added new product "${newProduct.name}" (${newProduct.category}) with initial stock of ${newProduct.stockQuantity}.`,
      type: 'inventory',
    };

    const updated = {
      ...state,
      products: [newProduct, ...state.products],
      activityLogs: [newLog, ...state.activityLogs],
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    set(updated);
    return newProduct;
  },

  updateProduct: (id, updates) => {
    const state = get();
    const updatedProducts = state.products.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    const target = state.products.find(p => p.id === id);

    const newLog: ActivityLog = {
      id: `ACT-${Date.now().toString().slice(-6)}`,
      user: state.currentUser.name,
      role: state.currentRole,
      action: 'Product Edited',
      record: target?.sku || id,
      timestamp: new Date().toISOString(),
      details: `Updated details for ${target?.name || id}.`,
      type: 'inventory',
    };

    const updated = {
      ...state,
      products: updatedProducts,
      activityLogs: [newLog, ...state.activityLogs],
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    set(updated);
  },

  deleteProduct: id => {
    const state = get();
    const target = state.products.find(p => p.id === id);
    const updatedProducts = state.products.filter(p => p.id !== id);

    const newLog: ActivityLog = {
      id: `ACT-${Date.now().toString().slice(-6)}`,
      user: state.currentUser.name,
      role: state.currentRole,
      action: 'Product Deleted',
      record: target?.sku || id,
      timestamp: new Date().toISOString(),
      details: `Removed product ${target?.name || id} from catalog.`,
      type: 'inventory',
    };

    const updated = {
      ...state,
      products: updatedProducts,
      activityLogs: [newLog, ...state.activityLogs],
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    set(updated);
  },

  addStock: (productId, quantity, buyingCost, notes) => {
    const state = get();
    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;

    const newCost = buyingCost !== undefined ? buyingCost : prod.buyingPrice;
    const updatedProducts = state.products.map(p =>
      p.id === productId
        ? {
            ...p,
            stockQuantity: p.stockQuantity + quantity,
            buyingPrice: newCost,
            updatedAt: new Date().toISOString(),
          }
        : p
    );

    const newLog: ActivityLog = {
      id: `ACT-${Date.now().toString().slice(-6)}`,
      user: state.currentUser.name,
      role: state.currentRole,
      action: 'Stock Replenishment',
      record: prod.sku,
      timestamp: new Date().toISOString(),
      details: `Added +${quantity} units to ${prod.name}. New total: ${prod.stockQuantity + quantity} units. ${notes || ''}`,
      type: 'stock_entry',
    };

    const updated = {
      ...state,
      products: updatedProducts,
      activityLogs: [newLog, ...state.activityLogs],
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    set(updated);
  },

  importProducts: newProducts => {
    const state = get();
    // Merge or replace matching SKUs, append new ones
    const productMap = new Map<string, Product>();
    state.products.forEach(p => productMap.set(p.sku.toUpperCase(), p));
    newProducts.forEach(p => productMap.set(p.sku.toUpperCase(), p));

    const merged = Array.from(productMap.values());

    const newLog: ActivityLog = {
      id: `ACT-${Date.now().toString().slice(-6)}`,
      user: state.currentUser.name,
      role: state.currentRole,
      action: 'Excel Inventory Import',
      record: `Import-${newProducts.length}-SKUs`,
      timestamp: new Date().toISOString(),
      details: `Imported ${newProducts.length} products from Excel spreadsheet. Catalog now has ${merged.length} items.`,
      type: 'system',
    };

    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      title: 'Import Successful',
      message: `Imported ${newProducts.length} products successfully from spreadsheet.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'success',
      link: '/app/inventory',
    };

    const updated = {
      ...state,
      products: merged,
      activityLogs: [newLog, ...state.activityLogs],
      notifications: [notif, ...state.notifications],
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    set(updated);
  },

  addStockEntry: entryData => {
    const state = get();
    const id = `SE-2024-${String(state.stockEntries.length + 1).padStart(3, '0')}`;
    const date = new Date().toISOString();
    const newEntry: StockEntry = {
      ...entryData,
      id,
      date,
    };

    // Update quantities of each product in the entry
    const productUpdates = new Map<string, { qty: number; cost: number }>();
    entryData.items.forEach(it => {
      productUpdates.set(it.productId, { qty: it.quantity, cost: it.buyingCost });
    });

    const updatedProducts = state.products.map(prod => {
      const up = productUpdates.get(prod.id);
      if (up) {
        return {
          ...prod,
          stockQuantity: prod.stockQuantity + up.qty,
          buyingPrice: up.cost,
          updatedAt: date,
        };
      }
      return prod;
    });

    const newLog: ActivityLog = {
      id: `ACT-${Date.now().toString().slice(-6)}`,
      user: state.currentUser.name,
      role: state.currentRole,
      action: 'Stock Entry Received',
      record: id,
      timestamp: date,
      details: `Received ${entryData.items.reduce((acc, it) => acc + it.quantity, 0)} units from ${entryData.supplierName} (Total: PKR ${entryData.totalCost.toLocaleString()}).`,
      type: 'stock_entry',
    };

    const updated = {
      ...state,
      stockEntries: [newEntry, ...state.stockEntries],
      products: updatedProducts,
      activityLogs: [newLog, ...state.activityLogs],
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    set(updated);
    return newEntry;
  },

  processReturn: returnData => {
    const state = get();
    const id = `RET-${String(state.returnRecords.length + 301).padStart(3, '0')}`;
    const date = new Date().toISOString();
    const newRecord: ReturnRecord = {
      ...returnData,
      id,
      date,
    };

    // Update original invoice status and returned quantity
    const updatedInvoices = state.invoices.map(inv => {
      if (inv.id === returnData.invoiceId) {
        return {
          ...inv,
          status: 'Partially Returned' as const,
        };
      }
      return inv;
    });

    // Restock items that are restockable
    const updatedProducts = state.products.map(prod => {
      const returnedItem = returnData.items.find(it => it.productId === prod.id && it.restockable);
      if (returnedItem) {
        return {
          ...prod,
          stockQuantity: prod.stockQuantity + returnedItem.quantity,
          updatedAt: date,
        };
      }
      return prod;
    });

    const newLog: ActivityLog = {
      id: `ACT-${Date.now().toString().slice(-6)}`,
      user: state.currentUser.name,
      role: state.currentRole,
      action: 'Return Processed',
      record: id,
      timestamp: date,
      details: `Processed return for Invoice ${returnData.invoiceId}. Refunded PKR ${returnData.refundTotal.toLocaleString()} via ${returnData.refundMethod}.`,
      type: 'return',
    };

    const updated = {
      ...state,
      returnRecords: [newRecord, ...state.returnRecords],
      invoices: updatedInvoices,
      products: updatedProducts,
      activityLogs: [newLog, ...state.activityLogs],
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    set(updated);
    return newRecord;
  },

  getInvoiceById: id => {
    return get().invoices.find(inv => inv.id.toLowerCase() === id.toLowerCase());
  },

  addCustomer: customerData => {
    const state = get();
    const id = `CUST-${String(state.customers.length).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const newCust: Customer = {
      ...customerData,
      id,
      totalPurchases: 0,
      totalSpent: 0,
      lastPurchaseDate: now,
      createdAt: now,
    };

    const newLog: ActivityLog = {
      id: `ACT-${Date.now().toString().slice(-6)}`,
      user: state.currentUser.name,
      role: state.currentRole,
      action: 'Customer Added',
      record: newCust.id,
      timestamp: now,
      details: `Created customer profile for ${newCust.name} (${newCust.phone}).`,
      type: 'customer',
    };

    const updated = {
      ...state,
      customers: [...state.customers, newCust],
      activityLogs: [newLog, ...state.activityLogs],
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    set(updated);
    return newCust;
  },

  updateCustomer: (id, updates) => {
    const state = get();
    const updatedCustomers = state.customers.map(c => (c.id === id ? { ...c, ...updates } : c));
    const target = state.customers.find(c => c.id === id);

    const newLog: ActivityLog = {
      id: `ACT-${Date.now().toString().slice(-6)}`,
      user: state.currentUser.name,
      role: state.currentRole,
      action: 'Customer Updated',
      record: id,
      timestamp: new Date().toISOString(),
      details: `Updated information for customer ${target?.name || id}.`,
      type: 'customer',
    };

    const updated = {
      ...state,
      customers: updatedCustomers,
      activityLogs: [newLog, ...state.activityLogs],
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    set(updated);
  },

  deleteCustomer: id => {
    const state = get();
    if (id === 'CUST-000') return; // Cannot delete walk-in customer
    const target = state.customers.find(c => c.id === id);
    const updated = {
      ...state,
      customers: state.customers.filter(c => c.id !== id),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    set(updated);
  },

  logActivity: (action, record, details, type) => {
    const state = get();
    const newLog: ActivityLog = {
      id: `ACT-${Date.now().toString().slice(-6)}`,
      user: state.currentUser.name,
      role: state.currentRole,
      action,
      record,
      timestamp: new Date().toISOString(),
      details,
      type,
    };
    const updated = {
      ...state,
      activityLogs: [newLog, ...state.activityLogs],
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    set(updated);
  },

  markNotificationRead: id => {
    const state = get();
    const updated = {
      ...state,
      notifications: state.notifications.map(n => (n.id === id ? { ...n, read: true } : n)),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    set(updated);
  },

  markAllNotificationsRead: () => {
    const state = get();
    const updated = {
      ...state,
      notifications: state.notifications.map(n => ({ ...n, read: true })),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    set(updated);
  },

  updateSettings: updates => {
    const state = get();
    const updated = {
      ...state,
      settings: { ...state.settings, ...updates },
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    set(updated);
  },

  resetDemoData: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    get().initialize();
  },
}));

