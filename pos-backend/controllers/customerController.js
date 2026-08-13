const asyncHandler = require("express-async-handler");
const Customer = require("../models/Customer");
const Sale = require("../models/Sale");

// @desc    Get all customers (search)
// @route   GET /api/customers
// @access  Private
const getCustomers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const customers = await Customer.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: customers.length, data: customers });
});

// @desc    Get single customer with purchase history
// @route   GET /api/customers/:id
// @access  Private
const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  const sales = await Sale.find({ customer: customer._id })
    .sort({ createdAt: -1 })
    .select("invoiceNumber total createdAt paymentMethod");

  const totalSpent = sales.reduce((sum, s) => sum + s.total, 0);

  res.json({
    success: true,
    data: {
      ...customer.toObject(),
      totalOrders: sales.length,
      totalSpent,
      recentOrders: sales.slice(0, 5),
    },
  });
});

// @desc    Create customer
// @route   POST /api/customers
// @access  Private
const createCustomer = asyncHandler(async (req, res) => {
  const { name, phone, email, address } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Customer name is required");
  }

  const customer = await Customer.create({ name, phone, email, address });
  res.status(201).json({ success: true, data: customer });
});

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  customer.name = req.body.name ?? customer.name;
  customer.phone = req.body.phone ?? customer.phone;
  customer.email = req.body.email ?? customer.email;
  customer.address = req.body.address ?? customer.address;

  const updated = await customer.save();
  res.json({ success: true, data: updated });
});

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  await customer.deleteOne();
  res.json({ success: true, message: "Customer deleted successfully" });
});

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
