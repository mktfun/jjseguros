import { Logo } from "./Logo";
import { Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo size="sm" className="mb-4" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sua corretora de seguros de confiança. Protegendo o que importa há mais de 10 anos.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              Nossos Seguros
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Auto</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Residencial</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Vida</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Empresarial</a></li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              Institucional
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              Contato
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-secondary" />
                <span>(00) 0000-0000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-secondary" />
                <span>contato@corretorajj.com.br</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-secondary mt-0.5" />
                <span>São Paulo, SP</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Corretora JJ. Todos os direitos reservados. SUSEP nº 00.000.000/0000-00
          </p>
        </div>
      </div>
    </footer>
  );
};
