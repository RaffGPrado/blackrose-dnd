# 🛠️ Functional Programming & Novos Padrões de Arquitetura

Este documento formaliza os novos padrões arquiteturais ativamente aplicados no desenvolvimento do **Black Rose D&D 5e**. O foco destas abordagens é maximizar a previsibilidade, desacoplamento e a clareza do código.

---

## 1. Tratamento de Erros Funcional com `neverthrow` (Monad Result)

Abolimos o uso de `try/catch` imperativo e blocos de exceção genéricos em nossa lógica de domínio. No lugar, adotamos o padrão **Result Monad** através da biblioteca `neverthrow`.

### Por que?
- Exceções tradicionais quebram o fluxo de execução silenciosamente e escondem assinaturas de erro.
- O padrão Result força o tratamento explícito de casos de sucesso (`ok`) e falha (`err`).
- O TypeScript consegue inferir e forçar o desenvolvedor a checar os erros em tempo de compilação.

### Como aplicamos:
- Funções que podem falhar retornam `Result<T, E>`.
- Em vez de lançar exceções (`throw new Error(...)`), retornamos um erro tipado (`return err(...)`).
- Consumidores dessas funções utilizam encadeamento funcional (`.match()`, `.map()`, `.mapErr()`) ou checagens `isOk()` e `isErr()`, garantindo fluxos determinísticos e seguros.

---

## 2. Reatividade Desacoplada: Pattern Observer (`GameEventBus`)

Para lidar com a reatividade do frontend sem acoplar regras de negócio diretamente aos componentes de UI, utilizamos o **Observer Pattern** consolidado em nosso `GameEventBus`.

### Por que?
- Componentes da interface precisam reagir a mudanças de estado cruciais (como "Vida zerada, ativando Death Saves" ou "Fim de Descanso Longo") sem depender diretamente dos serviços que causaram a mutação.
- Facilita testar lógicas e reações de maneira independente do framework (React).

### Como aplicamos:
- O `GameEventBus` funciona como um *broker* tipado para onde os eventos de domínio convergem.
- Os serviços publicam eventos diretamente (`bus.publish('hp_zeroed', payload)`).
- Componentes e hooks reagem passivamente inscrevendo-se nos tópicos de interesse.
- Evitamos *prop drilling* excessivo e o acoplamento de callbacks profundos.

---

## 3. Clean Code: A Proibição de Comentários Arbitrários

O código deve ser a documentação viva e expressar sua própria intenção de forma inequívoca. **Comentários explicativos de "o que" o código faz estão formalmente proibidos.**

### Por que?
- Comentários apodrecem: o código muda e o comentário fica para trás, gerando mentiras que sabotam o desenvolvedor.
- Um comentário frequentemente serve de muleta para mascarar funções longas, variáveis obscuras e ausência de abstrações.

### Como aplicamos:
- Se você sente a necessidade de explicar um bloco complexo, deve refatorá-lo extraindo a lógica para uma função com um nome altamente semântico.
- **Exceções Permitidas:** Somente comentários do tipo "Por que?" (para detalhar uma limitação externa, *workaround* de API ou decisão não óbvia de arquitetura) ou documentações geradas como JSDoc/TSDoc em APIs públicas do sistema.
- A narrativa natural das variáveis e funções é a nossa única documentação admissível no código.
