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
import { Calendar, DollarSign, CheckCircle, TrendingUp, Activity, Filter } from 'lucide-react';
import {
  getDashboardStats,
  getFilteredDashboardStats,
  getDailyAnalytics,
  getPaymentStats,
  getHourlyTraffic,
} from '../lib/api';

const COLORS = {
  emerald: '#10b981',
  green: '#22c55e',
  red: '#ef4444',
  orange: '#f97316',
  amber: '#f59e0b',
  black: '#18181b',
  zinc: '#71717a'
};

const DONUT_COLORS = [COLORS.emerald, COLORS.orange, COLORS.amber, COLORS.green];
const STATUS_COLORS = { success: COLORS.emerald, failed: COLORS.red, pending: COLORS.amber };

function CustomTooltip({ active, payload, label, formatter }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-4 py-3 rounded-lg shadow-xl border border-slate-200 dark:border-zinc-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></span>
            <span className="text-slate-600 dark:text-slate-300">{entry.name}:</span>
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

function MiniStatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-200 dark:border-zinc-800 flex items-center gap-4 hover:border-emerald-500/30 transition-all">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="text-xs text-slate-500 dark:text-zinc-400">{label}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, children, className = '', headerRight }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 ${className}`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
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
    <ul className="flex flex-col gap-3 mt-4">
      {payload.map((entry, index) => {
        const percent = ((entry.payload.count / total) * 100).toFixed(1);
        const isActive = index === activeIndex;
        return (
          <li 
            key={`item-${index}`} 
            className={`text-xs transition-all duration-200 ${
              isActive 
                ? 'text-zinc-900 dark:text-white scale-105 origin-left' 
                : 'text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <div 
                  className={`w-2.5 h-2.5 rounded-full mr-2 transition-transform duration-200 ${isActive ? 'scale-125' : ''}`} 
                  style={{ backgroundColor: entry.color }} 
                />
                <span className={`font-medium ${isActive ? 'font-bold' : ''}`}>{entry.value}</span>
              </div>
              <span className={`font-semibold ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}>{percent}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isActive ? 'h-2' : ''}`}
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
  
  // Date range state
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [statsRes, dailyRes, paymentRes, hourlyRes] = await Promise.all([
          getFilteredDashboardStats(startDate, endDate),
          getDailyAnalytics(startDate, endDate),
          getPaymentStats(startDate, endDate),
          getHourlyTraffic(startDate, endDate),
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
  }, [startDate, endDate]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Analytics</h1>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-0.5">Detailed charts and insights</p>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-700 p-2">
          <div className="flex items-center gap-2 px-3">
            <Calendar className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span className="text-sm text-slate-500 dark:text-zinc-400">From</span>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 text-sm bg-stone-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
          <span className="text-slate-400 dark:text-zinc-600">—</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-zinc-400">To</span>
          </div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 text-sm bg-stone-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-orange-500 rounded-lg hover:from-emerald-600 hover:to-orange-600 transition-colors">
            <Filter className="w-4 h-4" />
            Apply
          </button>
        </div>
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStatCard
          icon={DollarSign}
          label="Total GTV"
          value={formatCurrency(stats?.totalGtv)}
          color="bg-emerald-500"
        />
        <MiniStatCard
          icon={CheckCircle}
          label="Success Rate"
          value={`${stats?.successRate?.toFixed(1) || 0}%`}
          color="bg-green-500"
        />
        <MiniStatCard
          icon={TrendingUp}
          label="Transactions"
          value={stats?.totalTxns?.toLocaleString() || 0}
          color="bg-orange-500"
        />
        <MiniStatCard
          icon={Activity}
          label="Avg Ticket"
          value={formatCurrency(stats?.averageTicketSize)}
          color="bg-amber-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart (Larger) */}
        <ChartCard title="Revenue Over Time" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12, fill: '#71717a' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#71717a' }}
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
              <Legend wrapperStyle={{ paddingTop: 16 }} />
              <Area
                type="monotone"
                dataKey="totalAmount"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                name="Volume"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Donut Chart with Custom Legend */}
        <ChartCard title="Payment Methods">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentData}
                cx="50%"
                cy="40%"
                innerRadius={55}
                outerRadius={80}
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
                        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))' }}
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
                      <div className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-zinc-700">
                        <p className="font-semibold text-emerald-500 dark:text-emerald-400">{payload[0].name}</p>
                        <p>{payload[0].value.toLocaleString()} txns</p>
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

      {/* Bottom Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stacked Status Bar */}
        <ChartCard title=" Daily Transaction Traffic">
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12, fill: '#71717a' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 16 }} iconType="circle" iconSize={8} />
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
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Hourly Traffic (Line Graph with Peak Issues) */}
        <ChartCard 
          title="Hourly Peak Traffic" 
          headerRight={
            hourlyData.length > 0 && (() => {
              const peakHour = hourlyData.reduce((max, curr) => 
                (curr.pendingCount + curr.failedCount) > (max.pendingCount + max.failedCount) ? curr : max
              , hourlyData[0]);
              const peakIssues = peakHour.pendingCount + peakHour.failedCount;
              return (
                <div className="text-right bg-orange-500/10 dark:bg-orange-500/15 px-3 py-2 rounded-lg border border-orange-500/20">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Peak Issues</p>
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{peakHour.hour}:00</p>
                  <p className="text-[10px] text-zinc-500">{peakIssues} pending+failed</p>
                </div>
              );
            })()
          }
        >
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={hourlyData} margin={{ left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 12, fill: '#71717a' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(h) => `${h}h`}
                dy={10}
              />
              <YAxis tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              
              <Line type="monotone" dataKey="successCount" name="Success" stroke={COLORS.emerald} strokeWidth={2} dot={{ r: 3, fill: COLORS.emerald }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="pendingCount" name="Pending" stroke={COLORS.amber} strokeWidth={2} dot={{ r: 3, fill: COLORS.amber }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="failedCount" name="Failed" stroke={COLORS.red} strokeWidth={2} dot={{ r: 3, fill: COLORS.red }} activeDot={{ r: 5 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
