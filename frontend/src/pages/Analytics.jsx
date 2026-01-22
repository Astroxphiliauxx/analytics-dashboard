import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart,
  Bar,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
} from 'recharts';
import { Calendar, DollarSign, CheckCircle, TrendingUp, Activity, Filter, Download, FileJson, FileSpreadsheet, ChevronDown } from 'lucide-react';
import {
  getDashboardStats,
  getFilteredDashboardStats,
  getDailyAnalytics,
  getPaymentStats,
  getHourlyTraffic,
} from '../lib/api';
import { useDateRange } from '../context/DateRangeContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const COLORS = {
  ocean: '#4988C4',
  oceanDark: '#1C4D8D',
  oceanDeep: '#0F2854',
  oceanLight: '#BDE8F5',
  red: '#ef4444',
  amber: '#f59e0b',
  zinc: '#71717a'
};

const DONUT_COLORS = ['#8B5CF6', '#06B6D4', '#F59E0B', '#10B981', '#EC4899', '#3B82F6'];
const STATUS_COLORS = { success: '#4988C4', failed: '#ef4444', pending: '#f59e0b' };

function CustomTooltip({ active, payload, label, formatter }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-ocean-800 text-ocean-900 dark:text-white px-6 py-4 rounded-xl shadow-xl border border-ocean-200 dark:border-ocean-700">
        <p className="text-base text-ocean-500 dark:text-ocean-400 mb-3">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-3 text-lg">
            <span
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></span>
            <span className="text-ocean-600 dark:text-ocean-300">{entry.name}:</span>
            <span className="font-semibold">
              {formatter ? formatter(entry.value, entry.name) : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// Mini Stat Card - Modern Design (matches Overview.jsx style)
function MiniStatCard({ icon: Icon, label, value, cardColorClass = 'blue' }) {
  // Gradient and color mappings based on card type
  const gradientMap = {
    blue: 'from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/10 border-blue-100 dark:border-blue-800/50',
    green: 'from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/10 border-green-100 dark:border-green-800/50',
    red: 'from-red-100 to-pink-50 dark:from-red-900/30 dark:to-pink-800/10 border-red-100 dark:border-red-800/50',
    amber: 'from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/10 border-amber-100 dark:border-amber-800/50',
    indigo: 'from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/10 border-indigo-100 dark:border-indigo-800/50',
    cyan: 'from-cyan-100 to-cyan-50 dark:from-cyan-900/30 dark:to-cyan-800/10 border-cyan-100 dark:border-cyan-800/50',
    ocean: 'from-ocean-100 to-ocean-50 dark:from-ocean-900/30 dark:to-ocean-800/10 border-ocean-100 dark:border-ocean-800/50'
  };

  const iconBgMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
    ocean: 'bg-ocean-50 dark:bg-ocean-900/20 text-ocean-600 dark:text-ocean-400'
  };

  const gradientClass = gradientMap[cardColorClass] || gradientMap.ocean;
  const iconBgClass = iconBgMap[cardColorClass] || iconBgMap.ocean;

  return (
    <motion.div
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.01)] transition-all duration-300 border border-gray-100 dark:border-gray-800 group"
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Header Row */}
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-3 rounded-lg ${iconBgClass}`}>
          <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{label}</h3>
      </div>

      {/* Value Display Area */}
      <div className={`bg-gradient-to-br ${gradientClass} rounded-xl p-5 flex flex-col items-center justify-center min-h-[80px] border`}>
        <p className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white transition-transform duration-200 group-hover:scale-105">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

function ChartCard({ title, children, className = '', headerRight }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-white dark:bg-ocean-800 rounded-3xl p-8 border border-ocean-200 dark:border-ocean-700 ${className}`}
    >
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-semibold text-ocean-900 dark:text-white">{title}</h3>
        {headerRight}
      </div>
      {children}
    </motion.div>
  );
}

