import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ArrowRight, Hash, FileText, BarChart3, Receipt } from 'lucide-react';

const SEARCH_INDEX = [
    // Pages
    { id: 'page-dash', title: 'Dashboard', path: '/dashboard', type: 'page', icon: FileText, keywords: ['home', 'overview', 'main'] },
    { id: 'page-analytics', title: 'Analytics', path: '/analytics', type: 'page', icon: BarChart3, keywords: ['charts', 'graphs', 'reports'] },
    { id: 'page-txns', title: 'Transactions', path: '/transactions', type: 'page', icon: Receipt, keywords: ['payments', 'history', 'list'] },

    // Metrics (Dashboard)
    { id: 'metric-gtv', title: 'Total GTV', path: '/dashboard#kpi-gtv', type: 'metric', icon: Hash, keywords: ['revenue', 'volume', 'sales', 'gross'] },
    { id: 'metric-success', title: 'Success Rate', path: '/dashboard#kpi-success', type: 'metric', icon: Hash, keywords: ['performance', 'quality'] },
    { id: 'metric-failed', title: 'Failed Volume', path: '/dashboard#kpi-failed', type: 'metric', icon: Hash, keywords: ['errors', 'declined', 'lost'] },
    { id: 'chart-rev', title: 'Revenue Trends', path: '/dashboard#chart-revenue', type: 'chart', icon: BarChart3, keywords: ['graph', 'history'] },
    { id: 'chart-status', title: 'Status Breakdown', path: '/dashboard#chart-status', type: 'chart', icon: BarChart3, keywords: ['success', 'pending', 'failed', 'split'] },
    { id: 'chart-payment', title: 'Payment Distribution', path: '/dashboard#chart-payment', type: 'chart', icon: BarChart3, keywords: ['methods', 'cards', 'wallet'] },
    { id: 'chart-hourly', title: 'Hourly Traffic', path: '/dashboard#chart-hourly', type: 'chart', icon: BarChart3, keywords: ['time', 'peak', 'activity'] },

    // Features (Transactions)
    { id: 'feat-filter', title: 'Transaction Filters', path: '/transactions#filters-panel', type: 'feature', icon: Command, keywords: ['search', 'refine', 'sort', 'status'] },
    { id: 'feat-export', title: 'Export Data', path: '/transactions#export-btn', type: 'feature', icon: Command, keywords: ['download', 'csv', 'json'] },

    // Features (Analytics)
    { id: 'feat-date', title: 'Date Range Picker', path: '/analytics#date-picker', type: 'feature', icon: Command, keywords: ['time', 'calendar', 'period'] },
    { id: 'chart-rev-ana', title: 'Revenue Analysis', path: '/analytics#chart-revenue-analytics', type: 'chart', icon: BarChart3, keywords: ['growth', 'trends'] },
    { id: 'chart-pay-ana', title: 'Payment Method Analysis', path: '/analytics#chart-payment-analytics', type: 'chart', icon: BarChart3, keywords: ['distribution', 'usage'] },
    { id: 'chart-daily-ana', title: 'Daily Traffic', path: '/analytics#chart-daily-analytics', type: 'chart', icon: BarChart3, keywords: ['volume', 'count'] },
    { id: 'chart-hourly-ana', title: 'Hourly Peak Traffic', path: '/analytics#chart-hourly-analytics', type: 'chart', icon: BarChart3, keywords: ['peak', 'load', 'issues'] },
];

export default function SearchPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const navigate = useNavigate();

    // Toggle on Ctrl+K / Cmd+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery('');
            setResults(SEARCH_INDEX.slice(0, 5));
        }
    }, [isOpen]);

    // Search Logic
    useEffect(() => {
        if (!query) {
            setResults(SEARCH_INDEX.slice(0, 5));
            return;
        }
        const lowerQuery = query.toLowerCase();
        const filtered = SEARCH_INDEX.filter((item) => {
            return (
                item.title.toLowerCase().includes(lowerQuery) ||
                item.keywords.some((k) => k.includes(lowerQuery))
            );
        });
        setResults(filtered.slice(0, 6));
        setSelectedIndex(0);
    }, [query]);

    // Keyboard Navigation
    const handleInputKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (results.length > 0) {
                handleSelect(results[selectedIndex]);
            }
        }
    };

    const handleSelect = (item) => {
        setIsOpen(false);

        // Check if path has hash
        if (item.path.includes('#')) {
            const [path, hash] = item.path.split('#');
            navigate(path);
            // Wait for navigation then scroll
            setTimeout(() => {
                const element = document.getElementById(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Highlight effect
                    element.classList.add('ring-4', 'ring-ocean-400', 'transition-all', 'duration-500');
                    setTimeout(() => element.classList.remove('ring-4', 'ring-ocean-400'), 2000);
                }
            }, 300);
        } else {
            navigate(item.path);
        }
    };

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative z-50" ref={containerRef}>
            {/* Search Input */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ocean-400 dark:text-ocean-500 group-focus-within:text-ocean-600 dark:group-focus-within:text-ocean-300 transition-colors" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search..."
                    value={query}
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onKeyDown={handleInputKeyDown}
                    className="w-64 pl-11 pr-12 py-2.5 bg-white dark:bg-ocean-800 border border-ocean-200 dark:border-ocean-700 rounded-full text-sm text-ocean-800 dark:text-ocean-200 placeholder-ocean-400 dark:placeholder-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 transition-all shadow-sm"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 bg-ocean-100 dark:bg-ocean-700 rounded text-xs font-mono text-ocean-600 dark:text-ocean-300 opacity-60">
                        <span className="text-[10px]">⌘</span>K
                    </kbd>
                </div>
            </div>

            {/* Dropdown Results */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-white dark:bg-ocean-900 rounded-2xl shadow-xl border border-ocean-200 dark:border-ocean-700 overflow-hidden"
                    >
                        <div className="max-h-[60vh] overflow-y-auto p-2">
                            {results.length === 0 ? (
                                <div className="py-8 text-center text-ocean-500 dark:text-ocean-400">
                                    <p className="text-sm">No results found.</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {results.map((item, index) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => handleSelect(item)}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${index === selectedIndex
                                                    ? 'bg-ocean-50 dark:bg-ocean-800 text-ocean-900 dark:text-white'
                                                    : 'text-ocean-600 dark:text-ocean-400 hover:bg-ocean-50 dark:hover:bg-ocean-800'
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-lg ${index === selectedIndex ? 'bg-white dark:bg-ocean-700 shadow-sm' : 'bg-ocean-100 dark:bg-ocean-800'}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <p className="font-medium text-sm truncate">{item.title}</p>
                                                    <p className="text-xs text-ocean-400 capitalize truncate">{item.type} • {item.keywords[0]}</p>
                                                </div>
                                                {index === selectedIndex && (
                                                    <ArrowRight className="w-3.5 h-3.5 text-ocean-400" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-3 py-2 bg-ocean-50 dark:bg-ocean-950/50 border-t border-ocean-100 dark:border-ocean-800 flex justify-between text-[10px] text-ocean-400">
                            <span>Use arrows to navigate</span>
                            <span>Toucanus Search</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
