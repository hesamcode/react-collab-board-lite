const VARIANT_CLASSES = {
  solid:
    "bg-primary-500 text-white hover:bg-rose-600 dark:hover:bg-rose-500 border-transparent",
  subtle:
    "bg-white text-slate-800 border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-700",
  ghost:
    "bg-transparent text-slate-700 border-transparent hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800",
  danger:
    "bg-red-500 text-white border-transparent hover:bg-red-600 dark:hover:bg-red-500",
};

const SIZE_CLASSES = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  icon: "h-10 w-10 p-0",
};

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Button({
  type = "button",
  variant = "subtle",
  size = "md",
  className,
  children,
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={joinClasses(
        "inline-flex items-center justify-center gap-2 rounded-lg border font-medium shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-light disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-bg-dark",
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.subtle,
        SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
