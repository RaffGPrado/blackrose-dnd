# 🔓 SOLID 2 — Open/Closed Principle (OCP)

> *"Software entities (classes, modules, functions, etc.) should be open for extension, but closed for modification."*  
> — Bertrand Meyer

---

## 🎯 Conceito Central

O **Princípio Aberto/Fechado** dita que você deve conseguir adicionar novos comportamentos ou regras ao sistema **sem precisar reescrever ou modificar o código-fonte existente que já foi testado e homologado**.

---

## 🎲 Aplicação no Domínio de D&D 5e

Em D&D, novos conteúdos são adicionados frequentemente:
* Novas **classes de personagem** (ex.: Artífice, Bruxo).
* Novas **condições de combate** (ex.: Envenenado, Cego, Paralisado).
* Novos **tipos de dano** ou regras especiais de descanso.

O código de resolução de efeitos não deve precisar de um `switch/case` que seja editado toda vez que um novo livro de regras for lançado.

---

## ❌ Anti-Padrão (Violação do OCP)

### Condicionais rígidos espalhados pelo código:

```typescript
// ❌ Violando OCP: Adicionar uma classe nova requer modificar esta função diretamente
export function calculateHitPointsOnLevelUp(className: string, conMod: number): number {
  let hitDie = 8;

  if (className === 'Barbarian') {
    hitDie = 12;
  } else if (className === 'Fighter' || className === 'Paladin' || className === 'Ranger') {
    hitDie = 10;
  } else if (className === 'Wizard' || className === 'Sorcerer') {
    hitDie = 6;
  }
  // Se adicionarmos "Artificer", teremos que editar este arquivo e retestar tudo!

  return Math.floor(hitDie / 2) + 1 + conMod;
}
```

---

## ✅ Boa Prática (Solução com OCP em TypeScript)

Uso de contratos polimórficos ou registro dinâmico (*Registry Pattern*):

```typescript
// Contrato aberto para extensão
export interface ICharacterClassRule {
  readonly className: string;
  readonly hitDieSides: number;
  readonly spellcastingAbility?: AbilityKey;
  calculateAverageHpGain(conMod: number): number;
}

// Implementações concretas fechadas para alteração
export class BarbarianClassRule implements ICharacterClassRule {
  readonly className = 'Barbarian';
  readonly hitDieSides = 12;

  calculateAverageHpGain(conMod: number): number {
    return 7 + conMod; // Média de 1d12 arredondada para cima
  }
}

export class WizardClassRule implements ICharacterClassRule {
  readonly className = 'Wizard';
  readonly hitDieSides = 6;
  readonly spellcastingAbility: AbilityKey = 'intelligence';

  calculateAverageHpGain(conMod: number): number {
    return 4 + conMod; // Média de 1d6 arredondada para cima
  }
}

// Registro Central (Permite que plugins ou módulos adicionem novas classes livremente)
export class ClassRuleRegistry {
  private static rules = new Map<string, ICharacterClassRule>();

  public static register(rule: ICharacterClassRule): void {
    ClassRuleRegistry.rules.set(rule.className.toLowerCase(), rule);
  }

  public static get(className: string): ICharacterClassRule | undefined {
    return ClassRuleRegistry.rules.get(className.toLowerCase());
  }
}

// Registro inicial
ClassRuleRegistry.register(new BarbarianClassRule());
ClassRuleRegistry.register(new WizardClassRule());

// Se amanhã criarmos uma classe homebrew ou Artífice:
// ClassRuleRegistry.register(new ArtificerClassRule()); -> SEM MODIFICAR O CÓDIGO DO NÚCLEO!
```

---

## 📋 Checklist de Revisão OCP
- [ ] Para adicionar uma nova raça ou classe de D&D, preciso abrir arquivos antigos e alterar `switch/case`?
- [ ] Posso estender o comportamento do sistema passando novas implementações de interfaces ou objetos de configuração?
- [ ] O núcleo da aplicação permanece estável quando novas regras opcionais são introduzidas?
