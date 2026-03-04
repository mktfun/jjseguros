# Vibe Proposal: JJ Seguros Mobile-First Redesign

## 1. O Problema

A auditoria visual do site `jjseguros` (live em `preview--cotar.lovable.app`) revelou problemas críticos de UX, especialmente no mobile:

- **Espaço Vazio na Home:** Grande área branca entre os cards de seguro e o rodapé no mobile.
- **Footer Intrusivo:** O rodapé completo aparece dentro dos formulários (wizards), empurrando o conteúdo principal e ocupando espaço valioso da tela no mobile.
- **Formulários Espremidos:** Campos de formulário muito próximos entre si, dificultando o toque e a leitura em telas menores.
- **Falta de Feedback:** O botão "Próximo" fica desabilitado sem clareza de qual campo impede o avanço.
- **Design Datado:** Uso de fontes padrão e layouts que não transmitem o nível "premium" desejado, em comparação com referências como a interface do TripGlide.

## 2. A Solução

Implementar um redesign focado em "Mobile-First Premium", melhorando a experiência de cotação:

- **Remoção do Footer dos Wizards:** Deixar a interface do formulário limpa e focada apenas na conversão.
- **Aumento do Espaçamento:** Ajustar tokens de layout nos formulários (`py`, `gap`, `space-y`) para garantir que os botões e campos sejam grandes e fáceis de tocar (thumb-friendly).
- **Tipografia e Cores Premium:** Adotar a fonte `Instrument Sans`, arredondar botões e usar um fundo mais limpo (branco/cinza claro) em vez de gradientes fortes no background.
- **Validação Visual (Inline):** Adicionar mensagens de erro ou destaques vermelhos abaixo dos campos não preenchidos quando o usuário tenta avançar.
- **Correção da Home Mobile:** Investigar e remover o espaço vazio fantasma e simplificar a Navbar no mobile (esconder o botão "Cotar" que compete com o hambúrguer).

## 3. Escopo

O escopo engloba ajustes visuais de UI/UX. Nenhuma lógica de negócio central (envio de dados para Supabase, conectores N8N) será alterada.

- Componentes da Landing Page (Home, Header, Footer).
- Hub de Seguros (`InsuranceHub.tsx`).
- Componentes Base dos Wizards (Auto, Vida, etc.).

## 4. Próximos Passos

1. Aprovação desta Proposal e do Design System atualizado (`design.md`).
2. Execução das tarefas listadas em `tasks.md`.
