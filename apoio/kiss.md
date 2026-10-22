# 🎯 KISS — Keep It Simple, Stupid

> *"Simplicity is a prerequisite for reliability."*  
> — Edsger W. Dijkstra

---

## 🎯 Conceito Central

O princípio **KISS** defende que a maioria dos sistemas funciona melhor quando são mantidos simples, em vez de se tornarem complicados. A simplicidade deve ser uma meta chave no design, e complexidade desnecessária deve ser ativamente evitada.

---

## 🎲 Aplicação no Domínio de D&D 5e

Em sessões ao vivo de RPG de mesa, o mestre e os jogadores operam sob pressão de tempo e tomadas de decisão rápidas:
* Se um jogador leva 6 segundos para encontrar o botão de dano ou precisa de 3 cliques para rolar um ataque, a dinâmica da mesa é interrompida.
* No código, regras de D&D 5e são fundamentalmente matemáticas e determinísticas. Não crie arquiteturas convolutas para algo que pode ser calculado em uma única linha legível.

---

## ❌ Anti-Padrão (Violação do KISS)

### Complexidade acidental no código e na interface:

```typescript
// ❌ Violando KISS no código: Arquitetura excessivamente complexa para calcular um modificador
class AbilityScoreValueObject {
  constructor(private rawValue: number) {}
  public getScore(): number { return this.rawValue; }
}

class ModifierCalculationStrategyFactory {
  public static getStrategyForEdition(edition: '5e') {
    return {
      compute: (scoreVo: AbilityScoreValueObject): number => {
        const base = scoreVo.getScore();
        return Math.floor((base - 10) / 2);
      }
    };
  }
}
// 15 linhas e 2 classes para fazer: Math.floor((score - 10) / 2)
```

### Na Interface (UI):
Obrigar o usuário a abrir um teclado virtual no celular, digitar o número `-5` e clicar em "Submeter formulário" apenas para descontar 5 pontos de vida em combate.

---

## ✅ Boa Prática (Solução KISS)

### No Código: Funções puras e diretas
```typescript
// ✅ Solução KISS: Uma função pura, clara e autoexplicativa
export const calculateModifier = (score: number = 10): number => {
  return Math.floor((score - 10) / 2);
};
```

### Na Interface: Ação direta em 1 toque
Botões de ajuste rápido pré-calculados (`-5`, `-1`, `+1`, `+5`) com alvos de toque grandes (≥ 48px), permitindo que o jogador resolva a vida do personagem com um único toque do polegar:

```tsx
// ✅ Solução KISS na UI: Botões táteis diretos
<div className="grid grid-cols-4 gap-2">
  <button onClick={() => adjustHp(-5)} className="h-12 bg-rose-950 text-rose-300 font-bold rounded-xl">-5</button>
  <button onClick={() => adjustHp(-1)} className="h-12 bg-rose-950 text-rose-300 font-bold rounded-xl">-1</button>
  <button onClick={() => adjustHp(1)} className="h-12 bg-emerald-950 text-emerald-300 font-bold rounded-xl">+1</button>
  <button onClick={() => adjustHp(5)} className="h-12 bg-emerald-950 text-emerald-300 font-bold rounded-xl">+5</button>
</div>
```

---

## 📋 Checklist de Revisão KISS
- [ ] Um desenvolvedor júnior consegue entender esta função sem explicações adicionais?
- [ ] Esta tarefa poderia ser resolvida com uma função pura em vez de instanciar classes ou adicionar bibliotecas externas?
- [ ] A interface permite que as ações mais frequentes do jogo sejam feitas com o menor número de toques possível?
