'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  ShoppingCart,
  Eye,
  Edit,
  Trash2,
  X,
  FileText,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useStore } from '@/lib/store';
import { Customer, Invoice } from '@/types';
import { formatPKR, formatDate, exportToCSV } from '@/lib/utils';
import { InvoiceDetailModal } from '@/components/invoices/InvoiceDetailModal';

export default function CustomersPage() {
  const router = useRouter();
  const {
    customers,
    invoices,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    setSelectedCustomer,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomerDetail] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form state
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custCity, setCustCity] = useState('Multan');
  const [custAddress, setCustAddress] = useState('');

  // Invoice modal
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return customers.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  // Open modal for editing
  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setCustName(c.name);
    setCustPhone(c.phone);
    setCustEmail(c.email);
    setCustCity(c.city);
    setCustAddress(c.address);
    setIsCustomerModalOpen(true);
  };

  // Open modal for adding
  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setCustName('');
    setCustPhone('+92 300 ');
    setCustEmail('');
    setCustCity('Multan');
    setCustAddress('Shop 14 Gulgasht, Multan');
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim()) return;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: custName,
        phone: custPhone,
        email: custEmail || `${custName.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`,
        city: custCity,
        address: custAddress,
      });
    } else {
      addCustomer({
        name: custName,
        phone: custPhone,
        email: custEmail || `${custName.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`,
        city: custCity,
        address: custAddress,
      });
    }

    setIsCustomerModalOpen(false);
  };

  // Quick sale for customer
  const handleCreateSaleForCustomer = (cust: Customer) => {
    setSelectedCustomer(cust);
    router.push('/app/pos');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-content-primary">
              Customer Directory
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
              Manage client records, track lifetime purchase volumes and initiate sales.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                const rows = customers.map(c => ({
                  ID: c.id,
                  Name: c.name,
                  Phone: c.phone,
                  Email: c.email,
                  City: c.city,
                  'Total Purchases': c.totalPurchases,
                  'Total Spent (PKR)': c.totalSpent,
                  'Last Purchase': formatDate(c.lastPurchaseDate),
                }));
                exportToCSV(`STOCKROOM_Customers_${new Date().toISOString().slice(0, 10)}.csv`, rows);
              }}
              className="px-3 py-1.5 rounded-lg border border-app-border bg-app-surface hover:bg-app-secondary text-xs font-medium text-content-primary transition-colors"
            >
              Export
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-subtle transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-app-surface border border-app-border shadow-subtle">
            <span className="text-xs font-medium text-content-secondary uppercase tracking-wider block mb-1">
              Registered Customers
            </span>
            <div className="text-2xl font-bold font-mono text-content-primary">
              {customers.length}
            </div>
            <span className="text-[11px] text-content-secondary">Verified buyer accounts</span>
          </div>

          <div className="p-4 rounded-xl bg-app-surface border border-app-border shadow-subtle">
            <span className="text-xs font-medium text-content-secondary uppercase tracking-wider block mb-1">
              Repeat Customers
            </span>
            <div className="text-2xl font-bold font-mono text-brand">
              {customers.filter(c => c.totalPurchases > 1).length}
            </div>
            <span className="text-[11px] text-content-secondary">More than 1 completed purchase</span>
          </div>

          <div className="p-4 rounded-xl bg-app-surface border border-app-border shadow-subtle">
            <span className="text-xs font-medium text-content-secondary uppercase tracking-wider block mb-1">
              Average Lifetime Spend
            </span>
            <div className="text-2xl font-bold font-mono text-content-primary">
              {formatPKR(
                customers.length > 0
                  ? customers.reduce((acc, c) => acc + c.totalSpent, 0) / customers.length
                  : 0
              )}
            </div>
            <span className="text-[11px] text-content-secondary">Per registered profile</span>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 rounded-xl bg-app-surface border border-app-border shadow-subtle">
          <div className="relative">
            <Search className="w-4 h-4 text-content-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, phone number (+92), city or email..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand text-content-primary"
            />
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-app-surface border border-app-border rounded-xl shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-app-secondary/50 text-content-secondary border-b border-app-border">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">Customer Name</th>
                  <th className="py-3 px-3 text-left font-semibold">Phone</th>
                  <th className="py-3 px-3 text-left font-semibold">City</th>
                  <th className="py-3 px-3 text-center font-semibold">Purchases</th>
                  <th className="py-3 px-4 text-right font-semibold">Total Spent</th>
                  <th className="py-3 px-3 text-left font-semibold">Last Purchase</th>
                  <th className="py-3 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {filteredCustomers.map(cust => (
                  <tr
                    key={cust.id}
                    onClick={() => setSelectedCustomerDetail(cust)}
                    className="hover:bg-app-secondary/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-content-primary flex items-center gap-2">
                        <span>{cust.name}</span>
                        {cust.id === 'CUST-000' && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-brand-soft text-brand font-bold">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-content-secondary">{cust.email}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-content-primary font-medium">
                      {cust.phone}
                    </td>
                    <td className="py-3 px-3 text-content-secondary">{cust.city}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      {cust.totalPurchases}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-brand">
                      {formatPKR(cust.totalSpent)}
                    </td>
                    <td className="py-3 px-3 text-content-secondary">
                      {formatDate(cust.lastPurchaseDate)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleCreateSaleForCustomer(cust);
                          }}
                          className="px-2.5 py-1 rounded bg-brand text-white hover:bg-brand-dark text-[11px] font-medium transition-colors"
                          title="Start POS sale for customer"
                        >
                          + Sale
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedCustomerDetail(cust);
                          }}
                          className="p-1 rounded text-content-secondary hover:text-content-primary hover:bg-app-secondary"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {cust.id !== 'CUST-000' && (
                          <>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleOpenEdit(cust);
                              }}
                              className="p-1 rounded text-content-secondary hover:text-content-primary hover:bg-app-secondary"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                if (confirm(`Remove customer ${cust.name}?`)) {
                                  deleteCustomer(cust.id);
                                }
                              }}
                              className="p-1 rounded text-content-secondary hover:text-status-danger hover:bg-status-dangerSoft"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer Detail Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-app-surface rounded-xl border border-app-border shadow-elevated overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-app-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand text-white font-bold flex items-center justify-center text-xs">
                  {selectedCustomer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-content-primary">{selectedCustomer.name}</h3>
                  <p className="text-xs text-content-secondary">{selectedCustomer.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCreateSaleForCustomer(selectedCustomer)}
                  className="px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand-dark"
                >
                  Start Sale
                </button>
                <button
                  onClick={() => setSelectedCustomerDetail(null)}
                  className="text-content-secondary p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-app-secondary/40 border border-app-border">
                  <span className="text-[10px] text-content-secondary uppercase tracking-wider block mb-1">
                    Transactions
                  </span>
                  <div className="text-lg font-bold font-mono text-content-primary">
                    {selectedCustomer.totalPurchases}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-app-secondary/40 border border-app-border col-span-2">
                  <span className="text-[10px] text-content-secondary uppercase tracking-wider block mb-1">
                    Total Spent
                  </span>
                  <div className="text-lg font-bold font-mono text-brand">
                    {formatPKR(selectedCustomer.totalSpent)}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-app-secondary/20 border border-app-border space-y-1.5">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-content-secondary" />
                  <span className="text-content-primary">{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-content-secondary" />
                  <span className="text-content-primary">{selectedCustomer.address}</span>
                </div>
              </div>

              {/* Invoices by this customer */}
              <div>
                <h4 className="font-semibold text-content-primary mb-2">Order History</h4>
                {invoices.filter(inv => inv.customer.id === selectedCustomer.id).length === 0 ? (
                  <p className="text-content-secondary italic">No counter invoices for this profile yet.</p>
                ) : (
                  <div className="border border-app-border rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-app-secondary text-content-secondary border-b border-app-border">
                        <tr>
                          <th className="py-2 px-3 text-left">Invoice</th>
                          <th className="py-2 px-3 text-left">Date</th>
                          <th className="py-2 px-3 text-left">Payment</th>
                          <th className="py-2 px-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-app-border">
                        {invoices
                          .filter(inv => inv.customer.id === selectedCustomer.id)
                          .slice(0, 5)
                          .map(inv => (
                            <tr
                              key={inv.id}
                              onClick={() => setViewInvoice(inv)}
                              className="hover:bg-app-secondary/30 cursor-pointer"
                            >
                              <td className="py-2 px-3 font-mono font-medium text-brand">{inv.id}</td>
                              <td className="py-2 px-3 text-content-secondary">{formatDate(inv.date)}</td>
                              <td className="py-2 px-3">{inv.paymentMethod}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold">{formatPKR(inv.total)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-app-surface rounded-xl border border-app-border shadow-elevated p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-app-border">
              <h3 className="text-sm font-semibold text-content-primary">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-content-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-content-secondary mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={e => setCustName(e.target.value)}
                  placeholder="e.g. Asad Munir"
                  className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-content-secondary mb-1">Mobile Number (+92) *</label>
                <input
                  type="text"
                  required
                  value={custPhone}
                  onChange={e => setCustPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand font-mono"
                />
              </div>

              <div>
                <label className="block text-content-secondary mb-1">Email Address</label>
                <input
                  type="email"
                  value={custEmail}
                  onChange={e => setCustEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-content-secondary mb-1">City</label>
                  <input
                    type="text"
                    value={custCity}
                    onChange={e => setCustCity(e.target.value)}
                    className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-content-secondary mb-1">Address</label>
                  <input
                    type="text"
                    value={custAddress}
                    onChange={e => setCustAddress(e.target.value)}
                    placeholder="Gulgasht, Sector A"
                    className="w-full px-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-app-border">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-app-secondary text-content-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand text-white font-medium hover:bg-brand-dark shadow-subtle"
                >
                  {editingCustomer ? 'Save Changes' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        invoice={viewInvoice}
        isOpen={!!viewInvoice}
        onClose={() => setViewInvoice(null)}
      />
    </AppLayout>
  );
}

