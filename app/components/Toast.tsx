import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  type: ToastType;
  message: string;
};

let _addToast: ((type: ToastType, message: string) => void) | null = null;

export function toast(type: ToastType, message: string) {
  _addToast?.(type, message);
}

const icons = {
  success: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const styles: Record<ToastType, { bg: string; border: string; color: string; icon: string }> = {
  success: { bg: "#f0fdf4", border: "#bbf7d0", color: "#15803d", icon: "#16a34a" },
  error:   { bg: "#fef2f2", border: "#fecaca", color: "#dc2626", icon: "#dc2626" },
  info:    { bg: "#fff7ed", border: "#fed7aa", color: "#c2410c", icon: "#f97316" },
};

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let counter = 0;

  useEffect(() => {
    _addToast = (type, message) => {
      const id = ++counter;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    };
    return () => { _addToast = null; };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const s = styles[t.type];
        return (
          <div
            key={t.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-lg pointer-events-auto"
            style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              color: s.color,
              minWidth: 260,
              maxWidth: 380,
              animation: "slideInRight 0.25s ease",
            }}
          >
            <span style={{ color: s.icon }}>{icons[t.type]}</span>
            {t.message}
          </div>
        );
      })}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
