# Vibe Design: JJ Seguros Mobile-First Premium

## 1. Princípios Visuais

- **Clean & Minimal:** Fundos branco (`#ffffff`) e cinza ultra-suave (`#f5f6f7`), reduzindo o uso de gradientes pesados em grandes áreas.
- **Tipografia Moderna:** Toda a tipografia passa a usar `Instrument Sans` via Google Fonts, conferindo um ar contemporâneo e sofisticado.
- **Mobile-First Real:** O espaçamento, tamanho de botões e áreas de toque são otimizados primariamente para polegares humanos (`min-h-[48px]`, gaps generosos).
- **Foco na Conversão:** Formulários (wizards) devem ter distrações mínimas. Menus de navegação complexos e footers longos devem sumir quando o usuário estiver preenchendo dados.

## 2. Paleta de Cores (Ajustes)

- **Primary:** Mantém o azul/roxo escuro atual (branding), mas usado apenas em botões e CTAs primários.
- **Backgrounds:**
  - Home/Global: Base cinza claro/branco.
  - Cards: Branco puro com `shadow-sm` ou `shadow-md` muito suave e bordas arredondadas (`rounded-2xl` ou `3xl`).

## 3. Tipografia

- **Font-Family:** `Instrument Sans, sans-serif`
- **Títulos:** Fortes, com boa hierarquia e tracking ajustado.
- **Inputs:** Texto tamanho `text-base` padrão (evita zoom automático no iOS nas caixas de texto).

## 4. UI Patterns

### 4.1 Formulários (Wizards)

- **Espaçamentos Internos:** Inputs devem ter `py-3` ou `py-4` para ficarem altos e "gordos".
- **Gaps:** Entre os campos vizinhos (ex: Nome e Email), usar `space-y-4` ou `space-y-5`.
- **Validation:** Se o botão "Próximo" for clicado e houver erro, borda do input fica vermelha e um texto miúdo aparece (`text-xs text-destructive mt-1`).
- **Footer:** NUNCA renderizar o `Footer` dentro das rotas do wizard; usar uma versão ultra mínima (apenas aviso de segurança) se necessário.

### 4.2 Navbar (Header) Mobile

- Somente a Logo alinhada à esquerda e o Menu Hambúrguer à direita.
- Botão CTA superior (Cotar) deve ser oculto na versão mobile (pois a responsabilidade vira um botão na hero ou flutuante).

### 4.3 Home Page Mobile

- Esconder quaisquer seções com erro condicional que geram gaps brancos gigantes.
- No Hub de seguros, cards precisam de respiro (paddings maiores) e um ícone contrastante com fundo suave.

### 4.4 Estética Premium (Fase 6)

- **Scroll Horizontal Suave:** Substituir `snap-mandatory` por `snap-proximity` nos carrosséis mobile para evitar paradas bruscas e passar uma sensação mais fluida.
- **Minimalismo de Fundo:** Remover texturas pesadas (ex: patterns de grid muito visíveis) ou fundos complexos em favor de branco limpo (`#ffffff`) ou cinza levíssimo (`#f5f6f7`), inspirado nos guias de estilo modernos (ex: interfaces da Apple/Stripe).
- **Sombras e Bordas Suaves:** Preferir `shadow-sm` ou um shadow customizado extremamente difuso em vez de bordas duras para separar elementos. Maximar o uso de `rounded-2xl` ou `rounded-3xl` em cartões principais.
