'use client';

import React, { useState, useEffect } from 'react';
import { X, Package, Sparkles } from 'lucide-react';
import { Product, ProductCategory } from '@/types';
import { useStore } from '@/lib/store';

interface ProductFormModalProps {
  product: Product | null; // null means Add new
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: ProductCategory[] = [
  'Chargers & Adapters',
  'Audio & Earbuds',
  'Cables & Data',
  'Power Banks',
  'Cases & Protection',
  'Car Accessories',
  'Mounts & Stands',
  'Smart Wearables',
  'Gaming Accessories',
  'Other Accessories',
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { addProduct, updateProduct, currentRole, products } = useStore();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Chargers & Adapters');
  const [brand, setBrand] = useState('Anker');
  const [buyingPrice, setBuyingPrice] = useState(650);
  const [sellingPrice, setSellingPrice] = useState(1150);
  const [stockQuantity, setStockQuantity] = useState(25);
  const [reorderLevel, setReorderLevel] = useState(10);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSku(product.sku);
      setBarcode(product.barcode);
      setCategory(product.category);
      setBrand(product.brand);
      setBuyingPrice(product.buyingPrice);
      setSellingPrice(product.sellingPrice);
      setStockQuantity(product.stockQuantity);
      setReorderLevel(product.reorderLevel);
      setDescription(product.description || '');
    } else {
      setName('');
      // Auto generate SKU & barcode
      const nextNum = products.length + 1;
      setSku(`CHG-${String(nextNum).padStart(3, '0')}`);
      setBarcode(`89012345${String(67000 + nextNum).slice(-5)}`);
      setCategory('Chargers & Adapters');
      setBrand('Anker');
      setBuyingPrice(650);
      setSellingPrice(1150);
      setStockQuantity(25);
      setReorderLevel(10);
      setDescription('');
    }
  }, [product, products.length, isOpen]);

  if (!isOpen) return null;

  const handleGenerateSku = () => {
    const prefix = category.substring(0, 3).toUpperCase();
    const rand = Math.floor(100 + Math.random() * 900);
    setSku(`${prefix}-${rand}`);
    setBarcode(`89012345${String(Math.floor(10000 + Math.random() * 89999))}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    if (product) {
      updateProduct(product.id, {
        name,
        sku,
        barcode,
        category,
        brand,
        buyingPrice: currentRole === 'admin' ? buyingPrice : product.buyingPrice,
        sellingPrice,
        stockQuantity,
        reorderLevel,
        description,
      });
    } else {
      addProduct({
        name,
        sku,
        barcode,
        category,
        brand,
        buyingPrice: currentRole === 'admin' ? buyingPrice : Math.round(sellingPrice * 0.65),
        sellingPrice,
        stockQuantity,
        reorderLevel,
        description,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-app-surface rounded-xl border border-app-border shadow-elevated overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-app-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-content-primary">
                {product ? 'Edit Product' : 'Add New Product'}
              </h3>
              <p className="text-xs text-content-secondary">
                {product ? `Update ${product.sku}` : 'Add a new accessory to catalog'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-content-secondary hover:text-content-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-medium text-content-primary mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Anker 20W USB-C Nano Charger (Black)"
              className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-content-primary">SKU Code *</label>
                <button
                  type="button"
                  onClick={handleGenerateSku}
                  className="text-[10px] text-brand hover:underline flex items-center gap-0.5"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Generate</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={sku}
                onChange={e => setSku(e.target.value.toUpperCase())}
                placeholder="e.g. CHG-020"
                className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand font-mono text-xs uppercase"
              />
            </div>

            <div>
              <label className="block font-medium text-content-primary mb-1">Barcode / EAN *</label>
              <input
                type="text"
                required
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                placeholder="8901234567012"
                className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-content-primary mb-1">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand text-xs"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-content-primary mb-1">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="e.g. Anker, Baseus, Joyroom"
                className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {currentRole === 'admin' ? (
              <div>
                <label className="block font-medium text-content-primary mb-1">
                  Buying Price (PKR) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={buyingPrice}
                  onChange={e => setBuyingPrice(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand font-mono text-xs"
                />
              </div>
            ) : (
              <div>
                <label className="block font-medium text-content-secondary mb-1">Buying Price</label>
                <div className="px-3 py-2 bg-app-secondary border border-app-border rounded-lg text-content-muted font-mono">
                  [Admin Only]
                </div>
              </div>
            )}

            <div>
              <label className="block font-medium text-content-primary mb-1">
                Selling Price (PKR) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={sellingPrice}
                onChange={e => setSellingPrice(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-content-primary mb-1">Stock Quantity *</label>
              <input
                type="number"
                required
                min="0"
                value={stockQuantity}
                onChange={e => setStockQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-content-primary mb-1">Reorder Level *</label>
              <input
                type="number"
                required
                min="1"
                value={reorderLevel}
                onChange={e => setReorderLevel(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-content-primary mb-1">Description / Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Technical specifications, packaging notes, warranty terms..."
              className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand text-xs resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-app-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-content-secondary hover:text-content-primary bg-app-secondary rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-dark rounded-lg shadow-subtle"
            >
              {product ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

