'use client';

import React, { useState } from 'react';
import {
  Settings,
  Store,
  Receipt,
  Boxes,
  CreditCard,
  Users,
  Check,
  Shield,
  UserCheck,
  Save,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useStore } from '@/lib/store';

export default function SettingsPage() {
  const { settings, updateSettings, currentRole, setRole } = useStore();

  const [activeTab, setActiveTab] = useState<'store' | 'invoice' | 'inventory' | 'payment' | 'users'>('store');
  const [saveBanner, setSaveBanner] = useState(false);

  // Form states initialized with settings
  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [address, setAddress] = useState(settings.address);
  const [city, setCity] = useState(settings.city);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);

  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix);
  const [startingInvoiceNumber, setStartingInvoiceNumber] = useState(settings.startingInvoiceNumber);
  const [footerMessage, setFooterMessage] = useState(settings.footerMessage);
  const [thermalReceiptWidth, setThermalReceiptWidth] = useState(settings.thermalReceiptWidth);

  const [defaultLowStockThreshold, setDefaultLowStockThreshold] = useState(settings.defaultLowStockThreshold);
  const [taxRate, setTaxRate] = useState(settings.taxRate);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName,
      tagline,
      address,
      city,
      phone,
      email,
      invoicePrefix,
      startingInvoiceNumber,
      footerMessage,
      thermalReceiptWidth,
      defaultLowStockThreshold,
      taxRate,
    });

    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 3000);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-content-primary">
              Store Configuration & Settings
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
              Customize receipt formats, low-stock trigger points and cashier user roles.
            </p>
          </div>

          {saveBanner && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-status-successSoft text-status-success text-xs font-semibold animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Settings saved to local storage!</span>
            </div>
          )}
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-app-border overflow-x-auto pb-1 text-xs">
          {[
            { id: 'store', label: 'Store Profile', icon: Store },
            { id: 'invoice', label: 'Invoicing & Receipts', icon: Receipt },
            { id: 'inventory', label: 'Inventory Rules', icon: Boxes },
            { id: 'payment', label: 'Payment Methods', icon: CreditCard },
            { id: 'users', label: 'Staff & Roles', icon: Users },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-t-lg font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-brand text-brand font-semibold bg-app-surface'
                  : 'border-transparent text-content-secondary hover:text-content-primary'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* TAB 1: Store Profile */}
          {activeTab === 'store' && (
            <div className="p-6 rounded-xl bg-app-surface border border-app-border shadow-subtle space-y-4 text-xs">
              <h3 className="text-sm font-semibold text-content-primary">Physical Retail Profile</h3>
              <p className="text-content-secondary">
                This information appears on printed receipts and customer invoices.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-content-primary font-medium mb-1">Store Name</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={e => setStoreName(e.target.value)}
                    className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-content-primary font-medium mb-1">Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={e => setTagline(e.target.value)}
                    className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-content-primary font-medium mb-1">Shop Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-content-primary font-medium mb-1">City, Country</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-content-primary font-medium mb-1">Store Phone (+92)</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand font-mono"
                  />
                </div>

                <div>
                  <label className="block text-content-primary font-medium mb-1">Support Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Invoicing & Receipts */}
          {activeTab === 'invoice' && (
            <div className="p-6 rounded-xl bg-app-surface border border-app-border shadow-subtle space-y-4 text-xs">
              <h3 className="text-sm font-semibold text-content-primary">Receipt & Invoice Formatting</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-content-primary font-medium mb-1">Invoice Prefix</label>
                  <input
                    type="text"
                    value={invoicePrefix}
                    onChange={e => setInvoicePrefix(e.target.value)}
                    className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-content-primary font-medium mb-1">Thermal Paper Roll Width</label>
                  <select
                    value={thermalReceiptWidth}
                    onChange={e => setThermalReceiptWidth(e.target.value)}
                    className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand"
                  >
                    <option value="80mm">80mm (Standard POS Thermal Roll)</option>
                    <option value="58mm">58mm (Compact Mobile Roll)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-content-primary font-medium mb-1">
                    Receipt Footer Warranty Notice
                  </label>
                  <textarea
                    rows={2}
                    value={footerMessage}
                    onChange={e => setFooterMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Inventory Rules */}
          {activeTab === 'inventory' && (
            <div className="p-6 rounded-xl bg-app-surface border border-app-border shadow-subtle space-y-4 text-xs">
              <h3 className="text-sm font-semibold text-content-primary">Inventory & Reorder Rules</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-content-primary font-medium mb-1">
                    Default Low Stock Warning Threshold (Units)
                  </label>
                  <input
                    type="number"
                    value={defaultLowStockThreshold}
                    onChange={e => setDefaultLowStockThreshold(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand font-mono"
                  />
                  <span className="text-[11px] text-content-muted mt-1 block">
                    Products with stock below this level trigger dashboard replenishment alerts.
                  </span>
                </div>

                <div>
                  <label className="block text-content-primary font-medium mb-1">
                    Sales Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={e => setTaxRate(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand font-mono"
                  />
                  <span className="text-[11px] text-content-muted mt-1 block">
                    Standard retail accessory rate (0% for non-registered sales).
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Payment Methods */}
          {activeTab === 'payment' && (
            <div className="p-6 rounded-xl bg-app-surface border border-app-border shadow-subtle space-y-4 text-xs">
              <h3 className="text-sm font-semibold text-content-primary">Enabled POS Payment Channels</h3>

              <div className="space-y-3 pt-2">
                {[
                  { name: 'Cash Register Tender', desc: 'Accept cash notes and calculate change due automatically.' },
                  { name: 'Card POS Terminals', desc: 'Accept Visa / Mastercard / UnionPay bank cards.' },
                  { name: 'Online Bank & Raast Transfer', desc: 'Accept direct Pakistani instant account transfers.' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-app-secondary/40 border border-app-border flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-content-primary">{item.name}</div>
                      <div className="text-[11px] text-content-secondary">{item.desc}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-status-successSoft text-status-success font-bold">
                      ENABLED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Staff & User Roles */}
          {activeTab === 'users' && (
            <div className="p-6 rounded-xl bg-app-surface border border-app-border shadow-subtle space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-content-primary">User Management & Permissions</h3>
                  <p className="text-content-secondary">
                    Toggle roles to test permission restrictions throughout the interface.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${
                      currentRole === 'admin'
                        ? 'bg-brand text-white border-brand'
                        : 'bg-app-secondary text-content-primary border-app-border'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('staff')}
                    className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${
                      currentRole === 'staff'
                        ? 'bg-brand text-white border-brand'
                        : 'bg-app-secondary text-content-primary border-app-border'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Staff Cashier Mode</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-lg bg-app-secondary/40 border border-app-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand text-white font-bold flex items-center justify-center">
                      BF
                    </div>
                    <div>
                      <div className="font-semibold text-content-primary">Bilal Farooq (Admin)</div>
                      <div className="text-[11px] text-content-secondary">admin@stockroom.pk • Full Store Owner Access</div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] uppercase font-bold text-brand bg-brand-soft px-2 py-0.5 rounded">
                    SUPERADMIN
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-app-secondary/40 border border-app-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-warm text-white font-bold flex items-center justify-center">
                      HT
                    </div>
                    <div>
                      <div className="font-semibold text-content-primary">Hamza Tariq (Staff Cashier)</div>
                      <div className="text-[11px] text-content-secondary">cashier@stockroom.pk • POS & Invoicing Only (Cost Hidden)</div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] uppercase font-bold text-warm bg-warm-soft px-2 py-0.5 rounded">
                    CASHIER
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-subtle flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

