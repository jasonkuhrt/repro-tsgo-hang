# tsgo Hang Reproduction

`tsgo` hangs indefinitely. `tsc` completes.

## Trigger

Requires ALL of:
1. `declaration: true` in tsconfig
2. Class + merged namespace (same name)
3. Static method referencing type from merged namespace
4. Recursive conditional types

## Repro

```bash
pnpm install
pnpm tsc    # completes
pnpm tsgo   # hangs
```
