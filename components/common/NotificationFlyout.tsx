'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle, Info, Bell, Check, ExternalLink } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatDateTime } from '@/lib/utils';

interface NotificationFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationFlyout: React.FC<NotificationFlyoutProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useStore();

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div
      className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-app-surface rounded-xl border border-app-border shadow-elevated overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-app-border bg-app-surface">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-brand" />
          <span className="text-sm font-semibold text-content-primary">Store Alerts</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-status-dangerSoft text-status-danger">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllNotificationsRead()}
            className="text-xs text-brand hover:underline font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto divide-y divide-app-border/50">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-content-secondary">
            No notifications at this moment.
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              className={`p-3.5 transition-colors cursor-pointer hover:bg-app-secondary/60 flex items-start gap-3 ${
                !notif.read ? 'bg-brand-soft/30' : ''
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {notif.type === 'alert' && (
                  <div className="w-6 h-6 rounded-full bg-status-dangerSoft flex items-center justify-center text-status-danger">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                )}
                {notif.type === 'warning' && (
                  <div className="w-6 h-6 rounded-full bg-status-warningSoft flex items-center justify-center text-status-warning">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                )}
                {notif.type === 'success' && (
                  <div className="w-6 h-6 rounded-full bg-status-successSoft flex items-center justify-center text-status-success">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                )}
                {notif.type === 'info' && (
                  <div className="w-6 h-6 rounded-full bg-app-secondary flex items-center justify-center text-content-secondary">
                    <Info className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className={`text-xs font-medium leading-tight ${!notif.read ? 'text-content-primary font-semibold' : 'text-content-secondary'}`}>
                    {notif.title}
                  </h4>
                  {!notif.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                  )}
                </div>
                <p className="text-xs text-content-secondary mt-0.5 line-clamp-2 leading-relaxed">
                  {notif.message}
                </p>
                <div className="flex items-center justify-between mt-2 pt-1">
                  <span className="text-[10px] text-content-muted">
                    {formatDateTime(notif.timestamp)}
                  </span>
                  {notif.link && (
                    <Link
                      href={notif.link}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 text-[11px] text-brand hover:underline font-medium"
                    >
                      <span>View</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-2 border-t border-app-border bg-app-secondary/30 text-center">
        <Link
          href="/app/activity"
          onClick={onClose}
          className="text-xs font-medium text-brand hover:underline"
        >
          View Full Store Activity Log →
        </Link>
      </div>
    </div>
  );
};

