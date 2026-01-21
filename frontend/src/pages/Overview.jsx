import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ComposedChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Sector,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label
} from 'recharts';
import {
  Wallet,
  Users,
  Activity,
  ArrowRightLeft,
  AlertCircle,
  Clock,
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import {
  getDashboardStats,
  getDailyAnalytics,
  getPaymentStats,
  getHourlyTraffic
} from '../lib/api';

// --- Constants & Helpers ---
const COLORS = {
  ocean: '#4988C4',
  oceanDark: '#1C4D8D',
  oceanDeep: '#0F2854',
  oceanLight: '#BDE8F5',
  red: '#ef4444',
  amber: '#f59e0b',
  zinc: '#71717a'
};

const PIE_COLORS = ['#8B5CF6', '#06B6D4', '#F59E0B', '#10B981', '#EC4899', '#3B82F6'];

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
  return `₹${val.toLocaleString('en-IN')}`;
};

const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return num.toLocaleString('en-IN');
};

// --- Sub-Components ---

// 1. Primary Metric Card (Modern Design)
function MetricCard({ title, value, subValue, icon: Icon, trendText, trendType = 'neutral', cardColorClass }) {
  // Gradient and color mappings based on card type
  const gradientMap = {
    blue: 'from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/10 border-blue-100 dark:border-blue-800/50',
    indigo: 'from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/10 border-indigo-100 dark:border-indigo-800/50',
    sky: 'from-sky-100 to-sky-50 dark:from-sky-900/30 dark:to-sky-800/10 border-sky-100 dark:border-sky-800/50',
    green: 'from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/10 border-green-100 dark:border-green-800/50',
    red: 'from-red-100 to-pink-50 dark:from-red-900/30 dark:to-pink-800/10 border-red-100 dark:border-red-800/50',
    amber: 'from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/10 border-amber-100 dark:border-amber-800/50',
    default: 'from-ocean-100 to-ocean-50 dark:from-ocean-900/30 dark:to-ocean-800/10 border-ocean-100 dark:border-ocean-800/50'
  };

  const iconBgMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    sky: 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    default: 'bg-ocean-50 dark:bg-ocean-900/20 text-ocean-600 dark:text-ocean-400'
  };

  const trendColorMap = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-500 dark:text-red-400',
    warning: 'text-amber-600 dark:text-amber-400',
    neutral: 'text-gray-400 dark:text-gray-500'
  };

  const gradientClass = gradientMap[cardColorClass] || gradientMap.default;
  const iconBgClass = iconBgMap[cardColorClass] || iconBgMap.default;
  const trendColorClass = trendColorMap[trendType];

  return (
    <motion.div
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.01)] transition-all duration-300 border border-gray-100 dark:border-gray-800 group"
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${iconBgClass}`}>
            <Icon className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{title}</h3>
        </div>
        {subValue && (
          <span className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-sm rounded-full font-medium">
            {subValue}
          </span>
        )}
      </div>

      {/* Value Display Area */}
      <div className={`bg-gradient-to-br ${gradientClass} rounded-xl p-5 mb-3 flex flex-col items-center justify-center min-h-[120px] border`}>
        <p className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white transition-transform duration-200 group-hover:scale-105">
          {value}
        </p>
      </div>

      {/* Trend Indicator */}
      {trendText && (
        <div className={`flex items-center justify-end text-sm font-medium ${trendColorClass}`}>
          {trendType === 'up' && <TrendingUp className="w-5 h-5 mr-1" />}
          {trendType === 'down' && <TrendingDown className="w-5 h-5 mr-1" />}
          {trendType === 'warning' && <AlertTriangle className="w-5 h-5 mr-1" />}
          {trendText}
        </div>
      )}
    </motion.div>
  );
}

// 2. Secondary Metric Card (Modern Compact Design)
function CompactCard({ title, value, icon: Icon, trendText, trendType = 'neutral', cardColorClass }) {
  const gradientMap = {
    cyan: 'from-cyan-100 to-cyan-50 dark:from-cyan-900/30 dark:to-cyan-800/10 border-cyan-100 dark:border-cyan-800/50',
    orange: 'from-orange-200 to-orange-50 dark:from-orange-800/40 dark:to-orange-700/10 border-orange-100 dark:border-orange-800/50',
    red: 'from-red-200 to-red-50 dark:from-red-800/40 dark:to-red-700/10 border-red-100 dark:border-red-800/50',
    green: 'from-green-300 to-green-100 dark:from-green-700/60 dark:to-green-600/20 border-green-200 dark:border-green-800/50',
    default: 'from-ocean-100 to-ocean-50 dark:from-ocean-900/30 dark:to-ocean-800/10 border-ocean-100 dark:border-ocean-800/50'
  };

  const iconBgMap = {
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    default: 'bg-ocean-50 dark:bg-ocean-900/20 text-ocean-600 dark:text-ocean-400'
  };

  const trendColorMap = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-500 dark:text-red-400',
    warning: 'text-orange-600 dark:text-orange-400',
    success: 'text-green-700 dark:text-green-400',
    neutral: 'text-gray-400 dark:text-gray-500'
  };

  const gradientClass = gradientMap[cardColorClass] || gradientMap.default;
  const iconBgClass = iconBgMap[cardColorClass] || iconBgMap.default;
  const trendColorClass = trendColorMap[trendType];

  // Special styling for System Status card
  const isOperational = title === 'System Status' && value === 'Operational';

  return (
    <motion.div
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.01)] transition-all duration-300 border border-gray-100 dark:border-gray-800 group relative overflow-hidden"
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${iconBgClass}`}>
            <Icon className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{title}</h3>
        </div>
      </div>

      {/* Value Display Area */}
      <div className={`bg-gradient-to-br ${gradientClass} rounded-xl p-5 mb-3 flex flex-col items-center justify-center min-h-[120px] border relative z-10 shadow-sm`}>
        {isOperational ? (
          <div className="flex items-center space-x-3">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
            </span>
            <p className="text-3xl font-bold text-green-900 dark:text-white transition-transform duration-200 group-hover:scale-105">
              {value}
            </p>
          </div>
        ) : (
          <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white transition-transform duration-200 group-hover:scale-105">
            {value}
          </p>
        )}
      </div>

      {/* Trend Indicator */}
      {trendText && (
        <div className={`flex items-center justify-end text-sm font-medium ${trendColorClass} relative z-10`}>
          {trendType === 'warning' && <AlertTriangle className="w-5 h-5 mr-1" />}
          {trendType === 'success' && <CheckCircle2 className="w-5 h-5 mr-1" />}
          {trendText}
        </div>
      )}

      {/* Decorative blur for System Status */}
      {isOperational && (
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-green-400/10 dark:bg-green-600/10 rounded-full blur-2xl"></div>
      )}
    </motion.div>
  );
}

