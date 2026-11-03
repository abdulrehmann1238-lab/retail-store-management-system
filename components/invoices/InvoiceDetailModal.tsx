'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Printer,
  FileText,
  RotateCcw,
  Check,
  Building,
  Calendar,
  CreditCard,
  User,
  Phone,
  Receipt,
  Download,
} from 'lucide-react';
import { Invoice } from '@/types';
import { useStore } from '@/lib/store';
import { formatPKR, formatDate, formatTime } from '@/lib/utils';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onInitiateReturn?: (invoice: Invoice) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onInitiateReturn,
}) => {
  const { settings, currentRole } = useStore();
  const [printMode, setPrintMode] = useState<'thermal' | 'a4' | null>(null);

  if (!isOpen || !invoice) return null;

  const handlePrintThermal = () => {
    setPrintMode('thermal');
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handlePrintA4 = () => {
    setPrintMode('a4');
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <>
      {/* Interactive Modal Preview */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150 no-print">
        <div className="w-full max-w-2xl bg-app-surface rounded-xl border border-app-border shadow-elevated overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-app-border bg-app-surface">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-content-primary font-mono">{invoice.id}</h3>
                  <span
                    className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                      invoice.status === 'Paid'
                        ? 'bg-status-successSoft text-status-success'
                        : invoice.status === 'Partially Returned'
                        ? 'bg-status-warningSoft text-status-warning'
                        : 'bg-status-dangerSoft text-status-danger'
                    }`}
                  >
                    {invoice.status}
                  </span>
                </div>
                <p className="text-xs text-content-secondary">
                  {formatDate(invoice.date)} at {formatTime(invoice.date)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintThermal}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-soft hover:bg-brand/10 text-brand border border-brand/20 transition-colors flex items-center gap-1.5"
                title="Print 80mm thermal roll receipt"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>80mm Thermal</span>
              </button>

              <button
                onClick={handlePrintA4}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-app-secondary hover:bg-app-border/40 text-content-primary border border-app-border transition-colors flex items-center gap-1.5"
                title="Print full page invoice"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>A4 Invoice</span>
              </button>

              <button
                onClick={onClose}
                className="p-1 rounded-md text-content-secondary hover:text-content-primary ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Meta Information Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-app-secondary/40 border border-app-border">
                <span className="text-[11px] text-content-secondary uppercase tracking-wider block mb-1">
                  Customer
                </span>
                <div className="text-xs font-semibold text-content-primary">{invoice.customer.name}</div>
                <div className="text-[11px] text-content-secondary font-mono">{invoice.customer.phone}</div>
              </div>

              <div className="p-3 rounded-lg bg-app-secondary/40 border border-app-border">
                <span className="text-[11px] text-content-secondary uppercase tracking-wider block mb-1">
                  Cashier & Register
                </span>
                <div className="text-xs font-semibold text-content-primary">{invoice.cashier}</div>
                <div className="text-[11px] text-content-secondary">{settings.city}</div>
              </div>

              <div className="p-3 rounded-lg bg-app-secondary/40 border border-app-border col-span-2 sm:col-span-1">
                <span className="text-[11px] text-content-secondary uppercase tracking-wider block mb-1">
                  Payment Method
                </span>
                <div className="text-xs font-semibold text-content-primary flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-brand" />
                  <span>{invoice.paymentMethod}</span>
                </div>
                <div className="text-[11px] text-content-secondary">
                  Paid: {formatPKR(invoice.amountPaid)}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <h4 className="text-xs font-semibold text-content-primary uppercase tracking-wider mb-2">
                Purchased Items ({invoice.items.length})
              </h4>
              <div className="border border-app-border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-app-secondary/60 text-content-secondary border-b border-app-border">
                    <tr>
                      <th className="py-2.5 px-3 text-left font-medium">Item & SKU</th>
                      <th className="py-2.5 px-3 text-center font-medium">Qty</th>
                      <th className="py-2.5 px-3 text-right font-medium">Rate</th>
                      <th className="py-2.5 px-3 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app-border">
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-app-secondary/20">
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-content-primary">{item.productName}</div>
                          <div className="text-[11px] font-mono text-content-secondary">{item.sku}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatPKR(item.unitPrice)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium">
                          {formatPKR(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 p-4 rounded-xl bg-app-secondary/30 border border-app-border">
              <div className="text-xs text-content-secondary space-y-1">
                <div>
                  <span className="font-medium text-content-primary">Warranty:</span> 7 days standard
                  replacement against manufacturing defects.
                </div>
                <div className="font-mono text-[11px]">
                  Cashier Reference: {invoice.cashier}
                </div>
              </div>

              <div className="w-full sm:w-60 space-y-1.5 text-xs">
                <div className="flex justify-between text-content-secondary">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatPKR(invoice.subtotal)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-status-success font-medium">
                    <span>Discount:</span>
                    <span className="font-mono">-{formatPKR(invoice.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-content-primary pt-1.5 border-t border-app-border">
                  <span>Grand Total:</span>
                  <span className="font-mono text-brand">{formatPKR(invoice.total)}</span>
                </div>
                {invoice.paymentMethod === 'Cash' && (
                  <>
                    <div className="flex justify-between text-content-secondary text-[11px] pt-1">
                      <span>Amount Received:</span>
                      <span className="font-mono">{formatPKR(invoice.amountPaid)}</span>
                    </div>
                    <div className="flex justify-between text-content-secondary text-[11px]">
                      <span>Change Due:</span>
                      <span className="font-mono">{formatPKR(invoice.changeDue)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-3 border-t border-app-border bg-app-secondary/30 flex items-center justify-between">
            {invoice.status !== 'Returned' && onInitiateReturn && (
              <button
                onClick={() => {
                  onInitiateReturn(invoice);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-status-danger hover:bg-status-dangerSoft border border-status-danger/20 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Process Return / Refund</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-content-secondary hover:text-content-primary bg-app-secondary transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 80mm Dedicated Printable Thermal Slip */}
      <div id="printable-receipt" className="hidden print:block text-black bg-white">
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 2px 0' }}>
            {settings.storeName}
          </h2>
          <p style={{ fontSize: '10px', margin: '0' }}>{settings.tagline}</p>
          <p style={{ fontSize: '10px', margin: '0' }}>{settings.address}</p>
          <p style={{ fontSize: '10px', margin: '0' }}>{settings.city}</p>
          <p style={{ fontSize: '10px', margin: '0' }}>Tel: {settings.phone}</p>
        </div>

        <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />

        <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
          <div>Invoice: <b>{invoice.id}</b></div>
          <div>Date: {formatDate(invoice.date)} {formatTime(invoice.date)}</div>
          <div>Cashier: {invoice.cashier}</div>
          <div>Customer: {invoice.customer.name} ({invoice.customer.phone})</div>
        </div>

        <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />

        <table style={{ width: '100%', fontSize: '10px', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #000' }}>
              <th style={{ padding: '2px 0' }}>Item</th>
              <th style={{ textAlign: 'center', padding: '2px 0' }}>Qty</th>
              <th style={{ textAlign: 'right', padding: '2px 0' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((it, i) => (
              <tr key={i}>
                <td style={{ padding: '3px 0' }}>
                  <div>{it.productName}</div>
                  <div style={{ fontSize: '9px', color: '#444' }}>{it.sku}</div>
                </td>
                <td style={{ textAlign: 'center', verticalAlign: 'top', padding: '3px 0' }}>
                  {it.quantity}
                </td>
                <td style={{ textAlign: 'right', verticalAlign: 'top', padding: '3px 0' }}>
                  {formatPKR(it.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />

        <div style={{ fontSize: '10px', lineHeight: '1.5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span>{formatPKR(invoice.subtotal)}</span>
          </div>
          {invoice.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Discount:</span>
              <span>-{formatPKR(invoice.discount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px', marginTop: '2px' }}>
            <span>TOTAL:</span>
            <span>{formatPKR(invoice.total)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
            <span>Paid ({invoice.paymentMethod}):</span>
            <span>{formatPKR(invoice.amountPaid)}</span>
          </div>
          {invoice.paymentMethod === 'Cash' && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Change Due:</span>
              <span>{formatPKR(invoice.changeDue)}</span>
            </div>
          )}
        </div>

        <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />

        <div style={{ textAlign: 'center', fontSize: '9px', lineHeight: '1.4' }}>
          <p style={{ margin: '0 0 2px 0', fontWeight: 'bold' }}>{settings.footerMessage}</p>
          <p style={{ margin: '0' }}>Please keep this receipt for warranty claims.</p>
          <p style={{ margin: '4px 0 0 0', fontFamily: 'monospace' }}>*** THANK YOU ***</p>
        </div>
      </div>
    </>
  );
};

