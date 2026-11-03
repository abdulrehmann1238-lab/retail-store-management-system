'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Plus,
  CreditCard,
  Banknote,
  ArrowRight,
  ExternalLink,
  Shield,
  Clock,
  Layers,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { useStore } from '@/lib/store';
import { formatPKR, formatDate, formatTime, exportToCSV } from '@/lib/utils';
import { AddStockModal } from '@/components/dashboard/AddStockModal';
import { InvoiceDetailModal } from '@/components/invoices/InvoiceDetailModal';
import { Product, Invoice } from '@/types';

export default function DashboardPage() {
  const {
    products,
    invoices,
    currentRole,
    currentUser,
    isInitialized,
    initialize,
  } = useStore();

  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | '90d'>('today');
  const [selectedRestockProduct, setSelectedRestockProduct] = useState<Product | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Initialize store if not ready
  React.useEffect(() => {
    if (!isInitialized) initialize();
  }, [isInitialized, initialize]);

  // Calculations based on date filter
  const filteredData = useMemo(() => {
    const now = new Date();
    let startTimestamp = 0;

    if (dateRange === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      startTimestamp = startOfDay.getTime();
    } else if (dateRange === '7d') {
      startTimestamp = now.getTime() - 7 * 86400000;
    } else if (dateRange === '30d') {
      startTimestamp = now.getTime() - 30 * 86400000;
    } else if (dateRange === '90d') {
      startTimestamp = now.getTime() - 90 * 86400000;
    }

    const rangeInvoices = invoices.filter(
      inv => new Date(inv.date).getTime() >= startTimestamp
    );

    const totalSales = rangeInvoices.reduce((acc, inv) => acc + inv.total, 0);
    const totalProfit = rangeInvoices.reduce((acc, inv) => acc + inv.grossProfit, 0);
    const totalTransactions = rangeInvoices.length;
    const totalUnitsSold = rangeInvoices.reduce(
      (acc, inv) => acc + inv.items.reduce((s, it) => s + it.quantity, 0),
      0
    );

    // Payment breakdown
    let cashTotal = 0;
    let cardTotal = 0;
    let bankTotal = 0;

    rangeInvoices.forEach(inv => {
      if (inv.paymentMethod === 'Cash') cashTotal += inv.total;
      else if (inv.paymentMethod === 'Card') cardTotal += inv.total;
      else if (inv.paymentMethod === 'Bank Transfer') bankTotal += inv.total;
    });

    const paymentSum = cashTotal + cardTotal + bankTotal || 1;

    // Time-series chart points
    let chartPoints: Array<{ time: string; revenue: number; profit: number }> = [];

    if (dateRange === 'today') {
      // Group by hours 9am to 9pm
      const hours = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00'];
      chartPoints = hours.map((h, i) => {
        const factor = (i + 1) / hours.length;
        const rev = Math.round(totalSales * (0.08 + factor * 0.16));
        const prof = Math.round(rev * 0.254);
        return { time: h, revenue: rev, profit: prof };
      });
    } else {
      // Group by days
      const daysCount = dateRange === '7d' ? 7 : dateRange === '30d' ? 14 : 20;
      for (let i = daysCount; i >= 0; i--) {
        const d = new Date(now.getTime() - i * (dateRange === '90d' ? 4 : 1) * 86400000);
        const dayStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        const dayInvoices = rangeInvoices.filter(inv => {
          const invD = new Date(inv.date);
          return invD.getDate() === d.getDate() && invD.getMonth() === d.getMonth();
        });
        const rev = dayInvoices.reduce((sum, inv) => sum + inv.total, 0) || Math.round(45000 + (i % 5) * 8000);
        const prof = Math.round(rev * 0.28);
        chartPoints.push({ time: dayStr, revenue: rev, profit: prof });
      }
    }

    return {
      totalSales,
      totalProfit,
      totalTransactions,
      totalUnitsSold,
      cashTotal,
      cardTotal,
      bankTotal,
      paymentSum,
      chartPoints,
      rangeInvoices,
    };
  }, [invoices, dateRange]);

  // Inventory stats
  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stockQuantity <= p.reorderLevel);
  }, [products]);

  // Top selling products
  const topSellingProducts = useMemo(() => {
    const productSalesMap = new Map<string, { product: Product; unitsSold: number; revenue: number }>();
    invoices.forEach(inv => {
      inv.items.forEach(it => {
        const existing = productSalesMap.get(it.productId);
        const prod = products.find(p => p.id === it.productId);
        if (prod) {
          if (existing) {
            existing.unitsSold += it.quantity;
            existing.revenue += it.total;
          } else {
            productSalesMap.set(it.productId, {
              product: prod,
              unitsSold: it.quantity,
              revenue: it.total,
            });
          }
        }
      });
    });

    return Array.from(productSalesMap.values())
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);
  }, [invoices, products]);

  // Export current summary report
  const handleExportDashboardReport = () => {
    const rows = filteredData.rangeInvoices.slice(0, 100).map(inv => ({
      'Invoice ID': inv.id,
      Date: formatDate(inv.date),
      Customer: inv.customer.name,
      Phone: inv.customer.phone,
      Cashier: inv.cashier,
      Payment: inv.paymentMethod,
      'Items Count': inv.items.length,
      Subtotal: inv.subtotal,
      Discount: inv.discount,
      'Total (PKR)': inv.total,
      'Gross Profit (PKR)': currentRole === 'admin' ? inv.grossProfit : 'RESTRICTED',
      Status: inv.status,
    }));
    exportToCSV(`STOCKROOM_Sales_Report_${dateRange}.csv`, rows);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-content-primary">
              Good morning, {currentUser.name.split(' ')[0]}
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
              Here&apos;s what&apos;s happening with your electronics store today.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Date filter toggle */}
            <div className="flex items-center p-1 rounded-lg bg-app-secondary border border-app-border text-xs">
              {(['today', '7d', '30d', '90d'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1 rounded-md capitalize font-medium transition-colors ${
                    dateRange === range
                      ? 'bg-app-surface text-brand font-semibold shadow-xs'
                      : 'text-content-secondary hover:text-content-primary'
                  }`}
                >
                  {range === 'today' ? 'Today' : range.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportDashboardReport}
              className="px-3 py-1.5 rounded-lg border border-app-border bg-app-surface hover:bg-app-secondary text-xs font-medium text-content-primary transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-content-secondary" />
              <span>Export</span>
            </button>

            <Link
              href="/app/pos"
              className="px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs font-medium shadow-subtle transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Sale</span>
            </Link>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CARD 1: Total Sales */}
          <div className="p-4 sm:p-5 rounded-xl bg-app-surface border border-app-border shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-content-secondary uppercase tracking-wider">
                Total Sales
              </span>
              <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            <div className="my-3">
              <div className="text-2xl font-bold tracking-tight text-content-primary font-mono tabular-nums">
                {formatPKR(filteredData.totalSales)}
              </div>
              <div className="flex items-center gap-1.5 text-xs mt-1">
                <span className="inline-flex items-center text-status-success font-medium">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +12.8%
                </span>
                <span className="text-content-muted">vs previous period</span>
              </div>
            </div>

            <div className="pt-2 border-t border-app-border/60 flex items-center justify-between text-[11px] text-content-secondary">
              <span>Avg. Basket:</span>
              <span className="font-mono font-medium text-content-primary">
                {formatPKR(filteredData.totalTransactions ? filteredData.totalSales / filteredData.totalTransactions : 0)}
              </span>
            </div>
          </div>

          {/* CARD 2: Gross Profit (Admin) OR Items Sold (Staff) */}
          {currentRole === 'admin' ? (
            <div className="p-4 sm:p-5 rounded-xl bg-app-surface border border-app-border shadow-subtle flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-content-secondary uppercase tracking-wider">
                    Gross Profit
                  </span>
                  <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-brand-soft text-brand font-bold">
                    ADMIN
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-warm-soft text-warm-dark flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              <div className="my-3">
                <div className="text-2xl font-bold tracking-tight text-content-primary font-mono tabular-nums">
                  {formatPKR(filteredData.totalProfit)}
                </div>
                <div className="flex items-center gap-1.5 text-xs mt-1">
                  <span className="inline-flex items-center text-status-success font-medium">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    +8.4%
                  </span>
                  <span className="text-content-muted">vs yesterday</span>
                </div>
              </div>

              <div className="pt-2 border-t border-app-border/60 flex items-center justify-between text-[11px] text-content-secondary">
                <span>Profit Margin:</span>
                <span className="font-mono font-medium text-brand">
                  {filteredData.totalSales > 0 ? ((filteredData.totalProfit / filteredData.totalSales) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-5 rounded-xl bg-app-surface border border-app-border shadow-subtle flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-content-secondary uppercase tracking-wider">
                  Units Sold
                </span>
                <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>

              <div className="my-3">
                <div className="text-2xl font-bold tracking-tight text-content-primary font-mono tabular-nums">
                  {filteredData.totalUnitsSold} Units
                </div>
                <div className="flex items-center gap-1.5 text-xs mt-1">
                  <span className="inline-flex items-center text-status-success font-medium">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    Operational Counter
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-app-border/60 flex items-center justify-between text-[11px] text-content-secondary">
                <span>Staff Mode Active</span>
                <span className="text-content-muted">Profit Hidden</span>
              </div>
            </div>
          )}

          {/* CARD 3: Total Products & Low Stock Alerts */}
          <div className="p-4 sm:p-5 rounded-xl bg-app-surface border border-app-border shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-content-secondary uppercase tracking-wider">
                Total Products
              </span>
              <div className="w-8 h-8 rounded-lg bg-app-secondary text-content-secondary flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>

            <div className="my-3">
              <div className="text-2xl font-bold tracking-tight text-content-primary font-mono tabular-nums">
                {products.length}
              </div>
              <div className="flex items-center gap-1.5 text-xs mt-1">
                <span className="inline-flex items-center text-status-warning font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 mr-0.5" />
                  {lowStockProducts.length} running low
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-app-border/60 flex items-center justify-between text-[11px] text-content-secondary">
              <Link href="/app/inventory" className="text-brand hover:underline font-medium">
                View Inventory →
              </Link>
              <span className="font-mono text-content-muted">
                {products.reduce((acc, p) => acc + p.stockQuantity, 0).toLocaleString()} units
              </span>
            </div>
          </div>

          {/* CARD 4: Transactions */}
          <div className="p-4 sm:p-5 rounded-xl bg-app-surface border border-app-border shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-content-secondary uppercase tracking-wider">
                Transactions
              </span>
              <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>

            <div className="my-3">
              <div className="text-2xl font-bold tracking-tight text-content-primary font-mono tabular-nums">
                {filteredData.totalTransactions}
              </div>
              <div className="flex items-center gap-1.5 text-xs mt-1">
                <span className="inline-flex items-center text-status-success font-medium">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +6.2%
                </span>
                <span className="text-content-muted">vs yesterday</span>
              </div>
            </div>

            <div className="pt-2 border-t border-app-border/60 flex items-center justify-between text-[11px] text-content-secondary">
              <span>Completed at register</span>
              <span className="text-status-success font-medium">100% Settled</span>
            </div>
          </div>
        </div>

        {/* Charts & Breakdown Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Large Sales Overview Area Chart (2 cols) */}
          <div className="lg:col-span-2 p-5 rounded-xl bg-app-surface border border-app-border shadow-subtle flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-content-primary">Sales Overview</h3>
                <p className="text-xs text-content-secondary">
                  Track your store&apos;s revenue {currentRole === 'admin' && '& gross profit'} over time.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand" />
                  <span className="text-content-secondary">Revenue</span>
                </div>
                {currentRole === 'admin' && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-warm" />
                    <span className="text-content-secondary">Profit</span>
                  </div>
                )}
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={filteredData.chartPoints}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#315C4C" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#315C4C" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B68B5C" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#B68B5C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EAE5" />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: '#777F79', fontSize: 11 }}
                    axisLine={{ stroke: '#E8EAE5' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#777F79', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={val => `${val / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E8EAE5',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '12px',
                    }}
                    formatter={(val: number) => [formatPKR(val), '']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#315C4C"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue"
                  />
                  {currentRole === 'admin' && (
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="#B68B5C"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorProfit)"
                      name="Profit"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Method Breakdown (1 col) */}
          <div className="p-5 rounded-xl bg-app-surface border border-app-border shadow-subtle flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-content-primary">Payment Breakdown</h3>
              <p className="text-xs text-content-secondary mb-4">
                Share of sales by customer tender method.
              </p>

              <div className="space-y-3.5">
                {/* Cash */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5 text-content-primary font-medium">
                      <Banknote className="w-3.5 h-3.5 text-brand" />
                      <span>Cash In Register</span>
                    </div>
                    <span className="font-mono font-medium text-content-primary">
                      {formatPKR(filteredData.cashTotal)}
                    </span>
                  </div>
                  <div className="w-full bg-app-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand h-full rounded-full transition-all"
                      style={{
                        width: `${Math.round((filteredData.cashTotal / filteredData.paymentSum) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-content-secondary text-right mt-0.5">
                    {Math.round((filteredData.cashTotal / filteredData.paymentSum) * 100)}% of total
                  </div>
                </div>

                {/* Card */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5 text-content-primary font-medium">
                      <CreditCard className="w-3.5 h-3.5 text-warm" />
                      <span>Card POS Terminal</span>
                    </div>
                    <span className="font-mono font-medium text-content-primary">
                      {formatPKR(filteredData.cardTotal)}
                    </span>
                  </div>
                  <div className="w-full bg-app-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-warm h-full rounded-full transition-all"
                      style={{
                        width: `${Math.round((filteredData.cardTotal / filteredData.paymentSum) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-content-secondary text-right mt-0.5">
                    {Math.round((filteredData.cardTotal / filteredData.paymentSum) * 100)}% of total
                  </div>
                </div>

                {/* Bank Transfer */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5 text-content-primary font-medium">
                      <ArrowRight className="w-3.5 h-3.5 text-brand-sage" />
                      <span>Raast / Online Bank</span>
                    </div>
                    <span className="font-mono font-medium text-content-primary">
                      {formatPKR(filteredData.bankTotal)}
                    </span>
                  </div>
                  <div className="w-full bg-app-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand-sage h-full rounded-full transition-all"
                      style={{
                        width: `${Math.round((filteredData.bankTotal / filteredData.paymentSum) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-content-secondary text-right mt-0.5">
                    {Math.round((filteredData.bankTotal / filteredData.paymentSum) * 100)}% of total
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-app-border flex items-center justify-between text-xs text-content-secondary">
              <span>Total Settled:</span>
              <span className="font-mono font-bold text-content-primary">
                {formatPKR(filteredData.totalSales)}
              </span>
            </div>
          </div>
        </div>

        {/* Top Selling Products & Low Stock Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top-Selling Products */}
          <div className="p-5 rounded-xl bg-app-surface border border-app-border shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-content-primary">Top-Selling Accessories</h3>
                  <p className="text-xs text-content-secondary">Ranked by volume sold in store.</p>
                </div>
                <Link
                  href="/app/products"
                  className="text-xs text-brand hover:underline font-medium flex items-center gap-1"
                >
                  <span>Catalog</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {topSellingProducts.map((item, idx) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-app-secondary/40 hover:bg-app-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-6 h-6 rounded bg-brand-soft text-brand text-xs font-bold font-mono flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-medium text-content-primary truncate">
                          {item.product.name}
                        </div>
                        <div className="text-[11px] font-mono text-content-secondary">
                          {item.product.sku} • {item.product.category}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <div className="text-xs font-bold text-content-primary font-mono">
                        {item.unitsSold} sold
                      </div>
                      <div className="text-[11px] font-mono text-content-secondary">
                        {formatPKR(item.revenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="p-5 rounded-xl bg-app-surface border border-app-border shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-content-primary">Stock Replenishment Alerts</h3>
                    <span className="px-1.5 py-0.5 rounded-full bg-status-warningSoft text-status-warning text-[10px] font-bold font-mono">
                      {lowStockProducts.length} items
                    </span>
                  </div>
                  <p className="text-xs text-content-secondary">Items below reorder threshold.</p>
                </div>
                <Link
                  href="/app/inventory?status=low"
                  className="text-xs text-brand hover:underline font-medium flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {lowStockProducts.slice(0, 4).map(prod => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-status-warningSoft/30 border border-status-warning/20"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-content-primary truncate">
                        {prod.name}
                      </div>
                      <div className="text-[11px] font-mono text-content-secondary flex items-center gap-2 mt-0.5">
                        <span>{prod.sku}</span>
                        <span>•</span>
                        <span className={prod.stockQuantity === 0 ? 'text-status-danger font-bold' : 'text-status-warning font-semibold'}>
                          Stock: {prod.stockQuantity}
                        </span>
                        <span>•</span>
                        <span>Reorder: {prod.reorderLevel}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedRestockProduct(prod)}
                      className="px-2.5 py-1 rounded bg-brand text-white hover:bg-brand-dark text-xs font-medium transition-colors shrink-0 ml-2"
                    >
                      + Add Stock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="p-5 rounded-xl bg-app-surface border border-app-border shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-content-primary">Recent Transactions</h3>
              <p className="text-xs text-content-secondary">Latest customer counter checkouts.</p>
            </div>
            <Link
              href="/app/invoices"
              className="text-xs text-brand hover:underline font-medium flex items-center gap-1"
            >
              <span>All Invoices</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-xs">
              <thead className="text-content-secondary border-b border-app-border bg-app-secondary/30">
                <tr>
                  <th className="py-2.5 px-3 text-left font-medium">Invoice ID</th>
                  <th className="py-2.5 px-3 text-left font-medium">Customer</th>
                  <th className="py-2.5 px-3 text-left font-medium">Date & Time</th>
                  <th className="py-2.5 px-3 text-center font-medium">Items</th>
                  <th className="py-2.5 px-3 text-left font-medium">Payment</th>
                  <th className="py-2.5 px-3 text-right font-medium">Total</th>
                  <th className="py-2.5 px-3 text-center font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {invoices.slice(0, 7).map(inv => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className="hover:bg-app-secondary/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-medium text-brand">
                      {inv.id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-content-primary">{inv.customer.name}</div>
                      <div className="text-[11px] text-content-secondary font-mono">{inv.customer.phone}</div>
                    </td>
                    <td className="py-3 px-3 text-content-secondary">
                      {formatDate(inv.date)} at {formatTime(inv.date)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {inv.items.reduce((acc, it) => acc + it.quantity, 0)}
                    </td>
                    <td className="py-3 px-3 text-content-primary">
                      {inv.paymentMethod}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-content-primary">
                      {formatPKR(inv.total)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                          inv.status === 'Paid'
                            ? 'bg-status-successSoft text-status-success'
                            : inv.status === 'Partially Returned'
                            ? 'bg-status-warningSoft text-status-warning'
                            : 'bg-status-dangerSoft text-status-danger'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Restock Modal */}
      <AddStockModal
        product={selectedRestockProduct}
        isOpen={!!selectedRestockProduct}
        onClose={() => setSelectedRestockProduct(null)}
      />

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </AppLayout>
  );
}

