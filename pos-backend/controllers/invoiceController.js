const asyncHandler = require("express-async-handler");
const PDFDocument = require("pdfkit");
const Sale = require("../models/Sale");

// @desc    Download / print invoice as PDF
// @route   GET /api/sales/:id/invoice
// @access  Private
const downloadInvoice = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id)
    .populate("customer", "name phone email address")
    .populate("cashier", "name");

  if (!sale) {
    res.status(404);
    throw new Error("Sale not found");
  }

  const doc = new PDFDocument({ margin: 50, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${sale.invoiceNumber}.pdf`
  );

  doc.pipe(res);

  // Header
  doc.fontSize(20).text("INVOICE", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Invoice #: ${sale.invoiceNumber}`);
  doc.text(`Date: ${new Date(sale.createdAt).toLocaleString()}`);
  doc.text(`Cashier: ${sale.cashier?.name || "N/A"}`);
  doc.text(`Customer: ${sale.customer?.name || "Walk-in Customer"}`);
  if (sale.customer?.phone) doc.text(`Phone: ${sale.customer.phone}`);
  doc.moveDown();

  // Table header
  doc.fontSize(11).text("Item", 50, doc.y, { continued: true, width: 200 });
  doc.text("Qty", 250, doc.y, { continued: true, width: 60 });
  doc.text("Price", 310, doc.y, { continued: true, width: 100 });
  doc.text("Total", 410, doc.y);
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  sale.items.forEach((item) => {
    const y = doc.y;
    doc.fontSize(10).text(item.name, 50, y, { width: 200 });
    doc.text(String(item.quantity), 250, y, { width: 60 });
    doc.text(`Rs.${item.price.toFixed(2)}`, 310, y, { width: 100 });
    doc.text(`Rs.${item.total.toFixed(2)}`, 410, y);
    doc.moveDown(0.5);
  });

  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  doc.fontSize(11).text(`Subtotal: Rs.${sale.subtotal.toFixed(2)}`, { align: "right" });
  doc.text(`Discount: Rs.${sale.discount.toFixed(2)}`, { align: "right" });
  doc.text(`Tax: Rs.${sale.tax.toFixed(2)}`, { align: "right" });
  doc.fontSize(13).text(`Total: Rs.${sale.total.toFixed(2)}`, { align: "right" });
  doc.moveDown();

  doc.fontSize(11).text(`Payment Method: ${sale.paymentMethod}`, { align: "right" });
  doc.text(`Paid: Rs.${sale.paidAmount.toFixed(2)}`, { align: "right" });
  doc.text(`Change: Rs.${sale.changeAmount.toFixed(2)}`, { align: "right" });

  doc.moveDown(2);
  doc.fontSize(10).text("Thank you for your business!", { align: "center" });

  doc.end();
});

module.exports = { downloadInvoice };
