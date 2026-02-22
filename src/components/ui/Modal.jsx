import { useEffect } from "react";
import Button from "./Button";

export default function Modal({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-lg rounded-2xl border border-slate-300 bg-bg-light p-5 text-text-light shadow-2xl dark:border-slate-700 dark:bg-bg-dark dark:text-text-dark"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close about modal"
          >
            ✕
          </Button>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}
