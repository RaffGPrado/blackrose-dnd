# ✨ Guia de Clean Code em TypeScript & React

Este guia contém as convenções e práticas recomendadas para manter o código do **Black Rose D&D 5e** legível, seguro contra erros em tempo de execução e fácil de manter.

---

## 1. Diretrizes de TypeScript

### 1.1 Elimine o uso de `any`
O tipo `any` desativa o verificador de tipos do TypeScript, gerando uma falsa sensação de segurança.
* Use `unknown` quando o tipo for genuinamente incerto (ex.: resposta de API ou parsing JSON) e realize o afunilamento de tipo (*Type Narrowing*).
* Use *Generics* para componentes e funções reutilizáveis.

```typescript
// ❌ Evitar
function parseApiResponse(data: any): any {
  return data.character.name; // Se data for null, quebra em runtime!
}

// ✅ Recomendado
function parseApiResponse<T>(data: unknown): T {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Payload inválido recebido da API');
  }
  return data as T;
}
```

---

### 1.2 Uniões Discriminadas (Discriminated Unions) para Estados de Tela
Para telas com múltiplos estados (carregando, erro, sucesso, vazio), utilize uniões discriminadas para tornar impossíveis estados inválidos.

```typescript
type CharacterViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'ready'; data: EnrichedCharacter };

function renderView(state: CharacterViewState) {
  switch (state.status) {
    case 'loading':
      return <LoadingSpinner />;
    case 'error':
      return <ErrorMessage text={state.message} />;
    case 'empty':
      return <EmptyStateNotice />;
    case 'ready':
      return <CharacterHeader character={state.data} />;
  }
}
```

---

### 1.3 Imutabilidade e Funções Puras
Evite mutações diretas em arrays e objetos de estado.

```typescript
// ❌ Mutação direta de estado
character.current_hp = newHp;
setCharacter(character);

// ✅ Atualização imutável
setCharacter((prev) => (prev ? { ...prev, current_hp: newHp } : null));
```

---

## 2. Boas Práticas em React & Mobile UI

### 2.1 Colocação de Estado (*Colocate State*)
Mantenha o estado o mais próximo possível de onde ele é consumido.
* Se um modal de adicionar arma só é aberto dentro de `AttacksList.tsx`, o estado do formulário (`newAttackName`, `damageType`) não precisa estar no componente raiz da página.
* Estados globais são reservados apenas para dados compartilhados (ex.: Usuário logado via `AuthContext`).

### 2.2 Extração de Custom Hooks
Quando uma lógica envolver `useEffect` e requisições assíncronas repetitivas, isole-a em um Custom Hook:

```typescript
// src/hooks/useCharacter.ts
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CharacterDetailResponse } from '../types/dnd5e';

export function useCharacter(characterId: number) {
  const [data, setData] = useState<CharacterDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const res = await api.getCharacter(characterId);
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, [characterId]);

  return { data, loading, error, reload };
}
```

---

### 2.3 Ergonomia Tátil e Acessibilidade Móvel
1. **Alvos de Toque:** Todo elemento interativo (botões de dano, ícones de filtro, abas de navegação) deve respeitar a área mínima de **48 × 48 px**.
2. **Prevenção de Zoom Acidental:** Em dispositivos móveis, garanta que campos de texto (`input`) tenham tamanho de fonte de pelo menos `16px` no mobile ou manipule meta viewports para evitar o zoom involuntário do navegador ao focar.
3. **Feedback Visual:** Utilize `active:scale-95` e transições suaves de opacidade para que o usuário sinta a resposta tátil imediata ao tocar em botões.
