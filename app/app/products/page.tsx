'use client';

import React, { useState, useMemo } from 'react';
import {
  Package,
  Barcode,
  Grid,
  List,
  Search,
  Printer,
  Plus,
  Eye,
  Edit,
  Tag,
  Shield,
  Layers,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useStore } from '@/lib/store';
import { Product } from '@/types';
import { formatPKR } from '@/lib/utils';
import { ProductFormModal } from '@/components/inventory/ProductFormModal';
import { ProductDetailModal } from '@/components/inventory/ProductDetailModal';
import { AddStockModal } from '@/components/dashboard/AddStockModal';

export default function ProductsPage() {
  const { products, currentRole } = useStore();
  const [viewMode, setViewMode] = useState<'grid' | 'labels'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter(p => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.brand.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  const handlePrintLabels = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-content-primary">
              Product & Barcode Management
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
              Review retail catalog items, SKU codes and generate shelf barcode tags.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center p-1 rounded-lg bg-app-secondary border border-app-border text-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-app-surface text-brand font-semibold shadow-xs'
                    : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Card View</span>
              </button>
              <button
                onClick={() => setViewMode('labels')}
                className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  viewMode === 'labels'
                    ? 'bg-app-surface text-brand font-semibold shadow-xs'
                    : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                <Barcode className="w-3.5 h-3.5" />
                <span>Barcode Labels</span>
              </button>
            </div>

            {viewMode === 'labels' && (
              <button
                onClick={handlePrintLabels}
                className="px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs font-medium shadow-subtle transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Labels</span>
              </button>
            )}

            {currentRole === 'admin' && (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsFormOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs font-medium shadow-subtle transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Product</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-4 rounded-xl bg-app-surface border border-app-border shadow-subtle flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-content-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products by brand, title, SKU or barcode..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand text-content-primary"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand text-content-primary"
          >
            <option value="All">All Categories</option>
            <option value="Chargers & Adapters">Chargers & Adapters</option>
            <option value="Audio & Earbuds">Audio & Earbuds</option>
            <option value="Cables & Data">Cables & Data</option>
            <option value="Power Banks">Power Banks</option>
            <option value="Cases & Protection">Cases & Protection</option>
            <option value="Car Accessories">Car Accessories</option>
            <option value="Mounts & Stands">Mounts & Stands</option>
            <option value="Smart Wearables">Smart Wearables</option>
            <option value="Gaming Accessories">Gaming Accessories</option>
            <option value="Other Accessories">Other Accessories</option>
          </select>
        </div>

        {/* View Mode 1: Product Grid */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.slice(0, 48).map(prod => (
              <div
                key={prod.id}
                className="p-4 rounded-xl bg-app-surface border border-app-border hover:border-brand/40 hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-mono px-2 py-0.5 rounded bg-brand-soft text-brand font-semibold">
                      {prod.sku}
                    </span>
                    <span
                      className={`font-mono text-xs font-semibold ${
                        prod.stockQuantity === 0
                          ? 'text-status-danger'
                          : prod.stockQuantity <= prod.reorderLevel
                          ? 'text-status-warning'
                          : 'text-content-secondary'
                      }`}
                    >
                      {prod.stockQuantity} in stock
                    </span>
                  </div>

                  <h3
                    onClick={() => setSelectedProduct(prod)}
                    className="text-xs font-semibold text-content-primary hover:text-brand cursor-pointer line-clamp-2 leading-snug"
                  >
                    {prod.name}
                  </h3>

                  <div className="text-[11px] text-content-secondary mt-1 flex items-center justify-between">
                    <span>{prod.brand}</span>
                    <span className="font-mono">{prod.barcode}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-app-border/60 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold font-mono text-content-primary">
                      {formatPKR(prod.sellingPrice)}
                    </div>
                    {currentRole === 'admin' ? (
                      <div className="text-[10px] text-content-muted font-mono">
                        Cost: {formatPKR(prod.buyingPrice)}
                      </div>
                    ) : (
                      <div className="text-[10px] text-content-muted">[Staff Hidden]</div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedProduct(prod)}
                      className="p-1.5 rounded-lg bg-app-secondary hover:bg-brand-soft hover:text-brand text-content-secondary text-xs"
                      title="Inspect"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {currentRole === 'admin' && (
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setIsFormOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-app-secondary hover:bg-brand-soft hover:text-brand text-content-secondary text-xs"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Mode 2: Barcode Printable Sticker Sheet */}
        {viewMode === 'labels' && (
          <div className="p-6 rounded-xl bg-app-surface border border-app-border shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-app-border">
              <div>
                <h3 className="text-sm font-semibold text-content-primary">
                  Printable Shelf Tags Sheet (Standard Thermal / Adhesive Paper)
                </h3>
                <p className="text-xs text-content-secondary">
                  Ready to print with store pricing, SKU, and scannable barcode lines.
                </p>
              </div>
              <button
                onClick={handlePrintLabels}
                className="px-4 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-dark flex items-center gap-1.5 shadow-subtle"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print All Labels</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 print:grid-cols-3 print:gap-2">
              {filteredProducts.slice(0, 24).map(prod => (
                <div
                  key={prod.id}
                  className="p-3 border border-app-border rounded-lg bg-white text-black text-center space-y-1.5 shadow-xs"
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-black truncate">
                    STOCKROOM RETAIL
                  </div>
                  <div className="text-[11px] font-semibold text-black line-clamp-1">
                    {prod.name}
                  </div>
                  <div className="py-1">
                    <div className="font-mono text-sm tracking-widest font-bold select-all">
                      ||| | |||| | ||||| ||| |
                    </div>
                    <div className="font-mono text-[9px] text-gray-700">
                      {prod.barcode}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-black/10">
                    <span className="font-mono font-bold">{prod.sku}</span>
                    <span className="font-mono font-extrabold text-xs">{formatPKR(prod.sellingPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onEdit={p => {
          setEditingProduct(p);
          setIsFormOpen(true);
        }}
        onRestock={p => setRestockProduct(p)}
      />

      {/* Product Form Modal */}
      <ProductFormModal
        product={editingProduct}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
      />

      {/* Restock Modal */}
      <AddStockModal
        product={restockProduct}
        isOpen={!!restockProduct}
        onClose={() => setRestockProduct(null)}
      />
    </AppLayout>
  );
}