// 3. Custom Tooltip (Toucan Theme)
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-ocean-800/95 backdrop-blur text-ocean-800 dark:text-white text-base p-5 rounded-xl shadow-xl border border-ocean-200 dark:border-ocean-700/50">
        <p className="font-semibold mb-3 text-ocean-600 dark:text-ocean-400 border-b border-ocean-200 dark:border-ocean-700/50 pb-2 text-lg">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-4 mb-2 justify-between min-w-[160px]">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full ring-2 ring-black/10 dark:ring-white/10" style={{ backgroundColor: entry.color }} />
              <span className="opacity-70 font-medium">{entry.name}:</span>
            </div>
            <span className="font-mono font-bold text-lg">
              {entry.name.includes('Amount') || entry.name.includes('GTV')
                ? formatCurrency(entry.value)
                : formatNumber(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// 4. Custom Legend for Pie Chart (Toucan Theme)
const renderCustomLegend = (props, activeIndex) => {
  const { payload } = props;
  const total = payload.reduce((acc, entry) => acc + entry.payload.count, 0);

  return (
    <ul className="flex flex-col gap-4 mt-6">
      {payload.map((entry, index) => {
        const percent = ((entry.payload.count / total) * 100).toFixed(1);
        const isActive = index === activeIndex;
        return (
          <motion.li
            key={`item-${index}`}
            className={`text-base transition-colors duration-300 ${isActive
              ? 'text-ocean-900 dark:text-white'
              : 'text-ocean-700 dark:text-ocean-300'
              }`}
            animate={{
              scale: isActive ? 1.02 : 1,
              x: isActive ? 4 : 0
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <motion.div
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: entry.color }}
                  animate={{
                    scale: isActive ? 1.4 : 1,
                    boxShadow: isActive ? `0 0 8px ${entry.color}` : '0 0 0px transparent'
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                />
                <span className={`font-medium transition-all duration-300 ${isActive ? 'font-bold' : ''}`}>
                  {entry.value}
                </span>
              </div>
              <motion.span
                className={`font-semibold transition-colors duration-300 ${isActive ? 'text-ocean-600 dark:text-ocean-400' : 'text-ocean-500'}`}
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {percent}%
              </motion.span>
            </div>
            <div className="w-full h-3 bg-ocean-200 dark:bg-ocean-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: entry.color }}
                initial={{ width: 0 }}
                animate={{
                  width: `${percent}%`,
                  height: isActive ? 12 : 12,
                  boxShadow: isActive ? `0 0 10px ${entry.color}40` : 'none'
                }}
                transition={{
                  width: { duration: 0.8, ease: 'easeOut' },
                  height: { type: 'spring', stiffness: 400, damping: 25 }
                }}
              />
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
};

// --- Main Page Component ---

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    async function fetchAllData() {
      try {
        const [statsRes, dailyRes, paymentRes, hourlyRes] = await Promise.all([
          getDashboardStats(),
          getDailyAnalytics('2026-01-09', '2026-01-16'),  // Volume vs Value + Transaction Status
          getPaymentStats(),  // All data - no date filter
          getHourlyTraffic('2026-01-16', '2026-01-16')  // Hourly traffic for Jan 16, 2026 only
        ]);

        setStats(statsRes);
        setDailyData(dailyRes);
        setPaymentData(paymentRes);
        setHourlyData(hourlyRes);
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-ocean-500/30 rounded-full mb-4"></div>
          <div className="text-ocean-500 dark:text-ocean-400 font-medium text-xl">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">

      {/* HEADER (Toucan Theme) */}
      <div>
        <h1 className="text-7xl font-bold text-ocean-900 dark:text-white tracking-tight" style={{ fontFamily: 'Firlest, serif' }}>Dashboard Overview</h1>

      </div>

      {/* SECTION A: KEY METRICS GRID (8 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Row 1: Primary Growth Metrics */}
        <MetricCard
          title="Total GTV"
          value={formatCurrency(stats?.totalGtv)}
          icon={Wallet}
          cardColorClass="blue"
          trendText="+12.5% this month"
          trendType="up"
        />
        <MetricCard
          title="Active Users"
          value={formatNumber(stats?.totalUsers)}
          subValue={`+${stats?.newUsersToday || 0} today`}
          icon={Users}
          cardColorClass="indigo"
          trendText="Stable activity"
          trendType="neutral"
        />
        <MetricCard
          title="Total Transactions"
          value={formatNumber(stats?.totalTxns)}
          icon={ArrowRightLeft}
          cardColorClass="sky"
          trendText="+5% vs last week"
          trendType="up"
        />
        <MetricCard
          title="Success Rate"
          value={`${stats?.successRate?.toFixed(1)}%`}
          cardColorClass={
            stats?.successRate >= 95 ? 'green' : stats?.successRate >= 90 ? 'amber' : 'red'
          }
          icon={Activity}
          trendText={stats?.successRate < 95 ? "Requires attention" : "Excellent"}
          trendType={stats?.successRate >= 95 ? 'up' : 'warning'}
        />
      </div>

      {/* Row 2: Operational Health (Secondary) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <CompactCard
          title="Avg Ticket Size"
          value={formatCurrency(stats?.averageTicketSize)}
          icon={CreditCard}
          cardColorClass="cyan"
          trendText="Across all channels"
          trendType="neutral"
        />
        <CompactCard
          title="Pending Actions"
          value={formatNumber(stats?.pendingTrxns)}
          cardColorClass="orange"
          icon={Clock}
          trendText="12 urgent"
          trendType="warning"
        />
        <CompactCard
          title="Failed Volume"
          value={formatCurrency(stats?.totalFailedVolume)}
          cardColorClass="red"
          icon={AlertCircle}
          trendText="Technical failures"
          trendType="down"
        />
        <CompactCard
          title="System Status"
          value="Operational"
          cardColorClass="green"
          icon={Activity}
          trendText="All systems go"
          trendType="success"
        />
      </div>

      {/* SECTION B: MAIN TREND CHART (Dual Axis) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-ocean-800 p-8 rounded-3xl border border-ocean-200 dark:border-ocean-700 shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-ocean-900 dark:text-white text-2xl">Volume vs Value Trend</h3>
            <div className="flex gap-6 text-base font-medium">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-ocean-400 dark:bg-ocean-600"></div> <span className="text-ocean-500 dark:text-ocean-400">Count</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-ocean-500"></div> <span className="text-ocean-500 dark:text-ocean-400">GTV</span>
              </div>
            </div>
          </div>
          <p className="text-base text-ocean-500 mb-8">Last 7 Days Performance</p>

          <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dailyData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000000" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 14, fill: '#4988C4' }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                {/* Left Axis: Volume (Bars) */}
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tick={{ fontSize: 14, fill: '#4988C4' }}
                  axisLine={false}
                  tickLine={false}
                >
                  <Label
                    value="Txns"
                    angle={-90}
                    position="insideLeft"
                    style={{ textAnchor: 'middle', fill: '#4988C4', fontSize: 14, fontWeight: 500 }}
                  />
                </YAxis>
                {/* Right Axis: GTV (Line) */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(val) => `₹${val / 1000}k`}
                  tick={{ fontSize: 14, fill: '#4988C4' }}
                  axisLine={false}
                  tickLine={false}
                >
                  <Label
                    value="GTV"
                    angle={90}
                    position="insideRight"
                    style={{ textAnchor: 'middle', fill: '#54a0aa', fontSize: 14, fontWeight: 500 }}
                  />
                </YAxis>
                <Tooltip content={<CustomTooltip />} />

                <Bar
                  yAxisId="left"
                  dataKey="txnCount"
                  name="Transactions"
                  barSize={50}
                  fill="#1C4D8D"
                  radius={[8, 8, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="totalAmount"
                  name="Total GTV"
                  stroke={'#1a9130'}
                  strokeWidth={4}
                  dot={{ r: 6, fill: COLORS.ocean, strokeWidth: 3, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PAYMENT MIX (Donut) */}
        <div className="bg-white dark:bg-ocean-800 p-8 rounded-3xl border border-ocean-200 dark:border-ocean-700 shadow-sm flex flex-col transition-colors duration-300">
          <h3 className="font-bold text-ocean-900 dark:text-white text-2xl mb-2">Payment Methods</h3>
          <p className="text-base text-ocean-500 mb-8">Distribution by channel</p>

          <div className="flex-1 min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="45%"
                  innerRadius={90}
                  outerRadius={120}
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
                          innerRadius={innerRadius - 8}
                          outerRadius={outerRadius + 15}
                          startAngle={startAngle}
                          endAngle={endAngle}
                          fill={fill}
                          style={{
                            filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3))',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        />
                        <Sector
                          cx={cx}
                          cy={cy}
                          innerRadius={outerRadius + 20}
                          outerRadius={outerRadius + 24}
                          startAngle={startAngle}
                          endAngle={endAngle}
                          fill={fill}
                          style={{ opacity: 0.3 }}
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
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                      style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={(props) => renderCustomLegend(props, activeIndex)} verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION C: LOWER CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* 1. Transaction Status Split (Stacked Bar) */}
        <div className="bg-white dark:bg-ocean-800 p-8 rounded-3xl border border-ocean-200 dark:border-ocean-700 shadow-sm transition-colors duration-300">
          <h3 className="font-bold text-ocean-900 dark:text-white text-2xl mb-8">Transaction Status</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000000" className="dark:stroke-ocean-700" />
                <XAxis dataKey="date" tick={{ fontSize: 14, fill: '#4988C4' }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 14, fill: '#4988C4' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '24px' }} />

                <Bar dataKey="successCount" name="Success" stackId="a" fill={COLORS.ocean} barSize={40} />
                <Bar dataKey="pendingCount" name="Pending" stackId="a" fill={COLORS.amber} barSize={40} />
                <Bar dataKey="failedCount" name="Failed" stackId="a" fill={COLORS.red} radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Hourly Traffic (Line Graph) */}
        <div className="bg-white dark:bg-ocean-800 p-8 rounded-3xl border border-ocean-200 dark:border-ocean-700 shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-bold text-ocean-900 dark:text-white text-2xl mb-2">Hourly Peak Traffic</h3>
              <p className="text-base text-ocean-500">Transaction density by hour (0-23h) - Jan 16, 2026</p>
            </div>
            {/* Peak Issues Metric */}
            {hourlyData.length > 0 && (() => {
              const peakHour = hourlyData.reduce((max, curr) =>
                (curr.pendingCount + curr.failedCount) > (max.pendingCount + max.failedCount) ? curr : max
                , hourlyData[0]);
              const peakIssues = peakHour.pendingCount + peakHour.failedCount;
              return (
                <div className="text-right bg-ocean-500/10 dark:bg-ocean-500/15 px-5 py-3 rounded-xl border border-ocean-500/20">
                  <p className="text-sm font-medium text-ocean-500 dark:text-ocean-400">Peak Issues</p>
                  <p className="text-2xl font-bold text-ocean-600 dark:text-ocean-400">{peakHour.hour}:00</p>
                  <p className="text-sm text-ocean-500">{peakIssues} pending+failed</p>
                </div>
              );
            })()}
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={hourlyData} margin={{ left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000000" className="dark:stroke-ocean-700" />
                <XAxis
                  dataKey="hour"
                  tickFormatter={(val) => `${val}h`}
                  tick={{ fontSize: 14, fill: '#4988C4' }}
                  axisLine={false}
                  tickLine={false}
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
          </div>
        </div>

      </div>
    </div>
  );
}