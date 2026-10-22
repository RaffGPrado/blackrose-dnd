# Unit of Work & SQLite Transactions

## Fundamentals
The **Unit of Work** pattern coordinates the writing out of changes and resolves concurrency problems. It maintains a list of objects affected by a business transaction and coordinates the writing out of changes.

In the context of database operations, this directly maps to **Database Transactions**. A transaction ensures that a series of reads and writes are treated as a single, atomic, all-or-nothing operation.

## The "Why"
1. **Data Consistency (Atomicity)**: If a character is created, they need stats, inventory, and skills. If writing the skills fails, we don't want an orphaned character in the database. Transactions ensure all parts succeed, or none do (rollback).
2. **Isolation**: While a transaction is happening, other database reads/writes shouldn't see half-finished data.
3. **Simplicity in Failure**: When using a Unit of Work, business logic doesn't need to manually undo previous steps if step 3 of 5 fails. The database handles the rollback automatically.

## Best Practices
- **Keep Transactions Short**: Only include database operations within the transaction. Avoid making external API calls or doing heavy CPU calculations while a transaction is open, as this locks database resources.
- **Dependency Injection**: Pass the transaction object (or the Unit of Work interface) down to repositories so they can execute operations within the same context.
- **Native SQLite Transactions**: In synchronous SQLite environments (like `node:sqlite` or `better-sqlite3`), transactions are fast and native. Use them generously for any write spanning multiple tables.

## Alternatives and Why We Rejected Them

### 1. Implicit/Auto-commit Transactions
- **Why rejected**: Writing each record individually without a wrapping transaction leaves the database vulnerable to partial updates if the application crashes mid-process. It compromises data integrity.

### 2. Manual Compensation Logic
- **Why rejected**: Writing custom code to delete the character if the skill insert fails is error-prone, hard to maintain, and reinvents the wheel that relational databases have perfected decades ago.

### 3. "Active Record" Saving on Every Change
- **Why rejected**: Calling `.save()` on individual models repeatedly generates excessive I/O and creates the same partial-update risks. Unit of Work collects changes and flushes them together safely.
