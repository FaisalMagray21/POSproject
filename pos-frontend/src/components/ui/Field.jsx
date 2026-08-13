import clsx from "clsx";
import { forwardRef } from "react";

export function Label({ children, required }) {
  return (
    <label className="block text-xs font-medium text-ink-600 mb-1.5">
      {children}
      {required && <span className="text-brick-500 ml-0.5">*</span>}
    </label>
  );
}

export const Input = forwardRef(function Input({ className, error, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={clsx(
        "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100",
        error ? "border-brick-500" : "border-ink-100",
        className
      )}
      {...props}
    />
  );
});

export function Select({ className, error, children, ...props }) {
  return (
    <select
      className={clsx(
        "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100",
        error ? "border-brick-500" : "border-ink-100",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, error, ...props }) {
  return (
    <textarea
      className={clsx(
        "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100",
        error ? "border-brick-500" : "border-ink-100",
        className
      )}
      {...props}
    />
  );
}

export function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-brick-500">{children}</p>;
}
