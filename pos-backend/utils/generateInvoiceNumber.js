const Sale = require("../models/Sale");

// Generates sequential invoice numbers like INV-00001, INV-00002 ...
const generateInvoiceNumber = async () => {
  const lastSale = await Sale.findOne().sort({ createdAt: -1 });

  let nextNumber = 1;

  if (lastSale && lastSale.invoiceNumber) {
    const match = lastSale.invoiceNumber.match(/(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `INV-${String(nextNumber).padStart(5, "0")}`;
};

module.exports = generateInvoiceNumber;
