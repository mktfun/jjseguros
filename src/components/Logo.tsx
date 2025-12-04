import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light";
}

export const Logo = ({ className, size = "md", variant = "default" }: LogoProps) => {
  const sizes = {
    sm: { icon: 20, text: "text-lg" },
    md: { icon: 28, text: "text-2xl" },
    lg: { icon: 36, text: "text-3xl" },
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Shield 
          size={sizes[size].icon} 
          className="text-secondary fill-secondary/10" 
          strokeWidth={2}
        />
      </div>
      <span className={cn(
        "font-semibold tracking-tight",
        sizes[size].text,
        variant === "light" ? "text-primary-foreground" : "text-foreground"
      )}>
        Corretora <span className="text-secondary">JJ</span>
      </span>
    </div>
  );
};
