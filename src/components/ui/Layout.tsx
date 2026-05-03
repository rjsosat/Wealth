import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Wallet, Settings, CircleDollarSign, Target } from 'lucide-react';
import { PendingReviewModal } from './PendingReviewModal';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-900 pb-16 md:pb-0 selection:bg-indigo-100 selection:text-indigo-900">
      <PendingReviewModal />
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 bg-white/70 backdrop-blur-lg shadow-xl border-r border-gray-100 p-6 fixed h-full z-10">
        <div className="font-bold text-2xl text-indigo-600 mb-10 flex items-center gap-2">
           <CircleDollarSign className="w-8 h-8"/> Wealth
        </div>
        <nav className="flex flex-col gap-4">
          <NavItem to="/" icon={<LayoutDashboard />} label="Dashboard" />
          <NavItem to="/transactions" icon={<Wallet />} label="Transactions" />
          <NavItem to="/budgets" icon={<Target />} label="Budgets" />
          <NavItem to="/accounts" icon={<CircleDollarSign />} label="Accounts" />
          <NavItem to="/settings" icon={<Settings />} label="Settings" />
        </nav>
      </aside>
      
      {/* Mobile Desktop spacer */}
      <div className="hidden md:block w-64 flex-shrink-0" />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-2xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex justify-around items-center h-16 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe pt-1">
        <NavItem to="/" icon={<LayoutDashboard className="w-6 h-6" />} label="Home" mobile />
        <NavItem to="/transactions" icon={<Wallet className="w-6 h-6" />} label="Transact" mobile />
        <NavItem to="/budgets" icon={<Target className="w-6 h-6" />} label="Budgets" mobile />
        <NavItem to="/accounts" icon={<CircleDollarSign className="w-6 h-6" />} label="Accounts" mobile />
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label, mobile = false }: { to: string, icon: React.ReactNode, label: string, mobile?: boolean }) {
  return (
    <NavLink 
      to={to}
      className={({ isActive }) => 
        `flex ${mobile ? 'flex-col items-center justify-center gap-1 text-[10px]' : 'items-center gap-3 px-4 py-3 rounded-xl font-medium text-base'} transition-all duration-200 ${
          isActive 
            ? 'text-indigo-600 ' + (mobile ? '' : 'bg-indigo-50 shadow-sm') 
            : 'text-gray-500 hover:text-indigo-600 ' + (mobile ? '' : 'hover:bg-gray-50')
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className={`${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-200`}>
            {icon}
          </div>
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}
