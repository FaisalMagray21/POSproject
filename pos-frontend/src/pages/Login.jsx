import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScanBarcode, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Label, Input } from "../components/ui/Field";
import Button from "../components/ui/Button";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(form.email, form.password);
    setLoading(false);
    if (res.success) {
      toast.success("Welcome back!");
      navigate("/");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient receipt-strip background texture */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none [background-image:repeating-linear-gradient(0deg,transparent,transparent_23px,#fff_23px,#fff_24px)]" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lift mb-4">
            <ScanBarcode size={26} className="text-white" />
          </div>
          <h1 className="font-display font-semibold text-2xl text-white">NovaPOS</h1>
          <p className="text-ink-400 text-sm mt-1 font-mono">Point of Sale System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lift p-6 sm:p-8">
          <h2 className="font-display font-semibold text-lg text-ink-900 mb-1">
            Sign in to your account
          </h2>
          <p className="text-sm text-ink-400 mb-6">Enter your credentials to access the dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label required>Email</Label>
              <Input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label required>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" loading={loading} size="lg">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>

        <p className="text-center text-ink-500 text-xs mt-6 font-mono">
          Default admin: admin@pos.com / Admin@123
        </p>
      </div>
    </div>
  );
}
