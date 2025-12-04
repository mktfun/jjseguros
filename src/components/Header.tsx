import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { Phone } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/">
          <Logo size="md" />
        </Link>
        
        <div className="flex items-center gap-4">
          <a 
            href="tel:+5500000000000" 
            className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Phone size={16} />
            <span>(00) 0000-0000</span>
          </a>
          <Button variant="cta" size="sm" asChild>
            <Link to="/cotacao">Solicitar Cotação</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
