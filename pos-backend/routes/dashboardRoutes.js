const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getRecentSales,
  getSalesChart,
} = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/stats", getDashboardStats);
router.get("/recent-sales", getRecentSales);
router.get("/sales-chart", getSalesChart);

module.exports = router;
