# POS System — Frontend

React + Vite + Tailwind CSS frontend for the POS backend. Mobile-responsive, connects to every backend endpoint (Auth, Dashboard, Categories, Products/Inventory, POS Checkout, Customers, Sales/Invoices, Reports, Users).

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL to your backend URL
npm run dev
```

Default login (matches backend seed): `admin@pos.com` / `Admin@123`

## Build for production

```bash
npm run build   # outputs to dist/
npm run preview # preview the production build locally
```

## Pages

- **Login** — JWT auth
- **Dashboard** — today's sales/orders, totals, low stock, 7-day sales chart, recent sales
- **POS / Checkout** — barcode/name search, cart, discount/tax, customer select, cash/card/bank payment, receipt + PDF invoice
- **Products** — CRUD, image upload, category/stock filters, stock adjustment, stock history
- **Categories** — CRUD with search
- **Customers** — CRUD, purchase history, total spent
- **Sales & Invoices** — searchable/paginated list, full invoice view, PDF download
- **Reports** (admin) — sales by date, top products, revenue/gross profit, low stock
- **Users** (admin) — manage admin/cashier accounts

## Notes

- Role-based UI: cashiers see POS/Products/Customers/Sales; admins additionally see Reports and Users, and can edit/delete catalog data.
- Fully responsive: collapsible sidebar drawer on mobile, stacked cards, touch-friendly controls.
- Built with: React 19, React Router, Axios, Tailwind CSS, Recharts, Lucide icons.
