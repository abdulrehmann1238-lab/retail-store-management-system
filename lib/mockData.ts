import {
  Product,
  Customer,
  Invoice,
  StockEntry,
  ReturnRecord,
  ActivityLog,
  NotificationItem,
  StoreSettings,
  ProductCategory,
  PaymentMethod,
} from '../types';

// Deterministic Pseudo-Random Number Generator (PRNG)
function createSeededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'STOCKROOM',
  tagline: 'Electronics Accessories Retail',
  address: 'Shop #14, Ground Floor, Gulgasht Commercial Center',
  city: 'Multan, Pakistan',
  phone: '+92 61 6523910',
  email: 'sales@stockroom.pk',
  invoicePrefix: 'INV-',
  startingInvoiceNumber: 1045,
  footerMessage: 'Thank you for shopping with us! Standard 7-day replacement warranty on electronics accessories.',
  thermalReceiptWidth: '80mm',
  defaultLowStockThreshold: 10,
  taxRate: 0,
  currency: 'PKR',
  paymentMethodsEnabled: {
    cash: true,
    card: true,
    bankTransfer: true,
  },
};

const CATEGORIES: ProductCategory[] = [
  'Chargers & Adapters',
  'Audio & Earbuds',
  'Cables & Data',
  'Power Banks',
  'Cases & Protection',
  'Car Accessories',
  'Mounts & Stands',
  'Smart Wearables',
  'Gaming Accessories',
  'Other Accessories',
];

const BRANDS = [
  'Anker',
  'Baseus',
  'Joyroom',
  'Ugreen',
  'Apple',
  'Samsung',
  'Ronin',
  'Audionic',
  'Faster',
  'Remax',
  'Xiaomi',
  'Dany',
  'Tronsmart',
  'Spigen',
];

