import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutGrid, PieChart, List, Search, Bell, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutGrid },
  { to: '/analytics', label: 'Analytics', icon: PieChart },
  { to: '/transactions', label: 'Transactions', icon: List },
];

function SidebarLink({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-emerald-500/20 text-emerald-400 border-l-2 border-emerald-400'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
        }`
      }
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-60 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🦜</span>
            </div>
            <span className="text-base font-semibold text-white">Toucanus</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pt-6">
          <p className="px-3 mb-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Dashboards
          </p>
          <div className="space-y-1">
            {navItems.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </div>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">Admin User</p>
              <p className="text-xs text-zinc-500 truncate">admin@toucanus.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900">
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1 text-sm text-zinc-500">
              <span>Dashboards</span>
              <span>/</span>
              <span className="text-zinc-200 font-medium">Default</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search..."
                className="w-64 pl-9 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
            <button className="p-2 text-zinc-400 hover:text-orange-400 transition-colors">
              <Sun className="w-5 h-5" />
            </button>
            <button className="p-2 text-zinc-400 hover:text-emerald-400 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-zinc-950">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="p-6"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
