'use client';

import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Calendar,
  Building,
  CheckCircle,
  FileText,
  DollarSign,
  Package,
  X,
  Trash2,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useStore } from '@/lib/store';
import { StockEntry, Product } from '@/types';
import { formatPKR, formatDate, formatTime } from '@/lib/utils';

export default function PurchasesPage() {
  const { stockEntries, products, addStockEntry, currentRole } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<StockEntry | null>(null);
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);

  // Form state for creating new stock entry
  const [supplierName, setSupplierName] = useState('Anker Pakistan Official Importers');
  const [referenceNumber, setReferenceNumber] = useState(`PO-${Math.floor(89300 + Math.random() * 500)}`);
  const [notes, setNotes] = useState('Immediate shop inventory replenishment.');
  const [entryItems, setEntryItems] = useState<
    Array<{ product: Product; quantity: number; buyingCost: number }>
  >([
    { product: products[0] || ({} as Product), quantity: 50, buyingCost: products[0]?.buyingPrice || 650 },
  ]);

  const filteredEntries = stockEntries.filter(
    e =>
      e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddItemToEntry = () => {
    const nextProd = products.find(p => !entryItems.some(it => it.product.id === p.id)) || products[0];
    if (nextProd) {
      setEntryItems([...entryItems, { product: nextProd, quantity: 20, buyingCost: nextProd.buyingPrice }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setEntryItems(entryItems.filter((_, i) => i !== index));
  };

  const handleItemProductChange = (index: number, productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const updated = [...entryItems];
    updated[index] = { product: prod, quantity: updated[index].quantity, buyingCost: prod.buyingPrice };
    setEntryItems(updated);
  };

  const handleItemQtyChange = (index: number, qty: number) => {
    const updated = [...entryItems];
    updated[index].quantity = qty;
    setEntryItems(updated);
  };

  const handleItemCostChange = (index: number, cost: number) => {
    const updated = [...entryItems];
    updated[index].buyingCost = cost;
    setEntryItems(updated);
  };

  const totalCost = entryItems.reduce((acc, it) => acc + it.quantity * it.buyingCost, 0);

  const handleSubmitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (entryItems.length === 0) return;

    const items = entryItems.map(it => ({
      productId: it.product.id,
      productName: it.product.name,
      sku: it.product.sku,
      quantity: it.quantity,
      buyingCost: it.buyingCost,
      total: it.quantity * it.buyingCost,
    }));

    addStockEntry({
      supplierName,
      referenceNumber,
      items,
      totalCost,
      notes,
      receivedBy: 'Admin (Bilal)',
    });

    setIsNewEntryOpen(false);
    // Reset form
    setReferenceNumber(`PO-${Math.floor(89300 + Math.random() * 500)}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-content-primary">
              Stock Entries & Purchases
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
              Record incoming shipments, update product quantities and track supplier bills.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsNewEntryOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-subtle transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Stock Entry</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-app-surface border border-app-border shadow-subtle">
            <span className="text-xs font-medium text-content-secondary uppercase tracking-wider block mb-1">
              Total Stock Orders
            </span>
            <div className="text-2xl font-bold font-mono text-content-primary">
              {stockEntries.length}
            </div>
            <span className="text-[11px] text-content-secondary">Recorded batches</span>
          </div>

          <div className="p-4 rounded-xl bg-app-surface border border-app-border shadow-subtle">
            <span className="text-xs font-medium text-content-secondary uppercase tracking-wider block mb-1">
              Total Purchase Cost
            </span>
            <div className="text-2xl font-bold font-mono text-content-primary">
              {formatPKR(stockEntries.reduce((acc, s) => acc + s.totalCost, 0))}
            </div>
            <span className="text-[11px] text-content-secondary">Historical inventory spend</span>
          </div>

          <div className="p-4 rounded-xl bg-app-surface border border-app-border shadow-subtle">
            <span className="text-xs font-medium text-content-secondary uppercase tracking-wider block mb-1">
              Active Suppliers
            </span>
            <div className="text-2xl font-bold font-mono text-content-primary">6</div>
            <span className="text-[11px] text-content-secondary">Multan, Karachi & Lahore</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 rounded-xl bg-app-surface border border-app-border shadow-subtle">
          <div className="relative">
            <Search className="w-4 h-4 text-content-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by supplier name, reference order (e.g. PO-89201), or entry ID..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand text-content-primary"
            />
          </div>
        </div>

        {/* Stock Entries Table */}
        <div className="bg-app-surface border border-app-border rounded-xl shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-app-secondary/50 text-content-secondary border-b border-app-border">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">Entry ID</th>
                  <th className="py-3 px-4 text-left font-semibold">Supplier Name</th>
                  <th className="py-3 px-3 text-left font-semibold">Reference</th>
                  <th className="py-3 px-3 text-left font-semibold">Date Received</th>
                  <th className="py-3 px-3 text-center font-semibold">Items</th>
                  <th className="py-3 px-4 text-right font-semibold">Total Cost</th>
                  <th className="py-3 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {filteredEntries.map(entry => (
                  <tr
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className="hover:bg-app-secondary/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-brand">
                      {entry.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-content-primary">
                      {entry.supplierName}
                    </td>
                    <td className="py-3 px-3 font-mono text-content-secondary">
                      {entry.referenceNumber}
                    </td>
                    <td className="py-3 px-3 text-content-secondary">
                      {formatDate(entry.date)} at {formatTime(entry.date)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {entry.items.reduce((acc, it) => acc + it.quantity, 0)} units ({entry.items.length} SKUs)
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-content-primary">
                      {formatPKR(entry.totalCost)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedEntry(entry);
                        }}
                        className="px-2.5 py-1 rounded bg-app-secondary hover:bg-brand-soft hover:text-brand text-[11px] font-medium transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Stock Entry Modal */}
      {isNewEntryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-app-surface rounded-xl border border-app-border shadow-elevated overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-app-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-content-primary">New Stock Entry</h3>
                  <p className="text-xs text-content-secondary">Receive incoming supplier goods into store.</p>
                </div>
              </div>
              <button onClick={() => setIsNewEntryOpen(false)} className="text-content-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEntry} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-content-primary mb-1">Supplier *</label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={e => setSupplierName(e.target.value)}
                    className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block font-medium text-content-primary mb-1">PO / Reference *</label>
                  <input
                    type="text"
                    required
                    value={referenceNumber}
                    onChange={e => setReferenceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand font-mono"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-content-primary uppercase tracking-wider text-[11px]">
                    Products in Batch ({entryItems.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItemToEntry}
                    className="text-xs text-brand hover:underline font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Item</span>
                  </button>
                </div>

                <div className="space-y-2 border border-app-border rounded-lg p-3 bg-app-secondary/20">
                  {entryItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-app-surface border border-app-border flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs"
                    >
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-[10px] text-content-secondary mb-0.5">Product</label>
                        <select
                          value={item.product.id}
                          onChange={e => handleItemProductChange(idx, e.target.value)}
                          className="w-full px-2 py-1.5 bg-app-secondary border border-app-border rounded text-xs outline-none"
                        >
                          {products.slice(0, 100).map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24">
                        <label className="block text-[10px] text-content-secondary mb-0.5">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleItemQtyChange(idx, parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-app-secondary border border-app-border rounded text-xs font-mono"
                        />
                      </div>

                      <div className="w-28">
                        <label className="block text-[10px] text-content-secondary mb-0.5">Unit Cost (PKR)</label>
                        <input
                          type="number"
                          min="0"
                          value={item.buyingCost}
                          onChange={e => handleItemCostChange(idx, parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-app-secondary border border-app-border rounded text-xs font-mono"
                        />
                      </div>

                      <div className="w-24 text-right pt-4 font-mono font-bold text-content-primary">
                        {formatPKR(item.quantity * item.buyingCost)}
                      </div>

                      {entryItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-content-secondary hover:text-status-danger self-end sm:self-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-content-primary mb-1">Receipt Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-app-border">
                <div>
                  <span className="text-content-secondary">Total Purchase Value:</span>
                  <div className="text-base font-bold font-mono text-brand">
                    {formatPKR(totalCost)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewEntryOpen(false)}
                    className="px-3.5 py-2 rounded-lg bg-app-secondary text-content-secondary hover:text-content-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-brand text-white font-medium hover:bg-brand-dark shadow-subtle flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Receive & Update Inventory</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Entry Detail View Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-app-surface rounded-xl border border-app-border shadow-elevated overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-app-border">
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-brand" />
                <div>
                  <h3 className="text-sm font-semibold text-content-primary font-mono">{selectedEntry.id}</h3>
                  <p className="text-xs text-content-secondary">{selectedEntry.supplierName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="text-content-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-app-secondary/40 border border-app-border">
                <div>
                  <span className="text-content-secondary">Reference PO:</span>
                  <div className="font-mono font-medium text-content-primary">{selectedEntry.referenceNumber}</div>
                </div>
                <div>
                  <span className="text-content-secondary">Received On:</span>
                  <div>{formatDate(selectedEntry.date)}</div>
                </div>
                <div>
                  <span className="text-content-secondary">Received By:</span>
                  <div>{selectedEntry.receivedBy}</div>
                </div>
                <div>
                  <span className="text-content-secondary">Total Value:</span>
                  <div className="font-mono font-bold text-brand">{formatPKR(selectedEntry.totalCost)}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-content-primary uppercase tracking-wider text-[11px] mb-2">
                  Received Items ({selectedEntry.items.length})
                </h4>
                <div className="border border-app-border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-app-secondary text-content-secondary border-b border-app-border">
                      <tr>
                        <th className="py-2 px-3 text-left">Item</th>
                        <th className="py-2 px-3 text-center">Qty</th>
                        <th className="py-2 px-3 text-right">Cost</th>
                        <th className="py-2 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border">
                      {selectedEntry.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3">
                            <div className="font-medium text-content-primary">{it.productName}</div>
                            <div className="text-[10px] font-mono text-content-secondary">{it.sku}</div>
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold">{it.quantity}</td>
                          <td className="py-2 px-3 text-right font-mono">{formatPKR(it.buyingCost)}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{formatPKR(it.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedEntry.notes && (
                <div className="p-2.5 rounded bg-app-secondary/30 text-content-secondary text-[11px]">
                  <b>Notes:</b> {selectedEntry.notes}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-app-border text-right">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-1.5 rounded-lg bg-app-secondary text-content-secondary text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