// Product name templates per category
const CATEGORY_TEMPLATES: Record<ProductCategory, { prefix: string; names: string[]; baseBuy: number; baseSell: number }> = {
  'Chargers & Adapters': {
    prefix: 'CHG',
    names: [
      'Fast Charger 20W Type-C',
      'GaN Pro 65W 3-Port Wall Charger',
      'PowerPort III 30W Adapter',
      'Dual USB Fast Charger 18W',
      'Super Fast Charger 45W PPS',
      'Compact Mini Charger 12W',
      'MagSafe Wireless Charging Pad 15W',
      '3-in-1 Foldable Wireless Charging Station',
      '65W Desktop Charging Station with 4 Ports',
      'PD 25W Travel Adapter UK Pin',
      'Dual Port 36W Car & Wall Combo',
      'Magnetic Wireless Charger with Kickstand',
    ],
    baseBuy: 650,
    baseSell: 1150,
  },
  'Audio & Earbuds': {
    prefix: 'AUD',
    names: [
      'Wireless Earbuds Pro with ANC',
      'True Wireless Stereo Earbuds Air',
      'Over-Ear Wireless Headphones PureBass',
      'Sports Neckband Bluetooth Headset',
      'Gaming TWS Earbuds Ultra-Low Latency',
      'Hi-Res In-Ear Earphones with 3.5mm Jack',
      'Type-C Wired Digital Earphones with Mic',
      'Lightning Connector Earbuds for iPhone',
      'Wireless Conference Speakerphone Mic',
      'Studio Monitor Over-Ear Wired Headset',
      'Kids Safe-Volume Foldable Headset',
      'Sleep Earbuds Ultra-Thin Silicone',
    ],
    baseBuy: 1800,
    baseSell: 2750,
  },
  'Cables & Data': {
    prefix: 'CAB',
    names: [
      'Braided USB-C to USB-C 100W Cable 1M',
      'Braided USB-C to Lightning Cable 1.2M',
      'Fast Charging USB-A to Type-C 3A Cable',
      'Heavy Duty Nylon Micro USB Cable 1M',
      '3-in-1 Multi USB Charging Cable 1.5M',
      'Right-Angle 90-Degree Gaming USB-C Cable',
      'Thunderbolt 4 / USB4 40Gbps Video Cable',
      'Silicone Soft-Touch Type-C Cable 2M',
      'Magnetic Quick-Release USB Cable Set',
      'Short 20cm Power Bank Fast Charging Cable',
      'OTG Type-C to USB 3.0 Adapter Cable',
      'Aux 3.5mm to Type-C Audio Adapter Cable',
    ],
    baseBuy: 220,
    baseSell: 450,
  },
  'Power Banks': {
    prefix: 'PWB',
    names: [
      'Power Bank 10000mAh 22.5W Two-Way Fast Charge',
      'Power Bank 20000mAh 65W Laptop PD Charger',
      'MagSafe Magnetic Power Bank 5000mAh Slim',
      'Power Bank 30000mAh Heavy Duty with LED Lamp',
      'Ultra-Slim Mini Power Bank 10000mAh Pocket Size',
      'Solar Charging Power Bank 20000mAh Rugged IP67',
      'Wireless Power Bank 10000mAh with Digital Display',
      'Transparent Cyberpunk Fast Charge Power Bank',
      'Flight-Approved 27000mAh 140W Triple Output',
      'Dual USB Portable Battery Pack 10000mAh',
    ],
    baseBuy: 2400,
    baseSell: 3600,
  },
  'Cases & Protection': {
    prefix: 'CAS',
    names: [
      'Silicone Magnetic Case with Camera Shutter Ring',
      'Military Grade Armor Drop-Proof Case',
      'Ultra-Thin Clear Transparent Shockproof Case',
      'Luxury Vegan Leather Protective Case',
      'Matte Frosted Anti-Fingerprint Bumper Case',
      '9H Tempered Glass Screen Protector Full Glue',
      'Privacy Anti-Spy Tempered Glass Screen Guard',
      'Matte Anti-Glare Ceramic Screen Protector',
      'Metal Camera Lens Protector Ring Set',
      'Carbon Fiber Ultra-Slim Lightweight Cover',
      'Magnetic Kickstand Protective Wallet Case',
    ],
    baseBuy: 280,
    baseSell: 650,
  },
  'Car Accessories': {
    prefix: 'CAR',
    names: [
      'Dual Port Metal Car Charger 45W PD+QC',
      'Magnetic Wireless Car Charger Vent Mount 15W',
      'Bluetooth FM Transmitter & Hands-Free Car Kit',
      'Dashboard Suction Auto-Clamping Phone Holder',
      'Rearview Mirror Adjustable Phone Mount',
      'Cup Holder Flexible Goose-Neck Car Stand',
      'Retractable 3-in-1 Car Charger Cord 60W',
      'Mini Air Vent Gravity Mobile Grip',
      'Headrest Tablet Mount for Kids Backseat',
      'Emergency Car Window Glass Breaker & Seatbelt Cutter',
    ],
    baseBuy: 550,
    baseSell: 1100,
  },
  'Mounts & Stands': {
    prefix: 'MNT',
    names: [
      'Adjustable Aluminum Desktop Phone Stand',
      'Foldable Aluminum Laptop Riser with Heat Dissipation',
      'MagSafe Desktop Charging Stand for iPhone & Apple Watch',
      '360 Swivel Metal Tablet Stand with Weighted Base',
      'Flexible Bed Lazy Arm Tablet & Phone Clamp',
      'Mini Portable Pocket-Size Phone Kickstand',
      'Live Streaming LED Ring Light with Tripod Stand',
      'Overhead Articulating Boom Arm Phone Stand',
      'Under-Desk Dual Headphone Hanger Mount',
    ],
    baseBuy: 450,
    baseSell: 950,
  },
  'Smart Wearables': {
    prefix: 'WBL',
    names: [
      'Silicone Sport Strap for Apple Watch / Ultra',
      'Magnetic Milanese Loop Stainless Steel Band',
      'Rugged TPU Protective Bumper Frame for Watch',
      'Magnetic Wireless Charging Cable for Apple Watch',
      'Tempered Glass Curved Watch Screen Protector 2-Pack',
      'Universal Smart Band Replacement Straps 20mm/22mm',
      'Smart Tracker Anti-Lost Finder Bluetooth Tag',
      'Leather Retro Watch Band with Quick Release Pins',
    ],
    baseBuy: 350,
    baseSell: 750,
  },
  'Gaming Accessories': {
    prefix: 'GAM',
    names: [
      'Mobile Gaming Finger Sleeves Carbon Fiber 4-Pack',
      'Snap-On Mobile Gamepad Triggers L1 R1',
      'Semiconductor Phone Cooling Fan Cooler Radiator',
      'Bluetooth Wireless Gaming Controller for Phone/PC',
      'Type-C Low-Latency Gaming In-Ear Audio Dongle',
      'RGB Headset Stand with Dual USB Hub Ports',
      'Mobile Grip Handle Ergonomic Stand for PUBG/FreeFire',
    ],
    baseBuy: 480,
    baseSell: 980,
  },
  'Other Accessories': {
    prefix: 'OTH',
    names: [
      'Multi-Port USB-C Hub 7-in-1 4K HDMI PD 100W',
      'Dual Slot SD/TF MicroSD Memory Card Reader Type-C',
      'Bluetooth Audio Receiver & Transmitter 5.3',
      'Cable Management Magnetic Clips Organizer 5-Pack',
      'Precision Electronics Cleaning Kit 7-in-1',
      'Silicone Cable Ties Velcro Straps 10-Pack',
      'Webcam Privacy Slide Cover Shutter 3-Pack',
      'Stylus Pen Active Touch for iPad & Android',
    ],
    baseBuy: 600,
    baseSell: 1250,
  },
};

