import React from "react";
import { cn } from "@/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-1 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none";

    const variantStyles = {
      primary: "bg-[#2864E8] text-white hover:bg-[#1C4AC7] shadow-sm shadow-brand/20",
      secondary: "bg-[#F7F8FA] text-[#171A21] hover:bg-[#E5E8ED] border border-[#E5E8ED]",
      outline: "border border-[#E5E8ED] bg-white text-[#171A21] hover:bg-[#F7F8FA] hover:border-[#C4C9D3]",
      ghost: "text-[#626B78] hover:text-[#171A21] hover:bg-black/[0.04]",
      danger: "bg-[#C43D45] text-white hover:bg-[#A32E35] shadow-sm shadow-status-danger/20",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-btn gap-1.5",
      md: "h-9 px-4 text-sm rounded-btn gap-2",
      lg: "h-11 px-5 text-base rounded-btn gap-2.5",
      icon: "h-9 w-9 rounded-btn p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
