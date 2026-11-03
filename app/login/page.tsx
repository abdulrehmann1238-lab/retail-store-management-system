'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, UserCheck, ArrowRight, Lock, Mail, Store } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { useStore } from '@/lib/store';
import { Role } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useStore();

  const [selectedRole, setSelectedRole] = useState<Role>('admin');
  const [email, setEmail] = useState('admin@stockroom.pk');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    if (role === 'admin') {
      setEmail('admin@stockroom.pk');
    } else {
      setEmail('cashier@stockroom.pk');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRole(selectedRole);

    setTimeout(() => {
      router.push('/app');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-app-bg flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link href="/">
          <Logo />
        </Link>
        <Link
          href="/"
          className="text-xs text-content-secondary hover:text-content-primary transition-colors"
        >
          ← Return to Overview
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto animate-in fade-in duration-300">
        <div className="bg-app-surface border border-app-border rounded-2xl p-7 sm:p-9 shadow-elevated space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-content-primary">
              Sign In to STOCKROOM
            </h2>
            <p className="text-xs text-content-secondary">
              Multan Flagship Store • Retail Management Terminal
            </p>
          </div>

          {/* Quick Demo Role Selector Tabs */}
          <div>
            <label className="block text-[11px] font-semibold text-content-secondary uppercase tracking-wider mb-2 text-center">
              Select Demo Role Profile
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-app-secondary rounded-xl border border-app-border">
              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-app-surface text-brand shadow-subtle border border-app-border'
                    : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Owner</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('staff')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  selectedRole === 'staff'
                    ? 'bg-app-surface text-brand shadow-subtle border border-app-border'
                    : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Staff Cashier</span>
              </button>
            </div>
            <p className="text-[11px] text-content-muted text-center mt-1.5">
              {selectedRole === 'admin'
                ? 'Full access: Profit analytics, buying prices & store settings.'
                : 'Operational access: POS register & invoices (cost prices hidden).'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-content-primary mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-content-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand font-medium text-content-primary"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-content-primary">Password</label>
                <span className="text-[10px] text-brand hover:underline cursor-pointer">
                  Demo auto-filled
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-content-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-app-secondary border border-app-border rounded-lg outline-none focus:border-brand text-content-primary font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold text-xs shadow-card flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? (
                <span>Accessing Workspace...</span>
              ) : (
                <>
                  <span>Sign In as {selectedRole === 'admin' ? 'Store Admin' : 'Cashier'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-app-border text-center">
            <span className="text-[11px] text-content-muted">
              Interactive demonstration with deterministic local storage state.
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-content-secondary max-w-6xl mx-auto w-full">
        STOCKROOM Retail Management System • Gulgasht Center, Multan, Pakistan
      </div>
    </div>
  );
}

