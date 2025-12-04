import * as React from "react";
import { cn } from "@/lib/utils";

interface SegmentedControlOption {
  value: string;
  label: string;
  description?: string;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

const SegmentedControl = ({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedControlProps) => {
  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="flex rounded-lg bg-muted p-1 gap-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              value === option.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export { SegmentedControl, type SegmentedControlOption };
