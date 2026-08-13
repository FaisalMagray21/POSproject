import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const titles = {
  "/": "Dashboard",
  "/pos": "POS / Checkout",
  "/products": "Products",
  "/categories": "Categories",
  "/customers": "Customers",
  "/sales": "Sales & Invoices",
  "/reports": "Reports",
  "/users": "Users",
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const title =
    titles[location.pathname] ||
    Object.entries(titles).find(([path]) => location.pathname.startsWith(path) && path !== "/")?.[1];

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
