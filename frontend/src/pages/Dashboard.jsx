import { useEffect, useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  DollarSign,
  Clock,
} from 'lucide-react';
import {
  getDashboardStats,
  getDailyAnalytics,
  getPaymentStats,
  getHourlyTraffic,
} from '../lib/api';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];
const STATUS_COLORS = {
  success: '#22c55e',
  failed: '#ef4444',
  pending: '#f59e0b',
};

function KPICard({ title, value, icon: Icon, trend, color }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-zinc-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last period
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-zinc-800">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, dailyRes, paymentRes, hourlyRes] = await Promise.all([
          getDashboardStats(),
          getDailyAnalytics(),
          getPaymentStats(),
          getHourlyTraffic(),
        ]);
        setStats(statsRes);
        setDailyData(dailyRes);
        setPaymentData(paymentRes);
        setHourlyData(hourlyRes);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-emerald-400"></div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value?.toFixed(2) || 0}`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 dark:text-zinc-400 mt-1">Welcome back! Here's your analytics overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total GTV"
          value={formatCurrency(stats?.totalGtv)}
          icon={DollarSign}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
        />
        <KPICard
          title="New Users Today"
          value={stats?.newUsersToday?.toLocaleString() || 0}
          icon={Users}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <KPICard
          title="Success Rate"
          value={`${stats?.successRate?.toFixed(1) || 0}%`}
          icon={CheckCircle}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <KPICard
          title="Failed Volume"
          value={formatCurrency(stats?.totalFailedVolume)}
          icon={XCircle}
          color="bg-gradient-to-br from-red-500 to-red-600"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trends Chart (Dual Axis) */}
        <ChartCard title="Transaction Trends (Last 7 Days)">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-zinc-700" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
                className="fill-slate-500 dark:fill-zinc-400"
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => v.toLocaleString()}
                className="fill-slate-500 dark:fill-zinc-400"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency}
                className="fill-slate-500 dark:fill-zinc-400"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #fff)',
                  border: '1px solid var(--tooltip-border, #e2e8f0)',
                  borderRadius: '8px',
                  color: 'var(--tooltip-text, #1e293b)',
                }}
                formatter={(value, name) =>
                  name === 'totalAmount' ? formatCurrency(value) : value.toLocaleString()
                }
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="txnCount"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                name="Transactions"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="totalAmount"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ fill: '#22c55e', strokeWidth: 2 }}
                name="Volume"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Status Split (Stacked Bar) */}
        <ChartCard title="Status Breakdown (Last 7 Days)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-zinc-700" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
                className="fill-slate-500 dark:fill-zinc-400"
              />
              <YAxis tick={{ fontSize: 12 }} className="fill-slate-500 dark:fill-zinc-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #fff)',
                  border: '1px solid var(--tooltip-border, #e2e8f0)',
                  borderRadius: '8px',
                  color: 'var(--tooltip-text, #1e293b)',
                }}
              />
              <Legend />
              <Bar dataKey="successCount" stackId="a" fill={STATUS_COLORS.success} name="Success" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pendingCount" stackId="a" fill={STATUS_COLORS.pending} name="Pending" />
              <Bar dataKey="failedCount" stackId="a" fill={STATUS_COLORS.failed} name="Failed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Mix (Donut) */}
        <ChartCard title="Payment Method Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
                nameKey="paymentMethod"
                label={({ paymentMethod, percent }) =>
                  `${paymentMethod} ${(percent * 100).toFixed(0)}%`
                }
              >
                {paymentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #fff)',
                  border: '1px solid var(--tooltip-border, #e2e8f0)',
                  borderRadius: '8px',
                  color: 'var(--tooltip-text, #1e293b)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Hourly Traffic */}
        <ChartCard title="Hourly Traffic Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-zinc-700" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 12 }}
                tickFormatter={(h) => `${h}:00`}
                className="fill-slate-500 dark:fill-zinc-400"
              />
              <YAxis tick={{ fontSize: 12 }} className="fill-slate-500 dark:fill-zinc-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #fff)',
                  border: '1px solid var(--tooltip-border, #e2e8f0)',
                  borderRadius: '8px',
                  color: 'var(--tooltip-text, #1e293b)',
                }}
                labelFormatter={(h) => `${h}:00 - ${h}:59`}
              />
              <Legend />
              <Bar dataKey="successCount" stackId="a" fill={STATUS_COLORS.success} name="Success" />
              <Bar dataKey="pendingCount" stackId="a" fill={STATUS_COLORS.pending} name="Pending" />
              <Bar dataKey="failedCount" stackId="a" fill={STATUS_COLORS.failed} name="Failed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
