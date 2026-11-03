'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, FileText, Users, ArrowRight, CornerDownLeft, X, Layers } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatPKR } from '@/lib/utils';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { products, invoices, customers, currentRole } = useStore();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Static navigation routes
  const navigationItems = [
    { title: 'Overview Dashboard', href: '/app', icon: Layers, group: 'Navigation' },
    { title: 'Point of Sale (POS)', href: '/app/pos', icon: Layers, group: 'Navigation' },
    { title: 'Inventory Management', href: '/app/inventory', icon: Layers, group: 'Navigation' },
    { title: 'Product Catalog', href: '/app/products', icon: Layers, group: 'Navigation' },
    { title: 'Stock Entries & Purchases', href: '/app/purchases', icon: Layers, group: 'Navigation' },
    { title: 'Sales Invoices', href: '/app/invoices', icon: Layers, group: 'Navigation' },
    { title: 'Returns & Refunds', href: '/app/returns', icon: Layers, group: 'Navigation' },
    { title: 'Customer Directory', href: '/app/customers', icon: Layers, group: 'Navigation' },
    ...(currentRole === 'admin'
      ? [{ title: 'Financial Reports & Profit', href: '/app/reports', icon: Layers, group: 'Navigation' }]
      : []),
    { title: 'Activity Log', href: '/app/activity', icon: Layers, group: 'Navigation' },
    { title: 'Store Settings', href: '/app/settings', icon: Layers, group: 'Navigation' },
  ];

  const trimmed = query.trim().toLowerCase();

  // Filter items
  const matchedNav = navigationItems.filter(item =>
    item.title.toLowerCase().includes(trimmed)
  );

  const matchedProducts = query.length >= 2
    ? products
        .filter(
          p =>
            p.name.toLowerCase().includes(trimmed) ||
            p.sku.toLowerCase().includes(trimmed) ||
            p.barcode.includes(trimmed) ||
            p.category.toLowerCase().includes(trimmed)
        )
        .slice(0, 5)
    : [];

  const matchedInvoices = query.length >= 2
    ? invoices
        .filter(
          inv =>
            inv.id.toLowerCase().includes(trimmed) ||
            inv.customer.name.toLowerCase().includes(trimmed) ||
            inv.customer.phone.includes(trimmed)
        )
        .slice(0, 4)
    : [];

  const matchedCustomers = query.length >= 2
    ? customers
        .filter(
          c =>
            c.name.toLowerCase().includes(trimmed) ||
            c.phone.includes(trimmed) ||
            c.city.toLowerCase().includes(trimmed)
        )
        .slice(0, 4)
    : [];

  // Flattened items list for keyboard navigation
  const flatResults: Array<{
    id: string;
    title: string;
    subtitle: string;
    category: string;
    action: () => void;
  }> = [];

  if (trimmed.length > 0) {
    matchedNav.forEach(item => {
      flatResults.push({
        id: `nav-${item.href}`,
        title: item.title,
        subtitle: item.href,
        category: 'Pages',
        action: () => {
          router.push(item.href);
          onClose();
        },
      });
    });
  }

  matchedProducts.forEach(prod => {
    flatResults.push({
      id: `prod-${prod.id}`,
      title: prod.name,
      subtitle: `${prod.sku} • ${formatPKR(prod.sellingPrice)} • Stock: ${prod.stockQuantity}`,
      category: 'Products',
      action: () => {
        router.push(`/app/inventory?search=${encodeURIComponent(prod.sku)}`);
        onClose();
      },
    });
  });

  matchedInvoices.forEach(inv => {
    flatResults.push({
      id: `inv-${inv.id}`,
      title: `${inv.id} — ${inv.customer.name}`,
      subtitle: `${formatPKR(inv.total)} • ${inv.paymentMethod} • ${inv.status}`,
      category: 'Invoices',
      action: () => {
        router.push(`/app/invoices?search=${encodeURIComponent(inv.id)}`);
        onClose();
      },
    });
  });

  matchedCustomers.forEach(cust => {
    flatResults.push({
      id: `cust-${cust.id}`,
      title: cust.name,
      subtitle: `${cust.phone} • ${cust.city} • Total spent: ${formatPKR(cust.totalSpent)}`,
      category: 'Customers',
      action: () => {
        router.push(`/app/customers?search=${encodeURIComponent(cust.name)}`);
        onClose();
      },
    });
  });

  // Handle arrow keys
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < flatResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : flatResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatResults[selectedIndex]) {
        flatResults[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl bg-app-surface rounded-xl border border-app-border shadow-elevated overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-app-border bg-app-surface">
          <Search className="w-5 h-5 text-content-secondary mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search products, SKUs, invoices, customers, or pages..."
            className="w-full bg-transparent text-sm text-content-primary placeholder-content-muted outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-content-secondary hover:text-content-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 ml-2 text-[10px] font-mono text-content-secondary bg-app-secondary border border-app-border rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-app-border/40">
          {flatResults.length === 0 ? (
            <div className="py-12 text-center">
              {query ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-content-primary">No results found for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-content-secondary">
                    Try searching for a product name, SKU (e.g. &ldquo;CHG-020&rdquo;), barcode, or customer name.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-content-secondary">
                    Quick Navigation
                  </p>
                  <div className="grid grid-cols-2 gap-2 px-4 max-w-md mx-auto text-left">
                    {navigationItems.slice(0, 6).map(item => (
                      <button
                        key={item.href}
                        onClick={() => {
                          router.push(item.href);
                          onClose();
                        }}
                        className="flex items-center gap-2 p-2 rounded-lg text-xs text-content-primary hover:bg-app-secondary transition-colors"
                      >
                        <item.icon className="w-3.5 h-3.5 text-brand" />
                        <span>{item.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {flatResults.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-brand-soft text-brand'
                        : 'text-content-primary hover:bg-app-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div
                        className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-brand text-white' : 'bg-app-secondary text-content-secondary'
                        }`}
                      >
                        {item.category === 'Products' && <Package className="w-4 h-4" />}
                        {item.category === 'Invoices' && <FileText className="w-4 h-4" />}
                        {item.category === 'Customers' && <Users className="w-4 h-4" />}
                        {item.category === 'Pages' && <Layers className="w-4 h-4" />}
                      </div>
                      <div className="truncate">
                        <div className="text-sm font-medium leading-tight truncate">
                          {item.title}
                        </div>
                        <div className="text-xs text-content-secondary truncate">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-app-secondary text-content-secondary border border-app-border">
                        {item.category}
                      </span>
                      {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-brand" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-app-border bg-app-secondary/50 text-[11px] text-content-secondary">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 font-mono bg-app-surface border border-app-border rounded">↑</kbd>{' '}
              <kbd className="px-1.5 py-0.5 font-mono bg-app-surface border border-app-border rounded">↓</kbd> Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 font-mono bg-app-surface border border-app-border rounded">↵</kbd> Select
            </span>
          </div>
          <span>STOCKROOM OmniSearch</span>
        </div>
      </div>
    </div>
  );
};

