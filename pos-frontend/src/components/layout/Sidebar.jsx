import { NavLink } from "react-router-dom";
import clsx from "clsx";
import {
  LayoutGrid,
  Tag,
  Package,
  Users,
  ShoppingCart,
  Receipt,
  BarChart3,
  UserCog,
  X,
  ScanBarcode,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/pos", label: "POS / Checkout", icon: ScanBarcode },
  { to: "/products", label: "Products", icon: Package },
  { to: "/categories", label: "Categories", icon: Tag },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/sales", label: "Sales / Invoices", icon: Receipt },
  { to: "/reports", label: "Reports", icon: BarChart3, adminOnly: true },
  { to: "/users", label: "Users", icon: UserCog, adminOnly: true },
];

export default function Sidebar({ open, onClose }) {
  const { user, isAdmin } = useAuth();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-ink-950/50 z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}
      <aside
        className={clsx(
          "fixed lg:sticky top-0 left-0 h-screen w-64 bg-ink-900 text-ink-100 flex flex-col z-50 transition-transform duration-200 shrink-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-display font-bold text-white text-sm">
              N
            </div>
            <div>
              <p className="font-display font-semibold text-white leading-none">NovaPOS</p>
              <p className="text-[10px] text-ink-400 font-mono mt-0.5">v1.0 &middot; MVP</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-ink-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-500 text-white shadow-soft"
                      : "text-ink-200 hover:bg-white/5 hover:text-white"
                  )
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-gold-500 flex items-center justify-center font-display font-semibold text-white text-sm shrink-0">
              {user?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-ink-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
