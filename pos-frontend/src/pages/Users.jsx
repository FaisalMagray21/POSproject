import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, UserCog, ShieldCheck, ShieldOff } from "lucide-react";
import { userApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { Card, PageLoader, SectionHeading, EmptyState, Badge } from "../components/ui/Misc";
import Button from "../components/ui/Button";
import { Input, Label, Select } from "../components/ui/Field";
import Modal, { ConfirmDialog } from "../components/ui/Modal";
import { formatDate } from "../utils/format";

const emptyForm = { name: "", email: "", password: "", role: "cashier" };

export default function Users() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await userApi.list();
      setUsers(res.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const payload = { name: form.name, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        await userApi.update(editing._id, payload);
        toast.success("User updated");
      } else {
        await userApi.create(form);
        toast.success("User created");
      }
      setModalOpen(false);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u) => {
    try {
      await userApi.update(u._id, { isActive: !u.isActive });
      toast.success(u.isActive ? "User deactivated" : "User activated");
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userApi.remove(deleteTarget._id);
      toast.success("User deleted");
      setDeleteTarget(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Team"
        title="Users"
        description="Manage admin and cashier accounts."
        action={
          <Button icon={Plus} onClick={openCreate}>
            Add User
          </Button>
        }
      />

      <Card className="overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : users.length === 0 ? (
          <EmptyState icon={UserCog} title="No users found" />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wider text-ink-400">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium hidden sm:table-cell">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium hidden md:table-cell">Joined</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-ink-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-ink-800">
                      {u.name}
                      {u._id === currentUser?._id && (
                        <span className="text-xs text-ink-400 ml-1.5">(you)</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-ink-500 hidden sm:table-cell">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={u.role === "admin" ? "gold" : "neutral"} className="capitalize">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleActive(u)}
                        disabled={u._id === currentUser?._id}
                        className="disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Badge variant={u.isActive ? "brand" : "brick"}>
                          {u.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-ink-400 font-mono text-xs hidden md:table-cell">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-2 rounded-lg text-ink-500 hover:bg-brand-50 hover:text-brand-600"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          disabled={u._id === currentUser?._id}
                          className="p-2 rounded-lg text-ink-500 hover:bg-brick-50 hover:text-brick-500 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit User" : "Add User"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editing ? "Save Changes" : "Create User"}
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
              placeholder="e.g. Faisal Mehmood"
            />
          </div>
          <div>
            <Label required>Email</Label>
            <Input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="user@pos.com"
            />
          </div>
          <div>
            <Label required={!editing}>{editing ? "New Password (optional)" : "Password"}</Label>
            <Input
              required={!editing}
              type="password"
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={editing ? "Leave blank to keep current password" : "Minimum 6 characters"}
            />
          </div>
          <div>
            <Label required>Role</Label>
            <Select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="cashier">Cashier</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
      />
    </div>
  );
}
