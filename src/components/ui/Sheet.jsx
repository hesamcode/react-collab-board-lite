import Button from "./Button";

export default function Sheet({ open, title, onClose, children }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 md:hidden" aria-hidden="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
        aria-label="Close properties sheet"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute bottom-0 left-0 right-0 max-h-[82vh] overflow-y-auto rounded-t-3xl border border-slate-300 bg-bg-light p-4 text-text-light shadow-2xl transition motion-safe:animate-[slideUp_220ms_ease-out] dark:border-slate-700 dark:bg-bg-dark dark:text-text-dark"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
            aria-label="Close sheet"
          >
            ✕
          </Button>
        </div>
        {children}
      </section>
    </div>
  );
}
