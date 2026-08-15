const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  adjustStock,
  getStockHistory,
  deleteProduct,
  getLowStockProducts,
} = require("../controllers/productController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.use(protect);

router.get("/alerts/low-stock", getLowStockProducts);

router
  .route("/")
  .get(getProducts)
  .post(authorize("admin"), upload.single("image"), createProduct);

router
  .route("/:id")
  .get(getProduct)
  .put(authorize("admin"), upload.single("image"), updateProduct)
  .delete(authorize("admin"), deleteProduct);

router.put("/:id/adjust-stock", authorize("admin"), adjustStock);
router.get("/:id/stock-history", getStockHistory);

module.exports = router;
