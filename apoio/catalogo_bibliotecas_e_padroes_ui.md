# 📦 Catálogo de Bibliotecas, Design System (`cva`) & Padrões Modern Web

> **Objetivo:** Padronizar o uso de bibliotecas especializadas de código aberto e APIs nativas da plataforma Web moderna para eliminar *hardcode*, reduzir tamanho de componentes (< 250 LOC) e garantir ergonomia tátil de nível comercial no **Black Rose D&D 5e**.

---

## 1. Matriz de Bibliotecas Adotadas (Backend & Frontend)

### 1.1 Tipagem, Validação, Banco de Dados & Fluxo Funcional
* **`neverthrow`** (`Result<T, E>` / `ResultAsync<T, E>`): Tratamento de erros funcional determinístico sem `try/catch` ou `throw` no domínio ([`fp_and_patterns.md`](./fp_and_patterns.md)).
* **`drizzle-orm` + `drizzle-kit` + `drizzle-zod`**: ORM type-safe sobre `node:sqlite`, migrações declarativas e geração automática de schemas Zod a partir das tabelas ([`drizzle_orm_e_persistencia.md`](./drizzle_orm_e_persistencia.md)).
* **`zod`**: Validação e parsing em tempo de execução para fronteiras HTTP, mensagens WebSocket, `localStorage` e formulários.
* **`ts-pattern`**: Pattern matching exaustivo (`match(value).with(...).exhaustive()`) para substituir `switch/case` e cadeias de `if/else` em **Strategy**, **Command** e **Discriminated Unions**.
* **`@total-typescript/ts-reset`**: Corrige assinaturas globais do TypeScript (`JSON.parse` e `Response.json()` passam a retornar `unknown` em vez de `any`).

### 1.2 Motor de Regras D&D 5e (Zero Hardcode de Dados)
* **`@dice-roller/rpg-dice-roller`**: Parser e avaliador oficial de notação de dados de RPG:
  * Ataques e danos compostos do compêndio: `2d6+3`, `1d8+1d6+4`.
  * Vantagem / Desvantagem de D&D 5e: `2d20kh1+5` (Vantagem), `2d20kl1+5` (Desvantagem).
  * Rolagem de atributos e Descanso Curto: `4d6dl1`, `2d8+4`.

### 1.3 UI/UX Mobile, Design System & Interações Táteis
* **`class-variance-authority` (`cva`) + `clsx` + `tailwind-merge`**: Criação de variantes de componentes (`Button`, `TouchStepper`, `Input`, `Badge`, `Card`) com ergonomia mobile embutida por contrato.
* **`vaul` (ou `<dialog>` nativo)**: Drawer/BottomSheet mobile com física real de arrasto para baixo (*swipe-to-close*), *focus trap*, suporte a `Escape` e acessibilidade WAI-ARIA.
* **`sonner`**: Notificações *toast* empilháveis com suporte nativo a botão de ação rápida — usado diretamente pelo **Command Pattern** (`"Dano: -14 PV aplicado" ➔ [Desfazer]`).
* **`@dnd-kit/core` + `@dnd-kit/sortable`**: Reordenação tátil acessível por arrastar e soltar (*Drag & Drop*) para itens da mochila e fila de iniciativa do Mestre.
* **`react-zoom-pan-pinch`**: Visualizador de alta resolução com gesto de pinça (*Pinch-to-Zoom*) e duplo toque para leitura das 375+ cartas de magia diagramadas em português.

---

## 2. Design System Mobile-First com `cva` (Ergonomia Tátil Garantida)

Para evitar que botões fiquem menores que **48 × 48 px** ou inputs fiquem menores que **16 px** (causando *auto-zoom* involuntário no iOS Safari), todos os elementos interativos devem usar primitivos baseados em `cva`:

```typescript
// frontend/src/components/ui/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        primary: 'bg-dnd-rose text-white shadow-md hover:bg-dnd-rose/90',
        surface: 'bg-dnd-surface border border-dnd-border text-dnd-text hover:bg-dnd-elevated',
        damage: 'bg-red-950/60 border border-red-800/60 text-red-200 hover:bg-red-900/70',
        heal: 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 hover:bg-emerald-900/70',
        ghost: 'text-dnd-muted hover:text-dnd-text hover:bg-dnd-elevated',
      },
      size: {
        // Todo tamanho interativo respeita o mínimo ergonômico de 48px no mobile:
        touch: 'min-h-12 min-w-12 px-4 py-2.5 text-sm',
        icon: 'h-12 w-12 p-0',
        compact: 'min-h-11 min-w-11 px-3 py-2 text-xs',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'touch',
    },
  }
);
```

### Primitivo `Input` Anti-Zoom iOS:
* Todo `<input>`, `<select>` e `<textarea>` deve usar o primitivo `<Input />` que aplica obrigatoriamente `text-base sm:text-sm min-h-12` (`16px` em telas mobile, `14px` em telas desktop).

---

## 3. Padrões Modern Web (CSS & HTML Nativos)

1. **Multi-Temas via CSS Custom Properties (`ThemeStrategy`):**
   * Definir variáveis semânticas em `frontend/src/index.css` sob seletores `[data-theme="black-rose" | "old-parchment" | "arcane-void" | "verdant-wilds"]`:
     * `--dnd-bg-dark`, `--dnd-bg-surface`, `--dnd-bg-elevated`, `--dnd-border`, `--dnd-text`, `--dnd-muted`, `--dnd-accent`.
2. **Renderização Diferida com `content-visibility: auto`:**
   * Aplicar `content-visibility: auto; contain-intrinsic-size: 0 280px;` nos cards de magias (`SpellCardGrid`) e itens de compêndio para manter rolagem a 60fps mesmo com 375+ cartas em tela.
3. **HTML Popover API (`popover="auto"`):**
   * Usar popovers nativos nos badges de Condições (`ConditionBadge`) para exibir em 1 toque o resumo das regras oficiais da condição sem bloquear a tela com um modal pesado.
4. **View Transitions API (`document.startViewTransition`):**
   * Envolver a troca de abas da ficha (`combat`, `skills`, `grimoire`, `inventory`, `features`) em `startViewTransition` com fallback gracioso para transições fluidas.
