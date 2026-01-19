import { useEffect, useState } from 'react';
import {
  ComposedChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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
  CreditCard
} from 'lucide-react';
import { 
  getDashboardStats, 
  getDailyAnalytics, 
  getPaymentStats, 
  getHourlyTraffic 
} from '../lib/api';

// --- Constants & Helpers ---
const COLORS = {
  emerald: '#10b981',
  green: '#22c55e',
  orange: '#f97316',
  amber: '#f59e0b', 
  black: '#18181b',
  zinc: '#71717a'
};

const PIE_COLORS = [COLORS.emerald, COLORS.orange, COLORS.amber, COLORS.green];

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

// 1. Primary Metric Card (Toucan Dark Theme)
function MetricCard({ title, value, subValue, icon: Icon, trendColor = 'text-zinc-400' }) {
  return (
    <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm hover:shadow-lg hover:border-emerald-500/30 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-zinc-800 rounded-xl">
          <Icon className="w-6 h-6 text-emerald-400" />
        </div>
        {subValue && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 ${trendColor}`}>
            {subValue}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-400 mb-1 tracking-wide">{title}</p>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      </div>
    </div>
  );
}

// 2. Secondary Metric Card (Toucan Dark Theme)
function CompactCard({ title, value, icon: Icon, colorClass = "text-zinc-300" }) {
  return (
    <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-sm hover:shadow-lg hover:border-orange-500/30 transition-all duration-300 flex items-center justify-between group">
      <div>
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1 group-hover:text-zinc-400 transition-colors">{title}</p>
        <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
      </div>
      <div className="p-2 bg-zinc-800 rounded-lg group-hover:bg-zinc-700 transition-colors">
        <Icon className="w-5 h-5 text-orange-400 group-hover:text-orange-300 transition-colors" />
      </div>
    </div>
  );
}

// 3. Custom Tooltip (Toucan Theme)
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900/95 backdrop-blur text-white text-xs p-3 rounded-xl shadow-xl border border-zinc-700/50">
        <p className="font-semibold mb-2 text-emerald-400 border-b border-zinc-700/50 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-3 mb-1 justify-between min-w-[120px]">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full ring-2 ring-white/10" style={{ backgroundColor: entry.color }} />
              <span className="opacity-70 font-medium">{entry.name}:</span>
            </div>
            <span className="font-mono font-bold">
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
const renderCustomLegend = (props) => {
  const { payload } = props;
  const total = payload.reduce((acc, entry) => acc + entry.payload.count, 0);

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
      {payload.map((entry, index) => {
        const percent = ((entry.payload.count / total) * 100).toFixed(1);
        return (
          <li key={`item-${index}`} className="flex items-center text-xs text-zinc-300">
            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
            <span className="font-medium mr-1">{entry.value}</span>
            <span className="text-zinc-500">({percent}%)</span>
          </li>
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

  useEffect(() => {
    async function fetchAllData() {
      try {
        const [statsRes, dailyRes, paymentRes, hourlyRes] = await Promise.all([
          getDashboardStats(),
          getDailyAnalytics('2026-01-09', '2026-01-16'),  // Volume vs Value + Transaction Status
          getPaymentStats(),  // All data - no date filter
          getHourlyTraffic('2026-01-09', '2026-01-16')  // All data - no date filter
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
          <div className="h-8 w-8 bg-emerald-500/30 rounded-full mb-2"></div>
          <div className="text-zinc-400 font-medium">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      
      {/* HEADER (Toucan Theme) */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-zinc-400 mt-1">Real-time financial & operational insights.</p>
      </div>

      {/* SECTION A: KEY METRICS GRID (8 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Row 1: Primary Growth Metrics */}
        <MetricCard 
          title="Total GTV" 
          value={formatCurrency(stats?.totalGtv)} 
          icon={Wallet} 
        />
        <MetricCard 
          title="Active Users" 
          value={formatNumber(stats?.totalUsers)} 
          subValue={`+${stats?.newUsersToday || 0} today`}
          trendColor="text-emerald-400 bg-emerald-500/20 border-emerald-500/30"
          icon={Users} 
        />
        <MetricCard 
          title="Total Transactions" 
          value={formatNumber(stats?.totalTxns)} 
          icon={ArrowRightLeft} 
        />
        <MetricCard 
          title="Success Rate" 
          value={`${stats?.successRate?.toFixed(1)}%`}
          subValue={stats?.successRate > 90 ? 'Healthy' : 'Needs Attn'}
          trendColor={stats?.successRate > 90 ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' : 'text-orange-400 bg-orange-500/20 border-orange-500/30'}
          icon={Activity} 
        />
      </div>

      {/* Row 2: Operational Health (Secondary) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <CompactCard 
          title="Avg Ticket Size" 
          value={formatCurrency(stats?.averageTicketSize)} 
          icon={CreditCard} 
        />
        <CompactCard 
          title="Pending Actions" 
          value={formatNumber(stats?.pendingTrxns)} 
          colorClass="text-amber-400"
          icon={Clock} 
        />
        <CompactCard 
          title="Failed Volume" 
          value={formatCurrency(stats?.totalFailedVolume)} 
          colorClass="text-orange-400"
          icon={AlertCircle} 
        />
        <CompactCard 
          title="System Status" 
          value="Operational" 
          colorClass="text-emerald-400"
          icon={Activity} 
        />
      </div>

      {/* SECTION B: MAIN TREND CHART (Dual Axis) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-white text-lg">Volume vs Value Trend</h3>
            <div className="flex gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-600"></div> <span className="text-zinc-400">Count</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> <span className="text-zinc-400">GTV</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-zinc-500 mb-6">Last 7 Days Performance</p>
          
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dailyData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#71717a' }} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10}
                />
                {/* Left Axis: Volume (Bars) */}
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  tick={{ fontSize: 11, fill: '#71717a' }} 
                  axisLine={false} 
                  tickLine={false} 
                >
                  <Label 
                    value="Txns" 
                    angle={-90} 
                    position="insideLeft" 
                    style={{ textAnchor: 'middle', fill: '#71717a', fontSize: 10, fontWeight: 500 }} 
                  />
                </YAxis>
                {/* Right Axis: GTV (Line) */}
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tickFormatter={(val) => `₹${val/1000}k`} 
                  tick={{ fontSize: 11, fill: '#71717a' }} 
                  axisLine={false} 
                  tickLine={false} 
                >
                  <Label 
                    value="GTV" 
                    angle={90} 
                    position="insideRight" 
                    style={{ textAnchor: 'middle', fill: '#71717a', fontSize: 10, fontWeight: 500 }} 
                  />
                </YAxis>
                <Tooltip content={<CustomTooltip />} />
                
                <Bar 
                  yAxisId="left" 
                  dataKey="txnCount" 
                  name="Transactions" 
                  barSize={40} 
                  fill="#3f3f46" 
                  radius={[6, 6, 0, 0]} 
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="totalAmount" 
                  name="Total GTV" 
                  stroke={COLORS.emerald} 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: COLORS.emerald, strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PAYMENT MIX (Donut) */}
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm flex flex-col">
          <h3 className="font-bold text-white text-lg mb-1">Payment Methods</h3>
          <p className="text-sm text-zinc-500 mb-6">Distribution by channel</p>
          
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="45%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="paymentMethod"
                  stroke="none"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={renderCustomLegend} verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION C: LOWER CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Transaction Status Split (Stacked Bar) */}
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm">
          <h3 className="font-bold text-white text-lg mb-6">Transaction Status</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                
                <Bar dataKey="successCount" name="Success" stackId="a" fill={COLORS.emerald} barSize={32} />
                <Bar dataKey="pendingCount" name="Pending" stackId="a" fill={COLORS.amber} barSize={32} />
                <Bar dataKey="failedCount" name="Failed" stackId="a" fill={COLORS.orange} radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Hourly Traffic (Heatmap Style Bar) */}
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm">
          <h3 className="font-bold text-white text-lg mb-1">Hourly Peak Traffic</h3>
          <p className="text-sm text-zinc-500 mb-6">Transaction density by hour (0-23h)</p>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={(val) => `${val}h`}
                  tick={{ fontSize: 12, fill: '#71717a' }} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10}
                />
                <YAxis tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                
                <Bar dataKey="txnCount" name="Transactions" fill={COLORS.orange} radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}