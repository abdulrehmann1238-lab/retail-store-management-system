'use client';

import React, { useState } from 'react';
import { X, Plus, Package } from 'lucide-react';
import { Product } from '@/types';
import { useStore } from '@/lib/store';
import { formatPKR } from '@/lib/utils';

interface AddStockModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AddStockModal: React.FC<AddStockModalProps> = ({ product, isOpen, onClose }) => {
  const { addStock, currentRole } = useStore();
  const [quantity, setQuantity] = useState(25);
  const [costPrice, setCostPrice] = useState(product?.buyingPrice || 0);
  const [notes, setNotes] = useState('Immediate retail shelf replenishment.');

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;
    addStock(product.id, quantity, currentRole === 'admin' ? costPrice : undefined, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-app-surface rounded-xl border border-app-border shadow-elevated overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-app-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-content-primary">Quick Restock</h3>
              <p className="text-xs text-content-secondary truncate max-w-[240px]">{product.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-content-secondary hover:text-content-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 rounded-lg bg-app-secondary/50 border border-app-border text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-content-secondary">Product SKU:</span>
              <span className="font-mono font-medium text-content-primary">{product.sku}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-content-secondary">Current Stock:</span>
              <span className="font-semibold text-status-warning">{product.stockQuantity} units</span>
            </div>
            <div className="flex justify-between">
              <span className="text-content-secondary">Reorder Threshold:</span>
              <span className="text-content-primary">{product.reorderLevel} units</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-content-primary mb-1">
              Quantity to Receive (Units) *
            </label>
            <input
              type="number"
              min="1"
              max="5000"
              value={quantity}
              onChange={e => setQuantity(parseInt(e.target.value) || 0)}
              required
              className="w-full px-3 py-2 text-sm bg-app-surface border border-app-border rounded-lg outline-none focus:border-brand"
            />
          </div>

          {currentRole === 'admin' && (
            <div>
              <label className="block text-xs font-medium text-content-primary mb-1">
                Unit Buying Cost (PKR)
              </label>
              <input
                type="number"
                min="0"
                value={costPrice}
                onChange={e => setCostPrice(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm bg-app-surface border border-app-border rounded-lg outline-none focus:border-brand font-mono"
              />
              <span className="text-[11px] text-content-muted mt-0.5 block">
                Last recorded buying cost: {formatPKR(product.buyingPrice)}
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-content-primary mb-1">
              Stock Receipt Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Received from Karachi distributor"
              className="w-full px-3 py-2 text-sm bg-app-surface border border-app-border rounded-lg outline-none focus:border-brand"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-app-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-content-secondary hover:text-content-primary bg-app-secondary rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-brand hover:bg-brand-dark rounded-lg shadow-subtle transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Confirm Stock Addition</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

