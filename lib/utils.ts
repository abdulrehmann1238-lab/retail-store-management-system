import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Pakistani Rupees (PKR)
 * Example: 84650 -> "PKR 84,650"
 */
export function formatPKR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'PKR 0';
  }
  const formatted = Math.round(amount).toLocaleString('en-PK');
  return `PKR ${formatted}`;
}

export function formatDate(dateString: string | Date | undefined): string {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(dateString: string | Date | undefined): string {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateTime(dateString: string | Date | undefined): string {
  if (!dateString) return '-';
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
}

/**
 * Generate a clean SVG Barcode representation (Code 128 / EAN style)
 */
export function generateBarcodeBars(code: string): number[] {
  // Deterministic bar widths based on digits
  const bars: number[] = [];
  bars.push(2, 1, 2, 1); // Start guard
  for (let i = 0; i < code.length; i++) {
    const digit = parseInt(code[i], 10) || 3;
    const w1 = (digit % 3) + 1;
    const w2 = ((digit + 1) % 3) + 1;
    const w3 = ((digit + 2) % 3) + 1;
    bars.push(w1, w2, w3, 1);
  }
  bars.push(2, 1, 2); // Stop guard
  return bars;
}

/**
 * Trigger client-side CSV download
 */
export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

