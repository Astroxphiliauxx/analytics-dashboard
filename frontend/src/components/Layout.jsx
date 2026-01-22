import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { Search, Bell, LayoutDashboard, BarChart3, Receipt } from 'lucide-react';
import logoDark from '../assets/toucanlogo.png';
import logoLight from '../assets/toucanlogolight.png';
import { useTheme } from '../context/ThemeContext';
import SearchPalette from './SearchPalette';

export default function Layout() {
  const location = useLocation();
  const { theme } = useTheme();

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
        ${isActive
          ? 'bg-gradient-to-r from-ocean-600 to-ocean-500 text-white shadow-lg shadow-ocean-500/25'
          : 'text-ocean-500 dark:text-ocean-400 hover:bg-ocean-50 dark:hover:bg-ocean-800 hover:text-ocean-900 dark:hover:text-ocean-200'
        }
      `}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium text-base">{label}</span>
    </NavLink>
  );

  return (
    <div className="flex h-screen bg-ocean-50 dark:bg-ocean-900 transition-colors duration-300">
      {/* Sidebar - Fixed Width */}
      <aside className="w-72 bg-white dark:bg-ocean-900 border-r border-ocean-100 dark:border-ocean-800 flex flex-col z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
        {/* Logo Area */}
        <div className="h-24 flex items-center px-8 border-b border-ocean-100 dark:border-ocean-800/50">
          <img
            src={theme === 'dark' ? logoDark : logoLight}
            alt="Toucanus Logo"
            className="h-10 w-auto"
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-8 space-y-2">
          <div className="px-4 mb-4 text-xs font-semibold text-ocean-400 dark:text-ocean-600 uppercase tracking-wider">
            Main Menu
          </div>
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Overview" />
          <NavItem to="/analytics" icon={BarChart3} label="Analytics" />
          <NavItem to="/transactions" icon={Receipt} label="Transactions" />
        </nav>

        {/* User / Bottom Area (Optional Placeholder) */}
        <div className="p-4 border-t border-ocean-100 dark:border-ocean-800">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-ocean-50 dark:bg-ocean-800/50 border border-ocean-100 dark:border-ocean-700/50">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-ocean-500 to-purple-500"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ocean-900 dark:text-white truncate">Admin User</p>
              <p className="text-xs text-ocean-500 dark:text-ocean-400 truncate">admin@toucanus.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 bg-white/50 dark:bg-ocean-900/50 backdrop-blur-sm z-10">



          <div className="flex items-center gap-6 ml-auto">
            {/* Search */}
            <SearchPalette />

            {/* Notifications */}
            <button className="p-2.5 text-ocean-500 dark:text-ocean-400 hover:text-ocean-600 dark:hover:text-ocean-300 hover:bg-ocean-100 dark:hover:bg-ocean-800 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-ocean-900"></span>
            </button>
          </div>
        </header>

        {/* Page Scrollable Content */}
        <main className="flex-1 overflow-auto p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