// Generate 600 realistic products deterministically
export function generateProducts(): Product[] {
  const prng = createSeededRandom(42);
  const products: Product[] = [];

  // Seed the 5 specific reference products from PRD first:
  // 1. USB-C Fast Charger 20W (SKU: CHG-020, Barcode: 8901234567012)
  products.push({
    id: 'PRD-0001',
    name: 'USB-C Fast Charger 20W',
    sku: 'CHG-020',
    barcode: '8901234567012',
    category: 'Chargers & Adapters',
    brand: 'Anker',
    buyingPrice: 650,
    sellingPrice: 1050,
    stockQuantity: 45,
    reorderLevel: 10,
    description: 'High efficiency 20W Power Delivery compact wall adapter with smart temperature control.',
    createdAt: '2024-01-15T09:00:00.000Z',
    updatedAt: '2024-03-01T10:00:00.000Z',
  });

  // 2. Wireless Earbuds Pro (SKU: AUD-014, Barcode: 8901234567013)
  products.push({
    id: 'PRD-0002',
    name: 'Wireless Earbuds Pro',
    sku: 'AUD-014',
    barcode: '8901234567013',
    category: 'Audio & Earbuds',
    brand: 'Joyroom',
    buyingPrice: 1800,
    sellingPrice: 2650,
    stockQuantity: 12, // Low stock reorder level is 15
    reorderLevel: 15,
    description: 'Active Noise Cancelling Bluetooth 5.3 earbuds with transparency mode and 30-hour playback.',
    createdAt: '2024-01-16T09:00:00.000Z',
    updatedAt: '2024-03-02T10:00:00.000Z',
  });

  // 3. Power Bank 10000mAh (SKU: PWB-010, Barcode: 8901234567014)
  products.push({
    id: 'PRD-0003',
    name: 'Power Bank 10000mAh',
    sku: 'PWB-010',
    barcode: '8901234567014',
    category: 'Power Banks',
    brand: 'Baseus',
    buyingPrice: 2100,
    sellingPrice: 3000,
    stockQuantity: 4, // Low stock (reorder is 10)
    reorderLevel: 10,
    description: '22.5W Super Charge dual output pocket power bank with LED percentage display.',
    createdAt: '2024-01-17T09:00:00.000Z',
    updatedAt: '2024-03-02T10:00:00.000Z',
  });

  // 4. USB-C Cable 1M (SKU: CAB-001, Barcode: 8901234567015)
  products.push({
    id: 'PRD-0004',
    name: 'USB-C Cable 1M',
    sku: 'CAB-001',
    barcode: '8901234567015',
    category: 'Cables & Data',
    brand: 'Ugreen',
    buyingPrice: 180,
    sellingPrice: 350,
    stockQuantity: 120,
    reorderLevel: 25,
    description: 'Durable nylon braided 60W fast sync & charge Type-C cable.',
    createdAt: '2024-01-18T09:00:00.000Z',
    updatedAt: '2024-03-03T10:00:00.000Z',
  });

  // 5. iPhone 20W Adapter (SKU: CHG-022, Barcode: 8901234567016)
  products.push({
    id: 'PRD-0005',
    name: 'iPhone 20W Adapter',
    sku: 'CHG-022',
    barcode: '8901234567016',
    category: 'Chargers & Adapters',
    brand: 'Apple',
    buyingPrice: 900,
    sellingPrice: 1450,
    stockQuantity: 0, // Out of stock!
    reorderLevel: 12,
    description: 'Original specification 20W USB-C power adapter compatible with iPhone 11-15 series.',
    createdAt: '2024-01-19T09:00:00.000Z',
    updatedAt: '2024-03-04T10:00:00.000Z',
  });

  // Generate remaining 595 products
  let categoryIdx = 0;
  for (let i = 6; i <= 600; i++) {
    const category = CATEGORIES[categoryIdx % CATEGORIES.length];
    const catConfig = CATEGORY_TEMPLATES[category];
    const brand = BRANDS[Math.floor(prng() * BRANDS.length)];
    const templateName = catConfig.names[Math.floor(prng() * catConfig.names.length)];
    
    // Add variations to generate unique names
    const versionNum = Math.floor(i / 10) + 1;
    const colorOptions = ['Black', 'White', 'Titanium Gray', 'Midnight Blue', 'Space Silver', 'Gunmetal'];
    const color = colorOptions[Math.floor(prng() * colorOptions.length)];
    const fullName = `${brand} ${templateName} (${color})`;

    const idStr = String(i).padStart(4, '0');
    const sku = `${catConfig.prefix}-${String(i).padStart(3, '0')}`;
    const barcode = `89012345${String(67000 + i).slice(-5)}`;

    // Pricing calculation: realistic profit margin ~35% - 55%
    const markupFactor = 1.35 + prng() * 0.35;
    const baseVariation = 0.8 + prng() * 0.5;
    const rawBuy = Math.round((catConfig.baseBuy * baseVariation) / 10) * 10;
    const buyingPrice = Math.max(120, rawBuy);
    const rawSell = Math.round((buyingPrice * markupFactor) / 10) * 10;
    const sellingPrice = Math.max(buyingPrice + 50, rawSell);

    // Stock quantities:
    // We want exactly 12 products running low (stock < reorderLevel) and 3 out of stock (stock == 0)
    let stockQuantity: number;
    const reorderLevel = 10 + Math.floor(prng() * 10); // 10 to 19

    if (i === 15 || i === 89) {
      // Out of stock
      stockQuantity = 0;
    } else if ([7, 18, 29, 44, 62, 83, 105, 142, 178, 215].includes(i)) {
      // Low stock items (stock between 1 and 5, while reorder is 10-15)
      stockQuantity = 2 + Math.floor(prng() * 4);
    } else {
      // Normal healthy stock
      stockQuantity = 12 + Math.floor(prng() * 65);
    }

    products.push({
      id: `PRD-${idStr}`,
      name: fullName,
      sku,
      barcode,
      category,
      brand,
      buyingPrice,
      sellingPrice,
      stockQuantity,
      reorderLevel,
      description: `Premium quality ${templateName.toLowerCase()} engineered by ${brand} for reliable daily retail electronics performance.`,
      createdAt: new Date(Date.now() - (600 - i) * 86400000 * 0.2).toISOString(),
      updatedAt: new Date(Date.now() - (i % 20) * 86400000).toISOString(),
    });

    categoryIdx++;
  }

  return products;
}

