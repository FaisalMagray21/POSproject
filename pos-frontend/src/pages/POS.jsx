import { useEffect, useMemo, useRef, useState } from "react";
import {
  ScanBarcode,
  Plus,
  Minus,
  Trash2,
  User,
  CheckCircle2,
  Printer,
  Package,
  ShoppingCart,
} from "lucide-react";
import { productApi, customerApi, saleApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";
import { Card, EmptyState, Badge, Spinner } from "../components/ui/Misc";
import Button from "../components/ui/Button";
import { Input, Label } from "../components/ui/Field";
import Modal from "../components/ui/Modal";
import { formatCurrency, stockStatusMeta } from "../utils/format";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

export default function POS() {
  const toast = useToast();
  const searchRef = useRef(null);

  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [searching, setSearching] = useState(false);
  const [cart, setCart] = useState([]); // [{ product, quantity }]

  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);

  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paidAmount, setPaidAmount] = useState("");

  const [checkingOut, setCheckingOut] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await productApi.list({ search: query, limit: 20 });
        setProducts(res.data.data);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const res = await customerApi.list(customerSearch ? { search: customerSearch } : {});
        setCustomers(res.data.data);
      } catch {
        /* silent */
      }
    }, 300);
    return () => clearTimeout(t);
  }, [customerSearch]);

  const addToCart = (product) => {
    if (product.quantity <= 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        if (existing.quantity + 1 > product.quantity) {
          toast.error(`Only ${product.quantity} in stock for ${product.name}`);
          return prev;
        }
        return prev.map((item) =>
          item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setQuery("");
    setProducts([]);
    searchRef.current?.focus();
  };

  const changeQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product._id !== productId) return item;
          const next = item.quantity + delta;
          if (next > item.product.quantity) {
            toast.error(`Only ${item.product.quantity} in stock for ${item.product.name}`);
            return item;
          }
          return { ...item, quantity: next };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0),
    [cart]
  );
  const discountNum = Number(discount) || 0;
  const taxNum = Number(tax) || 0;
  const total = Math.max(0, subtotal - discountNum + taxNum);
  const paidNum = Number(paidAmount) || 0;
  const change = paidNum - total;

  const selectedCustomer = customers.find((c) => c._id === customerId);

  const resetSale = () => {
    setCart([]);
    setCustomerId("");
    setDiscount(0);
    setTax(0);
    setPaymentMethod("cash");
    setPaidAmount("");
    setCompletedSale(null);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (paidNum < total) {
      toast.error("Paid amount must be at least the total");
      return;
    }
    setCheckingOut(true);
    try {
      const res = await saleApi.create({
        customer: customerId || null,
        items: cart.map((item) => ({ product: item.product._id, quantity: item.quantity })),
        discount: discountNum,
        tax: taxNum,
        paymentMethod,
        paidAmount: paidNum,
      });
      setCompletedSale(res.data.data);
      toast.success("Sale completed!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-4 sm:gap-6 lg:h-[calc(100vh-8rem)]">
      <div className="lg:col-span-3 flex flex-col min-h-0 gap-4">
        <Card className="p-3 shrink-0">
          <div className="relative">
            <ScanBarcode
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500"
            />
            <Input
              ref={searchRef}
              autoFocus
              placeholder="Search product name, SKU or scan barcode..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 text-base py-3"
            />
            {searching && (
              <Spinner size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2" />
            )}
          </div>
        </Card>

        <Card className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-3">
          {query.trim() === "" ? (
            <EmptyState
              icon={ScanBarcode}
              title="Search or scan to add items"
              description="Start typing a product name, SKU, or scan a barcode to add it to the cart."
            />
          ) : products.length === 0 && !searching ? (
            <EmptyState icon={Package} title="No products found" description={`No matches for "${query}"`} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.map((product) => {
                const meta = stockStatusMeta[product.stockStatus];
                const outOfStock = product.quantity <= 0;
                return (
                  <button
                    key={product._id}
                    onClick={() => addToCart(product)}
                    disabled={outOfStock}
                    className="text-left border border-ink-100 rounded-xl overflow-hidden hover:border-brand-300 hover:shadow-card transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="aspect-[4/3] bg-ink-50 relative">
                      {product.image ? (
                        <img
                          src={`${API_BASE}${product.image}`}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={22} className="text-ink-200" />
                        </div>
                      )}
                      <Badge variant={meta.variant} className="absolute top-1.5 left-1.5 bg-white/95 text-[10px]">
                        {product.quantity} left
                      </Badge>
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium text-ink-900 line-clamp-1">{product.name}</p>
                      <p className="text-sm font-display font-semibold text-brand-600 mt-0.5">
                        {formatCurrency(product.sellingPrice)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="lg:col-span-2 flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-4 border-b border-ink-100 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-brand-500" />
              <h3 className="font-display font-semibold text-ink-900">Cart</h3>
              {cart.length > 0 && <Badge variant="brand">{cart.length}</Badge>}
            </div>
            <button
              onClick={() => setShowCustomerPicker(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-ink-600 hover:text-brand-600 border border-ink-100 hover:border-brand-200 rounded-lg px-2.5 py-1.5 transition-colors max-w-[160px]"
            >
              <User size={13} className="shrink-0" />
              <span className="truncate">{selectedCustomer?.name || "Walk-in"}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-2 min-h-[120px]">
            {cart.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="Cart is empty"
                description="Search for products on the left to add them here."
              />
            ) : (
              <div className="divide-y divide-ink-100">
                {cart.map((item) => (
                  <div key={item.product._id} className="py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-800 truncate">{item.product.name}</p>
                      <p className="text-xs text-ink-400 font-mono">
                        {formatCurrency(item.product.sellingPrice)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => changeQty(item.product._id, -1)}
                        className="w-6 h-6 rounded-md border border-ink-100 flex items-center justify-center text-ink-500 hover:bg-ink-50"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm font-medium text-ink-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => changeQty(item.product._id, 1)}
                        className="w-6 h-6 rounded-md border border-ink-100 flex items-center justify-center text-ink-500 hover:bg-ink-50"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-ink-900 w-16 text-right shrink-0">
                      {formatCurrency(item.product.sellingPrice * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="text-ink-300 hover:text-brick-500 shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ticket-edge bg-white border-t border-ink-100 shrink-0">
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Discount (Rs.)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Tax (Rs.)</Label>
                  <Input type="number" min="0" value={tax} onChange={(e) => setTax(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5 text-sm font-mono pt-1">
                <div className="flex justify-between text-ink-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-ink-500">
                  <span>Discount</span>
                  <span>- {formatCurrency(discountNum)}</span>
                </div>
                <div className="flex justify-between text-ink-500">
                  <span>Tax</span>
                  <span>+ {formatCurrency(taxNum)}</span>
                </div>
                <div className="flex justify-between text-base font-display font-semibold text-ink-900 pt-1.5 border-t border-dashed border-ink-200">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <div>
                <Label>Payment Method</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "cash", label: "Cash" },
                    { value: "card", label: "Card" },
                    { value: "bank_transfer", label: "Bank" },
                  ].map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setPaymentMethod(m.value)}
                      className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                        paymentMethod === m.value
                          ? "bg-brand-500 border-brand-500 text-white"
                          : "border-ink-100 text-ink-600 hover:bg-ink-50"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label required>Paid Amount</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="font-mono font-semibold"
                  />
                </div>
                <div>
                  <Label>Change</Label>
                  <div
                    className={`rounded-lg border px-3.5 py-2.5 text-sm font-mono font-semibold ${
                      change < 0
                        ? "border-brick-200 bg-brick-50 text-brick-600"
                        : "border-brand-100 bg-brand-50 text-brand-700"
                    }`}
                  >
                    {formatCurrency(Math.max(0, change))}
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                loading={checkingOut}
                disabled={cart.length === 0}
              >
                Confirm Payment
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        open={showCustomerPicker}
        onClose={() => setShowCustomerPicker(false)}
        title="Select Customer"
        size="sm"
      >
        <div className="space-y-3">
          <Input
            placeholder="Search customers..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            autoFocus
          />
          <button
            onClick={() => {
              setCustomerId("");
              setShowCustomerPicker(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-ink-50 text-left"
          >
            <div className="w-8 h-8 rounded-full bg-ink-100 flex items-center justify-center shrink-0">
              <User size={14} className="text-ink-500" />
            </div>
            <span className="text-sm font-medium text-ink-800">Walk-in Customer</span>
          </button>
          <div className="max-h-64 overflow-y-auto scrollbar-thin space-y-0.5">
            {customers.map((c) => (
              <button
                key={c._id}
                onClick={() => {
                  setCustomerId(c._id);
                  setShowCustomerPicker(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-ink-50 text-left"
              >
                <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center shrink-0 text-white text-xs font-semibold">
                  {c.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-800 truncate">{c.name}</p>
                  {c.phone && <p className="text-xs text-ink-400">{c.phone}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        open={!!completedSale}
        onClose={resetSale}
        title="Payment Successful"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              icon={Printer}
              onClick={() => window.open(saleApi.invoiceUrl(completedSale._id), "_blank")}
            >
              Print Invoice
            </Button>
            <Button onClick={resetSale}>New Sale</Button>
          </>
        }
      >
        {completedSale && (
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={28} className="text-brand-500" />
            </div>
            <p className="font-mono text-sm text-ink-400">{completedSale.invoiceNumber}</p>
            <p className="text-3xl font-display font-semibold text-ink-900 mt-1">
              {formatCurrency(completedSale.total)}
            </p>
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <div>
                <p className="text-ink-400 text-xs">Paid</p>
                <p className="font-mono font-medium text-ink-800">
                  {formatCurrency(completedSale.paidAmount)}
                </p>
              </div>
              <div>
                <p className="text-ink-400 text-xs">Change</p>
                <p className="font-mono font-medium text-brand-600">
                  {formatCurrency(completedSale.changeAmount)}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
