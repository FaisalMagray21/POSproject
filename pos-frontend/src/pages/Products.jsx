import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, Package, ImagePlus, SlidersHorizontal, PackagePlus } from "lucide-react";
import { productApi, categoryApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { Card, PageLoader, SectionHeading, EmptyState, Badge } from "../components/ui/Misc";
import Button from "../components/ui/Button";
import { Input, Label, Select } from "../components/ui/Field";
import Modal, { ConfirmDialog } from "../components/ui/Modal";
import Pagination from "../components/ui/Pagination";
import { formatCurrency, stockStatusMeta } from "../utils/format";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

const emptyForm = {
  name: "",
  sku: "",
  barcode: "",
  category: "",
  purchasePrice: "",
  sellingPrice: "",
  quantity: "",
  minStock: "5",
};

export default function Products() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [adjustTarget, setAdjustTarget] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  const loadCategories = async () => {
    try {
      const res = await categoryApi.list();
      setCategories(res.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.list({
        search: search || undefined,
        category: categoryFilter || undefined,
        stockStatus: stockFilter || undefined,
        page,
        limit: 12,
      });
      setProducts(res.data.data);
      setPages(res.data.pages);
      setTotal(res.data.total);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadProducts(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryFilter, stockFilter, page]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode || "",
      category: product.category?._id || "",
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      quantity: product.quantity,
      minStock: product.minStock,
    });
    setImageFile(null);
    setImagePreview(product.image ? `${API_BASE}${product.image}` : null);
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => fd.append(key, value));
      if (imageFile) fd.append("image", imageFile);

      if (editing) {
        await productApi.update(editing._id, fd);
        toast.success("Product updated");
      } else {
        await productApi.create(fd);
        toast.success("Product created");
      }
      setModalOpen(false);
      loadProducts();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productApi.remove(deleteTarget._id);
      toast.success("Product deleted");
      setDeleteTarget(null);
      loadProducts();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const openAdjust = (product) => {
    setAdjustTarget(product);
    setAdjustAmount("");
    setAdjustReason("");
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!adjustAmount || Number(adjustAmount) === 0) {
      toast.error("Enter a non-zero quantity change");
      return;
    }
    setAdjusting(true);
    try {
      await productApi.adjustStock(adjustTarget._id, {
        quantityChange: Number(adjustAmount),
        reference: adjustReason || undefined,
      });
      toast.success("Stock adjusted");
      setAdjustTarget(null);
      loadProducts();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Catalog"
        title="Products"
        description={`${total} product${total !== 1 ? "s" : ""} in your inventory`}
        action={
          isAdmin && (
            <Button icon={Plus} onClick={openCreate}>
              Add Product
            </Button>
          )
        }
      />

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <Input
              placeholder="Search by name, SKU, or barcode..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="pl-9"
            />
          </div>
          <Button
            variant="secondary"
            icon={SlidersHorizontal}
            onClick={() => setShowFilters((s) => !s)}
            className="sm:w-auto"
          >
            Filters
          </Button>
        </div>
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-ink-100">
            <div>
              <Label>Category</Label>
              <Select
                value={categoryFilter}
                onChange={(e) => {
                  setPage(1);
                  setCategoryFilter(e.target.value);
                }}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Stock Status</Label>
              <Select
                value={stockFilter}
                onChange={(e) => {
                  setPage(1);
                  setStockFilter(e.target.value);
                }}
              >
                <option value="">All</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </Select>
            </div>
          </div>
        )}
      </Card>

      {loading ? (
        <PageLoader />
      ) : products.length === 0 ? (
        <Card>
          <EmptyState
            icon={Package}
            title="No products found"
            description="Try adjusting your filters, or add a new product."
            action={
              isAdmin && (
                <Button icon={Plus} onClick={openCreate}>
                  Add Product
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => {
              const meta = stockStatusMeta[product.stockStatus];
              return (
                <Card key={product._id} className="overflow-hidden group flex flex-col">
                  <div className="aspect-square bg-ink-50 relative overflow-hidden">
                    {product.image ? (
                      <img
                        src={`${API_BASE}${product.image}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={28} className="text-ink-200" />
                      </div>
                    )}
                    <Badge variant={meta.variant} className="absolute top-2 left-2 bg-white/95">
                      {meta.label}
                    </Badge>
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <p className="text-sm font-medium text-ink-900 line-clamp-1">{product.name}</p>
                    <p className="text-xs font-mono text-ink-400 mt-0.5">{product.sku}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="font-display font-semibold text-ink-900">
                        {formatCurrency(product.sellingPrice)}
                      </p>
                      <p className="text-xs text-ink-400">Qty: {product.quantity}</p>
                    </div>
                    {isAdmin && (
                      <div className="mt-3 pt-3 border-t border-ink-100 flex items-center gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Pencil}
                          onClick={() => openEdit(product)}
                          className="flex-1"
                        >
                          Edit
                        </Button>
                        <button
                          onClick={() => openAdjust(product)}
                          title="Adjust stock"
                          className="p-2 rounded-lg text-ink-500 hover:bg-gold-50 hover:text-gold-700 border border-ink-100"
                        >
                          <PackagePlus size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="p-2 rounded-lg text-ink-500 hover:bg-brick-50 hover:text-brick-500 border border-ink-100"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
          <Card className="px-3">
            <Pagination page={page} pages={pages} total={total} onChange={setPage} />
          </Card>
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Product" : "Add Product"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editing ? "Save Changes" : "Create Product"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="w-20 h-20 rounded-xl bg-ink-50 border-2 border-dashed border-ink-100 flex items-center justify-center cursor-pointer overflow-hidden shrink-0 hover:border-brand-300 transition-colors">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImagePlus size={20} className="text-ink-400" />
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
            <p className="text-xs text-ink-400">
              Upload a product photo (JPEG, PNG or WEBP, max 5MB). Optional.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label required>Product Name</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. USB Cable"
              />
            </div>
            <div>
              <Label required>Category</Label>
              <Select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label required>SKU</Label>
              <Input
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="e.g. USB-001"
              />
            </div>
            <div>
              <Label>Barcode</Label>
              <Input
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                placeholder="e.g. 123456789"
              />
            </div>
            <div>
              <Label required>Purchase Price</Label>
              <Input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.purchasePrice}
                onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
              />
            </div>
            <div>
              <Label required>Selling Price</Label>
              <Input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.sellingPrice}
                onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
              />
            </div>
            <div>
              <Label required>{editing ? "Current Stock" : "Opening Stock"}</Label>
              <Input
                required
                type="number"
                min="0"
                disabled={!!editing}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
              {editing && (
                <p className="text-xs text-ink-400 mt-1">Use stock adjustment to change quantity.</p>
              )}
            </div>
            <div>
              <Label required>Minimum Stock Alert</Label>
              <Input
                required
                type="number"
                min="0"
                value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
      />

      <Modal
        open={!!adjustTarget}
        onClose={() => setAdjustTarget(null)}
        title="Adjust Stock"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdjustTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleAdjustStock} loading={adjusting}>
              Apply Adjustment
            </Button>
          </>
        }
      >
        <form onSubmit={handleAdjustStock} className="space-y-4">
          <div className="flex items-center justify-between bg-ink-50 rounded-xl px-4 py-3">
            <span className="text-sm text-ink-600">{adjustTarget?.name}</span>
            <span className="text-sm font-mono font-semibold text-ink-900">
              Current: {adjustTarget?.quantity}
            </span>
          </div>
          <div>
            <Label required>Quantity Change</Label>
            <Input
              required
              type="number"
              placeholder="e.g. 20 to add, -5 to remove"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
            />
            <p className="text-xs text-ink-400 mt-1">
              Use a positive number to add stock (purchase/return), negative to remove (damage/loss).
            </p>
          </div>
          <div>
            <Label>Reason / Reference</Label>
            <Input
              placeholder="e.g. New shipment, damaged goods"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
            />
          </div>
          {adjustAmount && adjustTarget && (
            <div className="text-sm text-ink-500">
              New stock will be:{" "}
              <span className="font-semibold text-brand-600">
                {Math.max(0, adjustTarget.quantity + Number(adjustAmount))}
              </span>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