// Generate 55 realistic Pakistani customers
export function generateCustomers(): Customer[] {
  const prng = createSeededRandom(101);
  const cities = ['Multan', 'Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Bahawalpur'];
  
  const customerNames = [
    'Walk-in Customer',
    'Muhammad Usman',
    'Ahmed Raza Qureshi',
    'Bilal Farooq',
    'Zainab Fatima',
    'Hamza Tariq',
    'Ali Hassan',
    'Saad Rafique',
    'Fatima Noor',
    'Kashif Mehmood',
    'Omer Sheikh',
    'Zeeshan Malik',
    'Ayesha Siddiqui',
    'Waqas Aslam',
    'Shahid Imran',
    'Hassan Javed',
    'Mariam Khan',
    'Kamran Bashir',
    'Taimoor Shah',
    'Nabeel Akhtar',
    'Sana Ullah',
    'Danish Riaz',
    'Asad Munir',
    'Farhan Saeed',
    'Irfan Gujjar',
    'Hina Babar',
    'Mohsin Raza',
    'Waleed Ashraf',
    'Adnan Latif',
    'Khurram Shehzad',
    'Rehan Siddique',
    'Adeel Anjum',
    'Sohail Warraich',
    'Fahad Mustaq',
    'Shoaib Lodhi',
    'Babar Azam',
    'Rizwan Bhatti',
    'Shaheen Afridi',
    'Haris Rauf',
    'Naseem Shah',
    'Abdullah Shafique',
    'Shan Masood',
    'Imam Ul Haq',
    'Fakhar Zaman',
    'Sarfaraz Ahmed',
    'Shadab Khan',
    'Imad Wasim',
    'Yasir Shah',
    'Azhar Ali',
    'Misbah Ul Haq',
    'Younis Khan',
    'Inzamam Ul Haq',
    'Wasim Akram',
    'Waqar Younis',
    'Shoaib Akhtar',
  ];

  const customers: Customer[] = customerNames.map((name, idx) => {
    if (idx === 0) {
      return {
        id: 'CUST-000',
        name: 'Walk-in Customer',
        phone: '+92 300 0000000',
        email: 'walkin@store.pk',
        address: 'In-Store Counter',
        city: 'Multan',
        totalPurchases: 284,
        totalSpent: 489500,
        lastPurchaseDate: new Date().toISOString(),
        createdAt: '2024-01-01T00:00:00.000Z',
      };
    }

    const city = cities[Math.floor(prng() * cities.length)];
    const code = ['300', '301', '302', '321', '333', '345', '312'][Math.floor(prng() * 7)];
    const phoneNum = Math.floor(1000000 + prng() * 8999999);
    const phone = `+92 ${code} ${phoneNum}`;
    const slug = name.toLowerCase().replace(/[^a-z]/g, '');
    const email = `${slug}${idx}@gmail.com`;

    const totalPurchases = 1 + Math.floor(prng() * 12);
    const totalSpent = totalPurchases * (1200 + Math.floor(prng() * 4500));

    return {
      id: `CUST-${String(idx).padStart(3, '0')}`,
      name,
      phone,
      email,
      address: `Street ${1 + Math.floor(prng() * 25)}, Sector ${String.fromCharCode(65 + Math.floor(prng() * 6))}, ${city}`,
      city,
      totalPurchases,
      totalSpent,
      lastPurchaseDate: new Date(Date.now() - Math.floor(prng() * 45) * 86400000).toISOString(),
      createdAt: new Date(Date.now() - (60 + Math.floor(prng() * 120)) * 86400000).toISOString(),
    };
  });

  return customers;
}