// Custom Legend for Pie Chart with progress bars
const renderCustomLegend = (props, activeIndex) => {
  const { payload } = props;
  const total = payload.reduce((acc, entry) => acc + entry.payload.count, 0);

  return (
    <ul className="flex flex-col gap-4 mt-6">
      {payload.map((entry, index) => {
        const percent = ((entry.payload.count / total) * 100).toFixed(1);
        const isActive = index === activeIndex;
        return (
          <li
            key={`item-${index}`}
            className={`text-base transition-all duration-200 ${isActive
              ? 'text-ocean-900 dark:text-white scale-105 origin-left'
              : 'text-ocean-700 dark:text-ocean-300'
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div
                  className={`w-4 h-4 rounded-full mr-3 transition-transform duration-200 ${isActive ? 'scale-125' : ''}`}
                  style={{ backgroundColor: entry.color }}
                />
                <span className={`font-medium ${isActive ? 'font-bold' : ''}`}>{entry.value}</span>
              </div>
              <span className={`font-semibold ${isActive ? 'text-ocean-600 dark:text-ocean-400' : 'text-ocean-500'}`}>{percent}%</span>
            </div>
            <div className="w-full h-3 bg-ocean-200 dark:bg-ocean-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isActive ? 'h-4' : ''}`}
                style={{ width: `${percent}%`, backgroundColor: entry.color }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isExportOpen, setExportOpen] = useState(false);

  // ============================================================
  // DATE RANGE STATE - Persisted via Context
  // ============================================================
  // Date range state is now managed globally via DateRangeContext
  // This ensures dates persist when navigating between pages
  // ============================================================
  const {
    draftStartDate,
    draftEndDate,
    setDraftStartDate,
    setDraftEndDate,
    appliedStartDate,
    appliedEndDate,
    applyDateRange
  } = useDateRange();

  // API calls depend ONLY on applied dates, NOT draft dates
  // This ensures date selection in the calendar does not trigger API calls
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [statsRes, dailyRes, paymentRes, hourlyRes] = await Promise.all([
          getFilteredDashboardStats(appliedStartDate, appliedEndDate),
          getDailyAnalytics(appliedStartDate, appliedEndDate),
          getPaymentStats(appliedStartDate, appliedEndDate),
          getHourlyTraffic(appliedStartDate, appliedEndDate),
        ]);
        setStats(statsRes);
        setDailyData(dailyRes);
        setPaymentData(paymentRes);
        setHourlyData(hourlyRes);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [appliedStartDate, appliedEndDate]); // Only applied dates trigger API

  const formatCurrency = (value) => {
    if (value == null) return '₹0';
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value.toFixed(0)}`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const handleExportJSON = () => {
    if (!stats) return;
    const data = {
      meta: {
        exportDate: new Date().toISOString(),
        dateRange: { start: appliedStartDate, end: appliedEndDate },
      },
      summary: stats,
      dailyTrends: dailyData,
      paymentMethods: paymentData,
      hourlyTraffic: hourlyData
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_export_${appliedStartDate}_${appliedEndDate}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportOpen(false);
  };

  const handleExportCSV = () => {
    if (!stats) return;

    // Helper to escape CSV fields
    const escape = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    let csv = `Analytics Export (${appliedStartDate} to ${appliedEndDate})\n\n`;

    // 1. Summary Stats
    csv += "SUMMARY STATS\n";
    csv += "Metric,Value\n";
    csv += `Total GTV,${escape(stats.totalGtv)}\n`;
    csv += `Success Rate,${escape(stats.successRate)}%\n`;
    csv += `Transactions,${escape(stats.totalTxns)}\n`;
    csv += `Avg Ticket Size,${escape(stats.averageTicketSize)}\n\n`;

    // 2. Revenue Trends (Daily Data)
    csv += "REVENUE TRENDS (DAILY)\n";
    if (dailyData.length > 0) {
      const headers = Object.keys(dailyData[0]);
      csv += headers.join(',') + "\n";
      dailyData.forEach(row => {
        csv += headers.map(header => escape(row[header])).join(',') + "\n";
      });
    } else {
      csv += "No daily data available\n";
    }
    csv += "\n";

    // 3. Payment Methods
    csv += "PAYMENT METHODS\n";
    if (paymentData.length > 0) {
      const headers = Object.keys(paymentData[0]);
      csv += headers.join(',') + "\n";
      paymentData.forEach(row => {
        csv += headers.map(header => escape(row[header])).join(',') + "\n";
      });
    } else {
      csv += "No payment data available\n";
    }
    csv += "\n";

    // 4. Hourly Traffic
    csv += "HOURLY TRAFFIC\n";
    if (hourlyData.length > 0) {
      const headers = Object.keys(hourlyData[0]);
      csv += headers.join(',') + "\n";
      hourlyData.forEach(row => {
        csv += headers.map(header => escape(row[header])).join(',') + "\n";
      });
    } else {
      csv += "No hourly data available\n";
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_export_${appliedStartDate}_${appliedEndDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-ocean-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header with Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-7xl font-bold text-ocean-900 dark:text-white" style={{ fontFamily: 'Firlest, serif' }}>Analytics</h1>
          <p className="text-ocean-500 dark:text-ocean-400 text-lg mt-1">Detailed charts and insights</p>
        </div>

        {/* Modern Date Range Filter with Custom DatePicker */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-gradient-to-r from-white via-ocean-50/50 to-white dark:from-ocean-800 dark:via-ocean-800/80 dark:to-ocean-800 rounded-2xl border border-ocean-200/50 dark:border-ocean-700/50 p-3 shadow-lg shadow-ocean-500/5"
          id="date-picker"
        >
          {/* Start Date Input */}
          <div className="relative group">
            <label className="absolute -top-2 left-3 px-1 text-xs font-medium text-ocean-500 dark:text-ocean-400 bg-white dark:bg-ocean-800 z-10">
              From
            </label>
            <DatePicker
              selected={draftStartDate ? new Date(draftStartDate) : null}
              onChange={(date) => setDraftStartDate(date ? date.toISOString().split('T')[0] : '')}
              dateFormat="MMM dd, yyyy"
              className="w-44 px-4 py-3 text-base font-medium bg-white dark:bg-ocean-900 text-ocean-800 dark:text-ocean-100 border-2 border-ocean-200 dark:border-ocean-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500/40 focus:border-ocean-500 transition-all cursor-pointer hover:border-ocean-400 dark:hover:border-ocean-500"
              calendarClassName="ocean-calendar"
              showPopperArrow={false}
              popperPlacement="bottom-start"
            />
          </div>

          {/* Separator Arrow */}
          <div className="flex items-center justify-center w-8 h-8 bg-ocean-100 dark:bg-ocean-700 rounded-full">
            <svg className="w-4 h-4 text-ocean-500 dark:text-ocean-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>

          {/* End Date Input */}
          <div className="relative group">
            <label className="absolute -top-2 left-3 px-1 text-xs font-medium text-ocean-500 dark:text-ocean-400 bg-white dark:bg-ocean-800 z-10">
              To
            </label>
            <DatePicker
              selected={draftEndDate ? new Date(draftEndDate) : null}
              onChange={(date) => setDraftEndDate(date ? date.toISOString().split('T')[0] : '')}
              dateFormat="MMM dd, yyyy"
              minDate={draftStartDate ? new Date(draftStartDate) : null}
              className="w-44 px-4 py-3 text-base font-medium bg-white dark:bg-ocean-900 text-ocean-800 dark:text-ocean-100 border-2 border-ocean-200 dark:border-ocean-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500/40 focus:border-ocean-500 transition-all cursor-pointer hover:border-ocean-400 dark:hover:border-ocean-500"
              calendarClassName="ocean-calendar"
              showPopperArrow={false}
              popperPlacement="bottom-start"
            />
          </div>

          {/* Apply Button with Animation */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={applyDateRange}
            className="flex items-center gap-2 px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-ocean-600 via-ocean-500 to-ocean-600 rounded-xl shadow-lg shadow-ocean-500/30 hover:shadow-ocean-500/50 transition-all duration-300 bg-[length:200%_100%] hover:bg-right"
          >
            <Filter className="w-5 h-5" />
            Apply
          </motion.button>

          {/* Export Button with Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || !stats}
              onClick={() => setExportOpen(!isExportOpen)}
              className="flex items-center gap-2 px-6 py-3 text-base font-semibold text-ocean-700 dark:text-ocean-200 bg-ocean-50 dark:bg-ocean-900/50 border border-ocean-200 dark:border-ocean-700 rounded-xl hover:bg-ocean-100 dark:hover:bg-ocean-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              Export
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExportOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            {isExportOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-ocean-800 rounded-xl shadow-xl border border-ocean-100 dark:border-ocean-700 overflow-hidden z-20"
              >
                <div className="p-1">
                  <button
                    onClick={handleExportJSON}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm font-medium text-ocean-700 dark:text-ocean-200 hover:bg-ocean-50 dark:hover:bg-ocean-700 rounded-lg transition-colors"
                  >
                    <FileJson className="w-4 h-4 text-ocean-500" />
                    Export as JSON
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm font-medium text-ocean-700 dark:text-ocean-200 hover:bg-ocean-50 dark:hover:bg-ocean-700 rounded-lg transition-colors mt-1"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-500" />
                    Export as CSV
                  </button>
                </div>
              </motion.div>
            )}

            {/* Backdrop to close dropdown on click outside */}
            {isExportOpen && (
              <div
                className="fixed inset-0 z-10 bg-transparent"
                onClick={() => setExportOpen(false)}
              />
            )}
          </div>
        </motion.div>
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <MiniStatCard
          icon={DollarSign}
          label="Total GTV"
          value={formatCurrency(stats?.totalGtv)}
          cardColorClass="blue"
        />
        <MiniStatCard
          icon={CheckCircle}
          label="Success Rate"
          value={`${stats?.successRate?.toFixed(1) || 0}%`}
          cardColorClass={
            stats?.successRate >= 95 ? 'green' : stats?.successRate >= 90 ? 'amber' : 'red'
          }
        />
        <MiniStatCard
          icon={TrendingUp}
          label="Transactions"
          value={stats?.totalTxns?.toLocaleString() || 0}
          cardColorClass="indigo"
        />
        <MiniStatCard
          icon={Activity}
          label="Avg Ticket"
          value={formatCurrency(stats?.averageTicketSize)}
          cardColorClass="cyan"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Chart (Larger) */}
        <div className="lg:col-span-2" id="chart-revenue-analytics">
          <ChartCard title="Revenue Over Time">
            <ResponsiveContainer width="100%" height={420}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#000000" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 14, fill: '#4988C4' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 14, fill: '#4988C4' }}
                  tickFormatter={formatCurrency}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={
                    <CustomTooltip
                      formatter={(value, name) =>
                        name === 'totalAmount' || name === 'Volume'
                          ? formatCurrency(value)
                          : value.toLocaleString()
                      }
                    />
                  }
                />
                <Legend wrapperStyle={{ paddingTop: 24, fontSize: '14px' }} />
                <Area
                  type="monotone"
                  dataKey="totalAmount"
                  stroke="#10B981"
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                  name="Volume"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Donut Chart with Custom Legend */}
        </div>

        {/* Donut Chart with Custom Legend */}
        <div id="chart-payment-analytics">
          <ChartCard title="Payment Methods">
            <ResponsiveContainer width="100%" height={420}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="40%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="paymentMethod"
                  stroke="none"
                  activeIndex={activeIndex}
                  activeShape={(props) => {
                    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                    return (
                      <g>
                        <Sector
                          cx={cx}
                          cy={cy}
                          innerRadius={innerRadius - 4}
                          outerRadius={outerRadius + 8}
                          startAngle={startAngle}
                          endAngle={endAngle}
                          fill={fill}
                          style={{ filter: 'drop-shadow(0 6px 10px rgba(0, 0, 0, 0.25))' }}
                        />
                      </g>
                    );
                  }}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(-1)}
                >
                  {paymentData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-ocean-800 text-ocean-900 dark:text-white px-5 py-3 rounded-xl text-base border border-ocean-200 dark:border-ocean-700">
                          <p className="font-semibold text-ocean-500 dark:text-ocean-400">{payload[0].name}</p>
                          <p className="text-lg">{payload[0].value.toLocaleString()} txns</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend content={(props) => renderCustomLegend(props, activeIndex)} verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Bottom Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stacked Status Bar */}
        <div id="chart-daily-analytics">
          <ChartCard title=" Daily Transaction Traffic" className="h-full">
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#000000" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 14, fill: '#4988C4' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 14, fill: '#4988C4' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 24, fontSize: '14px' }} iconType="circle" iconSize={12} />
                <Bar
                  dataKey="successCount"
                  stackId="status"
                  fill={STATUS_COLORS.success}
                  name="Success"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="pendingCount"
                  stackId="status"
                  fill={STATUS_COLORS.pending}
                  name="Pending"
                />
                <Bar
                  dataKey="failedCount"
                  stackId="status"
                  fill={COLORS.red}
                  name="Failed"
                  radius={[6, 6, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Hourly Traffic (Line Graph with Peak Issues) */}
        <div id="chart-hourly-analytics">
          <ChartCard
            title="Hourly Peak Traffic"
            className="h-full"
            headerRight={
              hourlyData.length > 0 && (() => {
                const peakHour = hourlyData.reduce((max, curr) =>
                  (curr.pendingCount + curr.failedCount) > (max.pendingCount + max.failedCount) ? curr : max
                  , hourlyData[0]);
                const peakIssues = peakHour.pendingCount + peakHour.failedCount;
                return (
                  <div className="text-right bg-red-500/20 dark:bg-red-500/25 px-5 py-3 rounded-xl border border-red-500/30">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Peak Issues</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300"> at {peakHour.hour}:00</p>
                    <p className="text-sm text-red-600 dark:text-red-400"><span className="font-bold">{peakIssues}</span> pending+failed</p>
                  </div>
                );
              })()
            }
          >
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart data={hourlyData} margin={{ left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#000000" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 14, fill: '#4988C4' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(h) => `${h}h`}
                  dy={10}
                />
                <YAxis tick={{ fontSize: 14, fill: '#4988C4' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />

                <Line type="monotone" dataKey="successCount" name="Success" stroke={'#1a9130'} strokeWidth={3} dot={{ r: 5, fill: '#1a9130' }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="pendingCount" name="Pending" stroke={COLORS.amber} strokeWidth={3} dot={{ r: 5, fill: COLORS.amber }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="failedCount" name="Failed" stroke={COLORS.red} strokeWidth={3} dot={{ r: 5, fill: COLORS.red }} activeDot={{ r: 8 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
