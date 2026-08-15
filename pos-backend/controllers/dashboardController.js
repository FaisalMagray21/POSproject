const asyncHandler = require("express-async-handler");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [todaySales, allProducts, totalCustomers, totalRevenueAgg] = await Promise.all([
    Sale.find({ createdAt: { $gte: startOfToday, $lte: endOfToday }, status: "completed" }),
    Product.find({ isActive: true }),
    Customer.countDocuments(),
    Sale.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
  ]);

  const todaysSalesTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
  const todaysOrders = todaySales.length;
  const totalProducts = allProducts.length;
  const lowStockCount = allProducts.filter((p) => p.quantity <= p.minStock).length;
  const totalRevenue = totalRevenueAgg[0]?.total || 0;

  res.json({
    success: true,
    data: {
      todaysSales: todaysSalesTotal,
      todaysOrders,
      totalProducts,
      totalCustomers,
      lowStockProducts: lowStockCount,
      totalRevenue,
    },
  });
});

// @desc    Get recent sales for dashboard
// @route   GET /api/dashboard/recent-sales
// @access  Private
const getRecentSales = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 10;

  const sales = await Sale.find({ status: "completed" })
    .populate("customer", "name")
    .populate("cashier", "name")
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("invoiceNumber total paymentMethod customer cashier createdAt");

  res.json({ success: true, count: sales.length, data: sales });
});

// @desc    Get sales chart data (last 7 / 30 days)
// @route   GET /api/dashboard/sales-chart
// @access  Private
const getSalesChart = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  const chartData = await Sale.aggregate([
    { $match: { createdAt: { $gte: startDate }, status: "completed" } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        orders: { $sum: 1 },
        sales: { $sum: "$total" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({ success: true, data: chartData });
});

module.exports = { getDashboardStats, getRecentSales, getSalesChart };