// Generate realistic Invoices (at least 100 historical + today's 38 sales matching KPI)
export function generateInvoices(products: Product[], customers: Customer[]): Invoice[] {
  const prng = createSeededRandom(777);
  const paymentMethods: PaymentMethod[] = ['Cash', 'Cash', 'Card', 'Cash', 'Bank Transfer'];
  const invoices: Invoice[] = [];

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);

  // Generate 38 sales for TODAY to match the KPI Card:
  // CARD 1: Total Sales PKR 84,650
  // CARD 2: Gross Profit PKR 21,480
  // CARD 4: Transactions 38
  const targetSales = 84650;
  const targetGrossProfit = 21480;

  // Let's create the 38 invoices for today such that their sum equals exactly 84,650 and gross profit is 21,480
  let currentSalesSum = 0;
  let currentProfitSum = 0;

  for (let i = 1; i <= 38; i++) {
    const invNum = 1045 - (38 - i);
    const invId = `INV-${invNum}`;

    // Time spread between 9:15 AM and current hour
    const minuteOffset = Math.floor((i / 38) * 540); // spread across 9 hours
    const invoiceTime = new Date(startOfDay.getTime() + minuteOffset * 60000).toISOString();

    const customer = i % 3 === 0 ? customers[0] : customers[1 + Math.floor(prng() * (customers.length - 1))];
    const method = paymentMethods[Math.floor(prng() * paymentMethods.length)];

    // Pick 1 to 3 items
    const itemCount = 1 + Math.floor(prng() * 2);
    const items = [];
    let subtotal = 0;
    let cogs = 0;

    for (let j = 0; j < itemCount; j++) {
      const prod = products[Math.floor(prng() * Math.min(products.length, 120))];
      const qty = 1 + Math.floor(prng() * 2);
      const lineTotal = prod.sellingPrice * qty;
      const lineCost = prod.buyingPrice * qty;

      subtotal += lineTotal;
      cogs += lineCost;

      items.push({
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        barcode: prod.barcode,
        quantity: qty,
        unitPrice: prod.sellingPrice,
        buyingPrice: prod.buyingPrice,
        discount: 0,
        total: lineTotal,
      });
    }

    const discount = i % 5 === 0 ? 100 : 0;
    const total = subtotal - discount;
    const profit = total - cogs;

    currentSalesSum += total;
    currentProfitSum += profit;

    const amountPaid = method === 'Cash' ? Math.ceil(total / 500) * 500 : total;
    const changeDue = amountPaid - total;

    invoices.push({
      id: invId,
      date: invoiceTime,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
      },
      cashier: i % 2 === 0 ? 'Admin (Bilal)' : 'Staff Cashier (Hamza)',
      cashierRole: i % 2 === 0 ? 'admin' : 'staff',
      items,
      subtotal,
      discount,
      discountType: 'fixed',
      tax: 0,
      total,
      costOfGoodsSold: cogs,
      grossProfit: profit,
      paymentMethod: method,
      amountPaid,
      changeDue,
      status: 'Paid',
    });
  }

  // Adjust the last 2 invoices so that today's total is exactly 84,650 and gross profit is 21,480
  const salesDiff = targetSales - currentSalesSum;
  const profitDiff = targetGrossProfit - currentProfitSum;

  if (invoices.length > 0) {
    const last = invoices[invoices.length - 1];
    last.total += salesDiff;
    last.subtotal += salesDiff;
    last.amountPaid = last.paymentMethod === 'Cash' ? Math.ceil(last.total / 100) * 100 : last.total;
    last.changeDue = last.amountPaid - last.total;
    last.costOfGoodsSold += (salesDiff - profitDiff);
    last.grossProfit = last.total - last.costOfGoodsSold;
    if (last.items.length > 0) {
      last.items[0].unitPrice += salesDiff;
      last.items[0].total += salesDiff;
      last.items[0].buyingPrice += (salesDiff - profitDiff);
    }
  }

  // Generate 85 historical invoices across the previous 30-90 days
  for (let i = 1; i <= 85; i++) {
    const invNum = 1000 - i;
    const invId = `INV-${invNum}`;
    const daysAgo = 1 + Math.floor(prng() * 88);
    const invDate = new Date(now.getTime() - daysAgo * 86400000 - Math.floor(prng() * 40000000)).toISOString();

    const customer = i % 4 === 0 ? customers[0] : customers[1 + Math.floor(prng() * (customers.length - 1))];
    const method = paymentMethods[Math.floor(prng() * paymentMethods.length)];

    const itemCount = 1 + Math.floor(prng() * 3);
    const items = [];
    let subtotal = 0;
    let cogs = 0;

    for (let j = 0; j < itemCount; j++) {
      const prod = products[Math.floor(prng() * Math.min(products.length, 150))];
      const qty = 1 + Math.floor(prng() * 3);
      const lineTotal = prod.sellingPrice * qty;
      const lineCost = prod.buyingPrice * qty;

      subtotal += lineTotal;
      cogs += lineCost;

      items.push({
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        barcode: prod.barcode,
        quantity: qty,
        unitPrice: prod.sellingPrice,
        buyingPrice: prod.buyingPrice,
        discount: 0,
        total: lineTotal,
      });
    }

    const discount = i % 6 === 0 ? 150 : 0;
    const total = subtotal - discount;
    const profit = total - cogs;
    const amountPaid = method === 'Cash' ? Math.ceil(total / 500) * 500 : total;

    // Mark a few older invoices as partially returned or returned
    const status: 'Paid' | 'Partially Returned' | 'Returned' = 
      i === 12 ? 'Returned' : i === 24 ? 'Partially Returned' : 'Paid';

    invoices.push({
      id: invId,
      date: invDate,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
      },
      cashier: i % 2 === 0 ? 'Admin (Bilal)' : 'Staff Cashier (Hamza)',
      cashierRole: i % 2 === 0 ? 'admin' : 'staff',
      items,
      subtotal,
      discount,
      discountType: 'fixed',
      tax: 0,
      total,
      costOfGoodsSold: cogs,
      grossProfit: profit,
      paymentMethod: method,
      amountPaid,
      changeDue: amountPaid - total,
      status,
    });
  }

  // Sort invoices: newest first
  return invoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Generate Stock Entries (Purchases / Replenishments)
