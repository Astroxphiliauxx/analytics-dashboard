
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import logoDark from '../assets/toucanlogo.png';
import logoLight from '../assets/toucanlogolight.png';
import { useTheme } from '../context/ThemeContext';


export default function Layout() {
  const location = useLocation();
  const { theme } = useTheme();
  return (
    <div className="flex h-screen bg-ocean-50 dark:bg-ocean-900 transition-colors duration-300">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-ocean-200 dark:border-ocean-700 flex items-center justify-between px-6 md:px-8 bg-white/95 dark:bg-ocean-800/95 backdrop-blur transition-colors duration-300">
          <div className="flex items-center gap-6">
            <img
              src={theme === 'dark' ? logoDark : logoLight}
              alt="Toucanus Logo"
              className="h-12 w-auto"
              style={{ objectFit: 'contain' }}
            />
            <div className="relative hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean-400 dark:text-ocean-500" />
              <input
                type="text"
                placeholder="Search..."
                className="w-48 md:w-72 pl-11 pr-5 py-3 bg-ocean-50 dark:bg-ocean-900 border border-ocean-300 dark:border-ocean-700 rounded-xl text-base text-ocean-800 dark:text-ocean-200 placeholder-ocean-400 dark:placeholder-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500/30 focus:border-ocean-500/80 transition-colors duration-300"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-5">
            {/* Nav sections - encapsulated in border */}
            <nav className="flex items-center gap-1 p-1 bg-ocean-100 dark:bg-ocean-800 rounded-xl border border-ocean-200 dark:border-ocean-700">
              <NavLink to="/dashboard" className={({ isActive }) => `px-4 py-2 rounded-lg font-semibold text-base transition-colors ${isActive ? 'bg-white dark:bg-ocean-700 text-ocean-900 dark:text-white shadow-sm' : 'text-ocean-600 dark:text-ocean-300 hover:bg-white/50 dark:hover:bg-ocean-700/60'}`}>Overview</NavLink>
              <NavLink to="/analytics" className={({ isActive }) => `px-4 py-2 rounded-lg font-semibold text-base transition-colors ${isActive ? 'bg-white dark:bg-ocean-700 text-ocean-900 dark:text-white shadow-sm' : 'text-ocean-600 dark:text-ocean-300 hover:bg-white/50 dark:hover:bg-ocean-700/60'}`}>Analytics</NavLink>
              <NavLink to="/transactions" className={({ isActive }) => `px-4 py-2 rounded-lg font-semibold text-base transition-colors ${isActive ? 'bg-white dark:bg-ocean-700 text-ocean-900 dark:text-white shadow-sm' : 'text-ocean-600 dark:text-ocean-300 hover:bg-white/50 dark:hover:bg-ocean-700/60'}`}>Transactions</NavLink>
            </nav>
            <button className="p-3 text-ocean-500 dark:text-ocean-400 hover:text-ocean-600 dark:hover:text-ocean-300 hover:bg-ocean-100 dark:hover:bg-ocean-700/80 rounded-lg transition-colors relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-3 h-3 bg-ocean-500 rounded-full shadow-[0_0_10px_rgba(73,136,196,0.9)]"></span>
            </button>
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-ocean-50 dark:bg-ocean-900 transition-colors duration-300 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
