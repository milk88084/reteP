import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "brand" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading,
      disabled,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const base =
      "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-150 select-none focus:outline-none active:scale-95";
    const variants = {
      primary: "bg-accent text-black hover:bg-[#B6B9FE] disabled:opacity-50",
      secondary: "bg-surface text-ink hover:bg-border disabled:opacity-50",
      ghost: "bg-transparent text-ink hover:bg-surface disabled:opacity-40",
      brand: "bg-brand text-[#1E1A14] hover:bg-brand-dark disabled:opacity-50",
      danger:
        "bg-red-500/10 text-red-500 hover:bg-red-500/20 disabled:opacity-40",
    };
    const sizes = {
      sm: "px-4 py-1.5 text-sm",
      md: "px-6 py-2.5 text-sm",
      lg: "px-8 py-3.5 text-base",
    };
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
