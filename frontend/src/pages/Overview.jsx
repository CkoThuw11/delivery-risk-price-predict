import { useState, useEffect } from "react";
import { apiFetch } from "../utils/apiFetch";
import { 
  DollarSign,
  ShoppingCart,
  Users,
  Wallet,
  ArrowUp,
  ArrowDown,
  Loader2,
  AlertCircle
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

function MainPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_URL = "http://127.0.0.1:8000/order/stats/orders/late-rate/";

        const response = await apiFetch(API_URL, {
          method: "GET"
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Dashboard data received:", data);
        setDashboard(data);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
        setError("Unable to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const calculateChange = (current, previous = null) => {
    if (!previous) {
      return { change: formatNumber(current * 0.1), percent: "+10%" };
    }
    const diff = current - previous;
    const percent = ((diff / previous) * 100).toFixed(1);
    return {
      change: formatNumber(Math.abs(diff)),
      percent: `${diff >= 0 ? '+' : '-'}${Math.abs(percent)}%`,
      isPositive: diff >= 0
    };
  };

  // Redesigned Metric Card - Horizontal Layout (Image 2 Style)
  const MetricCard = ({ icon: Icon, title, value, change, percent, color, isPositive = true }) => (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        {/* Left side - Content */}
        <div className="flex-1">
          <p className="text-3xl font-bold color-primary-3 mb-3">{value}</p>
          <p className="color-secondary-3 text-xl font-bold mb-2">{title}</p>
          
          {/* Change info */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 text-sm font-semibold ${
              isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {isPositive ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              <span>{change}</span>
            </div>
            <span className="text-gray-500 text-sm">{percent} this month</span>
          </div>
        </div>

        {/* Right side - Icon */}
        <div className={`p-4 rounded-xl flex-shrink-0 ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-600">No dashboard data available.</p>
      </div>
    );
  }

  const {
    kpi_cards,
    kpi_monthly,
    revenue_over_time,
    sales_by_customer_group,
    top_10_category,
    late_risk_over_time,
    top_10_sales_region,
  } = dashboard;

  const totalSalesChange = calculateChange(kpi_monthly.current_month.total_sales, kpi_monthly.previous_month.total_sales);
  const totalOrdersChange = calculateChange(kpi_monthly.current_month.total_orders, kpi_monthly.previous_month.total_orders);
  const totalCustomersChange = calculateChange(kpi_monthly.current_month.total_customers,kpi_monthly.previous_month.total_customers);
  const totalProfitChange = calculateChange(kpi_monthly.current_month.total_profit, kpi_monthly.previous_month.total_profit);

  const salesTimeData = revenue_over_time.data.map(item => ({
    month: item.month,
    sales: item.sales
  }));

  const segmentColors = {
    'Consumer': '#3B82F6',
    'Corporate': '#1E40AF',
    'Home Office': '#F97316'
  };
  const customerSegmentData = sales_by_customer_group.data.map(item => ({
    name: item.segment,
    value: item.sales,
    color: segmentColors[item.segment] || '#6B7280'
  }));

  const lateRiskData = late_risk_over_time.data.map(item => ({
    month: item.month,
    rate: (item.late_rate * 100).toFixed(1)
  }));

  const regionSalesData = top_10_sales_region.data.slice(0, 6);
  const categoryData = top_10_category.data;
  const totalCategorySales = categoryData.reduce((sum, item) => sum + item.sales, 0);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8">

        {/* Metric Cards - New Horizontal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            icon={DollarSign}
            title="Total Sales"
            value={formatNumber(kpi_cards.total_sales)}
            change={totalSalesChange.change}
            percent={totalSalesChange.percent}
            color="bg-gradient-to-br from-green-500 to-green-600"
            isPositive={totalSalesChange.isPositive}
          />
          <MetricCard
            icon={ShoppingCart}
            title="Count Of Orders"
            value={formatNumber(kpi_cards.total_orders)}
            change={totalOrdersChange.change}
            percent={totalOrdersChange.percent}
            color="bg-gradient-to-br from-teal-600 to-teal-700"
            isPositive={totalOrdersChange.isPositive}
          />
          <MetricCard
            icon={Users}
            title="Count Of Customers"
            value={formatNumber(kpi_cards.total_customers)}
            change={totalCustomersChange.change}
            percent={totalCustomersChange.percent}
            color="bg-gradient-to-br from-slate-700 to-slate-800"
            isPositive={totalCustomersChange.isPositive}
          />
          <MetricCard
            icon={Wallet}
            title="Sum Of Benefit"
            value={formatNumber(kpi_cards.total_profit)}
            change={totalProfitChange.change}
            percent={totalProfitChange.percent}
            color="bg-gradient-to-br from-emerald-600 to-emerald-700"
            isPositive={totalProfitChange.isPositive}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Sales Through Time */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h3 className="text-xl font-bold color-secondary-3 mb-6">Sales Through Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} fontSize={11} />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                  }}
                  formatter={(value) => formatNumber(value)}
                />
                <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Customer Segment */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h3 className="text-xl font-bold color-secondary-3 mb-6">Customer Segment</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={customerSegmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {customerSegmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatNumber(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {customerSegmentData.map((segment, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }}></div>
                    <span className="text-gray-700">{segment.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formatNumber(segment.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Late Risk */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h3 className="text-xl font-bold color-secondary-3 mb-6">Late Risk Through Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={lateRiskData}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} fontSize={11} />
                <YAxis stroke="#9CA3AF" />
                <Tooltip formatter={(value) => `${value}%`} />
                <Area type="monotone" dataKey="rate" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Sum of Sales by Order Region */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h3 className="text-xl font-bold color-secondary-3 mb-6">Sum Of Sales By Order Region</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={regionSalesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="region" type="category" width={120} stroke="#9CA3AF" fontSize={11} />
                <Tooltip formatter={(value) => formatNumber(value)} />
                <Bar dataKey="sales" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Sales Table */}
          <div className="rounded-2xl p-6 shadow-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold color-secondary-3 tracking-wide">
                Category Sales
              </h3>
            </div>

            <div className="overflow-y-auto max-h-[260px] rounded-xl border border-gray-200 shadow-inner">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-20 bg-white shadow-sm">
                  <tr className="text-secondary-3">
                    <th className="py-3 px-4 text-left font-bold color-secondary-3">Category Name</th>
                    <th className="py-3 px-4 text-right font-bold color-secondary-3">Sum Of Sales</th>
                  </tr>
                </thead>

                <tbody>
                  {(() => {
                    const top3 = [...categoryData]
                      .sort((a, b) => b.sales - a.sales)
                      .slice(0, 3)
                      .map((c) => c.product);

                    return categoryData.map((cat, idx) => {
                      const isTop3 = top3.includes(cat.product);

                      return (
                        <tr
                          key={idx}
                          className={`
                            transition-all duration-200 
                            hover:bg-secondary-4/30 hover:shadow-sm
                            ${
                              isTop3
                                ? "bg-red-50 border-l-4 border-red-300"
                                : idx % 2 === 0
                                ? "bg-white"
                                : "bg-gray-50"
                            }
                          `}
                        >
                          <td
                            className={`py-3 px-4 ${
                              isTop3 ? "text-gray-800" : "text-gray-700"
                            }`}
                          >
                            {cat.product}
                          </td>

                          <td
                            className={`py-3 px-4 text-right ${
                              isTop3 ? "text-gray-900" : "text-gray-900"
                            }`}
                          >
                            {cat.sales.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      );
                    });
                  })()}

                  <tr className="bg-secondary-4 font-bold text-gray-900 sticky bottom-0">
                    <td className="py-3 px-4">Total</td>
                    <td className="py-3 px-4 text-right">
                      {totalCategorySales.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;