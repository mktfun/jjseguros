import { Shield } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className, size = "md" }: LogoProps) => {
  const sizes = {
    sm: { icon: 20, text: "text-lg" },
    md: { icon: 28, text: "text-2xl" },
    lg: { icon: 36, text: "text-3xl" },
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Shield 
          size={sizes[size].icon} 
          className="text-secondary fill-secondary/10" 
          strokeWidth={2}
        />
      </div>
      <span className={`font-semibold tracking-tight text-foreground ${sizes[size].text}`}>
        Corretora <span className="text-secondary">JJ</span>
      </span>
    </div>
  );
};
