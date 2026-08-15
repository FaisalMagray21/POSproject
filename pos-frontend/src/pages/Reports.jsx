import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Package,
  AlertTriangle,
  Wallet,
  ShoppingBag,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { reportApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";
import { Card, PageLoader, SectionHeading, EmptyState } from "../components/ui/Misc";
import StatCard from "../components/ui/StatCard";
import { Select } from "../components/ui/Field";
import { formatCurrency } from "../utils/format";

const tabs = [
  { key: "sales", label: "Sales", icon: TrendingUp },
  { key: "products", label: "Top Products", icon: Package },
  { key: "revenue", label: "Revenue", icon: Wallet },
  { key: "lowStock", label: "Low Stock", icon: AlertTriangle },
];

export default function Reports() {
  const toast = useToast();
  const [tab, setTab] = useState("sales");
  const [period, setPeriod] = useState("week");
  const [loading, setLoading] = useState(true);

  const [salesReport, setSalesReport] = useState(null);
  const [productReport, setProductReport] = useState([]);
  const [revenueReport, setRevenueReport] = useState(null);
  const [lowStockReport, setLowStockReport] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (tab === "sales") {
          const res = await reportApi.sales({ period });
          setSalesReport(res.data);
        } else if (tab === "products") {
          const res = await reportApi.products({ period });
          setProductReport(res.data.data);
        } else if (tab === "revenue") {
          const res = await reportApi.revenue({ period });
          setRevenueReport(res.data.data);
        } else if (tab === "lowStock") {
          const res = await reportApi.lowStock();
          setLowStockReport(res.data.data);
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, period]);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Business Insights"
        title="Reports"
        description="Track sales performance, top products, and stock health."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 bg-white border border-ink-100 rounded-xl p-1.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key ? "bg-brand-500 text-white" : "text-ink-600 hover:bg-ink-50"
              }`}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {tab !== "lowStock" && (
          <Select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-auto max-w-[160px]">
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </Select>
        )}
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <>
          {tab === "sales" && salesReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  icon={ShoppingBag}
                  label="Total Orders"
                  value={salesReport.totals.totalOrders}
                  tone="ink"
                />
                <StatCard
                  icon={Wallet}
                  label="Total Sales"
                  value={formatCurrency(salesReport.totals.totalSales)}
                  tone="brand"
                />
              </div>
              <Card className="p-4 sm:p-6">
                <h3 className="font-display font-semibold text-ink-900 mb-4">Daily Breakdown</h3>
                {salesReport.data.length === 0 ? (
                  <EmptyState icon={BarChart3} title="No sales in this period" />
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesReport.data}>
                        <CartesianGrid vertical={false} stroke="#E4E7E2" />
                        <XAxis
                          dataKey="_id"
                          tickFormatter={(v) => v.slice(5)}
                          tick={{ fontSize: 11, fill: "#5C7A6C" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis tick={{ fontSize: 11, fill: "#5C7A6C" }} axisLine={false} tickLine={false} width={40} />
                        <Tooltip
                          formatter={(value, name) =>
                            name === "sales" ? formatCurrency(value) : value
                          }
                          contentStyle={{ borderRadius: 12, border: "1px solid #E4E7E2", fontSize: 12 }}
                        />
                        <Bar dataKey="sales" fill="#0B6E4F" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
              <Card className="overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wider text-ink-400">
                        <th className="px-5 py-3 font-medium">Date</th>
                        <th className="px-5 py-3 font-medium">Orders</th>
                        <th className="px-5 py-3 font-medium">Sales</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">
                      {salesReport.data.map((row) => (
                        <tr key={row._id}>
                          <td className="px-5 py-3 font-mono text-ink-700">{row._id}</td>
                          <td className="px-5 py-3 text-ink-600">{row.orders}</td>
                          <td className="px-5 py-3 font-semibold text-ink-900">
                            {formatCurrency(row.sales)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {tab === "products" && (
            <Card className="overflow-hidden">
              {productReport.length === 0 ? (
                <EmptyState icon={Package} title="No product sales in this period" />
              ) : (
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wider text-ink-400">
                        <th className="px-5 py-3 font-medium">#</th>
                        <th className="px-5 py-3 font-medium">Product</th>
                        <th className="px-5 py-3 font-medium hidden sm:table-cell">SKU</th>
                        <th className="px-5 py-3 font-medium">Units Sold</th>
                        <th className="px-5 py-3 font-medium">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">
                      {productReport.map((p, i) => (
                        <tr key={p._id} className="hover:bg-ink-50/50">
                          <td className="px-5 py-3.5 text-ink-400 font-mono">{i + 1}</td>
                          <td className="px-5 py-3.5 font-medium text-ink-800">{p.name}</td>
                          <td className="px-5 py-3.5 text-ink-400 font-mono text-xs hidden sm:table-cell">
                            {p.sku}
                          </td>
                          <td className="px-5 py-3.5 text-ink-600">{p.totalSold}</td>
                          <td className="px-5 py-3.5 font-semibold text-ink-900">
                            {formatCurrency(p.totalRevenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {tab === "revenue" && revenueReport && (
            <div className="grid sm:grid-cols-3 gap-4">
              <StatCard
                icon={Wallet}
                label="Total Sales"
                value={formatCurrency(revenueReport.totalSales)}
                tone="brand"
              />
              <StatCard
                icon={ShoppingBag}
                label="Total Cost"
                value={formatCurrency(revenueReport.totalCost)}
                tone="white"
              />
              <StatCard
                icon={TrendingUp}
                label="Gross Profit"
                value={formatCurrency(revenueReport.grossProfit)}
                tone="ink"
              />
            </div>
          )}

          {tab === "lowStock" && (
            <Card className="overflow-hidden">
              {lowStockReport.length === 0 ? (
                <EmptyState
                  icon={AlertTriangle}
                  title="All stocked up"
                  description="No products are currently below their minimum stock threshold."
                />
              ) : (
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wider text-ink-400">
                        <th className="px-5 py-3 font-medium">Product</th>
                        <th className="px-5 py-3 font-medium hidden sm:table-cell">Category</th>
                        <th className="px-5 py-3 font-medium">Current Stock</th>
                        <th className="px-5 py-3 font-medium">Min Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">
                      {lowStockReport.map((p) => (
                        <tr key={p._id} className="hover:bg-ink-50/50">
                          <td className="px-5 py-3.5 font-medium text-ink-800">{p.name}</td>
                          <td className="px-5 py-3.5 text-ink-500 hidden sm:table-cell">
                            {p.category || "—"}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-brick-600 font-semibold">{p.quantity}</span>
                          </td>
                          <td className="px-5 py-3.5 text-ink-500">{p.minStock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