export function generateStockEntries(products: Product[]): StockEntry[] {
  const prng = createSeededRandom(555);
  const suppliers = [
    'Anker Pakistan Official Importers',
    'Baseus Wholesale Karachi Hub',
    'Shenzhen Prime Electronics Co.',
    'Ugreen Direct Multan Distribution',
    'TechZone Lahore Wholesale Market',
    'Crown Mobile Accessories Multan',
  ];

  const entries: StockEntry[] = [];
  const now = new Date();

  for (let i = 1; i <= 14; i++) {
    const daysAgo = (i - 1) * 6 + 1;
    const entryDate = new Date(now.getTime() - daysAgo * 86400000).toISOString();
    const supplier = suppliers[Math.floor(prng() * suppliers.length)];
    const itemCount = 2 + Math.floor(prng() * 4);
    const items = [];
    let totalCost = 0;

    for (let j = 0; j < itemCount; j++) {
      const prod = products[Math.floor(prng() * 80)];
      const qty = 20 + Math.floor(prng() * 50);
      const buyingCost = prod.buyingPrice;
      const lineCost = qty * buyingCost;
      totalCost += lineCost;

      items.push({
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantity: qty,
        buyingCost,
        total: lineCost,
      });
    }

    entries.push({
      id: `SE-2024-${String(i).padStart(3, '0')}`,
      date: entryDate,
      supplierName: supplier,
      referenceNumber: `PO-${89200 + i}`,
      items,
      totalCost,
      notes: `Batch ${i} incoming verification passed. Stock verified and barcode scanned.`,
      receivedBy: 'Admin (Bilal)',
    });
  }

  return entries;
}

