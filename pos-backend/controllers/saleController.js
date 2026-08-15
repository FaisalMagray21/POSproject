const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const StockHistory = require("../models/StockHistory");
const generateInvoiceNumber = require("../utils/generateInvoiceNumber");

// @desc    Create a new sale (checkout)
// @route   POST /api/sales
// @access  Private (Cashier/Admin)
const createSale = asyncHandler(async (req, res) => {
  const {
    customer, // customer id, optional
    items, // [{ product, quantity }]
    discount = 0,
    tax = 0,
    paymentMethod,
    paidAmount,
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("Sale must include at least one item");
  }

  if (!paymentMethod) {
    res.status(400);
    throw new Error("Payment method is required");
  }

  // Try to use a transaction (requires MongoDB replica set). Falls back gracefully
  // to sequential operations if transactions aren't supported (e.g. standalone Mongo).
  const session = await mongoose.startSession();
  let useTransaction = true;
  try {
    session.startTransaction();
  } catch (e) {
    useTransaction = false;
  }

  try {
    const saleItems = [];
    let subtotal = 0;

    for (const item of items) {
      const query = Product.findById(item.product);
      const product = useTransaction ? await query.session(session) : await query;

      if (!product || !product.isActive) {
        throw Object.assign(new Error(`Product not found: ${item.product}`), { status: 404 });
      }

      if (product.quantity < item.quantity) {
        throw Object.assign(
          new Error(`Insufficient stock for ${product.name}. Available: ${product.quantity}`),
          { status: 400 }
        );
      }

      const previousStock = product.quantity;
      product.quantity -= item.quantity;
      await product.save(useTransaction ? { session } : undefined);

      await StockHistory.create(
        [
          {
            product: product._id,
            type: "sale",
            quantityChange: -item.quantity,
            previousStock,
            newStock: product.quantity,
            createdBy: req.user._id,
          },
        ],
        useTransaction ? { session } : undefined
      );

      const lineTotal = product.sellingPrice * item.quantity;
      subtotal += lineTotal;

      saleItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        price: product.sellingPrice,
        total: lineTotal,
      });
    }

    const total = subtotal - Number(discount) + Number(tax);

    if (total < 0) {
      throw Object.assign(new Error("Discount cannot exceed subtotal + tax"), { status: 400 });
    }

    if (paidAmount == null || Number(paidAmount) < total) {
      throw Object.assign(new Error("Paid amount must be greater than or equal to total"), {
        status: 400,
      });
    }

    const changeAmount = Number(paidAmount) - total;
    const invoiceNumber = await generateInvoiceNumber();

    const saleDocs = await Sale.create(
      [
        {
          invoiceNumber,
          customer: customer || null,
          items: saleItems,
          subtotal,
          discount,
          tax,
          total,
          paymentMethod,
          paidAmount,
          changeAmount,
          cashier: req.user._id,
        },
      ],
      useTransaction ? { session } : undefined
    );

    if (useTransaction) {
      await session.commitTransaction();
      session.endSession();
    }

    const populatedSale = await Sale.findById(saleDocs[0]._id)
      .populate("customer", "name phone")
      .populate("cashier", "name");

    res.status(201).json({ success: true, data: populatedSale });
  } catch (error) {
    if (useTransaction) {
      await session.abortTransaction();
      session.endSession();
    }
    res.status(error.status || 500);
    throw new Error(error.message || "Failed to process sale");
  }
});

// @desc    Get all sales (search, date filter, pagination)
// @route   GET /api/sales
// @access  Private
const getSales = asyncHandler(async (req, res) => {
  const { search, startDate, endDate, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (search) {
    filter.invoiceNumber = { $regex: search, $options: "i" };
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  // Cashiers only see their own sales; admins see all
  if (req.user.role === "cashier") {
    filter.cashier = req.user._id;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [sales, total] = await Promise.all([
    Sale.find(filter)
      .populate("customer", "name phone")
      .populate("cashier", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Sale.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: sales.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: sales,
  });
});

// @desc    Get single sale / invoice
// @route   GET /api/sales/:id
// @access  Private
const getSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id)
    .populate("customer", "name phone email address")
    .populate("cashier", "name")
    .populate("items.product", "name sku");

  if (!sale) {
    res.status(404);
    throw new Error("Sale not found");
  }

  res.json({ success: true, data: sale });
});

module.exports = { createSale, getSales, getSale };
