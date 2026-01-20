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
  CreditCard
} from 'lucide-react';
import { 
  getDashboardStats, 
  getDailyAnalytics, 
  getPaymentStats, 
  getHourlyTraffic 
} from '../lib/api';
import { PinContainer } from '../components/ui/3d-pin';

// --- Constants & Helpers ---
const COLORS = {
  emerald: '#10b981',
  green: '#22c55e',
  red: '#ef4444',
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

// 1. Primary Metric Card (3D Pin Version)
function MetricCard({ title, value, subValue, icon: Icon, trendColor = 'text-zinc-400' }) {
  return (
    <div className="h-[14rem] w-full flex items-center justify-center">
      <PinContainer title={value} containerClassName="w-full">
        <div className="flex flex-col p-4 tracking-tight w-[18rem] h-[9rem]">
          {/* Row 1: Icon + Name */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl transition-colors duration-300">
              <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 tracking-wide">{title}</p>
            {subValue && (
              <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 ${trendColor}`}>
                {subValue}
              </span>
            )}
          </div>
          {/* Spacer */}
          <div className="flex-1" />
          {/* Row 2: Colored section with value */}
          <div className="w-full h-14 rounded-lg bg-gradient-to-r from-emerald-500/30 via-zinc-200 dark:via-zinc-800 to-orange-500/20 flex items-center justify-center px-4 transition-colors duration-300">
            <h3 className="text-2xl md:text-3xl font-bold text-zinc-800 dark:text-white tracking-tight text-center transition-transform transition-colors duration-200 group-hover/pin:scale-110 group-hover/pin:text-emerald-600 dark:group-hover/pin:text-emerald-200">
              {value}
            </h3>
          </div>
        </div>
      </PinContainer>
    </div>
  );
}

// 2. Secondary Metric Card (3D Pin Version)
function CompactCard({ title, value, icon: Icon, colorClass = "text-zinc-700 dark:text-zinc-300" }) {
  return (
    <div className="h-[12rem] w-full flex items-center justify-center">
      <PinContainer title={value} containerClassName="w-full">
        <div className="flex flex-col p-3 tracking-tight w-[16rem] h-[8rem]">
          {/* Row 1: Icon + Name */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg transition-colors duration-300">
              <Icon className="w-4 h-4 text-orange-500 dark:text-orange-400" />
            </div>
            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">{title}</p>
          </div>
          {/* Spacer */}
          <div className="flex-1" />
          {/* Row 2: Colored section with value */}
          <div className="w-full h-12 rounded-lg bg-gradient-to-r from-orange-500/30 via-zinc-200 dark:via-zinc-800 to-amber-500/20 flex items-center justify-center px-3 transition-colors duration-300">
            <p
              className={`text-lg md:text-2xl font-bold ${colorClass} text-center transition-transform transition-colors duration-200 group-hover/pin:scale-110 group-hover/pin:text-amber-600 dark:group-hover/pin:text-amber-100`}
            >
              {value}
            </p>
          </div>
        </div>
      </PinContainer>
    </div>
  );
}

// 3. Custom Tooltip (Toucan Theme)
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur text-zinc-800 dark:text-white text-xs p-3 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700/50">
        <p className="font-semibold mb-2 text-emerald-600 dark:text-emerald-400 border-b border-zinc-200 dark:border-zinc-700/50 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-3 mb-1 justify-between min-w-[120px]">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full ring-2 ring-black/10 dark:ring-white/10" style={{ backgroundColor: entry.color }} />
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
const renderCustomLegend = (props, activeIndex) => {
  const { payload } = props;
  const total = payload.reduce((acc, entry) => acc + entry.payload.count, 0);

  return (
    <ul className="flex flex-col gap-3 mt-4">
      {payload.map((entry, index) => {
        const percent = ((entry.payload.count / total) * 100).toFixed(1);
        const isActive = index === activeIndex;
        return (
          <motion.li 
            key={`item-${index}`} 
            className={`text-xs transition-colors duration-300 ${
              isActive 
                ? 'text-zinc-900 dark:text-white' 
                : 'text-zinc-700 dark:text-zinc-300'
            }`}
            animate={{ 
              scale: isActive ? 1.02 : 1,
              x: isActive ? 4 : 0
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <motion.div 
                  className="w-2.5 h-2.5 rounded-full mr-2" 
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
                className={`font-semibold transition-colors duration-300 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {percent}%
              </motion.span>
            </div>
            <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <motion.div 
                className="h-full rounded-full"
                style={{ backgroundColor: entry.color }}
                initial={{ width: 0 }}
                animate={{ 
                  width: `${percent}%`,
                  height: isActive ? 6 : 6,
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
          <div className="h-8 w-8 bg-emerald-500/30 rounded-full mb-2"></div>
          <div className="text-zinc-500 dark:text-zinc-400 font-medium">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      
      {/* HEADER (Toucan Theme) */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Real-time financial & operational insights.</p>
      </div>

      {/* SECTION A: KEY METRICS GRID (8 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-zinc-900 dark:text-white text-lg">Volume vs Value Trend</h3>
            <div className="flex gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600"></div> <span className="text-zinc-500 dark:text-zinc-400">Count</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> <span className="text-zinc-500 dark:text-zinc-400">GTV</span>
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
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col transition-colors duration-300">
          <h3 className="font-bold text-zinc-900 dark:text-white text-lg mb-1">Payment Methods</h3>
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
                  activeIndex={activeIndex}
                  activeShape={(props) => {
                    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                    return (
                      <g>
                        <Sector
                          cx={cx}
                          cy={cy}
                          innerRadius={innerRadius - 5}
                          outerRadius={outerRadius + 10}
                          startAngle={startAngle}
                          endAngle={endAngle}
                          fill={fill}
                          style={{ 
                            filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.25))',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        />
                        <Sector
                          cx={cx}
                          cy={cy}
                          innerRadius={outerRadius + 14}
                          outerRadius={outerRadius + 16}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Transaction Status Split (Stacked Bar) */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
          <h3 className="font-bold text-zinc-900 dark:text-white text-lg mb-6">Transaction Status</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d4d4d8" className="dark:stroke-zinc-700" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                
                <Bar dataKey="successCount" name="Success" stackId="a" fill={COLORS.emerald} barSize={32} />
                <Bar dataKey="pendingCount" name="Pending" stackId="a" fill={COLORS.amber} barSize={32} />
                <Bar dataKey="failedCount" name="Failed" stackId="a" fill={COLORS.red} radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Hourly Traffic (Line Graph) */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-lg mb-1">Hourly Peak Traffic</h3>
              <p className="text-sm text-zinc-500">Transaction density by hour (0-23h) - Jan 16, 2026</p>
            </div>
            {/* Peak Issues Metric */}
            {hourlyData.length > 0 && (() => {
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
            })()}
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={hourlyData} margin={{ left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d4d4d8" className="dark:stroke-zinc-700" />
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
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                
                <Line type="monotone" dataKey="successCount" name="Success" stroke={COLORS.emerald} strokeWidth={2} dot={{ r: 3, fill: COLORS.emerald }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="pendingCount" name="Pending" stroke={COLORS.amber} strokeWidth={2} dot={{ r: 3, fill: COLORS.amber }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="failedCount" name="Failed" stroke={COLORS.red} strokeWidth={2} dot={{ r: 3, fill: COLORS.red }} activeDot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}