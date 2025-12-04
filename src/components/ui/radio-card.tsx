import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface RadioCardOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface RadioCardGroupProps {
  options: RadioCardOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  columns?: 2 | 3;
}

const RadioCardGroup = ({
  options,
  value,
  onChange,
  label,
  className,
  columns = 2,
}: RadioCardGroupProps) => {
  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div
        className={cn(
          "grid gap-3",
          columns === 2 ? "grid-cols-2" : "grid-cols-3"
        )}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                // Base styles - Mobile first with adequate touch target
                "relative flex flex-col items-start p-4 rounded-lg border-2 transition-all duration-200",
                "min-h-[60px] text-left",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                // State-based styling
                isSelected
                  ? "border-secondary bg-accent"
                  : "border-border bg-card hover:border-secondary/50 hover:bg-accent/50"
              )}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-secondary flex items-center justify-center">
                  <Check className="h-3 w-3 text-secondary-foreground" />
                </div>
              )}
              {/* Icon */}
              {option.icon && (
                <div
                  className={cn(
                    "mb-2 transition-colors",
                    isSelected ? "text-secondary" : "text-muted-foreground"
                  )}
                >
                  {option.icon}
                </div>
              )}
              {/* Label */}
              <span
                className={cn(
                  "text-sm font-semibold transition-colors",
                  isSelected ? "text-foreground" : "text-foreground"
                )}
              >
                {option.label}
              </span>
              {/* Description */}
              {option.description && (
                <span className="text-xs text-muted-foreground mt-0.5">
                  {option.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export { RadioCardGroup, type RadioCardOption };
