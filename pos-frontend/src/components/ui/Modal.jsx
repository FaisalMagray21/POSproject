import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import clsx from "clsx";
import Button from "./Button";

export default function Modal({ open, onClose, title, children, size = "md", footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-ink-950/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div
        className={clsx(
          "relative bg-white w-full rounded-t-2xl sm:rounded-2xl shadow-lift animate-fade-in max-h-[92vh] flex flex-col",
          sizes[size]
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100 shrink-0">
          <h2 className="font-display font-semibold text-ink-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-700 hover:bg-ink-50 rounded-lg p-1.5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto scrollbar-thin">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-ink-100 flex justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  variant = "danger",
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-ink-600">{message}</p>
    </Modal>
  );
}
