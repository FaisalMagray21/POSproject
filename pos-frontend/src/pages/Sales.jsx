import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Receipt, Eye, Printer, Calendar } from "lucide-react";
import { saleApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";
import { Card, PageLoader, SectionHeading, EmptyState, Badge } from "../components/ui/Misc";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import Pagination from "../components/ui/Pagination";
import { formatCurrency, formatDateTime } from "../utils/format";

const paymentLabels = { cash: "Cash", card: "Card", bank_transfer: "Bank Transfer" };
const paymentVariant = { cash: "brand", card: "gold", bank_transfer: "neutral" };

export default function Sales() {
  const toast = useToast();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const res = await saleApi.list({
        search: search || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: 15,
      });
      setSales(res.data.data);
      setPages(res.data.pages);
      setTotal(res.data.total);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, startDate, endDate, page]);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Transactions"
        title="Sales & Invoices"
        description={`${total} sale${total !== 1 ? "s" : ""} recorded`}
      />

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <Input
              placeholder="Search invoice number..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-ink-400 shrink-0 hidden sm:block" />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setPage(1);
                setStartDate(e.target.value);
              }}
            />
            <span className="text-ink-300 text-sm">to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setPage(1);
                setEndDate(e.target.value);
              }}
            />
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : sales.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No sales found"
            description="Sales will appear here once checkouts are completed at the POS."
          />
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wider text-ink-400">
                    <th className="px-5 py-3 font-medium">Invoice</th>
                    <th className="px-5 py-3 font-medium hidden sm:table-cell">Customer</th>
                    <th className="px-5 py-3 font-medium hidden md:table-cell">Cashier</th>
                    <th className="px-5 py-3 font-medium">Total</th>
                    <th className="px-5 py-3 font-medium hidden sm:table-cell">Payment</th>
                    <th className="px-5 py-3 font-medium hidden lg:table-cell">Date</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {sales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-ink-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link
                          to={`/sales/${sale._id}`}
                          className="font-mono font-medium text-ink-800 hover:text-brand-600"
                        >
                          {sale.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-ink-600 hidden sm:table-cell">
                        {sale.customer?.name || "Walk-in"}
                      </td>
                      <td className="px-5 py-3.5 text-ink-500 hidden md:table-cell">
                        {sale.cashier?.name || "—"}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-ink-900">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <Badge variant={paymentVariant[sale.paymentMethod]}>
                          {paymentLabels[sale.paymentMethod]}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-ink-400 font-mono text-xs hidden lg:table-cell">
                        {formatDateTime(sale.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/sales/${sale._id}`}
                            className="p-2 rounded-lg text-ink-500 hover:bg-ink-100 inline-flex"
                          >
                            <Eye size={15} />
                          </Link>
                          <button
                            onClick={() => window.open(saleApi.invoiceUrl(sale._id), "_blank")}
                            className="p-2 rounded-lg text-ink-500 hover:bg-brand-50 hover:text-brand-600"
                          >
                            <Printer size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-3">
              <Pagination page={page} pages={pages} total={total} onChange={setPage} />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
