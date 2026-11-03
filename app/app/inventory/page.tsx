'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Boxes,
  Plus,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  Package,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useStore } from '@/lib/store';
import { Product, ProductCategory } from '@/types';
import { formatPKR, formatDate, exportToCSV } from '@/lib/utils';
import { ExcelImportModal } from '@/components/inventory/ExcelImportModal';
import { ProductFormModal } from '@/components/inventory/ProductFormModal';
import { ProductDetailModal } from '@/components/inventory/ProductDetailModal';
import { AddStockModal } from '@/components/dashboard/AddStockModal';

function InventoryContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || 'all';

  const { products, deleteProduct, currentRole } = useStore();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [sortField, setSortField] = useState<'name' | 'stock' | 'price' | 'sku'>('name');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Modals state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);

  // Stats
  const totalUnits = useMemo(() => {
    return products.reduce((acc, p) => acc + p.stockQuantity, 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter(p => p.stockQuantity <= p.reorderLevel && p.stockQuantity > 0).length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter(p => p.stockQuantity === 0).length;
  }, [products]);

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products
      .filter(p => {
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesSearch =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.barcode.includes(q) ||
          p.brand.toLowerCase().includes(q);

        let matchesStatus = true;
        if (statusFilter === 'low') {
          matchesStatus = p.stockQuantity <= p.reorderLevel && p.stockQuantity > 0;
        } else if (statusFilter === 'out') {
          matchesStatus = p.stockQuantity === 0;
        } else if (statusFilter === 'in') {
          matchesStatus = p.stockQuantity > p.reorderLevel;
        }

        return matchesCategory && matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'name') comp = a.name.localeCompare(b.name);
        else if (sortField === 'stock') comp = a.stockQuantity - b.stockQuantity;
        else if (sortField === 'price') comp = a.sellingPrice - b.sellingPrice;
        else if (sortField === 'sku') comp = a.sku.localeCompare(b.sku);
        return sortAsc ? comp : -comp;
      });
  }, [products, searchQuery, selectedCategory, statusFilter, sortField, sortAsc]);

  // Paginated records
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Export full inventory to CSV
  const handleExportInventory = () => {
    const rows = filteredProducts.map(p => ({
      'Product ID': p.id,
      Name: p.name,
      SKU: p.sku,
      Barcode: p.barcode,
      Category: p.category,
      Brand: p.brand,
      'Buying Price (PKR)': currentRole === 'admin' ? p.buyingPrice : 'RESTRICTED',
      'Selling Price (PKR)': p.sellingPrice,
      'Stock Quantity': p.stockQuantity,
      'Reorder Level': p.reorderLevel,
      Status:
        p.stockQuantity === 0
          ? 'Out of Stock'
          : p.stockQuantity <= p.reorderLevel
          ? 'Low Stock'
          : 'In Stock',
    }));

    exportToCSV(`STOCKROOM_Inventory_Catalog_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  const handleSortToggle = (field: 'name' | 'stock' | 'price' | 'sku') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header & Main Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-content-primary">
              Inventory Management
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
              Manage stock levels, SKUs, reorder thresholds and bulk Excel updates.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-app-border bg-app-surface hover:bg-app-secondary text-xs font-medium text-content-primary transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-brand" />
              <span>Import Excel</span>
            </button>

            <button
              onClick={handleExportInventory}
              className="px-3 py-1.5 rounded-lg border border-app-border bg-app-surface hover:bg-app-secondary text-xs font-medium text-content-primary transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-content-secondary" />
              <span>Export</span>
            </button>

            {currentRole === 'admin' && (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductFormOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs font-medium shadow-subtle transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Compact Inventory Statistic Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-app-surface border border-app-border shadow-subtle">
            <span className="text-xs font-medium text-content-secondary uppercase tracking-wider block mb-1">
              Total Products
            </span>
            <div className="text-2xl font-bold font-mono text-content-primary">
              {products.length}
            </div>
            <span className="text-[11px] text-content-secondary">Across 10 categories</span>
          </div>

          <div className="p-4 rounded-xl bg-app-surface border border-app-border shadow-subtle">
            <span className="text-xs font-medium text-content-secondary uppercase tracking-wider block mb-1">
              Total Units in Stock
            </span>
            <div className="text-2xl font-bold font-mono text-content-primary">
              {totalUnits.toLocaleString()}
            </div>
            <span className="text-[11px] text-content-secondary">Verified physical items</span>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'low' ? 'all' : 'low')}
            className={`p-4 rounded-xl border shadow-subtle cursor-pointer transition-all ${
              statusFilter === 'low'
                ? 'bg-status-warningSoft border-status-warning ring-2 ring-status-warning/20'
                : 'bg-app-surface border-app-border hover:border-status-warning/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-status-warning uppercase tracking-wider block mb-1">
                Low Stock
              </span>
              <AlertTriangle className="w-4 h-4 text-status-warning" />
            </div>
            <div className="text-2xl font-bold font-mono text-status-warning">
              {lowStockCount}
            </div>
            <span className="text-[11px] text-content-secondary">Below reorder alert point</span>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'out' ? 'all' : 'out')}
            className={`p-4 rounded-xl border shadow-subtle cursor-pointer transition-all ${
              statusFilter === 'out'
                ? 'bg-status-dangerSoft border-status-danger ring-2 ring-status-danger/20'
                : 'bg-app-surface border-app-border hover:border-status-danger/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-status-danger uppercase tracking-wider block mb-1">
                Out of Stock
              </span>
              <AlertTriangle className="w-4 h-4 text-status-danger" />
            </div>
            <div className="text-2xl font-bold font-mono text-status-danger">
              {outOfStockCount}
            </div>
            <span className="text-[11px] text-content-secondary">Needs supplier reorder</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-xl bg-app-surface border border-app-border shadow-subtle space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-content-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search products by title, SKU, barcode, brand..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand text-content-primary"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
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

            {/* Stock status filter */}
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand text-content-primary"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in">In Stock (Healthy)</option>
              <option value="low">Low Stock Alerts</option>
              <option value="out">Out of Stock</option>
            </select>

            {/* Page size */}
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand text-content-primary"
            >
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-app-surface border border-app-border rounded-xl shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-app-secondary/50 text-content-secondary border-b border-app-border select-none">
                <tr>
                  <th
                    onClick={() => handleSortToggle('name')}
                    className="py-3 px-4 text-left font-semibold cursor-pointer hover:text-content-primary"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Product Name</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortToggle('sku')}
                    className="py-3 px-3 text-left font-semibold cursor-pointer hover:text-content-primary"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>SKU</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-left font-semibold">Barcode</th>
                  <th className="py-3 px-3 text-left font-semibold">Category</th>
                  {currentRole === 'admin' ? (
                    <th className="py-3 px-3 text-right font-semibold">Buying Cost</th>
                  ) : (
                    <th className="py-3 px-3 text-right font-semibold text-content-muted">
                      Cost [Hidden]
                    </th>
                  )}
                  <th
                    onClick={() => handleSortToggle('price')}
                    className="py-3 px-3 text-right font-semibold cursor-pointer hover:text-content-primary"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Selling Price</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortToggle('stock')}
                    className="py-3 px-3 text-center font-semibold cursor-pointer hover:text-content-primary"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Stock Qty</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-center font-semibold">Status</th>
                  <th className="py-3 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-content-secondary">
                      No products matching your search or filters.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map(prod => {
                    const isOutOfStock = prod.stockQuantity === 0;
                    const isLowStock = prod.stockQuantity <= prod.reorderLevel;

                    return (
                      <tr
                        key={prod.id}
                        className="hover:bg-app-secondary/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div
                            onClick={() => setInspectingProduct(prod)}
                            className="font-medium text-content-primary hover:text-brand cursor-pointer truncate max-w-xs"
                          >
                            {prod.name}
                          </div>
                          <span className="text-[11px] text-content-secondary">
                            Brand: {prod.brand}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-medium text-brand">
                          {prod.sku}
                        </td>
                        <td className="py-3 px-3 font-mono text-content-secondary text-[11px]">
                          {prod.barcode}
                        </td>
                        <td className="py-3 px-3 text-content-secondary whitespace-nowrap">
                          {prod.category}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          {currentRole === 'admin' ? (
                            <span className="text-content-secondary">{formatPKR(prod.buyingPrice)}</span>
                          ) : (
                            <span className="text-content-muted">[Admin]</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-content-primary">
                          {formatPKR(prod.sellingPrice)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold">
                          <span
                            className={
                              isOutOfStock
                                ? 'text-status-danger'
                                : isLowStock
                                ? 'text-status-warning'
                                : 'text-content-primary'
                            }
                          >
                            {prod.stockQuantity}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                              isOutOfStock
                                ? 'bg-status-dangerSoft text-status-danger'
                                : isLowStock
                                ? 'bg-status-warningSoft text-status-warning'
                                : 'bg-status-successSoft text-status-success'
                            }`}
                          >
                            {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setRestockProduct(prod)}
                              className="px-2 py-1 rounded bg-brand-soft text-brand hover:bg-brand/20 text-[11px] font-medium transition-colors"
                              title="Add Stock"
                            >
                              + Stock
                            </button>
                            <button
                              onClick={() => setInspectingProduct(prod)}
                              className="p-1 rounded text-content-secondary hover:text-content-primary hover:bg-app-secondary"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {currentRole === 'admin' && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingProduct(prod);
                                    setIsProductFormOpen(true);
                                  }}
                                  className="p-1 rounded text-content-secondary hover:text-content-primary hover:bg-app-secondary"
                                  title="Edit"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete ${prod.name} from catalog?`)) {
                                      deleteProduct(prod.id);
                                    }
                                  }}
                                  className="p-1 rounded text-content-secondary hover:text-status-danger hover:bg-status-dangerSoft"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-5 py-3 border-t border-app-border bg-app-secondary/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-content-secondary">
            <div>
              Showing {Math.min(filteredProducts.length, (currentPage - 1) * pageSize + 1)} to{' '}
              {Math.min(filteredProducts.length, currentPage * pageSize)} of {filteredProducts.length} items
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded bg-app-surface border border-app-border disabled:opacity-40 hover:bg-app-secondary transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="font-mono text-content-primary px-2">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded bg-app-surface border border-app-border disabled:opacity-40 hover:bg-app-secondary transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        product={editingProduct}
        isOpen={isProductFormOpen}
        onClose={() => {
          setIsProductFormOpen(false);
          setEditingProduct(null);
        }}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={inspectingProduct}
        isOpen={!!inspectingProduct}
        onClose={() => setInspectingProduct(null)}
        onEdit={p => {
          setEditingProduct(p);
          setIsProductFormOpen(true);
        }}
        onRestock={p => setRestockProduct(p)}
      />

      {/* Quick Restock Modal */}
      <AddStockModal
        product={restockProduct}
        isOpen={!!restockProduct}
        onClose={() => setRestockProduct(null)}
      />
    </AppLayout>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-content-secondary">Loading inventory...</div>}>
      <InventoryContent />
    </Suspense>
  );
}
