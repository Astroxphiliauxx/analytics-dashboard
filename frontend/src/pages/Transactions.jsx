import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Filter, X, Calendar, Download, FileJson, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { getTransactions } from '../lib/api';

const STATUS_BADGE = {
  SUCCESS: 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30',
  FAILED: 'bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/30',
  PENDING: 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30',
};

const PAYMENT_BADGE = {
  UPI: 'bg-ocean-500/20 text-ocean-500 dark:text-ocean-400 border border-ocean-500/30',
  CARD: 'bg-ocean-700/20 text-ocean-700 dark:text-ocean-300 border border-ocean-700/30',
  NET_BANKING: 'bg-ocean-600/20 text-ocean-600 dark:text-ocean-400 border border-ocean-600/30',
  WALLET: 'bg-ocean-400/20 text-ocean-400 dark:text-ocean-300 border border-ocean-400/30',
};

const TYPE_BADGE = {
  PAYIN: 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30',
  PAYOUT: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30',
  REFUND: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30',
};

function Badge({ value, colorMap }) {
  const colors = colorMap[value] || 'bg-zinc-700 text-zinc-300';
  return (
    <span className={`px-4 py-2 rounded-full text-base font-medium ${colors}`}>
      {value?.replace('_', ' ')}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-8 py-6">
          <div className="h-6 bg-ocean-200 dark:bg-ocean-700 rounded w-24"></div>
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
    userEmail: '',
    type: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isExportOpen, setExportOpen] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (filters.status) params.status = filters.status;
      if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
      if (filters.userEmail) params.userEmail = filters.userEmail;
      if (filters.type) params.type = filters.type;
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
    setFilters({ status: '', paymentMethod: '', userEmail: '', type: '', startDate: '', endDate: '' });
    setPage(0);
  };

  const hasActiveFilters = filters.status || filters.paymentMethod || filters.userEmail || filters.type || filters.startDate || filters.endDate;

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

  const handleExportJSON = () => {
    if (transactions.length === 0) return;
    const data = {
      meta: {
        exportDate: new Date().toISOString(),
        filters,
        page: page + 1,
        totalElements
      },
      transactions
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportOpen(false);
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    // Helper to escape CSV fields
    const escape = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    let csv = "Transaction ID,User Name,User Email,Amount,Type,Payment Method,Status,Date\n";

    transactions.forEach(txn => {
      csv += `${escape(txn.id)},${escape(txn.userName)},${escape(txn.userEmail)},${escape(txn.amount)},${escape(txn.type)},${escape(txn.paymentMethod)},${escape(txn.status)},${escape(txn.createdAt)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <h1 className="text-7xl font-bold text-ocean-900 dark:text-white" style={{ fontFamily: 'Firlest, serif' }}>Transactions</h1>
        <p className="text-ocean-500 dark:text-ocean-400 text-lg mt-2">View and filter all transactions</p>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-ocean-800 rounded-3xl border border-ocean-200 dark:border-ocean-700 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-ocean-200 dark:border-ocean-700">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-ocean-400 dark:text-ocean-500" />
              <input
                type="text"
                placeholder="Search by email..."
                value={filters.userEmail}
                onChange={(e) => handleFilterChange('userEmail', e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-ocean-50 dark:bg-ocean-900 border border-ocean-200 dark:border-ocean-700 rounded-xl text-lg text-ocean-800 dark:text-ocean-200 placeholder-ocean-400 dark:placeholder-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500/30 focus:border-ocean-500 transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl text-lg font-medium border transition-all ${showFilters || hasActiveFilters
                ? 'bg-gradient-to-r from-ocean-700 to-ocean-500 text-white border-transparent'
                : 'bg-ocean-50 dark:bg-ocean-900 text-ocean-700 dark:text-ocean-300 border-ocean-200 dark:border-ocean-700 hover:bg-ocean-100 dark:hover:bg-ocean-700'
                }`}
              id="filters-panel"
            >
              <Filter className="w-5 h-5" />
              Filters
              {hasActiveFilters && (
                <span className="w-3 h-3 bg-white rounded-full"></span>
              )}
            </button>

            {/* Export Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setExportOpen(!isExportOpen)}
                disabled={loading || transactions.length === 0}
                className="flex items-center gap-3 px-6 py-4 rounded-xl text-lg font-medium bg-ocean-50 dark:bg-ocean-900 text-ocean-700 dark:text-ocean-300 border border-ocean-200 dark:border-ocean-700 hover:bg-ocean-100 dark:hover:bg-ocean-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                id="export-btn"
              >
                <Download className="w-5 h-5" />
                Export
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExportOpen ? 'rotate-180' : ''}`} />
              </button>

              {isExportOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-ocean-800 rounded-xl shadow-xl border border-ocean-100 dark:border-ocean-700 overflow-hidden z-20"
                >
                  <div className="p-1">
                    <button
                      onClick={handleExportJSON}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-base font-medium text-ocean-700 dark:text-ocean-200 hover:bg-ocean-50 dark:hover:bg-ocean-700 rounded-lg transition-colors"
                    >
                      <FileJson className="w-4 h-4 text-ocean-500" />
                      JSON
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-base font-medium text-ocean-700 dark:text-ocean-200 hover:bg-ocean-50 dark:hover:bg-ocean-700 rounded-lg transition-colors mt-1"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-green-500" />
                      CSV
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Backdrop */}
              {isExportOpen && (
                <div
                  className="fixed inset-0 z-10 bg-transparent"
                  onClick={() => setExportOpen(false)}
                />
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-3 text-base text-ocean-500 dark:text-ocean-400 hover:text-ocean-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
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
              className="mt-6 pt-6 border-t border-ocean-200 dark:border-ocean-700"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <div>
                  <label className="block text-base font-medium text-ocean-500 dark:text-ocean-400 mb-3">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-4 py-3.5 bg-ocean-50 dark:bg-ocean-900 border border-ocean-200 dark:border-ocean-700 rounded-xl text-lg text-ocean-800 dark:text-ocean-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/30"
                  >
                    <option value="">All Statuses</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILED">Failed</option>
                    <option value="PENDING">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium text-ocean-500 dark:text-ocean-400 mb-3">
                    Payment Method
                  </label>
                  <select
                    value={filters.paymentMethod}
                    onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                    className="w-full px-4 py-3.5 bg-ocean-50 dark:bg-ocean-900 border border-ocean-200 dark:border-ocean-700 rounded-xl text-lg text-ocean-800 dark:text-ocean-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/30"
                  >
                    <option value="">All Methods</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>
                    <option value="NET_BANKING">Net Banking</option>
                    <option value="WALLET">Wallet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium text-ocean-500 dark:text-ocean-400 mb-3">
                    Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-4 py-3.5 bg-ocean-50 dark:bg-ocean-900 border border-ocean-200 dark:border-ocean-700 rounded-xl text-lg text-ocean-800 dark:text-ocean-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/30"
                  >
                    <option value="">All Types</option>
                    <option value="PAYIN">Payin</option>
                    <option value="PAYOUT">Payout</option>
                    <option value="REFUND">Refund</option>
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium text-ocean-500 dark:text-ocean-400 mb-3">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-4 py-3.5 bg-ocean-50 dark:bg-ocean-900 border border-ocean-200 dark:border-ocean-700 rounded-xl text-lg text-ocean-800 dark:text-ocean-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/30"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-ocean-500 dark:text-ocean-400 mb-3">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-4 py-3.5 bg-ocean-50 dark:bg-ocean-900 border border-ocean-200 dark:border-ocean-700 rounded-xl text-lg text-ocean-800 dark:text-ocean-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/30"
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
              <tr className="bg-ocean-50 dark:bg-ocean-900/50">
                <th className="px-8 py-5 text-left text-base font-semibold text-ocean-600 dark:text-ocean-300 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-8 py-5 text-left text-base font-semibold text-ocean-600 dark:text-ocean-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-8 py-5 text-left text-base font-semibold text-ocean-600 dark:text-ocean-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-8 py-5 text-left text-base font-semibold text-ocean-600 dark:text-ocean-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-8 py-5 text-left text-base font-semibold text-ocean-600 dark:text-ocean-300 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-8 py-5 text-left text-base font-semibold text-ocean-600 dark:text-ocean-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-8 py-5 text-left text-base font-semibold text-ocean-600 dark:text-ocean-300 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ocean-100 dark:divide-ocean-700">
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="text-ocean-500 dark:text-ocean-400">
                      <p className="text-xl font-medium">No transactions found</p>
                      <p className="text-base mt-2">Try adjusting your filters</p>
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
                    className="hover:bg-ocean-50 dark:hover:bg-ocean-900/50 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <span className="text-lg font-mono text-ocean-600 dark:text-ocean-300">
                        #{txn.id?.toString().padStart(6, '0')}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div>
                        <p className="text-lg font-medium text-ocean-900 dark:text-white">{txn.userName}</p>
                        <p className="text-base text-ocean-500 dark:text-ocean-400">{txn.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-lg font-semibold text-ocean-600 dark:text-ocean-400">
                        {formatCurrency(txn.amount)}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <Badge value={txn.type} colorMap={TYPE_BADGE} />
                    </td>
                    <td className="px-8 py-5">
                      <Badge value={txn.paymentMethod} colorMap={PAYMENT_BADGE} />
                    </td>
                    <td className="px-8 py-5">
                      <Badge value={txn.status} colorMap={STATUS_BADGE} />
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-lg text-ocean-600 dark:text-ocean-300">{formatDate(txn.createdAt)}</span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 border-t border-ocean-200 dark:border-ocean-700 flex items-center justify-between">
          <p className="text-lg text-ocean-500 dark:text-ocean-400">
            Showing <span className="font-medium text-ocean-900 dark:text-white">{page * 10 + 1}</span> to{' '}
            <span className="font-medium text-ocean-900 dark:text-white">{Math.min((page + 1) * 10, totalElements)}</span> of{' '}
            <span className="font-medium text-ocean-900 dark:text-white">{totalElements}</span> results
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-2 px-5 py-3 text-lg font-medium text-ocean-700 dark:text-ocean-300 bg-ocean-50 dark:bg-ocean-900 border border-ocean-200 dark:border-ocean-700 rounded-xl hover:bg-ocean-100 dark:hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
              Previous
            </button>
            <div className="px-5 py-3 text-lg font-medium text-white bg-gradient-to-r from-ocean-700 to-ocean-500 rounded-xl">
              {page + 1} / {totalPages || 1}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-2 px-5 py-3 text-lg font-medium text-ocean-700 dark:text-ocean-300 bg-ocean-50 dark:bg-ocean-900 border border-ocean-200 dark:border-ocean-700 rounded-xl hover:bg-ocean-100 dark:hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
