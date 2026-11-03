'use client';

import React, { useState } from 'react';
import { Shield, UserCheck, RefreshCw, Sparkles, ChevronUp, ChevronDown, Download, Check } from 'lucide-react';
import { useStore } from '@/lib/store';
import { exportToCSV } from '@/lib/utils';

export const DemoControls: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const { currentRole, setRole, resetDemoData, products } = useStore();

  const handleDownloadSampleSpreadsheet = () => {
    // Generate 15 sample electronic accessories records formatted for Excel/CSV import
    const sampleRows = [
      {
        'Product Name': 'Anker Nano 30W GaN Fast Charger',
        'SKU': 'CHG-901',
        'Barcode': '8901234567901',
        'Category': 'Chargers & Adapters',
        'Brand': 'Anker',
        'Buying Price': 1200,
        'Selling Price': 1950,
        'Quantity': 35,
        'Reorder Level': 10,
        'Description': 'Ultra compact 30W GaN technology USB-C PPS fast charger',
      },
      {
        'Product Name': 'Joyroom JR-T03S Pro ANC Earbuds',
        'SKU': 'AUD-902',
        'Barcode': '8901234567902',
        'Category': 'Audio & Earbuds',
        'Brand': 'Joyroom',
        'Buying Price': 2200,
        'Selling Price': 3400,
        'Quantity': 20,
        'Reorder Level': 8,
        'Description': 'Active noise cancellation TWS wireless Bluetooth 5.3 earbuds',
      },
      {
        'Product Name': 'Baseus Blade 100W 20000mAh Power Bank',
        'SKU': 'PWB-903',
        'Barcode': '8901234567903',
        'Category': 'Power Banks',
        'Brand': 'Baseus',
        'Buying Price': 5200,
        'Selling Price': 7800,
        'Quantity': 8,
        'Reorder Level': 5,
        'Description': 'Ultra thin laptop portable power station with digital power readout',
      },
      {
        'Product Name': 'Ugreen 100W 5A USB-C to USB-C Cable 2M',
        'SKU': 'CAB-904',
        'Barcode': '8901234567904',
        'Category': 'Cables & Data',
        'Brand': 'Ugreen',
        'Buying Price': 450,
        'Selling Price': 850,
        'Quantity': 60,
        'Reorder Level': 15,
        'Description': 'Heavy duty braided E-Marker chip fast charge cable',
      },
      {
        'Product Name': 'Spigen Ultra Hybrid Clear Case iPhone 15 Pro',
        'SKU': 'CAS-905',
        'Barcode': '8901234567905',
        'Category': 'Cases & Protection',
        'Brand': 'Spigen',
        'Buying Price': 800,
        'Selling Price': 1650,
        'Quantity': 25,
        'Reorder Level': 10,
        'Description': 'Military grade anti-yellowing crystal clear drop protective case',
      },
    ];

    exportToCSV('stockroom_sample_inventory_template.csv', sampleRows);
    setCopiedNotification('Sample spreadsheet downloaded!');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo data back to initial 600 products and starting state?')) {
      resetDemoData();
      setCopiedNotification('Demo data reset successfully!');
      setTimeout(() => setCopiedNotification(null), 3000);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 select-none">
      <div className="bg-app-surface border border-app-border rounded-xl shadow-elevated overflow-hidden transition-all duration-200">
        {/* Toggle bar */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-3.5 py-2 cursor-pointer hover:bg-app-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
            </span>
            <span className="text-xs font-semibold text-content-primary">Demo Controls</span>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase transition-colors ${
              currentRole === 'admin'
                ? 'bg-brand-soft text-brand border border-brand/20'
                : 'bg-warm-soft text-warm-dark border border-warm/20'
            }`}>
              {currentRole} Mode
            </span>
          </div>

          <button className="text-content-secondary hover:text-content-primary p-0.5 ml-1">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Collapsible body */}
        {isOpen && (
          <div className="p-3 border-t border-app-border space-y-3 bg-app-surface w-72">
            <div>
              <span className="text-[11px] font-medium text-content-secondary uppercase tracking-wider block mb-1.5">
                Switch Role Simulation
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setRole('admin');
                    setCopiedNotification('Switched to Admin: Full access enabled.');
                    setTimeout(() => setCopiedNotification(null), 2500);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-medium border transition-colors ${
                    currentRole === 'admin'
                      ? 'bg-brand text-white border-brand'
                      : 'bg-app-secondary text-content-primary border-app-border hover:bg-app-border/40'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>

                <button
                  onClick={() => {
                    setRole('staff');
                    setCopiedNotification('Switched to Staff: Profit & buying prices hidden.');
                    setTimeout(() => setCopiedNotification(null), 2500);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-medium border transition-colors ${
                    currentRole === 'staff'
                      ? 'bg-brand text-white border-brand'
                      : 'bg-app-secondary text-content-primary border-app-border hover:bg-app-border/40'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Staff / Cashier</span>
                </button>
              </div>
              <p className="text-[10px] text-content-secondary mt-1">
                {currentRole === 'admin'
                  ? 'Admin sees gross profit, margins, buying prices, and financial reports.'
                  : 'Staff view restricts buying prices, margins, and financial reports.'}
              </p>
            </div>

            <div className="space-y-1.5 pt-1 border-t border-app-border/60">
              <button
                onClick={handleDownloadSampleSpreadsheet}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium bg-app-secondary hover:bg-brand-soft hover:text-brand text-content-primary border border-app-border transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample Excel</span>
              </button>

              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium bg-status-dangerSoft hover:bg-status-dangerSoft/80 text-status-danger border border-status-danger/20 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo State</span>
              </button>
            </div>

            <div className="pt-1 text-center">
              <span className="text-[10px] text-content-muted">
                Interactive demonstration — sample data only.
              </span>
            </div>
          </div>
        )}
      </div>

      {copiedNotification && (
        <div className="absolute bottom-14 right-0 px-3 py-1.5 rounded-lg bg-content-primary text-white text-xs font-medium shadow-elevated flex items-center gap-1.5 whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-3.5 h-3.5 text-brand-sage" />
          <span>{copiedNotification}</span>
        </div>
      )}
    </div>
  );
};

