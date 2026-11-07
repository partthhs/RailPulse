import React from "react";
import { cn } from "@/utils/cn";

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#E5E8ED]/70", className)}
      {...props}
    />
  );
};
