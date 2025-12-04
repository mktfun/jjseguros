import { useState, useEffect } from "react";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { Phone } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? "top-3 sm:top-4 left-1/2 -translate-x-1/2 w-[92%] sm:w-[90%] max-w-5xl"
          : "top-0 left-0 w-full"
      }`}
    >
      <nav
        className={`flex h-14 sm:h-16 items-center justify-between transition-all duration-300 ease-in-out ${
          isScrolled
            ? "px-4 sm:px-6 rounded-full bg-background/85 backdrop-blur-xl border border-border/50 shadow-lg"
            : "px-4 sm:px-8 lg:px-12 rounded-none bg-transparent border-b border-transparent"
        }`}
      >
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
