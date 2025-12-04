import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { Phone } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  // Spring configuration for smooth, physical animation
  const springConfig = {
    type: "spring" as const,
    stiffness: 100,
    damping: 20,
    mass: 1,
  };

  return (
    <motion.header
      className="fixed z-50 left-1/2"
      initial={false}
      animate={{
        width: isScrolled ? "88%" : "100%",
        top: isScrolled ? 16 : 0,
        x: "-50%",
      }}
      transition={springConfig}
      style={{ maxWidth: isScrolled ? "1024px" : "100%" }}
    >
      <motion.nav
        className="flex items-center justify-between backdrop-blur-xl"
        initial={false}
        animate={{
          paddingLeft: isScrolled ? 24 : 32,
          paddingRight: isScrolled ? 24 : 32,
          paddingTop: isScrolled ? 10 : 14,
          paddingBottom: isScrolled ? 10 : 14,
          borderRadius: isScrolled ? 9999 : 0,
          backgroundColor: isScrolled 
            ? "rgba(255, 255, 255, 0.85)" 
            : "rgba(255, 255, 255, 0.6)",
          borderWidth: 1,
          borderColor: isScrolled 
            ? "rgba(255, 255, 255, 0.3)" 
            : "rgba(0, 0, 0, 0.05)",
          boxShadow: isScrolled
            ? "0px 10px 50px -12px rgba(0, 0, 0, 0.25)"
            : "0px 0px 0px 0px rgba(0, 0, 0, 0)",
        }}
        transition={springConfig}
        style={{ borderStyle: "solid" }}
      >
        <Link to="/">
          <Logo size="md" />
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/seguros"
            className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Nossos Seguros
          </Link>
          <a
            href="tel:+5511979699832"
            className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Phone size={16} />
            <span>(11) 97969-9832</span>
          </a>
          <Button variant="cta" size="sm" className="rounded-full" asChild>
            <Link to="/cotacao">Solicitar Cotação</Link>
          </Button>
        </div>
      </motion.nav>
    </motion.header>
  );
};
