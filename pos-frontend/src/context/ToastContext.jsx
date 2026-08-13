import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, X, Info } from "lucide-react";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "success") => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => remove(id), 3500);
    },
    [remove]
  );

  const toast = {
    success: (msg) => push(msg, "success"),
    error: (msg) => push(msg, "error"),
    info: (msg) => push(msg, "info"),
  };

  const icons = {
    success: <CheckCircle2 size={18} className="text-brand-500 shrink-0" />,
    error: <XCircle size={18} className="text-brick-500 shrink-0" />,
    info: <Info size={18} className="text-ink-400 shrink-0" />,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-fade-in flex items-start gap-2.5 bg-white border border-ink-100 shadow-lift rounded-xl px-4 py-3 text-sm"
          >
            {icons[t.type]}
            <p className="flex-1 text-ink-800 leading-snug">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="text-ink-400 hover:text-ink-700 shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
