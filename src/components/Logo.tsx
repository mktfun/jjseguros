import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo.png";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light";
}

export const Logo = ({ className, size = "md", variant = "default" }: LogoProps) => {
  const sizes = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-2xl" },
    lg: { icon: 40, text: "text-3xl" },
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img 
        src={logoImage} 
        alt="Corretora JJ" 
        width={sizes[size].icon} 
        height={sizes[size].icon}
        className="object-contain"
      />
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
