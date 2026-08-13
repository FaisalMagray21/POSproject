# POS System — Backend

Node.js + Express + MongoDB (Mongoose) backend for a Point of Sale system, built from the provided spec: Auth & Roles, Dashboard, Categories, Products, Inventory, POS/Checkout, Payments, Sales/Invoices, Customers, and Reports.

## Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- JWT authentication + bcryptjs password hashing
- Multer (product image uploads)
- PDFKit (invoice PDF generation)

## Setup

```bash
cd pos-backend
npm install
cp .env.example .env
```

Edit `.env` and set your `MONGO_URI` and a strong `JWT_SECRET`.

Start MongoDB locally (or use MongoDB Atlas), then:

```bash
# Create the first admin user
npm run seed

# Development (auto-restart)
npm run dev

# Production
npm start
```

Default admin (from `.env` / seed script):
- Email: `admin@pos.com`
- Password: `Admin@123`

> ⚠️ Change these in `.env` before seeding, or update the admin afterward via `PUT /api/users/:id`.

> **Note on transactions:** `POST /api/sales` uses a MongoDB session/transaction to keep stock deduction and sale creation atomic. This requires MongoDB running as a **replica set** (Atlas is a replica set by default; local single-node `mongod` is not). The code automatically **falls back to sequential (non-transactional) writes** if transactions aren't supported, so it still works on a plain local `mongod` — just without the atomicity guarantee.

## Project Structure

```
pos-backend/
├── config/db.js                 # MongoDB connection
├── models/                      # Mongoose schemas
│   ├── User.js
│   ├── Category.js
│   ├── Product.js
│   ├── StockHistory.js
│   ├── Customer.js
│   └── Sale.js
├── controllers/                 # Route logic
├── middleware/
│   ├── authMiddleware.js        # JWT protect + role-based authorize()
│   ├── errorMiddleware.js       # 404 + centralized error handler
│   └── uploadMiddleware.js      # Multer config for product images
├── routes/
├── utils/
│   ├── generateToken.js
│   ├── generateInvoiceNumber.js
│   └── seed.js                  # Creates default admin
├── uploads/products/             # Uploaded product images (served at /uploads)
├── server.js
└── .env.example
```

## Roles

| Role    | Permissions |
|---------|-------------|
| admin   | Manage products, categories, users, view sales, view reports |
| cashier | Use POS, create sales, generate invoices, manage customers |

Reports and user management are **admin-only**. Cashiers only see their own sales in `GET /api/sales`.

## API Endpoints

### Auth
```
POST   /api/auth/register      Register user (name, email, password, role)
POST   /api/auth/login         Login (email, password) → JWT token
GET    /api/auth/me            Get logged-in user            [Private]
POST   /api/auth/logout        Logout                        [Private]
```

### Users (Admin only)
```
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

### Categories
```
GET    /api/categories?search=            [Private]
POST   /api/categories                    [Admin]
GET    /api/categories/:id                [Private]
PUT    /api/categories/:id                [Admin]
DELETE /api/categories/:id                [Admin] (blocked if products still linked)
```

### Products
```
GET    /api/products?search=&category=&stockStatus=&page=&limit=   [Private]
GET    /api/products/alerts/low-stock                              [Private]
GET    /api/products/:id            (also accepts a barcode)       [Private]
POST   /api/products   (multipart/form-data, field "image")        [Admin]
PUT    /api/products/:id                                           [Admin]
DELETE /api/products/:id  (soft delete)                            [Admin]
PUT    /api/products/:id/adjust-stock  { quantityChange, reference }  [Admin]
GET    /api/products/:id/stock-history                             [Private]
```
`stockStatus` filter values: `in_stock` | `low_stock` | `out_of_stock`

### Customers
```
GET    /api/customers?search=                    [Private]
POST   /api/customers                            [Private]
GET    /api/customers/:id  (includes purchase history + totalSpent)   [Private]
PUT    /api/customers/:id                        [Private]
DELETE /api/customers/:id                        [Admin]
```

### Sales / POS Checkout
```
POST   /api/sales
Body: {
  customer: "<customerId>" | null,
  items: [{ product: "<productId>", quantity: 2 }, ...],
  discount: 100,
  tax: 0,
  paymentMethod: "cash" | "card" | "bank_transfer",
  paidAmount: 3000
}
```
This single endpoint:
1. Validates stock for every item
2. Deducts product quantity
3. Logs a `StockHistory` entry (type: `sale`)
4. Generates a sequential invoice number (`INV-00001`, ...)
5. Calculates `total`, `changeAmount`
6. Saves the `Sale`

```
GET    /api/sales?search=&startDate=&endDate=&page=&limit=   [Private]
GET    /api/sales/:id                                        [Private]
GET    /api/sales/:id/invoice     → downloads a PDF invoice   [Private]
```

### Dashboard
```
GET    /api/dashboard/stats          Today's sales/orders, total products/customers, low stock, total revenue
GET    /api/dashboard/recent-sales?limit=10
GET    /api/dashboard/sales-chart?days=7
```

### Reports (Admin only)
```
GET    /api/reports/sales?period=today|week|month  or  ?startDate=&endDate=
GET    /api/reports/products?period=...             Best-selling products
GET    /api/reports/revenue?period=...               Total sales - cost = gross profit
GET    /api/reports/low-stock
```

## Auth Header

All private routes require:
```
Authorization: Bearer <token>
```

## Database Collections

`users`, `categories`, `products`, `customers`, `sales`, `stockhistories` — matching the spec (inventory is tracked via `product.quantity` + the `StockHistory` audit trail rather than a separate heavy inventory collection).

## Next Steps (not in MVP scope)

- Add refresh tokens / token blacklist for logout
- Add JazzCash/Easypaisa payment gateway integration
- Rate limiting & request validation hardening (express-validator is included as a dependency, ready to wire in)
- Automated tests (Jest/Supertest)
