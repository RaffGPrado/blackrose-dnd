# Observer Pattern & Game Event Bus

## Fundamentals
The **Observer Pattern** is a software design pattern where an object (the subject) maintains a list of its dependents (observers) and notifies them automatically of any state changes, usually by calling one of their methods.

In our project, this is implemented as a **GameEventBus**. Various parts of the game engine (combat systems, character sheets, inventory) act as publishers that emit events (e.g., `CharacterTookDamage`, `ItemEquipped`), while other parts (UI, loggers, condition trackers) subscribe to these events and react accordingly.

## The "Why"
1. **Decoupling**: Publishers don't need to know who is listening. The UI can react to a character taking damage without the combat calculation logic having a direct reference to the UI components.
2. **Scalability**: Adding a new feature that needs to react to an event (like an achievement system unlocking an achievement when you deal 100 damage) simply requires subscribing to the existing event, without touching the core combat code.
3. **Reactive Architecture**: It aligns perfectly with a dynamic game state where many disparate systems need to synchronize based on user actions or game ticks.

## Best Practices
- **Typed Events**: Use strict TypeScript types or interfaces for event payloads so subscribers know exactly what data is available.
- **Cleanup / Unsubscribe**: Always unsubscribe observers when they are no longer needed (e.g., when a UI component unmounts). Failing to do so is the most common cause of memory leaks in this pattern.
- **Keep Handlers Fast**: Event handlers should be lightweight. If a subscriber needs to do heavy processing, it should schedule it asynchronously so it doesn't block the event bus or other subscribers.

## Alternatives and Why We Rejected Them

### 1. Prop Drilling (React/UI layer)
- **Why rejected**: Passing callbacks and state down through many layers of components becomes an unmaintainable nightmare. It couples intermediate components to data they don't care about and forces widespread refactoring when a deeply nested component needs to trigger an action.

### 2. Tight Coupling / Direct Method Calls
- **Why rejected**: Hardcoding `ui.updateHealthBar()` inside `combatLogic.calculateDamage()` tightly couples the domain logic to the presentation layer. It makes the code harder to test, reuse, and extend.

### 3. Polling
- **Why rejected**: Having the UI constantly check the game state (`setInterval(() => checkHealth(), 100)`) is inefficient, drains performance, and can lead to missed intermediate states or janky updates. The Observer pattern provides immediate, push-based updates.
