'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  Barcode,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  CreditCard,
  Banknote,
  Building,
  User,
  Percent,
  DollarSign,
  AlertCircle,
  ArrowRight,
  Printer,
  FileText,
  Scan,
  X,
  Package,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useStore } from '@/lib/store';
import { formatPKR, formatDate, formatTime } from '@/lib/utils';
import { Product, Customer, PaymentMethod, Invoice, ProductCategory } from '@/types';
import { InvoiceDetailModal } from '@/components/invoices/InvoiceDetailModal';

export default function PointOfSalePage() {
  const {
    products,
    cart,
    selectedCustomer,
    cartDiscount,
    cartDiscountType,
    customers,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    setCartDiscount,
    setSelectedCustomer,
    completeSale,
    addCustomer,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeNotification, setBarcodeNotification] = useState<{ message: string; success: boolean } | null>(null);

  // Cash payment calculation
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [customDiscountInput, setCustomDiscountInput] = useState<string>('0');
  const [discountModalOpen, setDiscountModalOpen] = useState(false);

  // New customer modal
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustCity, setNewCustCity] = useState('Multan');

  // Completed sale success state
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);
  const [viewInvoiceModalOpen, setViewInvoiceModalOpen] = useState(false);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Totals calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.sellingPrice * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (cartDiscountType === 'percent') {
      return Math.round((subtotal * cartDiscount) / 100);
    }
    return cartDiscount;
  }, [subtotal, cartDiscount, cartDiscountType]);

  const grandTotal = Math.max(0, subtotal - discountAmount);
  const changeDue = paymentMethod === 'Cash' ? Math.max(0, amountReceived - grandTotal) : 0;

  // Auto set amount received to grand total if cash
  useEffect(() => {
    if (amountReceived < grandTotal) {
      setAmountReceived(grandTotal);
    }
  }, [grandTotal]);

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter(p => {
      const matchesCat =
        selectedCategory === 'All' ||
        p.category === selectedCategory ||
        (selectedCategory === 'Chargers' && p.category.includes('Charger')) ||
        (selectedCategory === 'Audio' && p.category.includes('Audio')) ||
        (selectedCategory === 'Cables' && p.category.includes('Cable')) ||
        (selectedCategory === 'Power Banks' && p.category.includes('Power'));

      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.brand.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle barcode scanner input
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    const matchedProduct = products.find(
      p => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase()
    );

    if (matchedProduct) {
      const res = addToCart(matchedProduct, 1);
      if (res.success) {
        setBarcodeNotification({
          message: `Scanned: ${matchedProduct.name}`,
          success: true,
        });
      } else {
        setBarcodeNotification({
          message: res.message || 'Stock limit reached',
          success: false,
        });
      }
    } else {
      setBarcodeNotification({
        message: `No product found for barcode "${code}"`,
        success: false,
      });
    }

    setBarcodeInput('');
    setTimeout(() => setBarcodeNotification(null), 3000);
  };

  // Quick Barcode Demo Scan
  const simulateScan = (barcode: string) => {
    setBarcodeInput(barcode);
    const matchedProduct = products.find(p => p.barcode === barcode);
    if (matchedProduct) {
      const res = addToCart(matchedProduct, 1);
      if (res.success) {
        setBarcodeNotification({
          message: `Scanned: ${matchedProduct.name}`,
          success: true,
        });
      } else {
        setBarcodeNotification({
          message: res.message || 'Out of stock',
          success: false,
        });
      }
    }
    setTimeout(() => setBarcodeNotification(null), 3000);
  };

  // Complete sale checkout
  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'Cash' && amountReceived < grandTotal) {
      alert(`Amount received (PKR ${amountReceived.toLocaleString()}) cannot be less than Grand Total (PKR ${grandTotal.toLocaleString()}).`);
      return;
    }

    try {
      const inv = completeSale(paymentMethod, amountReceived);
      setCompletedInvoice(inv);
    } catch (err: any) {
      alert(err.message || 'Sale failed');
    }
  };

  // Add new customer handler
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) return;

    const created = addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      email: `${newCustName.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`,
      address: `Gulgasht Colony, ${newCustCity}`,
      city: newCustCity,
    });

    setSelectedCustomer(created);
    setNewCustName('');
    setNewCustPhone('');
    setCustomerModalOpen(false);
  };

  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Section ~65%: Catalogue & Search */}
        <div className="w-full lg:w-[65%] space-y-4">
          {/* POS Barcode & Search Controls */}
          <div className="p-4 rounded-xl bg-app-surface border border-app-border shadow-subtle space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Product search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-content-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search name, SKU, brand (e.g. 'Anker', 'CHG-020')..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand text-content-primary"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-content-secondary hover:text-content-primary"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Barcode scanner input simulation */}
              <form onSubmit={handleBarcodeSubmit} className="relative sm:w-64">
                <Barcode className="w-4 h-4 text-brand absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={e => setBarcodeInput(e.target.value)}
                  placeholder="Scan / Type Barcode + ↵"
                  className="w-full pl-9 pr-16 py-2 text-xs bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand font-mono text-content-primary"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-2 rounded bg-brand text-white text-[10px] font-medium flex items-center gap-1 hover:bg-brand-dark"
                >
                  <Scan className="w-3 h-3" />
                  <span>Scan</span>
                </button>
              </form>
            </div>

            {/* Quick Demo Barcode Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
              <span className="text-[11px] text-content-secondary">Simulate Scan:</span>
              <button
                type="button"
                onClick={() => simulateScan('8901234567012')}
                className="px-2 py-0.5 rounded bg-brand-soft hover:bg-brand/10 text-brand text-[10px] font-mono font-medium border border-brand/20 transition-colors"
                title="USB-C Fast Charger 20W"
              >
                20W Charger
              </button>
              <button
                type="button"
                onClick={() => simulateScan('8901234567013')}
                className="px-2 py-0.5 rounded bg-brand-soft hover:bg-brand/10 text-brand text-[10px] font-mono font-medium border border-brand/20 transition-colors"
                title="Wireless Earbuds Pro"
              >
                Earbuds Pro
              </button>
              <button
                type="button"
                onClick={() => simulateScan('8901234567014')}
                className="px-2 py-0.5 rounded bg-brand-soft hover:bg-brand/10 text-brand text-[10px] font-mono font-medium border border-brand/20 transition-colors"
                title="Power Bank 10000mAh"
              >
                Power Bank
              </button>
              <button
                type="button"
                onClick={() => simulateScan('8901234567015')}
                className="px-2 py-0.5 rounded bg-brand-soft hover:bg-brand/10 text-brand text-[10px] font-mono font-medium border border-brand/20 transition-colors"
                title="USB-C Cable 1M"
              >
                USB-C Cable
              </button>
            </div>

            {/* Barcode Alert feedback */}
            {barcodeNotification && (
              <div
                className={`p-2 rounded-lg text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150 ${
                  barcodeNotification.success
                    ? 'bg-status-successSoft text-status-success'
                    : 'bg-status-dangerSoft text-status-danger'
                }`}
              >
                {barcodeNotification.success ? (
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{barcodeNotification.message}</span>
              </div>
            )}

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                'All',
                'Chargers & Adapters',
                'Audio & Earbuds',
                'Cables & Data',
                'Power Banks',
                'Cases & Protection',
                'Car Accessories',
                'Mounts & Stands',
              ].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg whitespace-nowrap text-xs font-medium transition-colors shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-brand text-white shadow-subtle'
                      : 'bg-app-secondary text-content-secondary hover:text-content-primary hover:bg-app-border/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.slice(0, 36).map(prod => {
              const isOutOfStock = prod.stockQuantity <= 0;
              const cartItem = cart.find(c => c.product.id === prod.id);

              return (
                <div
                  key={prod.id}
                  onClick={() => {
                    if (!isOutOfStock) addToCart(prod, 1);
                  }}
                  className={`p-3 rounded-xl bg-app-surface border transition-all flex flex-col justify-between select-none ${
                    isOutOfStock
                      ? 'opacity-50 cursor-not-allowed border-app-border'
                      : 'cursor-pointer hover:border-brand/40 hover:shadow-card active:scale-[0.99] border-app-border'
                  }`}
                >
                  <div>
                    {/* Top Tag & Stock */}
                    <div className="flex items-center justify-between text-[10px] mb-2">
                      <span className="font-mono px-1.5 py-0.5 rounded bg-app-secondary text-content-secondary uppercase">
                        {prod.sku}
                      </span>
                      <span
                        className={`font-semibold font-mono ${
                          isOutOfStock
                            ? 'text-status-danger'
                            : prod.stockQuantity <= prod.reorderLevel
                            ? 'text-status-warning'
                            : 'text-content-secondary'
                        }`}
                      >
                        {isOutOfStock ? 'Out of stock' : `${prod.stockQuantity} in stock`}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h4 className="text-xs font-semibold text-content-primary line-clamp-2 leading-snug">
                      {prod.name}
                    </h4>

                    {/* Brand */}
                    <span className="text-[11px] text-content-secondary mt-0.5 block">
                      {prod.brand}
                    </span>
                  </div>

                  {/* Pricing and Cart Feedback */}
                  <div className="mt-3 pt-2 border-t border-app-border/60 flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-brand">
                      {formatPKR(prod.sellingPrice)}
                    </span>

                    {cartItem ? (
                      <span className="w-5 h-5 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                        {cartItem.quantity}
                      </span>
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-app-secondary hover:bg-brand-soft text-content-secondary hover:text-brand flex items-center justify-center transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length > 36 && (
            <div className="text-center py-2 text-xs text-content-secondary">
              Showing first 36 of {filteredProducts.length} matching products. Use search for exact SKU.
            </div>
          )}
        </div>

        {/* Right Section ~35%: Cart & Checkout */}
        <div className="w-full lg:w-[35%] lg:sticky lg:top-24 space-y-4">
          <div className="p-4 sm:p-5 rounded-xl bg-app-surface border border-app-border shadow-subtle flex flex-col justify-between">
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-app-border">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-brand" />
                <h3 className="text-sm font-semibold text-content-primary">Current Cart</h3>
                <span className="px-1.5 py-0.2 rounded-full bg-brand-soft text-brand text-[10px] font-mono font-bold">
                  {cart.reduce((a, b) => a + b.quantity, 0)} items
                </span>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-status-danger hover:underline flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Customer Selector */}
            <div className="py-3 border-b border-app-border space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-content-secondary font-medium">Customer:</span>
                <button
                  onClick={() => setCustomerModalOpen(true)}
                  className="text-[11px] text-brand hover:underline font-medium"
                >
                  + Add New
                </button>
              </div>

              <select
                value={selectedCustomer.id}
                onChange={e => {
                  const cust = customers.find(c => c.id === e.target.value);
                  if (cust) setSelectedCustomer(cust);
                }}
                className="w-full px-3 py-1.5 text-xs bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand text-content-primary"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Cart Items List */}
            <div className="my-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-content-secondary space-y-2">
                  <div className="w-10 h-10 rounded-full bg-app-secondary mx-auto flex items-center justify-center text-content-muted">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium">Cart is currently empty</p>
                  <p className="text-[11px] text-content-muted max-w-[200px] mx-auto">
                    Scan a barcode or tap accessories from the catalog to start sale.
                  </p>
                </div>
              ) : (
                cart.map(item => (
                  <div
                    key={item.product.id}
                    className="p-2.5 rounded-lg bg-app-secondary/40 border border-app-border flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-content-primary truncate">
                        {item.product.name}
                      </div>
                      <div className="text-[11px] font-mono text-content-secondary flex items-center gap-2">
                        <span>{formatPKR(item.product.sellingPrice)}</span>
                        <span>•</span>
                        <span>Max: {item.product.stockQuantity}</span>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-app-surface border border-app-border hover:bg-app-secondary text-content-primary flex items-center justify-center text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="w-6 text-center text-xs font-mono font-bold text-content-primary">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stockQuantity}
                        className={`w-6 h-6 rounded bg-app-surface border border-app-border flex items-center justify-center text-xs ${
                          item.quantity >= item.product.stockQuantity
                            ? 'opacity-40 cursor-not-allowed'
                            : 'hover:bg-app-secondary text-content-primary'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-content-secondary hover:text-status-danger ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="w-16 text-right font-mono text-xs font-semibold text-content-primary">
                      {formatPKR(item.product.sellingPrice * item.quantity)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Discounts & Totals Calculation */}
            {cart.length > 0 && (
              <div className="pt-3 border-t border-app-border space-y-2 text-xs">
                {/* Discount input toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-content-secondary">Discount:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const val = prompt('Enter fixed discount in PKR:', String(cartDiscount));
                        if (val !== null) {
                          setCartDiscount(Math.max(0, parseInt(val) || 0), 'fixed');
                        }
                      }}
                      className="px-2 py-0.5 rounded bg-app-secondary border border-app-border text-[11px] hover:border-brand font-mono"
                    >
                      {cartDiscount > 0 ? `-${formatPKR(discountAmount)}` : '+ Apply Discount'}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-content-secondary">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatPKR(subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm font-bold text-content-primary pt-2 border-t border-app-border">
                  <span>Grand Total:</span>
                  <span className="font-mono text-brand text-base">{formatPKR(grandTotal)}</span>
                </div>

                {/* Tender Method Selection */}
                <div className="pt-2">
                  <span className="text-[11px] uppercase tracking-wider text-content-secondary font-medium block mb-1.5">
                    Payment Method
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Cash', 'Card', 'Bank Transfer'] as PaymentMethod[]).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                          paymentMethod === m
                            ? 'bg-brand text-white border-brand shadow-subtle'
                            : 'bg-app-secondary text-content-primary border-app-border hover:bg-app-border/40'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cash Received & Change Due */}
                {paymentMethod === 'Cash' && (
                  <div className="p-2.5 rounded-lg bg-app-secondary/50 border border-app-border space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-content-secondary font-medium">Cash Received:</span>
                      <input
                        type="number"
                        value={amountReceived || ''}
                        onChange={e => setAmountReceived(parseInt(e.target.value) || 0)}
                        className="w-28 text-right px-2 py-1 bg-app-surface border border-app-border rounded font-mono font-bold text-content-primary text-xs outline-none focus:border-brand"
                      />
                    </div>

                    {/* Quick tender amount chips */}
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAmountReceived(grandTotal)}
                        className="px-2 py-0.5 rounded bg-app-surface border border-app-border text-[10px] font-mono text-content-primary hover:border-brand"
                      >
                        Exact
                      </button>
                      <button
                        type="button"
                        onClick={() => setAmountReceived(Math.ceil(grandTotal / 500) * 500)}
                        className="px-2 py-0.5 rounded bg-app-surface border border-app-border text-[10px] font-mono text-content-primary hover:border-brand"
                      >
                        Round 500
                      </button>
                      <button
                        type="button"
                        onClick={() => setAmountReceived(Math.ceil(grandTotal / 1000) * 1000)}
                        className="px-2 py-0.5 rounded bg-app-surface border border-app-border text-[10px] font-mono text-content-primary hover:border-brand"
                      >
                        Round 1000
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-app-border/60">
                      <span className="text-xs text-content-secondary">Change Due:</span>
                      <span className="font-mono font-bold text-status-success text-xs">
                        {formatPKR(changeDue)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Complete Sale CTA */}
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="w-full py-3 mt-3 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold text-xs shadow-card flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Complete Sale ({formatPKR(grandTotal)})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sale Success Modal */}
      {completedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-app-surface rounded-xl border border-app-border shadow-elevated p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-status-successSoft text-status-success mx-auto flex items-center justify-center scale-up">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-content-primary">Sale Completed Successfully!</h3>
              <p className="text-xs text-content-secondary mt-1">
                Transaction recorded, inventory deducted, and receipt ready.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-app-secondary/50 border border-app-border text-xs space-y-1.5 text-left">
              <div className="flex justify-between">
                <span className="text-content-secondary">Invoice Number:</span>
                <span className="font-mono font-bold text-brand">{completedInvoice.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-secondary">Customer:</span>
                <span className="font-medium text-content-primary">{completedInvoice.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-secondary">Payment Method:</span>
                <span className="text-content-primary">{completedInvoice.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-secondary">Total Paid:</span>
                <span className="font-mono font-bold text-brand">{formatPKR(completedInvoice.total)}</span>
              </div>
              {completedInvoice.paymentMethod === 'Cash' && (
                <div className="flex justify-between text-status-success">
                  <span>Change Given:</span>
                  <span className="font-mono font-bold">{formatPKR(completedInvoice.changeDue)}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  setViewInvoiceModalOpen(true);
                }}
                className="py-2 px-3 rounded-lg bg-app-secondary hover:bg-app-border/40 text-content-primary text-xs font-medium border border-app-border flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Invoice</span>
              </button>

              <button
                onClick={() => {
                  setViewInvoiceModalOpen(true);
                  setTimeout(() => window.print(), 300);
                }}
                className="py-2 px-3 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs font-medium shadow-subtle flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print 80mm</span>
              </button>
            </div>

            <button
              onClick={() => {
                setCompletedInvoice(null);
                setAmountReceived(0);
              }}
              className="w-full py-2 rounded-lg text-xs font-medium text-brand hover:underline"
            >
              + Start Next Customer Sale
            </button>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {customerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-app-surface rounded-xl border border-app-border shadow-elevated p-5">
            <div className="flex items-center justify-between pb-3 border-b border-app-border">
              <h3 className="text-sm font-semibold text-content-primary">Add New Customer</h3>
              <button onClick={() => setCustomerModalOpen(false)} className="text-content-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block text-content-secondary mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  placeholder="e.g. Tariq Mehmood"
                  className="w-full px-3 py-1.5 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-content-secondary mb-1">Mobile Phone *</label>
                <input
                  type="text"
                  required
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-3 py-1.5 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand font-mono"
                />
              </div>

              <div>
                <label className="block text-content-secondary mb-1">City</label>
                <input
                  type="text"
                  value={newCustCity}
                  onChange={e => setNewCustCity(e.target.value)}
                  className="w-full px-3 py-1.5 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-app-border">
                <button
                  type="button"
                  onClick={() => setCustomerModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-app-secondary text-content-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-brand text-white font-medium hover:bg-brand-dark"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Detail & Print Modal */}
      <InvoiceDetailModal
        invoice={completedInvoice}
        isOpen={viewInvoiceModalOpen}
        onClose={() => setViewInvoiceModalOpen(false)}
      />
    </AppLayout>
  );
}

