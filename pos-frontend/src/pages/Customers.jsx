import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, Users, Eye, Phone, Mail } from "lucide-react";
import { customerApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { Card, PageLoader, SectionHeading, EmptyState, Badge } from "../components/ui/Misc";
import Button from "../components/ui/Button";
import { Input, Label } from "../components/ui/Field";
import Modal, { ConfirmDialog } from "../components/ui/Modal";
import { formatCurrency, formatDate } from "../utils/format";

const emptyForm = { name: "", phone: "", email: "", address: "" };

export default function Customers() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [viewing, setViewing] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const load = async (q = "") => {
    setLoading(true);
    try {
      const res = await customerApi.list(q ? { search: q } : {});
      setCustomers(res.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (customer) => {
    setEditing(customer);
    setForm({
      name: customer.name,
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
    });
    setModalOpen(true);
  };

  const openView = async (customer) => {
    setViewing({ _id: customer._id });
    setViewLoading(true);
    try {
      const res = await customerApi.get(customer._id);
      setViewing(res.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setViewing(null);
    } finally {
      setViewLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await customerApi.update(editing._id, form);
        toast.success("Customer updated");
      } else {
        await customerApi.create(form);
        toast.success("Customer added");
      }
      setModalOpen(false);
      load(search);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await customerApi.remove(deleteTarget._id);
      toast.success("Customer deleted");
      setDeleteTarget(null);
      load(search);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="People"
        title="Customers"
        description="Manage your customer directory and view their purchase history."
        action={
          <Button icon={Plus} onClick={openCreate}>
            Add Customer
          </Button>
        }
      />

      <Card className="p-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <Input
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers found"
            description="Add your first customer, or let cashiers sell to walk-ins directly."
            action={
              <Button icon={Plus} onClick={openCreate}>
                Add Customer
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wider text-ink-400">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium hidden sm:table-cell">Contact</th>
                  <th className="px-5 py-3 font-medium hidden md:table-cell">Joined</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-ink-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => openView(customer)}
                        className="font-medium text-ink-800 hover:text-brand-600 text-left"
                      >
                        {customer.name}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-ink-500 hidden sm:table-cell">
                      <div className="flex flex-col gap-0.5">
                        {customer.phone && (
                          <span className="flex items-center gap-1.5 text-xs">
                            <Phone size={12} /> {customer.phone}
                          </span>
                        )}
                        {customer.email && (
                          <span className="flex items-center gap-1.5 text-xs">
                            <Mail size={12} /> {customer.email}
                          </span>
                        )}
                        {!customer.phone && !customer.email && "—"}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-ink-400 font-mono text-xs hidden md:table-cell">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openView(customer)}
                          className="p-2 rounded-lg text-ink-500 hover:bg-ink-100"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => openEdit(customer)}
                          className="p-2 rounded-lg text-ink-500 hover:bg-brand-50 hover:text-brand-600"
                        >
                          <Pencil size={15} />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteTarget(customer)}
                            className="p-2 rounded-lg text-ink-500 hover:bg-brick-50 hover:text-brick-500"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add/Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Customer" : "Add Customer"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editing ? "Save Changes" : "Add Customer"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label required>Full Name</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Ali Khan"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="03001234567"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ali@gmail.com"
              />
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Optional"
            />
          </div>
        </form>
      </Modal>

      {/* View / purchase history modal */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Customer Details" size="lg">
        {viewLoading ? (
          <PageLoader />
        ) : viewing ? (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gold-500 flex items-center justify-center font-display font-semibold text-white text-xl shrink-0">
                {viewing.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-ink-900">{viewing.name}</h3>
                <p className="text-sm text-ink-400">
                  {viewing.phone || "No phone"} {viewing.email && `· ${viewing.email}`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 bg-ink-50 border-none">
                <p className="text-xs text-ink-400 font-mono uppercase">Total Orders</p>
                <p className="text-2xl font-display font-semibold text-ink-900 mt-1">
                  {viewing.totalOrders ?? 0}
                </p>
              </Card>
              <Card className="p-4 bg-brand-50 border-none">
                <p className="text-xs text-brand-600 font-mono uppercase">Total Spent</p>
                <p className="text-2xl font-display font-semibold text-brand-700 mt-1">
                  {formatCurrency(viewing.totalSpent ?? 0)}
                </p>
              </Card>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-ink-700 mb-2">Recent Orders</h4>
              {!viewing.recentOrders || viewing.recentOrders.length === 0 ? (
                <p className="text-sm text-ink-400">No orders yet.</p>
              ) : (
                <div className="divide-y divide-ink-100 border border-ink-100 rounded-xl overflow-hidden">
                  {viewing.recentOrders.map((order) => (
                    <Link
                      key={order._id}
                      to={`/sales/${order._id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-ink-50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-mono font-medium text-ink-800">
                          {order.invoiceNumber}
                        </p>
                        <p className="text-xs text-ink-400">{formatDate(order.createdAt)}</p>
                      </div>
                      <p className="text-sm font-semibold text-ink-900">
                        {formatCurrency(order.total)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
      />
    </div>
  );
}
