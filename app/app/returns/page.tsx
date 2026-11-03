'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  RotateCcw,
  Search,
  CheckCircle,
  AlertCircle,
  Receipt,
  FileText,
  DollarSign,
  User,
  Calendar,
  Package,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useStore } from '@/lib/store';
import { Invoice, ReturnReason, RefundMethod } from '@/types';
import { formatPKR, formatDate, formatTime } from '@/lib/utils';
import { InvoiceDetailModal } from '@/components/invoices/InvoiceDetailModal';

function ReturnsContent() {
  const searchParams = useSearchParams();
  const queryInvoiceId = searchParams.get('invoiceId') || '';

  const { invoices, returnRecords, processReturn, currentRole } = useStore();

  const [invoiceLookup, setInvoiceLookup] = useState(queryInvoiceId);
  const [matchedInvoice, setMatchedInvoice] = useState<Invoice | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Return item selection state
  const [selectedItems, setSelectedItems] = useState<
    Record<
      string,
      {
        selected: boolean;
        quantity: number;
        reason: ReturnReason;
        restockable: boolean;
      }
    >
  >({});

  const [refundMethod, setRefundMethod] = useState<RefundMethod>('Cash');
  const [returnNotes, setReturnNotes] = useState('Customer returned within standard 7-day store warranty.');
  const [completedReturn, setCompletedReturn] = useState<any>(null);
  const [inspectingInvoice, setInspectingInvoice] = useState<Invoice | null>(null);

  // Auto lookup if query param is set
  useEffect(() => {
    if (queryInvoiceId) {
      handleFindInvoice(queryInvoiceId);
    }
  }, [queryInvoiceId]);

  const handleFindInvoice = (idToFind: string) => {
    const trimmed = idToFind.trim().toUpperCase();
    if (!trimmed) return;

    const found = invoices.find(inv => inv.id.toUpperCase() === trimmed);
    if (found) {
      setMatchedInvoice(found);
      setLookupError(null);

      // Initialize items mapping
      const initMap: typeof selectedItems = {};
      found.items.forEach(it => {
        initMap[it.productId] = {
          selected: false,
          quantity: 1,
          reason: 'Defective product',
          restockable: false,
        };
      });
      setSelectedItems(initMap);
    } else {
      setMatchedInvoice(null);
      setLookupError(`No invoice found matching "${idToFind}". Try an invoice like "INV-1045".`);
    }
  };

  const handleToggleSelectItem = (productId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        selected: !prev[productId]?.selected,
      },
    }));
  };

  const handleUpdateItem = (productId: string, updates: Partial<typeof selectedItems[string]>) => {
    setSelectedItems(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        ...updates,
      },
    }));
  };

  // Calculate refund sum
  const refundTotal = matchedInvoice
    ? matchedInvoice.items.reduce((sum, it) => {
        const sel = selectedItems[it.productId];
        if (sel?.selected) {
          return sum + it.unitPrice * sel.quantity;
        }
        return sum;
      }, 0)
    : 0;

  const handleCompleteReturn = () => {
    if (!matchedInvoice) return;
    const itemsToReturn = matchedInvoice.items
      .filter(it => selectedItems[it.productId]?.selected)
      .map(it => {
        const config = selectedItems[it.productId];
        return {
          productId: it.productId,
          productName: it.productName,
          sku: it.sku,
          quantity: config.quantity,
          unitPrice: it.unitPrice,
          refundAmount: it.unitPrice * config.quantity,
          reason: config.reason,
          restockable: config.restockable,
        };
      });

    if (itemsToReturn.length === 0) {
      alert('Please select at least one product item to return.');
      return;
    }

    const record = processReturn({
      invoiceId: matchedInvoice.id,
      customerId: matchedInvoice.customer.id,
      customerName: matchedInvoice.customer.name,
      items: itemsToReturn,
      refundTotal,
      refundMethod,
      processedBy: currentRole === 'admin' ? 'Admin (Bilal)' : 'Staff Cashier (Hamza)',
      notes: returnNotes,
    });

    setCompletedReturn(record);
    setMatchedInvoice(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-content-primary">
              Returns & Customer Refunds
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
              Look up original customer invoices, process item returns and restock undamaged inventory.
            </p>
          </div>
        </div>

        {/* Invoice Lookup Section */}
        <div className="p-5 rounded-xl bg-app-surface border border-app-border shadow-subtle space-y-4">
          <h3 className="text-sm font-semibold text-content-primary">Look Up Original Sales Invoice</h3>

          <form
            onSubmit={e => {
              e.preventDefault();
              handleFindInvoice(invoiceLookup);
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-content-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={invoiceLookup}
                onChange={e => setInvoiceLookup(e.target.value)}
                placeholder="Enter Invoice ID (e.g. INV-1045, INV-1044)..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand font-mono text-content-primary"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-subtle flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Fetch Invoice</span>
            </button>
          </form>

          {/* Quick Demo Invoice Buttons */}
          <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
            <span className="text-[11px] text-content-secondary">Quick Test Invoices:</span>
            {invoices.slice(0, 3).map(inv => (
              <button
                key={inv.id}
                type="button"
                onClick={() => {
                  setInvoiceLookup(inv.id);
                  handleFindInvoice(inv.id);
                }}
                className="px-2 py-0.5 rounded bg-brand-soft hover:bg-brand/10 text-brand text-[10px] font-mono font-medium border border-brand/20 transition-colors"
              >
                {inv.id} ({inv.customer.name.split(' ')[0]})
              </button>
            ))}
          </div>

          {lookupError && (
            <div className="p-3 rounded-lg bg-status-dangerSoft text-status-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{lookupError}</span>
            </div>
          )}
        </div>

        {/* Return Processing Panel */}
        {matchedInvoice && (
          <div className="p-5 rounded-xl bg-app-surface border border-brand/40 shadow-card space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-app-border">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-content-primary font-mono">{matchedInvoice.id}</h3>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold bg-brand-soft text-brand">
                    Active Invoice
                  </span>
                </div>
                <p className="text-xs text-content-secondary">
                  Customer: <b>{matchedInvoice.customer.name}</b> ({matchedInvoice.customer.phone}) • Paid on {formatDate(matchedInvoice.date)}
                </p>
              </div>

              <button
                onClick={() => setInspectingInvoice(matchedInvoice)}
                className="text-xs text-brand hover:underline font-medium self-start sm:self-auto"
              >
                View Full Receipt Details →
              </button>
            </div>

            {/* Line items return selector */}
            <div>
              <h4 className="text-xs font-semibold text-content-primary uppercase tracking-wider mb-2">
                Select Items to Return & Specify Condition
              </h4>

              <div className="border border-app-border rounded-lg overflow-hidden divide-y divide-app-border">
                {matchedInvoice.items.map(item => {
                  const state = selectedItems[item.productId] || {
                    selected: false,
                    quantity: 1,
                    reason: 'Defective product' as ReturnReason,
                    restockable: false,
                  };

                  return (
                    <div
                      key={item.productId}
                      className={`p-3.5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        state.selected ? 'bg-brand-soft/20' : 'bg-app-surface'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={state.selected}
                          onChange={() => handleToggleSelectItem(item.productId)}
                          className="w-4 h-4 accent-brand rounded cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-semibold text-content-primary">
                            {item.productName}
                          </div>
                          <div className="text-[11px] font-mono text-content-secondary">
                            {item.sku} • Purchased: {item.quantity} units @ {formatPKR(item.unitPrice)}
                          </div>
                        </div>
                      </div>

                      {state.selected && (
                        <div className="flex items-center gap-3 flex-wrap text-xs pl-7 sm:pl-0">
                          {/* Quantity */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-content-secondary">Qty:</span>
                            <select
                              value={state.quantity}
                              onChange={e =>
                                handleUpdateItem(item.productId, {
                                  quantity: parseInt(e.target.value) || 1,
                                })
                              }
                              className="px-2 py-1 bg-app-secondary border border-app-border rounded text-xs font-mono font-bold"
                            >
                              {Array.from({ length: item.quantity }, (_, i) => i + 1).map(num => (
                                <option key={num} value={num}>
                                  {num}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Reason */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-content-secondary">Reason:</span>
                            <select
                              value={state.reason}
                              onChange={e =>
                                handleUpdateItem(item.productId, {
                                  reason: e.target.value as ReturnReason,
                                  restockable: e.target.value !== 'Defective product',
                                })
                              }
                              className="px-2 py-1 bg-app-secondary border border-app-border rounded text-xs"
                            >
                              <option value="Defective product">Defective product (Do not restock)</option>
                              <option value="Wrong product">Wrong product model</option>
                              <option value="Customer changed mind">Customer changed mind</option>
                              <option value="Damaged packaging">Damaged packaging</option>
                              <option value="Other">Other reason</option>
                            </select>
                          </div>

                          {/* Restock checkbox */}
                          <label className="flex items-center gap-1 text-[11px] text-content-secondary cursor-pointer">
                            <input
                              type="checkbox"
                              checked={state.restockable}
                              onChange={e =>
                                handleUpdateItem(item.productId, { restockable: e.target.checked })
                              }
                              className="w-3.5 h-3.5 accent-brand"
                            />
                            <span>Return to shelf inventory</span>
                          </label>

                          <div className="font-mono font-bold text-brand ml-auto">
                            Refund: {formatPKR(item.unitPrice * state.quantity)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Refund Options */}
            <div className="p-4 rounded-xl bg-app-secondary/40 border border-app-border space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-semibold text-content-primary uppercase tracking-wider block mb-1">
                    Refund Tender Method
                  </span>
                  <div className="flex items-center gap-2">
                    {(['Cash', 'Card', 'Bank Transfer', 'Store Credit'] as RefundMethod[]).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setRefundMethod(m)}
                        className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                          refundMethod === m
                            ? 'bg-brand text-white border-brand shadow-xs'
                            : 'bg-app-surface text-content-primary border-app-border hover:bg-app-border/40'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-content-secondary text-[11px]">Total Refund Amount:</span>
                  <div className="text-xl font-bold font-mono text-status-danger">
                    {formatPKR(refundTotal)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-content-secondary mb-1">Return Notes / Reason Details</label>
                <input
                  type="text"
                  value={returnNotes}
                  onChange={e => setReturnNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-app-surface border border-app-border rounded-lg outline-none focus:border-brand"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-app-border">
              <button
                onClick={() => setMatchedInvoice(null)}
                className="px-3.5 py-2 text-xs font-medium text-content-secondary hover:text-content-primary bg-app-secondary rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteReturn}
                disabled={refundTotal === 0}
                className="px-5 py-2 text-xs font-semibold text-white bg-status-danger hover:bg-status-danger/90 rounded-lg shadow-subtle flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Confirm & Issue Refund ({formatPKR(refundTotal)})</span>
              </button>
            </div>
          </div>
        )}

        {/* Completed Return Confirmation Banner */}
        {completedReturn && (
          <div className="p-5 rounded-xl bg-status-successSoft/50 border border-status-success/30 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-status-success font-semibold text-sm">
              <CheckCircle className="w-5 h-5" />
              <span>Return Processed Successfully — Reference #{completedReturn.id}</span>
            </div>
            <p className="text-xs text-content-secondary">
              Refund of <b>{formatPKR(completedReturn.refundTotal)}</b> paid back to{' '}
              <b>{completedReturn.customerName}</b> via {completedReturn.refundMethod}. Items restocked to inventory.
            </p>
            <button
              onClick={() => setCompletedReturn(null)}
              className="text-xs font-medium text-brand hover:underline"
            >
              + Process Another Return
            </button>
          </div>
        )}

        {/* Return History Table */}
        <div className="p-5 rounded-xl bg-app-surface border border-app-border shadow-subtle space-y-4">
          <h3 className="text-sm font-semibold text-content-primary">Return & Refund History</h3>

          <div className="border border-app-border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-app-secondary/60 text-content-secondary border-b border-app-border">
                <tr>
                  <th className="py-2.5 px-3 text-left">Return ID</th>
                  <th className="py-2.5 px-3 text-left">Invoice</th>
                  <th className="py-2.5 px-3 text-left">Customer</th>
                  <th className="py-2.5 px-3 text-left">Date</th>
                  <th className="py-2.5 px-3 text-left">Returned Products</th>
                  <th className="py-2.5 px-3 text-left">Tender</th>
                  <th className="py-2.5 px-3 text-right">Refund Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {returnRecords.map(ret => (
                  <tr key={ret.id} className="hover:bg-app-secondary/30">
                    <td className="py-2.5 px-3 font-mono font-medium text-brand">{ret.id}</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-content-primary">{ret.invoiceId}</td>
                    <td className="py-2.5 px-3">{ret.customerName}</td>
                    <td className="py-2.5 px-3 text-content-secondary">{formatDate(ret.date)}</td>
                    <td className="py-2.5 px-3">
                      {ret.items.map(it => `${it.quantity}x ${it.productName} (${it.reason})`).join(', ')}
                    </td>
                    <td className="py-2.5 px-3">{ret.refundMethod}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-status-danger">
                      {formatPKR(ret.refundTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        invoice={inspectingInvoice}
        isOpen={!!inspectingInvoice}
        onClose={() => setInspectingInvoice(null)}
      />
    </AppLayout>
  );
}

export default function ReturnsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-content-secondary">Loading returns...</div>}>
      <ReturnsContent />
    </Suspense>
  );
}
