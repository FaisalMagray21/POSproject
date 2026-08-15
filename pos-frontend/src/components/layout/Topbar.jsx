import { Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function Topbar({ onMenuClick, title }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur border-b border-ink-100 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-ink-600 hover:bg-ink-50 rounded-lg p-2 -ml-2"
        >
          <Menu size={20} />
        </button>
        {title && (
          <h2 className="font-display font-semibold text-ink-900 hidden sm:block">{title}</h2>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-ink-800 leading-tight">{user?.name}</p>
          <p className="text-xs text-ink-400 capitalize leading-tight">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          className="p-2.5 rounded-xl border border-ink-100 text-ink-500 hover:bg-brick-50 hover:text-brick-500 hover:border-brick-100 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
