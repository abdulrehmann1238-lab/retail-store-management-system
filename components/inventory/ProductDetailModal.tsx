'use client';

import React from 'react';
import {
  X,
  Package,
  Barcode,
  Layers,
  Calendar,
  AlertTriangle,
  Plus,
  Edit,
  Tag,
  Shield,
  Printer,
} from 'lucide-react';
import { Product } from '@/types';
import { useStore } from '@/lib/store';
import { formatPKR, formatDate, formatDateTime } from '@/lib/utils';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onRestock: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
  onRestock,
}) => {
  const { currentRole, invoices } = useStore();

  if (!isOpen || !product) return null;

  // Find recent transactions containing this product
  const recentSalesWithProduct = invoices
    .filter(inv => inv.items.some(it => it.productId === product.id))
    .slice(0, 5);

  const isLowStock = product.stockQuantity <= product.reorderLevel;
  const isOutOfStock = product.stockQuantity === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-app-surface rounded-xl border border-app-border shadow-elevated overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-app-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-content-primary">{product.name}</h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    isOutOfStock
                      ? 'bg-status-dangerSoft text-status-danger'
                      : isLowStock
                      ? 'bg-status-warningSoft text-status-warning'
                      : 'bg-status-successSoft text-status-success'
                  }`}
                >
                  {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                </span>
              </div>
              <p className="text-xs text-content-secondary font-mono">{product.sku} • {product.category}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                onEdit(product);
                onClose();
              }}
              className="p-1.5 rounded-lg text-content-secondary hover:text-content-primary hover:bg-app-secondary transition-colors"
              title="Edit Product"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-content-secondary hover:text-content-primary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Key metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-app-secondary/40 border border-app-border">
              <span className="text-[10px] text-content-secondary uppercase tracking-wider block mb-1">
                Selling Price
              </span>
              <div className="text-sm font-bold font-mono text-content-primary">
                {formatPKR(product.sellingPrice)}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-app-secondary/40 border border-app-border">
              <span className="text-[10px] text-content-secondary uppercase tracking-wider block mb-1">
                Buying Cost
              </span>
              {currentRole === 'admin' ? (
                <div className="text-sm font-bold font-mono text-brand">
                  {formatPKR(product.buyingPrice)}
                </div>
              ) : (
                <div className="text-xs text-content-muted font-mono">[Staff Hidden]</div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-app-secondary/40 border border-app-border">
              <span className="text-[10px] text-content-secondary uppercase tracking-wider block mb-1">
                Units in Stock
              </span>
              <div className={`text-sm font-bold font-mono ${isOutOfStock ? 'text-status-danger' : isLowStock ? 'text-status-warning' : 'text-content-primary'}`}>
                {product.stockQuantity} units
              </div>
            </div>

            <div className="p-3 rounded-lg bg-app-secondary/40 border border-app-border">
              <span className="text-[10px] text-content-secondary uppercase tracking-wider block mb-1">
                Reorder Level
              </span>
              <div className="text-sm font-mono text-content-primary">
                {product.reorderLevel} units
              </div>
            </div>
          </div>

          {/* Description & specs */}
          <div className="p-3.5 rounded-lg bg-app-secondary/30 border border-app-border space-y-1.5">
            <h4 className="font-semibold text-content-primary">Product Details</h4>
            <p className="text-content-secondary leading-relaxed">
              {product.description || 'Premium retail accessories stock.'}
            </p>
            <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-content-secondary">
              <span>Brand: <b className="text-content-primary">{product.brand}</b></span>
              <span>Category: <b className="text-content-primary">{product.category}</b></span>
              <span>Updated: <b className="text-content-primary">{formatDate(product.updatedAt)}</b></span>
            </div>
          </div>

          {/* Barcode Sticker Preview */}
          <div className="p-4 rounded-xl border border-dashed border-app-border bg-app-surface text-center space-y-2">
            <span className="text-[11px] font-mono text-content-secondary uppercase tracking-wider block">
              Shelf Label / Barcode
            </span>
            <div className="inline-block px-4 py-2 bg-white border border-black/10 rounded-md shadow-xs">
              <div className="text-[10px] font-bold text-black">{product.name}</div>
              <div className="font-mono text-xs tracking-widest text-black my-1 font-bold">
                ||| | |||| | ||||| ||| |
              </div>
              <div className="font-mono text-[10px] text-black tracking-wider">
                {product.barcode} • {formatPKR(product.sellingPrice)}
              </div>
            </div>
          </div>

          {/* Movement history */}
          <div>
            <h4 className="font-semibold text-content-primary mb-2">Recent Counter Sales</h4>
            {recentSalesWithProduct.length === 0 ? (
              <p className="text-content-secondary italic">No recent counter sales recorded yet.</p>
            ) : (
              <div className="border border-app-border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-app-secondary text-content-secondary border-b border-app-border">
                    <tr>
                      <th className="py-2 px-3 text-left">Invoice</th>
                      <th className="py-2 px-3 text-left">Customer</th>
                      <th className="py-2 px-3 text-center">Qty Sold</th>
                      <th className="py-2 px-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app-border">
                    {recentSalesWithProduct.map(inv => {
                      const line = inv.items.find(it => it.productId === product.id);
                      return (
                        <tr key={inv.id}>
                          <td className="py-2 px-3 font-mono font-medium text-brand">{inv.id}</td>
                          <td className="py-2 px-3">{inv.customer.name}</td>
                          <td className="py-2 px-3 text-center font-mono font-bold">{line?.quantity || 1}</td>
                          <td className="py-2 px-3 text-right text-content-secondary">{formatDate(inv.date)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-app-border bg-app-secondary/30 flex items-center justify-between">
          <button
            onClick={() => {
              onRestock(product);
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-brand text-white font-medium hover:bg-brand-dark flex items-center gap-1.5 shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Restock Inventory</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-content-secondary hover:text-content-primary bg-app-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

