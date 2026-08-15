import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Printer, User, CreditCard, Receipt } from "lucide-react";
import { saleApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";
import { Card, PageLoader, Badge } from "../components/ui/Misc";
import Button from "../components/ui/Button";
import { formatCurrency, formatDateTime } from "../utils/format";

const paymentLabels = { cash: "Cash", card: "Card", bank_transfer: "Bank Transfer" };

export default function SaleDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await saleApi.get(id);
        setSale(res.data.data);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <PageLoader />;
  if (!sale) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          to="/sales"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800"
        >
          <ArrowLeft size={16} /> Back to Sales
        </Link>
        <Button
          variant="secondary"
          icon={Printer}
          onClick={() => window.open(saleApi.invoiceUrl(sale._id), "_blank")}
        >
          Print / Download PDF
        </Button>
      </div>

      <Card className="ticket-edge overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-dashed border-ink-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Receipt size={18} className="text-brand-500" />
                <h1 className="font-display font-semibold text-xl text-ink-900">Invoice</h1>
              </div>
              <p className="font-mono text-sm text-ink-500">{sale.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <Badge variant="brand" className="mb-2">
                {sale.status}
              </Badge>
              <p className="text-xs text-ink-400">{formatDateTime(sale.createdAt)}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 py-6 border-b border-dashed border-ink-200">
            <div>
              <p className="text-xs font-mono uppercase text-ink-400 mb-1.5 flex items-center gap-1.5">
                <User size={12} /> Customer
              </p>
              <p className="text-sm font-medium text-ink-800">
                {sale.customer?.name || "Walk-in Customer"}
              </p>
              {sale.customer?.phone && <p className="text-xs text-ink-400">{sale.customer.phone}</p>}
            </div>
            <div>
              <p className="text-xs font-mono uppercase text-ink-400 mb-1.5">Cashier</p>
              <p className="text-sm font-medium text-ink-800">{sale.cashier?.name || "—"}</p>
            </div>
          </div>

          <div className="py-6 border-b border-dashed border-ink-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-ink-400">
                  <th className="pb-2 font-medium">Item</th>
                  <th className="pb-2 font-medium text-center">Qty</th>
                  <th className="pb-2 font-medium text-right">Price</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {sale.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2.5">
                      <p className="font-medium text-ink-800">{item.name}</p>
                      <p className="text-xs text-ink-400 font-mono">{item.sku}</p>
                    </td>
                    <td className="py-2.5 text-center text-ink-600">{item.quantity}</td>
                    <td className="py-2.5 text-right font-mono text-ink-600">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="py-2.5 text-right font-mono font-medium text-ink-900">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="py-6 flex flex-col sm:flex-row justify-between gap-6">
            <div>
              <p className="text-xs font-mono uppercase text-ink-400 mb-1.5 flex items-center gap-1.5">
                <CreditCard size={12} /> Payment
              </p>
              <p className="text-sm font-medium text-ink-800">
                {paymentLabels[sale.paymentMethod]}
              </p>
              <p className="text-xs text-ink-400 mt-1">
                Paid {formatCurrency(sale.paidAmount)} &middot; Change {formatCurrency(sale.changeAmount)}
              </p>
            </div>
            <div className="space-y-1.5 text-sm font-mono min-w-[200px]">
              <div className="flex justify-between text-ink-500">
                <span>Subtotal</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-500">
                <span>Discount</span>
                <span>- {formatCurrency(sale.discount)}</span>
              </div>
              <div className="flex justify-between text-ink-500">
                <span>Tax</span>
                <span>+ {formatCurrency(sale.tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-display font-semibold text-ink-900 pt-2 border-t border-dashed border-ink-200">
                <span>Total</span>
                <span>{formatCurrency(sale.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
