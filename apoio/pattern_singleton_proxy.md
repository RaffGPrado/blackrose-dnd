# 🛡️ Design Pattern — Singleton with Proxy

> **Classificação:** Padrão Criacional / Estrutural Composto  
> **Objetivo:** Garantir uma única instância de um recurso global crítico (ex.: Banco de Dados, Cache ou Cliente de WebSocket), combinando com um **Proxy** para interceptar chamadas, medir performance, registrar logs e adicionar segurança de forma transparente.

---

## 🎯 Por Que Usar no Black Rose D&D?

* **No Backend:** O banco de dados SQLite nativo (`DatabaseSync`) e pools de conexão devem existir em instância única para evitar bloqueios de arquivo (*database locked*) e overhead de conexões duplicadas.
* **O Problema do Singleton Clássico:** Singletons tradicionais frequentemente acumulam responsabilidades de logging, telemetria e tratamento de erros dentro da classe de domínio.
* **A Solução com Proxy:** Mantemos a classe de domínio estritamente enxuta e usamos o `Proxy` do JavaScript/TypeScript para interceptar dinamicamente todas as execuções SQL, cronometrar em milissegundos e auditar transações.

---

## 📐 Diagrama Estrutural

```text
+------------------------+
|   Client Consumer      |
+------------------------+
            │
            ▼ (invoca método query())
+-------------------------------------------------------------+
|                     ES6 Proxy Wrapper                       |
+-------------------------------------------------------------+
| Interceptador:                                              |
| 1. Marca tempo inicial (performance.now())                  |
| 2. Registra logs de auditoria e valida parâmetros           |
| 3. Repassa execução para a Instância Única (Singleton)       |
| 4. Mede tempo final e alerta se a consulta for lenta        |
+-------------------------------------------------------------+
            │
            ▼
+-------------------------------------------------------------+
|            DatabaseCoreInstance (Singleton)                 |
+-------------------------------------------------------------+
| Conexão real com SQLite / Persistência                      |
+-------------------------------------------------------------+
```

---

## 💻 Implementação Completa em TypeScript

```typescript
// 1. Contrato da Operação de Banco de Dados
export interface IDatabaseClient {
  query<T = any>(sql: string, params?: any[]): T[];
  execute(sql: string, params?: any[]): { changes: number; lastInsertRowid?: number | bigint };
}

// 2. Classe Concreta Núcleo (Focada apenas na conexão pura)
class SqliteDatabaseCore implements IDatabaseClient {
  public query<T = any>(sql: string, params: any[] = []): T[] {
    // Simulação de execução via db.prepare(sql).all(...params)
    return [] as T[];
  }

  public execute(sql: string, params: any[] = []): { changes: number } {
    return { changes: 1 };
  }
}

// 3. Gerenciador Singleton com Interceptador Proxy
export class DatabaseManager {
  private static instance: IDatabaseClient | null = null;

  private constructor() {
    // Construtor privado impede instanciação direta (new DatabaseManager())
  }

  public static getInstance(): IDatabaseClient {
    if (!DatabaseManager.instance) {
      const rawInstance = new SqliteDatabaseCore();

      // Envolvemos a instância única no Proxy interceptador
      DatabaseManager.instance = new Proxy<IDatabaseClient>(rawInstance, {
        get(target: IDatabaseClient, propKey: string | symbol, receiver: any) {
          const originalMethod = (target as any)[propKey];

          if (typeof originalMethod === 'function') {
            return function (...args: any[]) {
              const start = performance.now();
              const queryStr = typeof args[0] === 'string' ? args[0].replace(/\s+/g, ' ').trim() : '';

              try {
                // Executa o método original na instância
                const result = originalMethod.apply(target, args);
                const duration = performance.now() - start;

                // Log formatado com alerta de consulta lenta (> 50ms)
                if (duration > 50) {
                  console.warn(`⚠️ [SLOW QUERY: ${duration.toFixed(2)}ms] ${queryStr}`);
                } else {
                  console.log(`⚡ [DB PROXY: ${duration.toFixed(2)}ms] ${queryStr}`);
                }

                return result;
              } catch (error) {
                console.error(`🚨 [DB ERROR] Falha ao executar SQL: "${queryStr}"`, error);
                throw error;
              }
            };
          }

          return Reflect.get(target, propKey, receiver);
        },
      });
    }

    return DatabaseManager.instance;
  }
}

// 4. Consumo no Backend:
const db = DatabaseManager.getInstance();
const spells = db.query('SELECT * FROM spells WHERE school = ?', ['Evocação']);
```

---

## ⚖️ Vantagens e Cuidados
* **Vantagem:** Total transparência. Nenhum método da classe `SqliteDatabaseCore` precisa conter linhas de `console.log` ou medição de tempo.
* **Vantagem:** Centraliza métricas de telemetria e detecção de queries lentas em um único interceptador.
* **Cuidado:** Como qualquer Singleton, evite armazenar estados transitórios ou específicos de uma requisição de usuário dentro da instância única compartilhada.
