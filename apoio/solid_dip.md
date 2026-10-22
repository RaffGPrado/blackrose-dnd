# 🔌 SOLID 5 — Dependency Inversion Principle (DIP)

> *"High-level modules should not depend on low-level modules. Both should depend on abstractions.*  
> *Abstractions should not depend on details. Details should depend on abstractions."*  
> — Robert C. Martin (Uncle Bob)

---

## 🎯 Conceito Central

O **Princípio da Inversão de Dependência** estabelece que o fluxo de dependências do sistema deve apontar para **contratos/abstrações** (interfaces ou tipos abstratos), e não para implementações concretas (como chamadas diretas a `fetch()`, `sqlite3`, ou `localStorage`). Isso desacopla a regra de negócio da infraestrutura técnica.

---

## 🎲 Aplicação no Domínio de D&D 5e

* **Frontend:** Os componentes de UI da ficha não devem saber se os dados vêm de uma API REST (`fetch`), de um banco offline (`IndexedDB`) ou de um mock para testes.
* **Backend:** As rotas de regras de D&D não devem depender da sintaxe concreta do driver SQLite; elas devem depender de uma abstração de repositório.

---

## ❌ Anti-Padrão (Violação do DIP)

### Componente acoplado diretamente a detalhes de infraestrutura:

```tsx
// ❌ Violando DIP: Componente de UI depende diretamente de localStorage e fetch global
export const BadCharacterSheet = ({ id }: { id: number }) => {
  const [character, setCharacter] = useState(null);

  useEffect(() => {
    // Acoplamento direto com mecanismo de token e URL de servidor
    const token = localStorage.getItem('token');
    fetch(`http://localhost:4000/api/characters/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCharacter(data));
  }, [id]);

  // Se quisermos criar testes unitários deste componente sem subir um servidor HTTP, não conseguimos!
};
```

---

## ✅ Boa Prática (Solução com DIP em TypeScript)

Definir contratos de serviço (abstrações) e injetar as implementações:

```typescript
// 1. Abstração (Contrato)
export interface ICharacterService {
  getCharacter(id: number): Promise<CharacterDetailResponse>;
  updateHp(id: number, currentHp: number): Promise<void>;
  performLongRest(id: number): Promise<EnrichedCharacter>;
}

// 2. Implementação Concreta de Produção (HTTP / REST)
export class HttpCharacterService implements ICharacterService {
  async getCharacter(id: number): Promise<CharacterDetailResponse> {
    return api.getCharacter(id);
  }

  async updateHp(id: number, currentHp: number): Promise<void> {
    await api.updateCharacter(id, { current_hp: currentHp });
  }

  async performLongRest(id: number): Promise<EnrichedCharacter> {
    const res = await api.longRest(id);
    return res.character;
  }
}

// 3. Implementação Concreta de Teste / Mock (Zero dependência de rede)
export class MockCharacterService implements ICharacterService {
  private mockHp = 25;

  async getCharacter(id: number): Promise<CharacterDetailResponse> {
    return {
      character: { id, name: 'Geralt', current_hp: this.mockHp, max_hp: 30 } as any,
      items: [],
      attacks: [],
      features: [],
      spell_slots: [],
      spells: [],
    };
  }

  async updateHp(_id: number, currentHp: number): Promise<void> {
    this.mockHp = currentHp;
  }

  async performLongRest(_id: number): Promise<EnrichedCharacter> {
    this.mockHp = 30;
    return { current_hp: 30, max_hp: 30 } as any;
  }
}

// 4. Componente de UI desacoplado que depende apenas da ABSTRAÇÃO:
export const CleanCharacterView: React.FC<{
  characterId: number;
  service?: ICharacterService; // Injeção de dependência opcional com default
}> = ({ characterId, service = new HttpCharacterService() }) => {
  const [character, setCharacter] = useState<EnrichedCharacter | null>(null);

  useEffect(() => {
    service.getCharacter(characterId).then((res) => setCharacter(res.character));
  }, [characterId, service]);

  // Totalmente testável em segundos com MockCharacterService!
};
```

---

## 📋 Checklist de Revisão DIP
- [ ] Componentes chamam `fetch()` diretamente em vez de usar serviços abstraídos?
- [ ] É possível testar a interface de usuário sem ter o banco de dados e o servidor backend ativos?
- [ ] O backend separa controladores de rotas da camada de persistência de dados?
