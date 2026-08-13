const asyncHandler = require("express-async-handler");
const Sale = require("../models/Sale");
const Product = require("../models/Product");

// Helper to resolve a date range from query params (today / week / month / custom)
const resolveDateRange = (period, startDate, endDate) => {
  const now = new Date();
  let start, end;

  if (period === "today") {
    start = new Date(now.setHours(0, 0, 0, 0));
    end = new Date();
    end.setHours(23, 59, 59, 999);
  } else if (period === "week") {
    start = new Date();
    start.setDate(start.getDate() - 7);
    end = new Date();
  } else if (period === "month") {
    start = new Date();
    start.setMonth(start.getMonth() - 1);
    end = new Date();
  } else if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  } else {
    // default: last 30 days
    start = new Date();
    start.setDate(start.getDate() - 30);
    end = new Date();
  }

  return { start, end };
};

// @desc    Sales report (grouped by date)
// @route   GET /api/reports/sales
// @access  Private/Admin
const getSalesReport = asyncHandler(async (req, res) => {
  const { period, startDate, endDate } = req.query;
  const { start, end } = resolveDateRange(period, startDate, endDate);

  const report = await Sale.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end }, status: "completed" } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        orders: { $sum: 1 },
        sales: { $sum: "$total" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totals = report.reduce(
    (acc, r) => {
      acc.totalOrders += r.orders;
      acc.totalSales += r.sales;
      return acc;
    },
    { totalOrders: 0, totalSales: 0 }
  );

  res.json({ success: true, range: { start, end }, totals, data: report });
});

// @desc    Product performance report (best sellers)
// @route   GET /api/reports/products
// @access  Private/Admin
const getProductReport = asyncHandler(async (req, res) => {
  const { period, startDate, endDate } = req.query;
  const { start, end } = resolveDateRange(period, startDate, endDate);

  const report = await Sale.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end }, status: "completed" } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        name: { $first: "$items.name" },
        sku: { $first: "$items.sku" },
        totalSold: { $sum: "$items.quantity" },
        totalRevenue: { $sum: "$items.total" },
      },
    },
    { $sort: { totalSold: -1 } },
  ]);

  res.json({ success: true, range: { start, end }, count: report.length, data: report });
});

// @desc    Revenue report (gross profit = revenue - cost)
// @route   GET /api/reports/revenue
// @access  Private/Admin
const getRevenueReport = asyncHandler(async (req, res) => {
  const { period, startDate, endDate } = req.query;
  const { start, end } = resolveDateRange(period, startDate, endDate);

  const sales = await Sale.find({
    createdAt: { $gte: start, $lte: end },
    status: "completed",
  });

  let totalRevenue = 0;
  let totalCost = 0;

  // Build a product cost lookup
  const productIds = [
    ...new Set(sales.flatMap((s) => s.items.map((i) => String(i.product)))),
  ];
  const products = await Product.find({ _id: { $in: productIds } }).select(
    "purchasePrice"
  );
  const costMap = {};
  products.forEach((p) => (costMap[String(p._id)] = p.purchasePrice));

  sales.forEach((sale) => {
    totalRevenue += sale.total;
    sale.items.forEach((item) => {
      const cost = costMap[String(item.product)] || 0;
      totalCost += cost * item.quantity;
    });
  });

  const grossProfit = totalRevenue - totalCost;

  res.json({
    success: true,
    range: { start, end },
    data: {
      totalSales: totalRevenue,
      totalCost,
      grossProfit,
    },
  });
});

// @desc    Low stock report
// @route   GET /api/reports/low-stock
// @access  Private/Admin
const getLowStockReport = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true }).populate("category", "name");
  const lowStock = products
    .filter((p) => p.quantity <= p.minStock)
    .map((p) => ({
      _id: p._id,
      name: p.name,
      sku: p.sku,
      category: p.category?.name,
      quantity: p.quantity,
      minStock: p.minStock,
    }));

  res.json({ success: true, count: lowStock.length, data: lowStock });
});

module.exports = {
  getSalesReport,
  getProductReport,
  getRevenueReport,
  getLowStockReport,
};
