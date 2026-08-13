const express = require("express");
const router = express.Router();
const { createSale, getSales, getSale } = require("../controllers/saleController");
const { downloadInvoice } = require("../controllers/invoiceController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").get(getSales).post(createSale);
router.get("/:id", getSale);
router.get("/:id/invoice", downloadInvoice);

module.exports = router;
