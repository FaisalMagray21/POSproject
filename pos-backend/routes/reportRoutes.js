const express = require("express");
const router = express.Router();
const {
  getSalesReport,
  getProductReport,
  getRevenueReport,
  getLowStockReport,
} = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin")); // reports are admin-only per spec

router.get("/sales", getSalesReport);
router.get("/products", getProductReport);
router.get("/revenue", getRevenueReport);
router.get("/low-stock", getLowStockReport);

module.exports = router;