// Generate Return Records linked to invoices
export function generateReturnRecords(invoices: Invoice[]): ReturnRecord[] {
  const returns: ReturnRecord[] = [];
  const returnReasons = [
    'Defective product',
    'Wrong product',
    'Customer changed mind',
    'Damaged packaging',
  ] as const;

  // Link to specific invoices
  const returnedInvoices = invoices.filter(inv => inv.status !== 'Paid').slice(0, 4);

  returnedInvoices.forEach((inv, idx) => {
    const item = inv.items[0];
    const qtyToReturn = 1;
    const refundAmt = item.unitPrice * qtyToReturn;
    const reason = returnReasons[idx % returnReasons.length];

    returns.push({
      id: `RET-${String(301 + idx).padStart(3, '0')}`,
      invoiceId: inv.id,
      customerId: inv.customer.id,
      customerName: inv.customer.name,
      date: new Date(new Date(inv.date).getTime() + 86400000).toISOString(),
      items: [
        {
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          quantity: qtyToReturn,
          unitPrice: item.unitPrice,
          refundAmount: refundAmt,
          reason,
          restockable: reason !== 'Defective product',
        },
      ],
      refundTotal: refundAmt,
      refundMethod: inv.paymentMethod === 'Cash' ? 'Cash' : 'Store Credit',
      processedBy: 'Admin (Bilal)',
      notes: `Returned under 7-day guarantee. Inspection result: ${reason}.`,
    });
  });

  return returns;
}

