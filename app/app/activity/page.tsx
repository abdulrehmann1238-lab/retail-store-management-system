'use client';

import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  CheckCircle,
  Package,
  ShoppingCart,
  RotateCcw,
  User,
  Truck,
  Settings,
  Layers,
  Calendar,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useStore } from '@/lib/store';
import { ActivityLog } from '@/types';
import { formatDate, formatTime } from '@/lib/utils';

export default function ActivityLogPage() {
  const { activityLogs } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredLogs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return activityLogs.filter(log => {
      const matchSearch =
        !q ||
        log.action.toLowerCase().includes(q) ||
        log.record.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q);

      const matchType = typeFilter === 'all' || log.type === typeFilter;
      const matchRole = roleFilter === 'all' || log.role === roleFilter;

      return matchSearch && matchType && matchRole;
    });
  }, [activityLogs, searchQuery, typeFilter, roleFilter]);

  const getActivityIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'sale':
        return <ShoppingCart className="w-3.5 h-3.5 text-brand" />;
      case 'inventory':
        return <Package className="w-3.5 h-3.5 text-warm" />;
      case 'stock_entry':
        return <Truck className="w-3.5 h-3.5 text-brand-sage" />;
      case 'return':
        return <RotateCcw className="w-3.5 h-3.5 text-status-danger" />;
      case 'customer':
        return <User className="w-3.5 h-3.5 text-content-primary" />;
      default:
        return <History className="w-3.5 h-3.5 text-content-secondary" />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-content-primary">
              Live Activity Audit Log
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
              Review every operation performed across Point of Sale, stock replenishment and customer management.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 rounded-xl bg-app-surface border border-app-border shadow-subtle flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-content-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search activity by action, record (e.g. 'INV-1045'), or user..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand text-content-primary"
            />
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand text-content-primary"
          >
            <option value="all">All Event Types</option>
            <option value="sale">Sales & Checkout</option>
            <option value="inventory">Catalog & Price Edits</option>
            <option value="stock_entry">Stock Replenishment</option>
            <option value="return">Customer Returns</option>
            <option value="customer">Customer Registration</option>
            <option value="system">Excel & System</option>
          </select>

          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand text-content-primary"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin Actions</option>
            <option value="staff">Staff Actions</option>
          </select>
        </div>

        {/* Activity Table */}
        <div className="bg-app-surface border border-app-border rounded-xl shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-app-secondary/50 text-content-secondary border-b border-app-border">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">User & Role</th>
                  <th className="py-3 px-3 text-left font-semibold">Action</th>
                  <th className="py-3 px-3 text-left font-semibold">Record Ref</th>
                  <th className="py-3 px-4 text-left font-semibold">Event Details</th>
                  <th className="py-3 px-4 text-right font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-app-secondary/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-content-primary">{log.user}</div>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-app-secondary text-content-secondary">
                        {log.role}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-medium text-content-primary">
                        {getActivityIcon(log.type)}
                        <span>{log.action}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-brand">
                      {log.record}
                    </td>
                    <td className="py-3 px-4 text-content-secondary max-w-md leading-relaxed">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap text-content-secondary">
                      <div>{formatDate(log.timestamp)}</div>
                      <div className="text-[10px] text-content-muted">{formatTime(log.timestamp)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

