import * as React from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface ToggleSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

const ToggleSwitch = ({
  label,
  description,
  checked,
  onCheckedChange,
  className,
}: ToggleSwitchProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-lg border border-border bg-card",
        "transition-colors duration-200",
        checked && "border-secondary/50 bg-accent",
        className
      )}
    >
      <div className="flex-1 mr-4">
        <label className="text-sm font-medium text-foreground cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
};

export { ToggleSwitch };
