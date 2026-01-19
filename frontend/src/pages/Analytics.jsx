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
} from 'recharts';
import { Calendar, DollarSign, CheckCircle, TrendingUp, Activity, Filter } from 'lucide-react';
import {
  getDashboardStats,
  getFilteredDashboardStats,
  getDailyAnalytics,
  getPaymentStats,
  getHourlyTraffic,
} from '../lib/api';

const DONUT_COLORS = ['#10b981', '#f97316', '#f59e0b', '#22c55e'];
const STATUS_COLORS = { success: '#10b981', failed: '#f97316', pending: '#f59e0b' };

function CustomTooltip({ active, payload, label, formatter }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 text-white px-4 py-3 rounded-lg shadow-xl border border-zinc-700">
        <p className="text-xs text-slate-400 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></span>
            <span className="text-slate-300">{entry.name}:</span>
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
    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex items-center gap-4 hover:border-emerald-500/30 transition-all">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-lg font-bold text-white">{value}</p>
        <p className="text-xs text-zinc-400">{label}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-zinc-900 rounded-2xl p-6 border border-zinc-800 ${className}`}
    >
      <h3 className="text-base font-semibold text-white mb-4">{title}</h3>
      {children}
    </motion.div>
  );
}

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
          <h1 className="text-xl font-semibold text-white">Analytics</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Detailed charts and insights</p>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex items-center gap-3 bg-zinc-900 rounded-xl border border-zinc-700 p-2">
          <div className="flex items-center gap-2 px-3">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-zinc-400">From</span>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 text-sm bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
          <span className="text-zinc-600">—</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">To</span>
          </div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 text-sm bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
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

        {/* Donut Chart */}
        <ChartCard title="Payment Methods">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="count"
                nameKey="paymentMethod"
              >
                {paymentData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-zinc-900 text-white px-3 py-2 rounded-lg text-sm border border-zinc-700">
                        <p className="font-semibold text-emerald-400">{payload[0].name}</p>
                        <p>{payload[0].value.toLocaleString()} txns</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bottom Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stacked Status Bar */}
        <ChartCard title="Transaction Health">
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
                fill={STATUS_COLORS.failed}
                name="Failed"
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Hourly Traffic */}
        <ChartCard title="Hourly Traffic Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 12, fill: '#71717a' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(h) => `${h}:00`}
              />
              <YAxis tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const total = payload.reduce((sum, p) => sum + (p.value || 0), 0);
                    return (
                      <div className="bg-zinc-900 text-white px-4 py-3 rounded-lg shadow-xl border border-zinc-700">
                        <p className="text-xs text-zinc-400 mb-2">{label}:00 - {label}:59</p>
                        <p className="font-semibold text-lg text-emerald-400">{total} transactions</p>
                        <div className="mt-2 space-y-1 text-sm">
                          {payload.map((p, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: p.color }}
                              ></span>
                              <span className="text-zinc-300">{p.name}:</span>
                              <span>{p.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 16 }} iconType="circle" iconSize={8} />
              <Area 
                type="monotone" 
                dataKey="successCount" 
                stroke="#10b981" 
                strokeWidth={2}
                fill="url(#successGradient)" 
                name="Success" 
              />
              <Area 
                type="monotone" 
                dataKey="pendingCount" 
                stroke="#f59e0b" 
                strokeWidth={2}
                fill="url(#pendingGradient)" 
                name="Pending" 
              />
              <Area 
                type="monotone" 
                dataKey="failedCount" 
                stroke="#f97316" 
                strokeWidth={2}
                fill="url(#failedGradient)" 
                name="Failed" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
