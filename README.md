# tsgo Hang Reproduction

Minimal reproduction for a `tsgo` hang issue.

## Issue

`tsgo` hangs indefinitely when type-checking this codebase. Standard `tsc` completes successfully.

## Trigger

The hang requires **both**:

1. **`declaration: true`** in tsconfig.json
2. **The specific code pattern**: A class extending `S.Class` (Effect Schema) with a merged namespace containing complex recursive conditional types for type-level string parsing

Neither alone causes the hang:
- Simple code with `declaration: true` → completes
- This code without `declaration: true` → completes
- This code with `declaration: true` → **hangs**

## Reproduction

```bash
pnpm install

# tsc completes successfully
pnpm tsc

# tsgo hangs indefinitely (requires Ctrl+C to stop)
pnpm tsgo
```

## Files

- `src/cli/param/repro.ts` - Main file with class/namespace merge and recursive types
- `src/core/ts/err.ts` - StaticError interface
- `tsconfig.json` - Has `declaration: true`

## Environment

- Node.js 22+
- pnpm 10+
- effect@^3.16
