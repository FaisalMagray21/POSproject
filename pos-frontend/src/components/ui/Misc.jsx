import clsx from "clsx";
import { Loader2, Inbox } from "lucide-react";

export function Card({ children, className, ...props }) {
  return (
    <div
      className={clsx(
        "bg-white rounded-2xl border border-ink-100 shadow-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

const badgeVariants = {
  brand: "bg-brand-50 text-brand-700 border-brand-100",
  gold: "bg-gold-50 text-gold-700 border-gold-100",
  brick: "bg-brick-50 text-brick-700 border-brick-100",
  neutral: "bg-ink-50 text-ink-600 border-ink-100",
};

export function Badge({ children, variant = "neutral", className }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Spinner({ size = 24, className }) {
  return (
    <Loader2
      size={size}
      className={clsx("animate-spin text-brand-500", className)}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Spinner size={32} />
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-14 h-14 rounded-2xl bg-ink-50 flex items-center justify-center mb-4">
        <Icon size={24} className="text-ink-400" />
      </div>
      <h3 className="font-display font-semibold text-ink-800 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-ink-400 max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        {eyebrow && (
          <p className="text-xs font-mono uppercase tracking-wider text-brand-500 mb-1">
            {eyebrow}
          </p>
        )}
        <h1 className="text-xl sm:text-2xl font-display font-semibold text-ink-900">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-ink-400 mt-1">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
