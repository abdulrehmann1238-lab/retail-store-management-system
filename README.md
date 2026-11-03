# STOCKROOM — Premium Electronics Retail Store Management System

An ultra-premium, highly interactive, fully responsive retail management web application built for an electronics accessories retail store (managing ~600 SKUs).

Designed with a bespoke brand identity, deep forest green accents (`#315C4C`), warm neutrals, and fine typographic hierarchy. Built as an interactive frontend demo with realistic simulated datasets, local storage persistence, barcode scanning, 80mm thermal receipt generation, and admin/staff role simulation.

---

## 🌟 Key Application Modules & Features

### 1. Overview Dashboard (`/app`)
- **Executive KPI Cards**: Real-time Total Sales (`PKR 84,650`), Gross Profit (`PKR 21,480`), Total Products (`600` with 12 low-stock alerts), and Transactions (`38`).
- **Interactive Revenue & Profit Analytics**: Recharts Area chart supporting time intervals (*Today*, *7D*, *30D*, *90D*). Gross profit curves automatically hide when viewing as Staff.
- **Tender Share Breakdown**: Live distribution across Cash, Card Terminals, and Raast / Instant Bank Transfers.
- **Stock Replenishment Alerts**: Low-stock and out-of-stock items with one-click **+ Add Stock** modal.
- **Recent Counter Transactions**: Click any invoice to inspect, print 80mm receipt, or process refunds.

### 2. Point of Sale (POS) (`/app/pos`)
- **Cashier-Optimized 65/35 Split Interface**: Catalog search on left, live shopping cart and payment terminal on right.
- **Simulated Barcode Scanner**: Hardware USB/Bluetooth scanner support (with Enter key detection) and one-click demo scan buttons for fast demonstration.
- **Product & Category Filtering**: Quick filtering across Chargers, Audio & Earbuds, Cables, Power Banks, Cases, and Car Mounts.
- **Discounts & Cash Change Calculation**: Supports fixed PKR and percentage discounts, exact cash tenders, and rounding shortcuts (+500, +1000).
- **Checkout Success Modal**: Immediately updates inventory, records store activity, and opens printable 80mm thermal receipt.

### 3. Inventory Management (`/app/inventory`)
- **600 Deterministic Electronic Accessories**: Realistic brands (Anker, Joyroom, Baseus, Ugreen, Apple, Samsung, Ronin, Spigen) with realistic buying costs and retail selling prices.
- **Search, Sorting & Pagination**: Search by SKU, title, brand, or barcode with configurable 25/50/100 item page sizes.
- **5-Step Excel Import Wizard**: Genuinely parses `.xlsx`, `.xls`, and `.csv` files using SheetJS, detects columns, validates required fields, flags errors, and imports directly into application state.
- **Download Sample Excel Template**: One-click download of a formatted template with sample electronics accessories ready for import testing.
- **Stock Movement & Product Details Panel**: Inspect barcode stickers, past sales history, and reorder levels.

### 4. Product & Barcode Management (`/app/products`)
- **Card View & Shelf Tag Generator**: Switch between responsive product cards and printable barcode label sheets (24 shelf tags per page with scannable barcode lines and retail PKR pricing).

### 5. Stock Entries / Purchases (`/app/purchases`)
- **Receiving Stock Workflow**: Log incoming supplier purchase orders from Anker, Baseus, or local distributors. Automatically increments inventory counts and updates unit buying costs.

### 6. Sales Invoices (`/app/invoices`)
- **Historical Invoices Directory**: Comprehensive ledger of all counter sales with status tracking (*Paid*, *Partially Returned*, *Returned*).
- **Dual Printing Support**:
  - **80mm Thermal Receipt**: Dedicated CSS (`@media print`) matching standard point-of-sale thermal roll width.
  - **Standard A4 Invoice**: Full formal tax receipt format.

### 7. Returns and Refunds (`/app/returns`)
- **Linked Return Flow**: Search by original invoice ID (`INV-1045`), select specific items, specify return reasons (*Defective*, *Wrong item*, *Changed mind*), choose tender refund method, and automatically restock undamaged goods to inventory.

### 8. Customer Management CRM (`/app/customers`)
- **55 Realistic Customer Profiles**: Real Pakistani mobile phone formatting (`+92 300 ...`), city tracking (Multan, Lahore, Islamabad, Karachi), lifetime spend calculations, and direct "+ Sale" POS launching.

### 9. Profitability & Business Analytics (`/app/reports`) — *Admin Only*
- **Accurate Retail Accounting**:
  $$\text{Gross Profit} = \text{Net Sales Revenue} - \text{Cost of Goods Sold (COGS)}$$
- **Category Profit Contributions**: Pie and Bar visualizations of which accessories deliver the highest gross margins.
- **Product Performance Table**: Granular unit volume, revenue, cost, profit, and margin percentages with CSV export.
- **Staff Access Guard**: Staff members attempting to access this route are presented with an access restriction notice.

### 10. Live Activity Audit Log (`/app/activity`)
- **Immutable Transaction Audit**: Records actual interactions across sales, inventory edits, bulk Excel imports, and refunds with timestamps and user roles.

### 11. Store Configuration (`/app/settings`)
- **Store Profile & Customization**: Configure store branding (*Multan Flagship*), invoice prefixes, thermal roll width (80mm vs 58mm), low-stock thresholds, and cashier credentials.

### 12. Omni-Search & Notification Center
- **Cmd+K / Ctrl+K Global Search**: Instantly search products, SKUs, invoices, customer records, and application routes.
- **Notification Flyout**: Live alerts for low-stock warnings, zero-stock items, and daily targets.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: Zustand with LocalStorage synchronization
- **Excel & CSV Engine**: SheetJS (`xlsx`)
- **Motion**: Framer Motion

---

## 🚀 Running the Project

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run start
```

---

## 🔑 Role Simulation & Demo Controls

Use the floating **Demo Controls** widget at the bottom right of any screen to:
- **Switch to Admin**: Full visibility into wholesale buying costs, gross profit, margin percentages, and financial reports.
- **Switch to Staff**: Cashier mode — hides all wholesale prices, margins, and financial reports.
- **Download Sample Excel**: Generates a sample CSV template for testing the Excel Import wizard.
- **Reset Demo State**: Restores the clean 600-product deterministic starting dataset.

