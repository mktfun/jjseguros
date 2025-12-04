import * as React from "react";
import { cn } from "@/lib/utils";

interface FormCardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

const FormCard = ({ children, title, description, className }: FormCardProps) => {
  return (
    <div
      className={cn(
        "rounded-xl bg-card border border-border p-6 shadow-card",
        className
      )}
    >
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export { FormCard };
