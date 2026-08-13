import { Loader2 } from "lucide-react";
import clsx from "clsx";

const variants = {
  primary: "bg-brand-500 text-white hover:bg-brand-600 shadow-soft",
  secondary: "bg-white text-ink-800 border border-ink-100 hover:bg-ink-50",
  ghost: "text-ink-600 hover:bg-ink-50",
  danger: "bg-brick-500 text-white hover:bg-brick-700 shadow-soft",
  gold: "bg-gold-500 text-white hover:bg-gold-700 shadow-soft",
};

const sizes = {
  sm: "text-xs px-2.5 py-1.5 rounded-lg gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-xl gap-2",
  lg: "text-base px-5 py-3 rounded-xl gap-2",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  className,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        Icon && <Icon size={size === "sm" ? 14 : 16} />
      )}
      {children}
    </button>
  );
}
