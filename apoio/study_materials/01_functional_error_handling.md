# Functional Error Handling

## Fundamentals
Functional error handling treats errors as values rather than exceptions. Instead of throwing an error that forcefully alters the control flow of the application (using `try/catch`), functions return a data structure that encapsulates either a successful result or an error. 

In this project, we utilize the **Result Monad** (often via libraries like `neverthrow`). A `Result` type typically looks like `Result<T, E>`, meaning it can be either `Ok<T>` containing the successful data, or `Err<E>` containing the error details.

## The "Why"
1. **Type Safety for Errors**: In TypeScript, `catch (e)` types `e` as `unknown` or `any`. The Result Monad explicitly defines what errors a function can return (`E`), making them part of the function signature.
2. **Predictability**: You no longer need to guess if a function might throw an exception. If it can fail, the return type will explicitly be a `Result`.
3. **Exhaustive Handling**: The compiler forces you to unwrap or match the result, ensuring that error cases are handled explicitly before accessing the success value.
4. **Composability**: Monadic structures allow for fluent chaining of operations (e.g., `map`, `flatMap`, `match`), cleanly separating the happy path from error propagation.

## Best Practices
- **Never Throw**: Avoid `throw new Error()` in core domain logic. Wrap potential exceptions from third-party libraries (or the standard library) at the boundary using utility functions like `Result.fromThrowable()`.
- **Typed Errors**: Define specific error classes or discriminated unions for `E` (e.g., `NotFoundError`, `ValidationError`) rather than using generic string messages.
- **Chain Operations**: Use `.map()` to transform success values and `.mapErr()` to transform errors. Use `.andThen()` (or `flatMap`) to chain multiple operations that might fail.

## Alternatives and Why We Rejected Them

### 1. Traditional `try/catch`
- **Why rejected**: Errors are invisible in function signatures. It relies on side-effects for control flow. It easily leads to nested, unreadable `catch` blocks and type-unsafe error objects (`unknown`).

### 2. Node-style Callbacks (`(err, data) => void`)
- **Why rejected**: Leads to "callback hell" and does not play well with modern `async/await` syntax and Promises.

### 3. Go-style Tuples (`const [err, data] = await doSomething()`)
- **Why rejected**: While better than `try/catch` for visibility, it lacks the functional composability (like `map` and `andThen`) provided by a true Monad. You still have to write repetitive `if (err) return [err, null]` boilerplate.
