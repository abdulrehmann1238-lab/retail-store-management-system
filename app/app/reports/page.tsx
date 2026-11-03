'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Download,
  Calendar,
  ShieldAlert,
  Percent,
  PieChart,
  ArrowUpRight,
  HelpCircle,
  Package,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { useStore } from '@/lib/store';
import { formatPKR, formatDate, exportToCSV } from '@/lib/utils';
import { Product } from '@/types';

export default function ReportsPage() {
  const { invoices, returnRecords, products, currentRole, setRole } = useStore();

  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'last_month' | 'all'>('month');

  // Role Gate: If staff, block financial reports!
  if (currentRole !== 'admin') {
    return (
      <AppLayout>
        <div className="py-20 max-w-md mx-auto text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-status-dangerSoft text-status-danger mx-auto flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-content-primary">Admin Access Required</h2>
          <p className="text-xs text-content-secondary leading-relaxed">
            Financial analytics, gross profit calculations, margin percentages, and cost of goods sold (COGS) are restricted to store administrators.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setRole('admin')}
              className="px-4 py-2 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-dark shadow-subtle"
            >
              Switch to Admin Role
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Filter invoices according to selected period
  const reportData = useMemo(() => {
    const now = new Date();
    let startTime = 0;

    if (timeRange === 'today') {
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
    } else if (timeRange === 'week') {
      startTime = now.getTime() - 7 * 86400000;
    } else if (timeRange === 'month') {
      startTime = now.getTime() - 30 * 86400000;
    } else if (timeRange === 'last_month') {
      startTime = now.getTime() - 60 * 86400000;
    }

    const filteredInvoices = invoices.filter(
      inv => timeRange === 'all' || new Date(inv.date).getTime() >= startTime
    );

    const filteredReturns = returnRecords.filter(
      ret => timeRange === 'all' || new Date(ret.date).getTime() >= startTime
    );

    const grossRevenue = filteredInvoices.reduce((acc, inv) => acc + inv.subtotal, 0);
    const totalDiscounts = filteredInvoices.reduce((acc, inv) => acc + inv.discount, 0);
    const totalReturns = filteredReturns.reduce((acc, ret) => acc + ret.refundTotal, 0);
    const netSales = Math.max(0, grossRevenue - totalDiscounts - totalReturns);
    const cogs = filteredInvoices.reduce((acc, inv) => acc + inv.costOfGoodsSold, 0);
    const grossProfit = netSales - cogs;
    const profitMargin = netSales > 0 ? (grossProfit / netSales) * 100 : 0;

    // Sales by Category
    const categoryMap = new Map<string, { name: string; revenue: number; profit: number }>();
    filteredInvoices.forEach(inv => {
      inv.items.forEach(it => {
        const prod = products.find(p => p.id === it.productId);
        const cat = prod?.category || 'Other Accessories';
        const existing = categoryMap.get(cat);
        const lineProfit = it.total - it.buyingPrice * it.quantity;

        if (existing) {
          existing.revenue += it.total;
          existing.profit += lineProfit;
        } else {
          categoryMap.set(cat, { name: cat, revenue: it.total, profit: lineProfit });
        }
      });
    });

    const categoryStats = Array.from(categoryMap.values()).sort((a, b) => b.revenue - a.revenue);

    // Product performance table
    const productMap = new Map<
      string,
      { product: Product; unitsSold: number; revenue: number; cost: number; profit: number }
    >();

    filteredInvoices.forEach(inv => {
      inv.items.forEach(it => {
        const prod = products.find(p => p.id === it.productId);
        if (prod) {
          const existing = productMap.get(prod.id);
          const lineCost = it.buyingPrice * it.quantity;
          const lineProfit = it.total - lineCost;

          if (existing) {
            existing.unitsSold += it.quantity;
            existing.revenue += it.total;
            existing.cost += lineCost;
            existing.profit += lineProfit;
          } else {
            productMap.set(prod.id, {
              product: prod,
              unitsSold: it.quantity,
              revenue: it.total,
              cost: lineCost,
              profit: lineProfit,
            });
          }
        }
      });
    });

    const productPerformances = Array.from(productMap.values()).sort(
      (a, b) => b.profit - a.profit
    );

    return {
      grossRevenue,
      totalDiscounts,
      totalReturns,
      netSales,
      cogs,
      grossProfit,
      profitMargin,
      categoryStats,
      productPerformances,
      filteredInvoices,
    };
  }, [invoices, returnRecords, products, timeRange]);

  const COLORS = ['#315C4C', '#8FA995', '#B68B5C', '#C9A174', '#648B70', '#A0A69F'];

  const handleExportReport = () => {
    const rows = reportData.productPerformances.map(p => ({
      'Product Name': p.product.name,
      SKU: p.product.sku,
      Category: p.product.category,
      'Units Sold': p.unitsSold,
      'Revenue (PKR)': p.revenue,
      'Cost of Goods Sold (PKR)': p.cost,
      'Gross Profit (PKR)': p.profit,
      'Margin %': `${((p.profit / (p.revenue || 1)) * 100).toFixed(1)}%`,
    }));

    exportToCSV(`STOCKROOM_Profit_Analytics_${timeRange}.csv`, rows);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-content-primary">
                Financial Reports & Profitability
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-brand-soft text-brand font-bold">
                ADMIN RESTRICTED
              </span>
            </div>
            <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
              Comprehensive analytics tracking revenue, cost of goods sold (COGS), and net profit margins.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Period selector */}
            <div className="flex items-center p-1 rounded-lg bg-app-secondary border border-app-border text-xs">
              {(['today', 'week', 'month', 'last_month', 'all'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setTimeRange(period)}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    timeRange === period
                      ? 'bg-app-surface text-brand font-semibold shadow-xs'
                      : 'text-content-secondary hover:text-content-primary'
                  }`}
                >
                  {period === 'today'
                    ? 'Today'
                    : period === 'week'
                    ? 'This Week'
                    : period === 'month'
                    ? 'This Month'
                    : period === 'last_month'
                    ? 'Last 60d'
                    : 'All Time'}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportReport}
              className="px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-subtle transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 6 Key Financial KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl bg-app-surface border border-app-border shadow-subtle">
            <span className="text-[11px] font-medium text-content-secondary uppercase tracking-wider block mb-1">
              Gross Revenue
            </span>
            <div className="text-lg font-bold font-mono text-content-primary truncate">
              {formatPKR(reportData.grossRevenue)}
            </div>
            <span className="text-[10px] text-content-secondary">Total invoiced value</span>
          </div>

          <div className="p-3.5 rounded-xl bg-app-surface border border-app-border shadow-subtle">
            <span className="text-[11px] font-medium text-content-secondary uppercase tracking-wider block mb-1">
              Total Discounts
            </span>
            <div className="text-lg font-bold font-mono text-status-warning truncate">
              -{formatPKR(reportData.totalDiscounts)}
            </div>
            <span className="text-[10px] text-content-secondary">Promotional cuts</span>
          </div>

          <div className="p-3.5 rounded-xl bg-app-surface border border-app-border shadow-subtle">
            <span className="text-[11px] font-medium text-content-secondary uppercase tracking-wider block mb-1">
              Total Returns
            </span>
            <div className="text-lg font-bold font-mono text-status-danger truncate">
              -{formatPKR(reportData.totalReturns)}
            </div>
            <span className="text-[10px] text-content-secondary">Customer refunds</span>
          </div>

          <div className="p-3.5 rounded-xl bg-brand-soft/30 border border-brand/20 shadow-subtle">
            <span className="text-[11px] font-medium text-brand uppercase tracking-wider block mb-1">
              Net Sales
            </span>
            <div className="text-lg font-bold font-mono text-brand truncate">
              {formatPKR(reportData.netSales)}
            </div>
            <span className="text-[10px] text-content-secondary">Realized store turnover</span>
          </div>

          <div className="p-3.5 rounded-xl bg-app-surface border border-app-border shadow-subtle">
            <span className="text-[11px] font-medium text-content-secondary uppercase tracking-wider block mb-1">
              COGS (Cost)
            </span>
            <div className="text-lg font-bold font-mono text-content-primary truncate">
              {formatPKR(reportData.cogs)}
            </div>
            <span className="text-[10px] text-content-secondary">Wholesale acquisition</span>
          </div>

          <div className="p-3.5 rounded-xl bg-warm-soft border border-warm/30 shadow-subtle">
            <span className="text-[11px] font-medium text-warm-dark uppercase tracking-wider block mb-1">
              Gross Profit
            </span>
            <div className="text-lg font-bold font-mono text-warm-dark truncate">
              {formatPKR(reportData.grossProfit)}
            </div>
            <span className="text-[10px] text-warm-dark font-semibold">
              {reportData.profitMargin.toFixed(1)}% margin
            </span>
          </div>
        </div>

        {/* Profit Formula Educational Callout */}
        <div className="p-4 rounded-xl bg-app-surface border border-app-border shadow-subtle flex items-start gap-3">
          <div className="p-2 rounded-lg bg-brand-soft text-brand shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1">
            <h4 className="font-semibold text-content-primary">
              Retail Accounting Formula: Gross Profit = Net Sales Revenue - Cost of Goods Sold (COGS)
            </h4>
            <p className="text-content-secondary leading-relaxed">
              Every sold item matches its original supplier buying price. Discounts and customer returns are factored out to provide true operational profit in Pakistani Rupees.
            </p>
          </div>
        </div>

        {/* Charts: Category Breakdown & Profit by Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Bar Chart */}
          <div className="p-5 rounded-xl bg-app-surface border border-app-border shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-content-primary">Revenue by Product Category</h3>
                <p className="text-xs text-content-secondary">Ranked by PKR sales turnover.</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={reportData.categoryStats.slice(0, 6)}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EAE5" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#777F79', fontSize: 10 }}
                    axisLine={{ stroke: '#E8EAE5' }}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fill: '#777F79', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={val => `${val / 1000}k`}
                  />
                  <Tooltip
                    formatter={(val: number) => [formatPKR(val), 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E8EAE5',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="revenue" fill="#315C4C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Profit Distribution */}
          <div className="p-5 rounded-xl bg-app-surface border border-app-border shadow-subtle space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-content-primary">Gross Profit Contribution</h3>
              <p className="text-xs text-content-secondary">Which categories deliver the highest margins.</p>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={reportData.categoryStats.slice(0, 5)}
                    dataKey="profit"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {reportData.categoryStats.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [formatPKR(val), 'Gross Profit']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E8EAE5',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Product Performance Table */}
        <div className="p-5 rounded-xl bg-app-surface border border-app-border shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-content-primary">Product Performance & Profit Margin</h3>
              <p className="text-xs text-content-secondary">
                Detailed profitability per accessory SKU.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-app-secondary/50 text-content-secondary border-b border-app-border">
                <tr>
                  <th className="py-2.5 px-3 text-left">Product</th>
                  <th className="py-2.5 px-3 text-left">SKU</th>
                  <th className="py-2.5 px-3 text-left">Category</th>
                  <th className="py-2.5 px-3 text-center">Units Sold</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                  <th className="py-2.5 px-3 text-right">Cost (COGS)</th>
                  <th className="py-2.5 px-3 text-right">Gross Profit</th>
                  <th className="py-2.5 px-3 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {reportData.productPerformances.slice(0, 20).map(item => {
                  const marginPct = (item.profit / (item.revenue || 1)) * 100;
                  return (
                    <tr key={item.product.id} className="hover:bg-app-secondary/30">
                      <td className="py-2.5 px-3 font-medium text-content-primary">
                        {item.product.name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-brand font-semibold">
                        {item.product.sku}
                      </td>
                      <td className="py-2.5 px-3 text-content-secondary">
                        {item.product.category}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        {item.unitsSold}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {formatPKR(item.revenue)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-content-secondary">
                        {formatPKR(item.cost)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-warm-dark">
                        {formatPKR(item.profit)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-brand">
                        {marginPct.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

