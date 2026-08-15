# NovaPOS — Point of Sale System

A full-stack POS (Point of Sale) system for retail/shop management — built with the MERN stack (MongoDB, Express, React, Node.js) and deployed live on Vercel.

---

## 🔗 Live Links

| | URL |
|---|---|
| **Website (Frontend)** | https://po-sprojectfrontend.vercel.app/ |
| **Backend API** | https://po-sproject-wcgq.vercel.app/ |
| **Database** | MongoDB Atlas (cloud) |

---

## 🔑 Login Credentials

### Admin Account (full access)
```
Email:    admin@pos.com
Password: Admin@123
```

Admin can do everything: manage products, categories, users, view all sales, and view reports.

### Cashier Account
No cashier account exists by default. To create one:
1. Login as Admin
2. Go to **Users** page (sidebar)
3. Click **Add User**, set Role = **Cashier**

Cashiers can use the POS, create sales, manage customers — but cannot see Reports, Users, or edit Products/Categories.

> ⚠️ **Important:** Change the admin password after your first login for real/production use, since these are shared default credentials.

---

## 🧩 What This System Does

NovaPOS is a complete retail management tool. Here's what's actually working right now on the live site:

### 1. Authentication & Roles
- Secure login with JWT tokens + hashed passwords (bcrypt)
- Two roles: **Admin** (full control) and **Cashier** (sales-focused)
- Sidebar and page access automatically change based on who's logged in

### 2. Dashboard
- Today's sales total & order count
- Total products, total customers
- Low stock product count
- Total revenue (all-time)
- 7-day sales chart
- Recent sales list

### 3. Categories
- Add/edit/delete product categories (e.g. "Mobiles", "Accessories")
- Search categories
- A category can't be deleted if products are still linked to it (data safety)

### 4. Products & Inventory
- Add products with name, SKU, barcode, category, purchase price, selling price, opening stock, minimum stock alert, and photo
- Search by name/SKU/barcode, filter by category or stock status
- **Stock Adjustment** — manually add/remove stock (new shipment, damage, correction) with a logged reason
- Automatic **Low Stock** / **Out of Stock** badges based on the minimum stock threshold
- Stock history log per product (every sale, adjustment, tracked automatically)

### 5. POS / Checkout (the core screen)
- Search products live or scan a barcode
- Add to cart, adjust quantities, remove items
- Optional discount and tax
- Pick a customer or leave as "Walk-in"
- Choose payment method: Cash / Card / Bank Transfer
- Enter amount paid → change is calculated automatically
- On checkout: stock is deducted automatically, an invoice number is generated (`INV-00001`, `INV-00002`, ...), and a receipt is shown
- Print/download the invoice as a PDF instantly

### 6. Customers
- Add/edit/delete customer records (name, phone, email, address)
- Optional at checkout — walk-in sales don't need a customer
- Customer profile shows total orders, total amount spent, and recent purchase history

### 7. Sales & Invoices
- Full searchable, paginated list of every sale
- Filter by date range or search by invoice number
- Click into any sale to see the full invoice (items, prices, totals, payment info)
- Download/print any invoice as a PDF at any time

### 8. Reports (Admin only)
- **Sales Report** — daily breakdown with a bar chart, filterable by Today / This Week / This Month
- **Top Products** — best-selling products by units sold and revenue
- **Revenue Report** — total sales, total cost, and gross profit
- **Low Stock Report** — every product currently below its minimum stock level

### 9. User Management (Admin only)
- Create/edit/delete admin and cashier accounts
- Activate/deactivate accounts without deleting them
- An admin can't delete or deactivate their own account (safety guard)

---

## 🛠️ Tech Stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Axios, Recharts (charts), Lucide (icons)
**Backend:** Node.js, Express.js, JWT authentication, bcrypt (password hashing), Multer (image uploads), PDFKit (invoice PDFs)
**Database:** MongoDB Atlas + Mongoose
**Hosting:** Vercel (both frontend and backend, deployed as separate projects from the same GitHub repo)

---

## ⚠️ Known Limitation (Live Deployment)

Because the backend runs on Vercel as a **serverless function**, its filesystem is temporary — uploaded product images are **not permanently stored** and may disappear after a while. Everything else (data, sales, reports, PDFs) works normally since that's all stored in MongoDB, not the filesystem.

**Fix for later:** connect a cloud image host (e.g. Cloudinary or AWS S3) for permanent product photo storage — the app works perfectly fine without this for now, product images are optional everywhere.

---

## 📁 Project Structure

```
pos-backend/     → Express API (routes, controllers, models, auth)
pos-frontend/    → React app (pages, components, API calls)
```

Both are deployed as **separate Vercel projects** from the same GitHub repository, using Vercel's "Root Directory" setting to point at each folder.

---

## 🔄 How Data Flows (Quick Mental Model)

```
Login → Dashboard → Products (add stock)
                          ↓
                    POS (search & add to cart)
                          ↓
                    Checkout (payment)
                          ↓
              Stock auto-decreases + Invoice created
                          ↓
              Shows up in Sales, Reports, Dashboard
```

---

## 📝 Environment Variables Reference

**Backend** (`pos-backend` on Vercel):
`MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLIENT_URL` (must match the live frontend URL, no trailing slash), `VERCEL=1`

**Frontend** (`pos-frontend` on Vercel):
`VITE_API_URL` = `https://po-sproject-wcgq.vercel.app/api` (must end in `/api`)

If either project is redeployed and its URL changes, both of these need to be updated to match — otherwise login/API calls will fail with a CORS or network error.
