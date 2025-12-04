import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { Phone } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] sm:w-[90%] max-w-5xl">
      <nav className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 rounded-full bg-background/80 dark:bg-background/70 backdrop-blur-xl border border-border/50 shadow-lg">
        <Link to="/">
          <Logo size="md" />
        </Link>
        
        <div className="flex items-center gap-3 sm:gap-4">
          <a 
            href="tel:+5500000000000" 
            className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Phone size={16} />
            <span>(00) 0000-0000</span>
          </a>
          <Button variant="cta" size="sm" className="rounded-full" asChild>
            <Link to="/cotacao">Solicitar Cotação</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
};
