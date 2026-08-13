import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, Tag } from "lucide-react";
import { categoryApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { Card, PageLoader, SectionHeading, EmptyState } from "../components/ui/Misc";
import Button from "../components/ui/Button";
import { Input, Label, Textarea } from "../components/ui/Field";
import Modal, { ConfirmDialog } from "../components/ui/Modal";
import { formatDate } from "../utils/format";

export default function Categories() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async (q = "") => {
    setLoading(true);
    try {
      const res = await categoryApi.list(q ? { search: q } : {});
      setCategories(res.data.data);
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
    setForm({ name: "", description: "" });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await categoryApi.update(editing._id, form);
        toast.success("Category updated");
      } else {
        await categoryApi.create(form);
        toast.success("Category created");
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
      await categoryApi.remove(deleteTarget._id);
      toast.success("Category deleted");
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
        eyebrow="Catalog"
        title="Categories"
        description="Organize your products into categories."
        action={
          isAdmin && (
            <Button icon={Plus} onClick={openCreate}>
              Add Category
            </Button>
          )
        }
      />

      <Card className="p-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : categories.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="No categories found"
            description="Create your first category to start organizing products."
            action={
              isAdmin && (
                <Button icon={Plus} onClick={openCreate}>
                  Add Category
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wider text-ink-400">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium hidden sm:table-cell">Description</th>
                  <th className="px-5 py-3 font-medium hidden md:table-cell">Created</th>
                  {isAdmin && <th className="px-5 py-3 font-medium text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-ink-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-ink-800">{cat.name}</td>
                    <td className="px-5 py-3.5 text-ink-500 hidden sm:table-cell max-w-xs truncate">
                      {cat.description || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-ink-400 font-mono text-xs hidden md:table-cell">
                      {formatDate(cat.createdAt)}
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(cat)}
                            className="p-2 rounded-lg text-ink-500 hover:bg-brand-50 hover:text-brand-600"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(cat)}
                            className="p-2 rounded-lg text-ink-500 hover:bg-brick-50 hover:text-brick-500"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
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
        title={editing ? "Edit Category" : "Add Category"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editing ? "Save Changes" : "Create Category"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label required>Category Name</Label>
            <Input
              required
              placeholder="e.g. Electronics"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              rows={3}
              placeholder="Optional description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
      />
    </div>
  );
}
