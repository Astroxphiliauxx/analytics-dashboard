import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Filter, X, Calendar } from 'lucide-react';
import { getTransactions } from '../lib/api';

const STATUS_BADGE = {
  SUCCESS: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  FAILED: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  PENDING: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
};

const PAYMENT_BADGE = {
  UPI: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  CARD: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  NET_BANKING: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  WALLET: 'bg-green-500/20 text-green-400 border border-green-500/30',
};

function Badge({ value, colorMap }) {
  const colors = colorMap[value] || 'bg-zinc-700 text-zinc-300';
  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${colors}`}>
      {value?.replace('_', ' ')}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-slate-200 dark:bg-zinc-700 rounded w-20"></div>
        </td>
      ))}
    </tr>
  );
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    userEmail: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (filters.status) params.status = filters.status;
      if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
      if (filters.userEmail) params.userEmail = filters.userEmail;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const data = await getTransactions(params);
      setTransactions(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({ status: '', paymentMethod: '', userEmail: '', startDate: '', endDate: '' });
    setPage(0);
  };

  const hasActiveFilters = filters.status || filters.paymentMethod || filters.userEmail || filters.startDate || filters.endDate;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Transactions</h1>
        <p className="text-slate-500 dark:text-zinc-400 text-base mt-1">View and filter all transactions</p>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Search by email..."
                value={filters.userEmail}
                onChange={(e) => handleFilterChange('userEmail', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-base text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium border transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-gradient-to-r from-emerald-500 to-orange-500 text-white border-transparent'
                  : 'bg-stone-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-white rounded-full"></span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-base text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    <option value="">All Statuses</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILED">Failed</option>
                    <option value="PENDING">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={filters.paymentMethod}
                    onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-base text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    <option value="">All Methods</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>
                    <option value="NET_BANKING">Net Banking</option>
                    <option value="WALLET">Wallet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-2">
                    <Calendar className="w-3.5 h-3.5 inline mr-1" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-base text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-2">
                    <Calendar className="w-3.5 h-3.5 inline mr-1" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-base text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50 dark:bg-zinc-800/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="text-slate-500 dark:text-zinc-400">
                      <p className="text-lg font-medium">No transactions found</p>
                      <p className="text-sm mt-1">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((txn, index) => (
                  <motion.tr
                    key={txn.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="hover:bg-stone-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-base font-mono text-slate-600 dark:text-zinc-300">
                        #{txn.id?.toString().padStart(6, '0')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-base font-medium text-slate-900 dark:text-white">{txn.userName}</p>
                        <p className="text-sm text-slate-500 dark:text-zinc-400">{txn.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(txn.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge value={txn.paymentMethod} colorMap={PAYMENT_BADGE} />
                    </td>
                    <td className="px-6 py-4">
                      <Badge value={txn.status} colorMap={STATUS_BADGE} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-base text-slate-600 dark:text-zinc-300">{formatDate(txn.createdAt)}</span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <p className="text-base text-slate-500 dark:text-zinc-400">
            Showing <span className="font-medium text-slate-900 dark:text-white">{page * 10 + 1}</span> to{' '}
            <span className="font-medium text-slate-900 dark:text-white">{Math.min((page + 1) * 10, totalElements)}</span> of{' '}
            <span className="font-medium text-slate-900 dark:text-white">{totalElements}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 px-4 py-2.5 text-base font-medium text-slate-700 dark:text-zinc-300 bg-stone-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            <div className="px-4 py-2.5 text-base font-medium text-white bg-gradient-to-r from-emerald-500 to-orange-500 rounded-lg">
              {page + 1} / {totalPages || 1}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1 px-4 py-2.5 text-base font-medium text-slate-700 dark:text-zinc-300 bg-stone-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
