import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutGrid, PieChart, List, Search, Bell, Sun, Menu, X } from 'lucide-react';
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
        `group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
          isActive
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 border border-transparent'
        }`
      }
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span
        className="sidebar-label origin-left whitespace-nowrap text-[13px] font-medium text-zinc-100/90 opacity-0 scale-90 translate-x-[-4px]
                   pointer-events-none group-[.sidebar-expanded]:opacity-100 group-[.sidebar-expanded]:scale-100 group-[.sidebar-expanded]:translate-x-0
                   transition-all duration-200"
      >
        {label}
      </span>
    </NavLink>
  );
}

export default function Layout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden md:flex bg-zinc-900/95 border-r border-zinc-800/80 flex-col shadow-[0_0_40px_rgba(15,23,42,0.9)]/50"
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
        animate={{ width: isSidebarExpanded ? 240 : 80 }}
        initial={false}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 via-sky-500 to-orange-500 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.65)]">
              <span className="text-white font-semibold text-lg leading-none">🦜</span>
            </div>
            <div
              className={`transition-all duration-200 origin-left ${
                isSidebarExpanded ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-90 -translate-x-2'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400/80">
                Toucanus
              </p>
              <p className="text-[11px] text-zinc-400 font-medium">Analytics Console</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pt-4 pb-4 flex flex-col gap-4">
          <div className="space-y-1.5">
            <p
              className={`px-3 text-[11px] font-semibold tracking-[0.18em] text-zinc-500/80 uppercase transition-all duration-200 ${
                isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
              }`}
            >
              Dashboards
            </p>
            <div className="space-y-1.5">
              {navItems.map((item) => (
                <div
                  key={item.to}
                  className={isSidebarExpanded ? 'sidebar-expanded' : ''}
                >
                  <SidebarLink {...item} />
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-zinc-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 via-rose-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-[0_0_25px_rgba(249,115,22,0.75)]">
              AD
            </div>
            <div
              className={`flex-1 min-w-0 transition-all duration-200 origin-left ${
                isSidebarExpanded ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 -translate-x-2'
              }`}
            >
              <p className="text-sm font-medium text-zinc-100 truncate">Admin User</p>
              <p className="text-xs text-zinc-500 truncate">admin@toucanus.com</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="flex-1 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <motion.aside
              className="relative w-64 bg-zinc-900 border-l border-zinc-800 flex flex-col shadow-2xl"
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            >
              <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 via-sky-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-semibold text-lg leading-none">🦜</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400/80">
                      Toucanus
                    </p>
                    <p className="text-[11px] text-zinc-400 font-medium">Analytics Console</p>
                  </div>
                </div>
                <button
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-3 pt-4 pb-4 overflow-y-auto">
                <p className="px-3 mb-2 text-[11px] font-semibold text-zinc-500/80 uppercase tracking-[0.18em]">
                  Dashboards
                </p>
                <div className="space-y-1.5">
                  {navItems.map((item) => (
                    <SidebarLink
                      key={item.to}
                      {...item}
                    />
                  ))}
                </div>
              </nav>

              <div className="p-4 border-t border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-orange-500 via-rose-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    AD
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-100 truncate">Admin User</p>
                    <p className="text-xs text-zinc-500 truncate">admin@toucanus.com</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 md:px-6 bg-zinc-900/95 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden inline-flex items-center justify-center rounded-lg p-1.5 text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800/80 transition-colors"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <nav className="flex items-center gap-1 text-xs md:text-sm text-zinc-500">
              <span>Dashboards</span>
              <span>/</span>
              <span className="text-zinc-200 font-medium">Default</span>
            </nav>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search..."
                className="w-40 md:w-64 pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs md:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/80"
              />
            </div>
            <button className="p-2 text-zinc-400 hover:text-orange-400 hover:bg-zinc-800/80 rounded-lg transition-colors">
              <Sun className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800/80 rounded-lg transition-colors relative">
              <Bell className="w-4 h-4 md:w-5 md:h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.9)]"></span>
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
              className="p-4 md:p-6"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
