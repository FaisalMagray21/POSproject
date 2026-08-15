import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { dashboardApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";
import StatCard from "../components/ui/StatCard";
import { Card, PageLoader, SectionHeading, EmptyState } from "../components/ui/Misc";
import { formatCurrency, formatDateTime } from "../utils/format";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [chart, setChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, recentRes, chartRes] = await Promise.all([
          dashboardApi.stats(),
          dashboardApi.recentSales(8),
          dashboardApi.salesChart(7),
        ]);
        setStats(statsRes.data.data);
        setRecent(recentRes.data.data);
        setChart(
          chartRes.data.data.map((d) => ({
            date: d._id.slice(5),
            sales: d.sales,
            orders: d.orders,
          }))
        );
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow={`Welcome back, ${user?.name?.split(" ")[0]}`}
        title="Dashboard"
        description="Here's what's happening in your store today."
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          icon={Wallet}
          label="Today's Sales"
          value={formatCurrency(stats?.todaysSales)}
          tone="brand"
        />
        <StatCard icon={ShoppingBag} label="Today's Orders" value={stats?.todaysOrders ?? 0} />
        <StatCard icon={Package} label="Total Products" value={stats?.totalProducts ?? 0} />
        <StatCard icon={Users} label="Total Customers" value={stats?.totalCustomers ?? 0} />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock"
          value={stats?.lowStockProducts ?? 0}
          tone={stats?.lowStockProducts > 0 ? "gold" : "white"}
        />
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={formatCurrency(stats?.totalRevenue)}
          tone="ink"
        />
      </div>

      <div className="grid lg:grid-cols-5 gap-4 sm:gap-6">
        <Card className="lg:col-span-3 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-ink-900">Sales — last 7 days</h3>
          </div>
          <div className="h-64 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0B6E4F" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0B6E4F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#E4E7E2" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#5C7A6C" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#5C7A6C" }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E4E7E2",
                    fontSize: 12,
                    fontFamily: "Inter",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#0B6E4F"
                  strokeWidth={2}
                  fill="url(#salesFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-4 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-ink-900">Recent Sales</h3>
            <Link
              to="/sales"
              className="text-xs font-medium text-brand-500 hover:text-brand-600 flex items-center gap-0.5"
            >
              View all <ArrowUpRight size={13} />
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState title="No sales yet" description="Sales will appear here once you start checking out orders." />
          ) : (
            <div className="space-y-1 -mx-2">
              {recent.map((sale) => (
                <Link
                  to={`/sales/${sale._id}`}
                  key={sale._id}
                  className="flex items-center justify-between px-2 py-2.5 rounded-xl hover:bg-ink-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-mono font-medium text-ink-800 truncate">
                      {sale.invoiceNumber}
                    </p>
                    <p className="text-xs text-ink-400 truncate">
                      {sale.customer?.name || "Walk-in"} &middot; {formatDateTime(sale.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-ink-900 shrink-0 ml-3">
                    {formatCurrency(sale.total)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
