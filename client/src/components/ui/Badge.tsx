import React from "react";
import { cn } from "@/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "brand" | "neutral" | "outline";
  size?: "sm" | "md";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "brand",
  size = "md",
  dot = false,
  children,
  ...props
}) => {
  const variantStyles = {
    brand: "bg-[#2864E8]/10 text-[#2864E8] border-[#2864E8]/20",
    success: "bg-[#168653]/10 text-[#168653] border-[#168653]/25",
    warning: "bg-[#B7791F]/10 text-[#B7791F] border-[#B7791F]/25",
    danger: "bg-[#C43D45]/10 text-[#C43D45] border-[#C43D45]/25",
    neutral: "bg-[#F0F2F5] text-[#626B78] border-[#E5E8ED]",
    outline: "bg-white text-[#171A21] border-[#E5E8ED]",
  };

  const dotColors = {
    brand: "bg-[#2864E8]",
    success: "bg-[#168653]",
    warning: "bg-[#B7791F]",
    danger: "bg-[#C43D45]",
    neutral: "bg-[#626B78]",
    outline: "bg-[#171A21]",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] font-medium tracking-tight",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-badge border select-none transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])} />}
      {children}
    </span>
  );
};
