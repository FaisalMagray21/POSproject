const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const StockHistory = require("../models/StockHistory");

// @desc    Get all products (search, category filter, stock status filter, pagination)
// @route   GET /api/products
// @access  Private
const getProducts = asyncHandler(async (req, res) => {
  const { search, category, stockStatus, page = 1, limit = 20 } = req.query;

  const filter = { isActive: true };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
      { barcode: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    filter.category = category;
  }

  let query = Product.find(filter).populate("category", "name").sort({ createdAt: -1 });

  // Stock status filter applied after fetch since it's a virtual;
  // for large datasets this should be done via aggregation, kept simple for MVP
  const skip = (Number(page) - 1) * Number(limit);

  let products = await query;

  if (stockStatus) {
    products = products.filter((p) => p.stockStatus === stockStatus);
  }

  const total = products.length;
  const paginated = products.slice(skip, skip + Number(limit));

  res.json({
    success: true,
    count: paginated.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: paginated,
  });
});

// @desc    Get single product (by id or barcode)
// @route   GET /api/products/:id
// @access  Private
const getProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id).populate("category", "name");

  if (!product) {
    // fallback: try barcode lookup for POS scanning
    product = await Product.findOne({ barcode: req.params.id }).populate("category", "name");
  }

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, data: product });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    sku,
    barcode,
    category,
    purchasePrice,
    sellingPrice,
    quantity,
    minStock,
  } = req.body;

  if (!name || !sku || !category || purchasePrice == null || sellingPrice == null) {
    res.status(400);
    throw new Error("Please provide name, sku, category, purchasePrice and sellingPrice");
  }

  const image = req.file ? `/uploads/products/${req.file.filename}` : "";

  const product = await Product.create({
    name,
    sku,
    barcode: barcode || undefined,
    category,
    purchasePrice,
    sellingPrice,
    quantity: quantity || 0,
    minStock: minStock ?? 5,
    image,
  });

  // Log opening stock in history
  if (product.quantity > 0) {
    await StockHistory.create({
      product: product._id,
      type: "adjustment",
      quantityChange: product.quantity,
      previousStock: 0,
      newStock: product.quantity,
      reference: "Opening stock",
      createdBy: req.user._id,
    });
  }

  res.status(201).json({ success: true, data: product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const fields = [
    "name",
    "sku",
    "barcode",
    "category",
    "purchasePrice",
    "sellingPrice",
    "minStock",
    "isActive",
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  if (req.file) {
    product.image = `/uploads/products/${req.file.filename}`;
  }

  const updated = await product.save();
  res.json({ success: true, data: updated });
});

// @desc    Adjust stock manually (inventory adjustment)
// @route   PUT /api/products/:id/adjust-stock
// @access  Private/Admin
const adjustStock = asyncHandler(async (req, res) => {
  const { quantityChange, reference } = req.body;

  if (quantityChange == null || isNaN(quantityChange)) {
    res.status(400);
    throw new Error("Please provide a valid quantityChange (positive or negative number)");
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const previousStock = product.quantity;
  const newStock = previousStock + Number(quantityChange);

  if (newStock < 0) {
    res.status(400);
    throw new Error("Stock cannot go below zero");
  }

  product.quantity = newStock;
  await product.save();

  await StockHistory.create({
    product: product._id,
    type: "adjustment",
    quantityChange: Number(quantityChange),
    previousStock,
    newStock,
    reference: reference || "Manual adjustment",
    createdBy: req.user._id,
  });

  res.json({ success: true, data: product });
});

// @desc    Get stock history for a product
// @route   GET /api/products/:id/stock-history
// @access  Private
const getStockHistory = asyncHandler(async (req, res) => {
  const history = await StockHistory.find({ product: req.params.id })
    .populate("createdBy", "name")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: history.length, data: history });
});

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.isActive = false;
  await product.save();

  res.json({ success: true, message: "Product deleted successfully" });
});

// @desc    Get low stock products
// @route   GET /api/products/alerts/low-stock
// @access  Private
const getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true }).populate("category", "name");
  const lowStock = products.filter((p) => p.quantity <= p.minStock);

  res.json({ success: true, count: lowStock.length, data: lowStock });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  adjustStock,
  getStockHistory,
  deleteProduct,
  getLowStockProducts,
};
