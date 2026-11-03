'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Download,
  X,
  RefreshCw,
  Table,
  Check,
  Layers,
} from 'lucide-react';
import { Product, ProductCategory } from '@/types';
import { useStore } from '@/lib/store';
import { exportToCSV } from '@/lib/utils';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedRow {
  [key: string]: any;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ isOpen, onClose }) => {
  const { importProducts, products: existingProducts } = useStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [fileName, setFileName] = useState<string>('');
  const [fileRows, setFileRows] = useState<ParsedRow[]>([]);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({
    name: '',
    sku: '',
    barcode: '',
    category: '',
    brand: '',
    buyingPrice: '',
    sellingPrice: '',
    quantity: '',
    reorderLevel: '',
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validCount, setValidCount] = useState<number>(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Step 1: Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = evt => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<ParsedRow>(ws, { header: 1 });

        if (data.length < 2) {
          alert('Spreadsheet appears to be empty or missing data rows.');
          return;
        }

        const headers = (data[0] as string[]).map(h => String(h).trim());
        setDetectedHeaders(headers);

        // Convert rows to key-value objects
        const rows: ParsedRow[] = [];
        for (let i = 1; i < data.length; i++) {
          const rowData = data[i] as any[];
          if (!rowData || rowData.length === 0) continue;
          const rowObj: ParsedRow = {};
          headers.forEach((h, colIdx) => {
            rowObj[h] = rowData[colIdx];
          });
          rows.push(rowObj);
        }

        setFileRows(rows);

        // Auto-guess column mapping
        const newMap = { ...columnMap };
        headers.forEach(h => {
          const lower = h.toLowerCase();
          if (lower.includes('name') || lower.includes('product') || lower.includes('title')) newMap.name = h;
          else if (lower.includes('sku') || lower.includes('code') || lower.includes('item no')) newMap.sku = h;
          else if (lower.includes('barcode') || lower.includes('ean') || lower.includes('upc')) newMap.barcode = h;
          else if (lower.includes('category') || lower.includes('type')) newMap.category = h;
          else if (lower.includes('brand') || lower.includes('make')) newMap.brand = h;
          else if (lower.includes('buy') || lower.includes('cost') || lower.includes('purchase')) newMap.buyingPrice = h;
          else if (lower.includes('sell') || lower.includes('price') || lower.includes('retail')) newMap.sellingPrice = h;
          else if (lower.includes('qty') || lower.includes('quantity') || lower.includes('stock')) newMap.quantity = h;
          else if (lower.includes('reorder') || lower.includes('threshold') || lower.includes('min')) newMap.reorderLevel = h;
        });

        setColumnMap(newMap);
        setStep(2); // Move to Preview
      } catch (err) {
        console.error('File parsing error', err);
        alert('Failed to parse spreadsheet. Please upload a valid .xlsx, .xls, or .csv file.');
      }
    };

    reader.readAsBinaryString(file);
  };

  // Download Sample Template for easy testing
  const handleDownloadSample = () => {
    const sampleRows = [
      {
        'Product Name': 'Anker 737 GaNPrime 140W Power Bank',
        'SKU': 'PWB-881',
        'Barcode': '8901234568811',
        'Category': 'Power Banks',
        'Brand': 'Anker',
        'Buying Price': 9500,
        'Selling Price': 14000,
        'Quantity': 15,
        'Reorder Level': 5,
        'Description': 'Ultra powerful 24,000mAh 140W fast charge battery pack with smart color screen',
      },
      {
        'Product Name': 'Joyroom Wireless Car Mount Charger 15W',
        'SKU': 'CAR-882',
        'Barcode': '8901234568822',
        'Category': 'Car Accessories',
        'Brand': 'Joyroom',
        'Buying Price': 1400,
        'Selling Price': 2250,
        'Quantity': 30,
        'Reorder Level': 10,
        'Description': 'Auto-clamping Qi certified fast wireless windshield and vent mount',
      },
      {
        'Product Name': 'Baseus Bowie H1 ANC Wireless Headphones',
        'SKU': 'AUD-883',
        'Barcode': '8901234568833',
        'Category': 'Audio & Earbuds',
        'Brand': 'Baseus',
        'Buying Price': 3800,
        'Selling Price': 5600,
        'Quantity': 12,
        'Reorder Level': 6,
        'Description': '40dB hybrid active noise cancellation over-ear Bluetooth headphones with 70h battery',
      },
      {
        'Product Name': 'Ugreen 65W GaN Dual USB-C Fast Charger',
        'SKU': 'CHG-884',
        'Barcode': '8901234568844',
        'Category': 'Chargers & Adapters',
        'Brand': 'Ugreen',
        'Buying Price': 2100,
        'Selling Price': 3200,
        'Quantity': 40,
        'Reorder Level': 10,
        'Description': 'Compact dual port 65W PPS laptop and iPhone wall charger',
      },
    ];

    exportToCSV('STOCKROOM_Excel_Import_Template.csv', sampleRows);
  };

  // Step 3 -> 4: Validate rows based on mapping
  const handleRunValidation = () => {
    const errors: string[] = [];
    let valid = 0;

    const existingSkus = new Set(existingProducts.map(p => p.sku.toUpperCase()));

    fileRows.forEach((row, idx) => {
      const rowNum = idx + 2; // header is row 1
      const name = row[columnMap.name];
      const sku = row[columnMap.sku];
      const sell = row[columnMap.sellingPrice];
      const qty = row[columnMap.quantity];

      if (!name) {
        errors.push(`Row ${rowNum}: Missing Product Name`);
      }
      if (!sku) {
        errors.push(`Row ${rowNum}: Missing SKU`);
      }
      if (sell === undefined || isNaN(Number(sell))) {
        errors.push(`Row ${rowNum}: Invalid Selling Price "${sell}"`);
      }
      if (qty === undefined || isNaN(Number(qty))) {
        errors.push(`Row ${rowNum}: Invalid Stock Quantity "${qty}"`);
      }

      if (name && sku && !isNaN(Number(sell)) && !isNaN(Number(qty))) {
        valid++;
      }
    });

    setValidationErrors(errors);
    setValidCount(valid);
    setStep(4);
  };

  // Step 5: Execute Import
  const handleExecuteImport = () => {
    setIsImporting(true);

    setTimeout(() => {
      const newProducts: Product[] = [];
      const now = new Date().toISOString();

      fileRows.forEach((row, idx) => {
        const name = String(row[columnMap.name] || '').trim();
        const rawSku = String(row[columnMap.sku] || '').trim();
        const sku = rawSku || `IMP-${String(idx + 1).padStart(3, '0')}`;
        const barcode = String(row[columnMap.barcode] || `89012345${String(80000 + idx).slice(-5)}`);
        const cat = (row[columnMap.category] as ProductCategory) || 'Other Accessories';
        const brand = String(row[columnMap.brand] || 'Universal');
        const buy = Math.max(50, Number(row[columnMap.buyingPrice]) || 200);
        const sell = Math.max(buy + 50, Number(row[columnMap.sellingPrice]) || buy * 1.5);
        const qty = Math.max(0, Number(row[columnMap.quantity]) || 10);
        const reorder = Math.max(5, Number(row[columnMap.reorderLevel]) || 10);

        if (name) {
          newProducts.push({
            id: `PRD-IMP-${Date.now().toString().slice(-4)}-${idx}`,
            name,
            sku,
            barcode,
            category: cat,
            brand,
            buyingPrice: buy,
            sellingPrice: sell,
            stockQuantity: qty,
            reorderLevel: reorder,
            description: `Imported via STOCKROOM Excel wizard on ${new Date().toLocaleDateString()}.`,
            createdAt: now,
            updatedAt: now,
          });
        }
      });

      importProducts(newProducts);
      setIsImporting(false);
      setImportSuccess(true);
      setStep(5);
    }, 800);
  };

  const handleResetModal = () => {
    setStep(1);
    setFileName('');
    setFileRows([]);
    setValidationErrors([]);
    setImportSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-app-surface rounded-xl border border-app-border shadow-elevated overflow-hidden flex flex-col max-h-[90vh]">
        {/* Wizard Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-app-border bg-app-surface">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-content-primary">Excel Inventory Import Wizard</h3>
              <p className="text-xs text-content-secondary">
                Step {step} of 5 — {step === 1 ? 'Upload File' : step === 2 ? 'Data Preview' : step === 3 ? 'Column Mapping' : step === 4 ? 'Validation' : 'Import Complete'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-md text-content-secondary hover:text-content-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Progress Stepper */}
        <div className="px-6 py-2.5 bg-app-secondary/40 border-b border-app-border flex items-center justify-between text-xs">
          {[
            { num: 1, label: 'Upload' },
            { num: 2, label: 'Preview' },
            { num: 3, label: 'Mapping' },
            { num: 4, label: 'Validate' },
            { num: 5, label: 'Import' },
          ].map(s => (
            <div key={s.num} className="flex items-center gap-1.5">
              <span
                className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  step === s.num
                    ? 'bg-brand text-white'
                    : step > s.num
                    ? 'bg-brand-soft text-brand'
                    : 'bg-app-secondary text-content-secondary'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </span>
              <span
                className={`font-medium ${
                  step === s.num ? 'text-brand font-semibold' : 'text-content-secondary'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Wizard Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* STEP 1: Upload */}
          {step === 1 && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-app-border hover:border-brand/60 rounded-xl p-8 text-center cursor-pointer transition-colors bg-app-secondary/20 hover:bg-brand-soft/20 space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-brand-soft text-brand mx-auto flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-content-primary">
                    Click to browse or drag & drop spreadsheet
                  </h4>
                  <p className="text-xs text-content-secondary mt-1">
                    Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv) files.
                  </p>
                </div>
                <span className="inline-block px-3 py-1 rounded-md bg-app-surface border border-app-border text-[11px] font-mono text-content-secondary">
                  Max size: 10MB • Up to 5,000 SKUs
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Sample Template Download Box */}
              <div className="p-4 rounded-xl bg-app-secondary/50 border border-app-border flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-semibold text-content-primary">
                    Need a formatted Excel sample file?
                  </h5>
                  <p className="text-[11px] text-content-secondary mt-0.5">
                    Download our ready-to-use template with sample Pakistani electronics accessories.
                  </p>
                </div>

                <button
                  onClick={handleDownloadSample}
                  className="px-3 py-1.5 rounded-lg bg-app-surface hover:bg-brand-soft hover:text-brand border border-app-border text-xs font-medium text-content-primary transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Preview */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-brand-soft/40 border border-brand/20 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-brand">File Detected:</span> {fileName}
                </div>
                <div className="font-mono text-content-secondary">
                  {fileRows.length} rows • {detectedHeaders.length} columns
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-content-primary uppercase tracking-wider mb-2">
                  Sample Rows (First 4 Records)
                </h4>
                <div className="border border-app-border rounded-lg overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-app-secondary text-content-secondary border-b border-app-border">
                      <tr>
                        {detectedHeaders.slice(0, 6).map((h, i) => (
                          <th key={i} className="py-2 px-3 text-left font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border">
                      {fileRows.slice(0, 4).map((row, rIdx) => (
                        <tr key={rIdx}>
                          {detectedHeaders.slice(0, 6).map((h, cIdx) => (
                            <td key={cIdx} className="py-2 px-3 text-content-primary truncate max-w-[150px]">
                              {String(row[h] || '-')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-3 py-1.5 rounded-lg bg-app-secondary text-content-secondary text-xs"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-1.5 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand-dark flex items-center gap-1"
                >
                  <span>Proceed to Column Mapping</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Column Mapping */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-content-secondary">
                Match your spreadsheet headers to STOCKROOM product fields. We automatically matched headers where possible.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { key: 'name', label: 'Product Name *', required: true },
                  { key: 'sku', label: 'Product SKU *', required: true },
                  { key: 'barcode', label: 'Barcode / EAN', required: false },
                  { key: 'category', label: 'Category', required: false },
                  { key: 'brand', label: 'Brand Name', required: false },
                  { key: 'buyingPrice', label: 'Buying Cost (PKR)', required: false },
                  { key: 'sellingPrice', label: 'Selling Price (PKR) *', required: true },
                  { key: 'quantity', label: 'Stock Quantity *', required: true },
                  { key: 'reorderLevel', label: 'Reorder Threshold', required: false },
                ].map(field => (
                  <div key={field.key} className="p-2.5 rounded-lg bg-app-secondary/30 border border-app-border">
                    <label className="block text-content-primary font-medium mb-1">
                      {field.label}
                    </label>
                    <select
                      value={columnMap[field.key] || ''}
                      onChange={e => setColumnMap({ ...columnMap, [field.key]: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-app-surface border border-app-border rounded-md text-xs outline-none focus:border-brand"
                    >
                      <option value="">-- Ignore / Default --</option>
                      {detectedHeaders.map(h => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-3 py-1.5 rounded-lg bg-app-secondary text-content-secondary text-xs"
                >
                  Back
                </button>
                <button
                  onClick={handleRunValidation}
                  className="px-4 py-1.5 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand-dark flex items-center gap-1"
                >
                  <span>Validate Spreadsheet Rows</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Validation */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-status-successSoft/50 border border-status-success/20">
                  <span className="text-xs text-status-success font-medium">Valid Ready Records</span>
                  <div className="text-2xl font-bold font-mono text-status-success mt-1">
                    {validCount}
                  </div>
                  <span className="text-[11px] text-content-secondary">Eligible for instant import</span>
                </div>

                <div className="p-4 rounded-xl bg-app-secondary/50 border border-app-border">
                  <span className="text-xs text-content-secondary font-medium">Validation Warnings</span>
                  <div className="text-2xl font-bold font-mono text-content-primary mt-1">
                    {validationErrors.length}
                  </div>
                  <span className="text-[11px] text-content-secondary">
                    {validationErrors.length === 0 ? 'All rows clean' : 'Non-critical rows will be skipped'}
                  </span>
                </div>
              </div>

              {validationErrors.length > 0 && (
                <div className="p-3 rounded-lg bg-status-warningSoft/30 border border-status-warning/20 max-h-36 overflow-y-auto text-xs space-y-1">
                  <div className="font-semibold text-status-warning flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Errors found in {validationErrors.length} entries:</span>
                  </div>
                  {validationErrors.slice(0, 8).map((err, i) => (
                    <div key={i} className="text-content-secondary pl-5 text-[11px]">
                      • {err}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setStep(3)}
                  className="px-3 py-1.5 rounded-lg bg-app-secondary text-content-secondary text-xs"
                >
                  Back to Mapping
                </button>
                <button
                  onClick={handleExecuteImport}
                  disabled={validCount === 0 || isImporting}
                  className="px-5 py-2 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-dark flex items-center gap-2 shadow-subtle disabled:opacity-50"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Importing {validCount} Products...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm & Import ({validCount} Products)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Success */}
          {step === 5 && (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-status-successSoft text-status-success mx-auto flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-bold text-content-primary">
                  Products Imported Successfully!
                </h4>
                <p className="text-xs text-content-secondary mt-1">
                  {validCount} electronics accessories records added/updated in STOCKROOM catalog.
                </p>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => {
                    handleResetModal();
                    onClose();
                  }}
                  className="px-5 py-2 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand-dark"
                >
                  View Inventory Table
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

