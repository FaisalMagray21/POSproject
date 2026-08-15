import { Link } from "react-router-dom";
import { ScanBarcode } from "lucide-react";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-5">
          <ScanBarcode size={28} className="text-brand-500" />
        </div>
        <h1 className="font-display font-semibold text-6xl text-ink-900 mb-2">404</h1>
        <p className="text-ink-500 mb-6">This page doesn't exist or has been moved.</p>
        <Link to="/">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
