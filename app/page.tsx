'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Boxes,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  CheckCircle,
  Shield,
  Sparkles,
  Zap,
  Package,
  Layers,
  ChevronRight,
  ExternalLink,
  Store,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { formatPKR } from '@/lib/utils';

export default function MarketingPage() {
  const router = useRouter();
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);

  const handleLaunchDemo = (destination = '/app') => {
    setShowLoadingScreen(true);
    setTimeout(() => {
      router.push(destination);
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-app-bg text-content-primary selection:bg-brand-soft selection:text-brand flex flex-col justify-between">
      {/* Loading Transition Screen */}
      {showLoadingScreen && <LoadingScreen minDurationMs={1300} />}

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-app-bg/90 backdrop-blur-md border-b border-app-border/80 h-18">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-content-secondary">
            <a href="#inventory" className="hover:text-content-primary transition-colors">
              Inventory
            </a>
            <a href="#pos" className="hover:text-content-primary transition-colors">
              Point of Sale
            </a>
            <a href="#profit" className="hover:text-content-primary transition-colors">
              Profit Intelligence
            </a>
            <a href="#features" className="hover:text-content-primary transition-colors">
              Features
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-content-secondary hover:text-content-primary px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>

            <button
              onClick={() => handleLaunchDemo('/app')}
              className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-subtle flex items-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <span>Explore the Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-6 sm:px-10 border-b border-app-border">
        {/* Soft background ambient gradient */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-soft/50 rounded-full blur-3xl pointer-events-none -mr-40 -mt-20" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-warm-soft/60 rounded-full blur-3xl pointer-events-none -ml-40 -mb-20" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-soft border border-brand/20 text-brand text-xs font-semibold tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              <span>Smart Retail Management</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-content-primary leading-[1.12]">
              Your store. Your stock.{' '}
              <span className="text-brand block mt-1">Everything under control.</span>
            </h1>

            <p className="text-base sm:text-lg text-content-secondary leading-relaxed max-w-xl">
              Manage inventory, process fast counter sales, track exact gross profitability, and keep your entire electronics accessories shop organized from one simple, bespoke workspace.
            </p>

            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <button
                onClick={() => handleLaunchDemo('/app')}
                className="px-6 py-3 rounded-xl bg-brand hover:bg-brand-dark text-white text-sm font-semibold shadow-card flex items-center gap-2 transition-all active:scale-[0.98]"
              >
                <span>Explore the Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#features"
                className="px-5 py-3 rounded-xl bg-app-surface hover:bg-app-secondary border border-app-border text-content-primary text-sm font-semibold transition-colors"
              >
                See How It Works
              </a>
            </div>

            {/* Three compact trust indicators */}
            <div className="pt-8 border-t border-app-border/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-brand-soft text-brand flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-content-primary">Inventory made simple</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-brand-soft text-brand flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-content-primary">Faster counter checkout</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-brand-soft text-brand flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-content-primary">Clear profit visibility</span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Sophisticated Editorial Electronics Accessory Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md bg-app-surface rounded-2xl border border-app-border shadow-elevated p-6 space-y-4">
              {/* Top ambient banner */}
              <div className="flex items-center justify-between pb-3 border-b border-app-border">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand" />
                  <span className="text-xs font-semibold text-content-primary">STOCKROOM Terminal</span>
                </div>
                <span className="text-[11px] font-mono text-brand font-medium">Multan Counter #1</span>
              </div>

              {/* Realistic Retail Electronics Accessory Showcases */}
              <div className="space-y-2.5">
                {[
                  {
                    name: 'Anker GaN 20W Fast Charger',
                    sku: 'CHG-020',
                    price: 1050,
                    stock: 45,
                    tag: 'Bestseller',
                  },
                  {
                    name: 'Joyroom ANC Wireless Earbuds Pro',
                    sku: 'AUD-014',
                    price: 2650,
                    stock: 12,
                    tag: 'Low Stock',
                  },
                  {
                    name: 'Baseus 20000mAh Blade Power Bank',
                    sku: 'PWB-010',
                    price: 3000,
                    stock: 4,
                    tag: 'Reorder Due',
                  },
                  {
                    name: 'Ugreen 100W Braided Type-C Cable 1M',
                    sku: 'CAB-001',
                    price: 350,
                    stock: 120,
                    tag: 'High Velocity',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-app-secondary/40 border border-app-border/80 hover:bg-app-secondary transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center font-bold text-xs font-mono">
                        {item.sku.substring(0, 3)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-content-primary">{item.name}</div>
                        <div className="text-[10px] font-mono text-content-secondary">
                          {item.sku} • Stock: {item.stock}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-brand">
                        {formatPKR(item.price)}
                      </div>
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded font-semibold bg-app-surface border border-app-border text-content-secondary">
                        {item.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Simulated Floating Transaction Card */}
              <div className="p-3.5 rounded-xl bg-brand text-white shadow-card flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-white/70 uppercase tracking-wider">Today&apos;s Store Sales</div>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">PKR 84,650</div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-white/70">Gross Profit (Admin)</div>
                  <div className="text-sm font-bold font-mono text-brand-soft mt-0.5">PKR 21,480</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Sections */}
      <section id="features" className="py-20 px-6 sm:px-10 max-w-7xl mx-auto space-y-20">
        {/* Section 1: Inventory Management */}
        <div id="inventory" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-brand px-2.5 py-1 rounded bg-brand-soft">
              01 • INVENTORY CONTROL
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-content-primary">
              Built for 600+ physical electronics accessories.
            </h2>
            <p className="text-sm text-content-secondary leading-relaxed">
              Every adapter, cable, earbud, and power bank tracked by SKU, barcode, and reorder levels. Receive incoming supplier purchase orders, bulk import existing spreadsheets via our 5-step Excel wizard, and get instant low-stock notifications before shelves run dry.
            </p>
            <ul className="space-y-2 text-xs text-content-primary pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand" />
                <span>Bulk Excel import (.xlsx/.csv) with automatic column mapping</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand" />
                <span>Configurable reorder thresholds per product</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand" />
                <span>Automatic SKU and EAN barcode generation</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 p-6 rounded-2xl bg-app-surface border border-app-border shadow-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-app-border text-xs">
              <span className="font-semibold text-content-primary">Catalog Snapshot (600 Products)</span>
              <span className="text-brand font-mono font-bold">2,480 Units on Shelves</span>
            </div>
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-app-secondary/50 border border-app-border flex justify-between items-center text-xs">
                <div>
                  <div className="font-medium text-content-primary">USB-C Fast Charger 20W</div>
                  <div className="font-mono text-[10px] text-content-secondary">SKU: CHG-020 • Barcode: 8901234567012</div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-content-primary">{formatPKR(1050)}</div>
                  <div className="text-status-success font-semibold text-[10px]">45 in stock</div>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-status-warningSoft/40 border border-status-warning/20 flex justify-between items-center text-xs">
                <div>
                  <div className="font-medium text-content-primary">Wireless Earbuds Pro with ANC</div>
                  <div className="font-mono text-[10px] text-content-secondary">SKU: AUD-014 • Barcode: 8901234567013</div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-content-primary">{formatPKR(2650)}</div>
                  <div className="text-status-warning font-semibold text-[10px]">12 in stock (Low)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Point of Sale */}
        <div id="pos" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1 p-6 rounded-2xl bg-app-surface border border-app-border shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-app-border">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-brand" />
                <span className="text-xs font-semibold text-content-primary">Point of Sale Terminal</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-brand-soft text-brand text-[10px] font-mono font-bold">
                80mm Thermal Ready
              </span>
            </div>

            <div className="p-3 rounded-lg bg-app-secondary/40 border border-app-border flex items-center justify-between text-xs">
              <span className="text-content-secondary">Customer: <b>Ahmed Raza Qureshi</b></span>
              <span className="text-content-primary font-mono">+92 301 8934521</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-app-border/40">
                <span>1x GaN 65W 3-Port Wall Charger</span>
                <span className="font-mono font-bold">PKR 3,200</span>
              </div>
              <div className="flex justify-between py-1 border-b border-app-border/40">
                <span>2x Braided Type-C 100W 1.2M Cable</span>
                <span className="font-mono font-bold">PKR 700</span>
              </div>
              <div className="flex justify-between py-1 text-sm font-bold pt-2">
                <span>Total Amount</span>
                <span className="font-mono text-brand">PKR 3,900</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-brand px-2.5 py-1 rounded bg-brand-soft">
              02 • POINT OF SALE (POS)
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-content-primary">
              Lightning fast counter checkouts with barcode scanning.
            </h2>
            <p className="text-sm text-content-secondary leading-relaxed">
              Designed specifically for cashier workflow. Scan physical barcodes via standard USB or wireless handheld scanners, apply PKR or percent discounts, calculate cash change due in seconds, and print authentic 80mm thermal paper receipts.
            </p>
            <ul className="space-y-2 text-xs text-content-primary pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand" />
                <span>Hardware & keyboard scanner simulation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand" />
                <span>Cash, Card terminal, and Raast instant bank transfer</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand" />
                <span>Dedicated print layout styled for 80mm thermal receipt rolls</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Section 3: Profit Visibility & Reports */}
        <div id="profit" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-warm-dark px-2.5 py-1 rounded bg-warm-soft">
              03 • PROFIT VISIBILITY
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-content-primary">
              Know your exact profit. Not just your revenue.
            </h2>
            <p className="text-sm text-content-secondary leading-relaxed">
              Most store systems only show sales totals. STOCKROOM calculates exact Cost of Goods Sold (COGS) on every accessory, deducting discounts and refunds to reveal real gross profit margins.
            </p>
            <div className="p-3.5 rounded-xl bg-app-surface border border-app-border text-xs space-y-1">
              <span className="font-semibold text-content-primary">Role-Based Access Control (RBAC):</span>
              <p className="text-content-secondary leading-relaxed">
                Staff cashiers process sales smoothly without ever seeing your wholesale buying prices or profit margins.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 p-6 rounded-2xl bg-app-surface border border-app-border shadow-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-app-border">
              <h4 className="text-xs font-semibold text-content-primary uppercase tracking-wider">
                Financial Summary (Multan Retail)
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-soft text-brand font-bold">
                ADMIN VIEW
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-app-secondary/40 border border-app-border">
                <span className="text-content-secondary block mb-1">Today Sales</span>
                <span className="text-lg font-bold font-mono text-content-primary">PKR 84,650</span>
              </div>

              <div className="p-3 rounded-lg bg-warm-soft border border-warm/20">
                <span className="text-warm-dark block mb-1">Gross Profit</span>
                <span className="text-lg font-bold font-mono text-warm-dark">PKR 21,480</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-brand-soft/30 border border-brand/20 text-xs text-content-secondary">
              Formula: Gross Profit = Net Sales Revenue - Wholesale Acquisition Cost (COGS).
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 px-6 text-center bg-app-surface border-t border-b border-app-border">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-brand text-white mx-auto flex items-center justify-center shadow-subtle">
            <Store className="w-6 h-6" />
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-content-primary">
            Ready to take control of your store?
          </h2>

          <p className="text-sm text-content-secondary leading-relaxed">
            Experience the complete STOCKROOM system with 600 preloaded electronics accessories, live POS cashier terminal, barcode scanning, and profit reporting.
          </p>

          <div className="pt-2">
            <button
              onClick={() => handleLaunchDemo('/app')}
              className="px-8 py-3.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-sm font-semibold shadow-card inline-flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <span>Open Interactive Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-app-bg border-t border-app-border py-12 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
          <div className="space-y-3 md:col-span-1">
            <Logo />
            <p className="text-content-secondary leading-relaxed">
              Bespoke retail management software engineered for electronics and mobile accessories shops.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-content-primary mb-3">Product Modules</h4>
            <ul className="space-y-2 text-content-secondary">
              <li>
                <Link href="/app/pos" className="hover:text-brand">Point of Sale (POS)</Link>
              </li>
              <li>
                <Link href="/app/inventory" className="hover:text-brand">Inventory (600 Products)</Link>
              </li>
              <li>
                <Link href="/app/purchases" className="hover:text-brand">Stock Replenishment</Link>
              </li>
              <li>
                <Link href="/app/invoices" className="hover:text-brand">Invoices & Receipts</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-content-primary mb-3">Workflows</h4>
            <ul className="space-y-2 text-content-secondary">
              <li>
                <Link href="/app/returns" className="hover:text-brand">Returns & Refunds</Link>
              </li>
              <li>
                <Link href="/app/reports" className="hover:text-brand">Gross Profit Reports</Link>
              </li>
              <li>
                <Link href="/app/customers" className="hover:text-brand">Customer Directory</Link>
              </li>
              <li>
                <Link href="/app/activity" className="hover:text-brand">Live Activity Audit</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-content-primary mb-3">Demo Controls</h4>
            <ul className="space-y-2 text-content-secondary">
              <li>
                <Link href="/login" className="hover:text-brand">Switch to Staff Role</Link>
              </li>
              <li>
                <Link href="/app/settings" className="hover:text-brand">Store Settings</Link>
              </li>
              <li className="text-content-muted pt-2">
                Currency: Pakistani Rupee (PKR)
              </li>
              <li className="text-content-muted">
                Multan Commercial Center
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-app-border flex flex-col sm:flex-row items-center justify-between text-xs text-content-secondary gap-3">
          <div>© 2026 STOCKROOM. Retail Store Management System. All rights reserved.</div>
          <div className="text-[11px] text-content-muted">
            Interactive client demonstration — sample data only.
          </div>
        </div>
      </footer>
    </div>
  );
}