// Generate Initial Activity Logs
export function generateActivityLogs(): ActivityLog[] {
  const logs: ActivityLog[] = [
    {
      id: 'ACT-001',
      user: 'Admin (Bilal)',
      role: 'admin',
      action: 'Sale Completed',
      record: 'INV-1045',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      details: 'Completed cash sale of 2 items (PKR 3,700) for Walk-in Customer.',
      type: 'sale',
    },
    {
      id: 'ACT-002',
      user: 'Staff Cashier (Hamza)',
      role: 'staff',
      action: 'Sale Completed',
      record: 'INV-1044',
      timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
      details: 'Processed card payment of PKR 1,050 for USB-C Fast Charger 20W.',
      type: 'sale',
    },
    {
      id: 'ACT-003',
      user: 'Admin (Bilal)',
      role: 'admin',
      action: 'Stock Replenishment',
      record: 'CHG-020',
      timestamp: new Date(Date.now() - 52 * 60000).toISOString(),
      details: 'Added +50 units of Anker USB-C Fast Charger 20W from Baseus Wholesale Hub.',
      type: 'stock_entry',
    },
    {
      id: 'ACT-004',
      user: 'Admin (Bilal)',
      role: 'admin',
      action: 'Return Processed',
      record: 'RET-304',
      timestamp: new Date(Date.now() - 110 * 60000).toISOString(),
      details: 'Refunded PKR 2,650 for Wireless Earbuds Pro on invoice INV-988 (Defective item).',
      type: 'return',
    },
    {
      id: 'ACT-005',
      user: 'Staff Cashier (Hamza)',
      role: 'staff',
      action: 'Invoice Printed',
      record: 'INV-1042',
      timestamp: new Date(Date.now() - 160 * 60000).toISOString(),
      details: 'Generated 80mm thermal receipt for Customer Ahmed Raza Qureshi.',
      type: 'sale',
    },
    {
      id: 'ACT-006',
      user: 'Admin (Bilal)',
      role: 'admin',
      action: 'Product Edited',
      record: 'AUD-014',
      timestamp: new Date(Date.now() - 210 * 60000).toISOString(),
      details: 'Updated reorder threshold level from 10 to 15 units.',
      type: 'inventory',
    },
    {
      id: 'ACT-007',
      user: 'Admin (Bilal)',
      role: 'admin',
      action: 'Customer Added',
      record: 'CUST-042',
      timestamp: new Date(Date.now() - 320 * 60000).toISOString(),
      details: 'Registered customer Shaheen Afridi with phone +92 300 4819234.',
      type: 'customer',
    },
    {
      id: 'ACT-008',
      user: 'Admin (Bilal)',
      role: 'admin',
      action: 'Excel Inventory Import',
      record: 'Batch-102',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      details: 'Imported and verified 600 electronic accessories SKU records into STOCKROOM catalog.',
      type: 'system',
    },
  ];

  return logs;
}

// Generate Initial Notifications
export function generateNotifications(): NotificationItem[] {
  return [
    {
      id: 'NOTIF-01',
      title: 'Low Stock Alert',
      message: 'Power Bank 10000mAh (SKU: PWB-010) has reached 4 units (below reorder level of 10).',
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      read: false,
      type: 'warning',
      link: '/app/inventory',
    },
    {
      id: 'NOTIF-02',
      title: 'Out of Stock Alert',
      message: 'iPhone 20W Adapter (SKU: CHG-022) is completely out of stock (0 units).',
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      read: false,
      type: 'alert',
      link: '/app/inventory',
    },
    {
      id: 'NOTIF-03',
      title: 'Daily Sales Target Reached',
      message: 'Today sales exceeded PKR 80,000 across 38 transactions.',
      timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
      read: false,
      type: 'success',
      link: '/app',
    },
    {
      id: 'NOTIF-04',
      title: 'Incoming Stock Verified',
      message: 'Stock entry SE-2024-014 recorded with 85 received units from Crown Mobile Accessories.',
      timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
      read: true,
      type: 'info',
      link: '/app/purchases',
    },
  ];
}

