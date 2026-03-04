# Vibe Tasks: JJ Seguros Mobile-First Redesign

## Fase 1: Fundação & Estilo Global

- [x] 1.1 Atualizar `index.html` ou import global CSS (`index.css`) para incluir a webfont `Instrument Sans`.
- [x] 1.2 Atualizar Tailwind config (`tailwind.config.ts`) para usar `Instrument Sans` como fonte base de `sans`.

## Fase 2: Layout Base (Header/Footer)

- [x] 2.1 Refatorar `Header.tsx`: no mobile (`md:hidden`), esconder o botão "Cotar" e deixar apenas Logo e Menu Hambúrguer.
- [x] 2.2 Refatorar roteamento/layout para que Wizards não renderizem o componente `Footer.tsx` gigante. (Verificar App.tsx ou layouts de rota, se o Footer está global ou instanciado nos Wizards).

## Fase 3: Home Page Mobile

- [x] 3.1 Investigar e consertar o espaçamento/gap vazio gigante na renderização mobile do `HeroSection.tsx` ou `InsuranceTypes.tsx`.
- [x] 3.2 Refinar estilo do Hub de seguros (os botões/cards em mobile) para maior padding e clickability - `InsuranceHub.tsx`.

## Fase 4: Otimização dos Formulários (Wizards)

_(Focado nos componentes base e nos wizards mais vitais, Auto e Vida)_

- [x] 4.1 Aumentar e padronizar os tamanhos dos inputs (+ padding vertical, `py-3` ou `py-4`). (_Verificar se usashadcn/ui `Input` e ajustar lá ou aplicar classe via utility._)
- [x] 4.2 Aumentar espaçamento dos Fieldsets (de `space-y-2` para `space-y-4` ou `gap-5`).
- [x] 4.3 Ajustar o card de "Seguro Novo / Renovação" no `AutoWizard.tsx` (Step 1) que está cortado no mobile.
- [x] 4.4 Adicionar feedback visual (texto ou toast) no Validation Lock do botão "Próximo".

## Fase 5: QA & Deploy

- [x] 5.1 Rodar build e conferir lint (`npm run build`).
- [x] 5.2 Commit e Push para `main` (para trigger da Lovable).
- [ ] 5.3 Validação via live-url Lovable final. (Aguardando usuário)

## Fase 6: Premium Visual Overhaul (Landing Page)

- [x] 6.1 Refinar `InsuranceTypes.tsx`: Alterar o carrossel no mobile de `snap-mandatory` para `snap-proximity` ou suavizar a rolagem para evitar os "pulos" agressivos relatados na auditoria.
- [x] 6.2 Refinar Fundos e Texturas: Na `Index.tsx` e `HeroSection.tsx`, reduzir opacidade de patterns de fundo (grid) ou removê-los, priorizando um visual "Clean White/Grey", alinhando totalmente com as imagens conceituais premium.
- [x] 6.3 Refinar Sombras e Bordas: Ajustar globais nos cards principais (Features, Tipos de Seguros) para usar bordas mais suaves (`border-white/20`, shadows ultra-leves e cantos bem arredondados `rounded-3xl` onde aplicável).
