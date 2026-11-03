'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Package,
  Truck,
  Receipt,
  RotateCcw,
  Users,
  BarChart3,
  History,
  Settings,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Shield,
  UserCheck,
  Plus,
  Store,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { GlobalSearch } from '../common/GlobalSearch';
import { NotificationFlyout } from '../common/NotificationFlyout';
import { DemoControls } from '../common/DemoControls';
import { useStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');

  const {
    currentRole,
    currentUser,
    setRole,
    notifications,
    isInitialized,
    initialize,
  } = useStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleDateString('en-PK', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { name: 'Overview', href: '/app', icon: LayoutDashboard },
    { name: 'Point of Sale', href: '/app/pos', icon: ShoppingCart, badge: 'POS' },
    { name: 'Inventory', href: '/app/inventory', icon: Boxes },
    { name: 'Products', href: '/app/products', icon: Package },
    { name: 'Stock Entries', href: '/app/purchases', icon: Truck },
    { name: 'Invoices', href: '/app/invoices', icon: Receipt },
    { name: 'Returns', href: '/app/returns', icon: RotateCcw },
    { name: 'Customers', href: '/app/customers', icon: Users },
    // Reports is strictly admin-only
    ...(currentRole === 'admin'
      ? [{ name: 'Reports & Analytics', href: '/app/reports', icon: BarChart3, adminOnly: true }]
      : []),
    { name: 'Activity Log', href: '/app/activity', icon: History },
    { name: 'Settings', href: '/app/settings', icon: Settings },
  ];

  // Derive current page title
  const currentNavItem = navItems.find(
    item => item.href === pathname || (item.href !== '/app' && pathname?.startsWith(item.href))
  );
  const pageTitle = currentNavItem?.name || 'Store Management';

  return (
    <div className="min-h-screen bg-app-bg flex flex-col selection:bg-brand-soft selection:text-brand">
      {/* Desktop & Tablet Sidebar */}
      <div className="flex flex-1">
        <aside
          className={`hidden lg:flex flex-col bg-app-surface border-r border-app-border transition-all duration-200 z-30 shrink-0 sticky top-0 h-screen ${
            collapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Logo & Store Info */}
          <div className="h-18 px-5 border-b border-app-border flex items-center justify-between shrink-0">
            <Link href="/app" className="flex items-center">
              <Logo collapsed={collapsed} />
            </Link>
          </div>

          {/* Store Location Badge */}
          {!collapsed && (
            <div className="px-5 py-2.5 bg-app-secondary/40 border-b border-app-border flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-content-secondary">
                <Store className="w-3.5 h-3.5 text-brand" />
                <span className="font-medium truncate">Gulgasht Branch, Multan</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-status-success shrink-0" title="System Online" />
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {navItems.map(item => {
              const isActive =
                item.href === '/app'
                  ? pathname === '/app'
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand text-white shadow-subtle'
                      : 'text-content-secondary hover:text-content-primary hover:bg-app-secondary'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-content-secondary group-hover:text-content-primary'
                    }`}
                  />
                  {!collapsed && (
                    <div className="flex-1 flex items-center justify-between">
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded font-bold bg-white/20 text-white">
                          {item.badge}
                        </span>
                      )}
                      {item.adminOnly && (
                        <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded font-bold bg-brand-soft text-brand">
                          ADMIN
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Role Status & User Profile in Bottom Sidebar */}
          <div className="p-3 border-t border-app-border shrink-0 bg-app-surface">
            {!collapsed ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg bg-app-secondary/60">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {currentUser.avatar}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-content-primary truncate">
                        {currentUser.name}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-content-secondary">
                        {currentRole === 'admin' ? (
                          <Shield className="w-3 h-3 text-brand" />
                        ) : (
                          <UserCheck className="w-3 h-3 text-warm" />
                        )}
                        <span className="capitalize">{currentRole}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setRole(currentRole === 'admin' ? 'staff' : 'admin')}
                    className="p-1.5 rounded-md hover:bg-app-surface text-content-secondary hover:text-content-primary text-[10px] font-medium border border-app-border"
                    title="Quick Role Switch"
                  >
                    Switch
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-content-secondary px-1">
                  <span className="text-[11px]">STOCKROOM v2.4</span>
                  <button
                    onClick={() => setCollapsed(true)}
                    className="p-1 rounded hover:bg-app-secondary text-content-secondary hover:text-content-primary"
                    title="Collapse Sidebar"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center cursor-pointer"
                  onClick={() => setRole(currentRole === 'admin' ? 'staff' : 'admin')}
                  title={`Current: ${currentRole}. Click to toggle.`}
                >
                  {currentUser.avatar}
                </div>
                <button
                  onClick={() => setCollapsed(false)}
                  className="p-1.5 rounded-md hover:bg-app-secondary text-content-secondary hover:text-content-primary"
                  title="Expand Sidebar"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Slide-Out Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] bg-app-surface border-r border-app-border h-full flex flex-col z-10 shadow-elevated">
              <div className="h-16 px-5 border-b border-app-border flex items-center justify-between">
                <Logo />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-content-secondary hover:text-content-primary rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-5 py-2.5 bg-app-secondary/40 border-b border-app-border flex items-center gap-1.5 text-xs text-content-secondary">
                <Store className="w-3.5 h-3.5 text-brand" />
                <span>Gulgasht Branch, Multan</span>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {navItems.map(item => {
                  const isActive =
                    item.href === '/app'
                      ? pathname === '/app'
                      : pathname?.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-brand text-white shadow-subtle'
                          : 'text-content-secondary hover:text-content-primary hover:bg-app-secondary'
                      }`}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded font-bold bg-white/20 text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-app-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-content-secondary">Role:</span>
                  <button
                    onClick={() => setRole(currentRole === 'admin' ? 'staff' : 'admin')}
                    className="font-bold uppercase text-brand text-xs px-2 py-0.5 rounded bg-brand-soft"
                  >
                    {currentRole} (Tap to Switch)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header (~72px high) */}
          <header className="h-18 px-4 sm:px-8 border-b border-app-border bg-app-surface/90 backdrop-blur-xs sticky top-0 z-20 flex items-center justify-between shrink-0">
            {/* Left: Mobile Toggle & Breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 text-content-secondary hover:text-content-primary rounded-lg"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <div className="flex items-center gap-1.5 text-[11px] text-content-secondary">
                  <Link href="/app" className="hover:text-brand transition-colors">
                    Store
                  </Link>
                  <span>/</span>
                  <span className="text-content-primary font-medium">{pageTitle}</span>
                </div>
                <h1 className="text-lg font-semibold tracking-tight text-content-primary leading-tight">
                  {pageTitle}
                </h1>
              </div>
            </div>

            {/* Right: Search, Date, Notifications, New Sale */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              {/* Global Search Bar Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-app-secondary hover:bg-app-border/40 border border-app-border text-xs text-content-secondary transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="text-content-secondary">Search products, SKUs, invoices...</span>
                <kbd className="text-[10px] font-mono px-1.5 py-0.2 bg-app-surface border border-app-border rounded">
                  ⌘K
                </kbd>
              </button>

              {/* Mobile Search Icon */}
              <button
                onClick={() => setSearchOpen(true)}
                className="sm:hidden p-2 text-content-secondary hover:text-content-primary rounded-lg hover:bg-app-secondary"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Current Date Display */}
              <div className="hidden xl:flex items-center text-xs text-content-secondary border-l border-app-border pl-4">
                <span>{currentDateTime}</span>
              </div>

              {/* Notifications with Flyout */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 text-content-secondary hover:text-content-primary rounded-lg hover:bg-app-secondary transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-status-danger ring-2 ring-white" />
                  )}
                </button>

                <NotificationFlyout
                  isOpen={notifOpen}
                  onClose={() => setNotifOpen(false)}
                />
              </div>

              {/* New Sale Button */}
              <Link
                href="/app/pos"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs font-medium shadow-subtle transition-all active:scale-98"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Sale</span>
              </Link>
            </div>
          </header>

          {/* Main Page Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto animate-in fade-in duration-200">
            {children}
          </main>
        </div>
      </div>

      {/* Global Command Search Modal */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Global Interactive Demo Controls */}
      <DemoControls />
    </div>
  );
};

