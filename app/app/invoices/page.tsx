'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Receipt,
  Search,
  Download,
  Plus,
  Eye,
  Printer,
  RotateCcw,
  CreditCard,
  Banknote,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useStore } from '@/lib/store';
import { Invoice } from '@/types';
import { formatPKR, formatDate, formatTime, exportToCSV } from '@/lib/utils';
import { InvoiceDetailModal } from '@/components/invoices/InvoiceDetailModal';

function InvoicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const { invoices } = useStore();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Stats
  const totalSales = useMemo(() => {
    return invoices.reduce((acc, inv) => acc + inv.total, 0);
  }, [invoices]);

  const paidCount = useMemo(() => {
    return invoices.filter(inv => inv.status === 'Paid').length;
  }, [invoices]);

  const returnedCount = useMemo(() => {
    return invoices.filter(inv => inv.status !== 'Paid').length;
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return invoices.filter(inv => {
      const matchSearch =
        !q ||
        inv.id.toLowerCase().includes(q) ||
        inv.customer.name.toLowerCase().includes(q) ||
        inv.customer.phone.includes(q) ||
        inv.cashier.toLowerCase().includes(q);

      const matchPayment = paymentFilter === 'All' || inv.paymentMethod === paymentFilter;
      const matchStatus = statusFilter === 'All' || inv.status === statusFilter;

      return matchSearch && matchPayment && matchStatus;
    });
  }, [invoices, searchQuery, paymentFilter, statusFilter]);

  const totalPages = Math.ceil(filteredInvoices.length / pageSize) || 1;
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, currentPage, pageSize]);

  const handleExportInvoices = () => {
    const rows = filteredInvoices.map(inv => ({
      'Invoice ID': inv.id,
      Date: formatDate(inv.date),
      Time: formatTime(inv.date),
      Customer: inv.customer.name,
      Phone: inv.customer.phone,
      Cashier: inv.cashier,
      'Payment Method': inv.paymentMethod,
      'Item Count': inv.items.reduce((acc, it) => acc + it.quantity, 0),
      Subtotal: inv.subtotal,
      Discount: inv.discount,
      'Total (PKR)': inv.total,
      Status: inv.status,
    }));

    exportToCSV(`STOCKROOM_Sales_Invoices_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  const handleInitiateReturn = (inv: Invoice) => {
    router.push(`/app/returns?invoiceId=${encodeURIComponent(inv.id)}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-content-primary">
              Sales Invoices
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
              Review checkout receipts, print 80mm thermal slips and process customer refunds.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportInvoices}
              className="px-3 py-1.5 rounded-lg border border-app-border bg-app-surface hover:bg-app-secondary text-xs font-medium text-content-primary transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-content-secondary" />
              <span>Export</span>
            </button>

            <Link
              href="/app/pos"
              className="px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-subtle transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Sale</span>
            </Link>
          </div>
        </div>

        {/* 4 Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-app-surface border border-app-border shadow-subtle">
            <span className="text-xs font-medium text-content-secondary uppercase tracking-wider block mb-1">
              Total Invoices
            </span>
            <div className="text-2xl font-bold font-mono text-content-primary">
              {invoices.length}
            </div>
            <span className="text-[11px] text-content-secondary">All-time transactions</span>
          </div>

          <div className="p-4 rounded-xl bg-app-surface border border-app-border shadow-subtle">
            <span className="text-xs font-medium text-content-secondary uppercase tracking-wider block mb-1">
              Total Invoiced Revenue
            </span>
            <div className="text-2xl font-bold font-mono text-brand">
              {formatPKR(totalSales)}
            </div>
            <span className="text-[11px] text-content-secondary">Net sales settled</span>
          </div>

          <div className="p-4 rounded-xl bg-app-surface border border-app-border shadow-subtle">
            <span className="text-xs font-medium text-content-secondary uppercase tracking-wider block mb-1">
              Paid Invoices
            </span>
            <div className="text-2xl font-bold font-mono text-status-success">
              {paidCount}
            </div>
            <span className="text-[11px] text-content-secondary">Completed without return</span>
          </div>

          <div className="p-4 rounded-xl bg-app-surface border border-app-border shadow-subtle">
            <span className="text-xs font-medium text-content-secondary uppercase tracking-wider block mb-1">
              Returned Invoices
            </span>
            <div className="text-2xl font-bold font-mono text-status-warning">
              {returnedCount}
            </div>
            <span className="text-[11px] text-content-secondary">Refunded or exchanged</span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 rounded-xl bg-app-surface border border-app-border shadow-subtle flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-content-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by invoice number (e.g. 'INV-1042'), customer name, or phone..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand text-content-primary"
            />
          </div>

          <select
            value={paymentFilter}
            onChange={e => {
              setPaymentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand text-content-primary"
          >
            <option value="All">All Payment Tender</option>
            <option value="Cash">Cash Only</option>
            <option value="Card">Card Only</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand text-content-primary"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partially Returned">Partially Returned</option>
            <option value="Returned">Returned</option>
          </select>
        </div>

        {/* Invoices Table */}
        <div className="bg-app-surface border border-app-border rounded-xl shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-app-secondary/50 text-content-secondary border-b border-app-border">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">Invoice ID</th>
                  <th className="py-3 px-4 text-left font-semibold">Customer</th>
                  <th className="py-3 px-3 text-left font-semibold">Date & Time</th>
                  <th className="py-3 px-3 text-left font-semibold">Cashier</th>
                  <th className="py-3 px-3 text-center font-semibold">Items</th>
                  <th className="py-3 px-3 text-left font-semibold">Payment</th>
                  <th className="py-3 px-4 text-right font-semibold">Total</th>
                  <th className="py-3 px-3 text-center font-semibold">Status</th>
                  <th className="py-3 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {paginatedInvoices.map(inv => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className="hover:bg-app-secondary/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-brand">
                      {inv.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-content-primary">{inv.customer.name}</div>
                      <div className="text-[11px] text-content-secondary font-mono">{inv.customer.phone}</div>
                    </td>
                    <td className="py-3 px-3 text-content-secondary">
                      {formatDate(inv.date)} {formatTime(inv.date)}
                    </td>
                    <td className="py-3 px-3 text-content-secondary truncate max-w-[140px]">
                      {inv.cashier}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium">
                      {inv.items.reduce((acc, it) => acc + it.quantity, 0)}
                    </td>
                    <td className="py-3 px-3 text-content-primary">
                      {inv.paymentMethod}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-content-primary">
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
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedInvoice(inv);
                          }}
                          className="px-2.5 py-1 rounded bg-app-secondary hover:bg-brand-soft hover:text-brand text-[11px] font-medium transition-colors"
                          title="View / Print 80mm"
                        >
                          View Receipt
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-3 border-t border-app-border bg-app-secondary/30 flex items-center justify-between text-xs text-content-secondary">
            <div>
              Showing {Math.min(filteredInvoices.length, (currentPage - 1) * pageSize + 1)} to{' '}
              {Math.min(filteredInvoices.length, currentPage * pageSize)} of {filteredInvoices.length} invoices
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded bg-app-surface border border-app-border disabled:opacity-40 hover:bg-app-secondary"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-content-primary">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded bg-app-surface border border-app-border disabled:opacity-40 hover:bg-app-secondary"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onInitiateReturn={handleInitiateReturn}
      />
    </AppLayout>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-content-secondary">Loading invoices...</div>}>
      <InvoicesContent />
    </Suspense>
  );
}
