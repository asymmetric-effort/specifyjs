<img src="docs/img/logo.png" alt="SpecifyJS" width="128" align="left" style="margin-right: 16px;" />

# SpecifyJS

[![npm version](https://img.shields.io/npm/v/@asymmetric-effort/specifyjs.svg)](https://www.npmjs.com/package/@asymmetric-effort/specifyjs)
[![license](https://img.shields.io/npm/l/@asymmetric-effort/specifyjs.svg)](https://github.com/asymmetric-effort/specifyjs/blob/main/LICENSE)

<br clear="both" />

A declarative TypeScript UI framework built for performance, browser compatibility, and developer simplicity.

```bash
npm install @asymmetric-effort/specifyjs
```

## Monorepo Structure

```
specifyjs/
  core/           SpecifyJS framework — virtual DOM, reconciler, hooks, renderer, static pre-rendering
  tools/          Ecosystem tooling
  components/     Community-contributed reusable components
  docs/           Documentation (you are here)
  skills/         Claude skills for SpecifyJS developers
  .github/        CI/CD workflows (GitHub Actions)
  scripts/        Repository-wide automation scripts
```

## Quick Start

```bash
cd core
bun install
bun run test          # 600+ unit/integration tests
bun run build         # Rollup build → dist/
bun run test:e2e      # 27 Playwright browser tests
```

## Documentation

See [docs/README.md](docs/README.md) for the full documentation index, or jump to:

- [Getting Started](docs/guides/getting-started.md)
- [API Reference](docs/api/README.md)
- [Architecture](docs/architecture/README.md)
- [Contributing](docs/contributing/README.md)

## CI/CD

All workflows run via GitHub Actions and can be tested locally with [nektos/act](https://github.com/nektos/act):

```bash
./scripts/act-run.sh           # Run all CI jobs
./scripts/act-run.sh lint      # TypeScript + Prettier checks
./scripts/act-run.sh test      # Unit/integration tests with coverage
./scripts/act-run.sh build     # Library build + bundle size check
./scripts/act-run.sh e2e       # Playwright browser tests
```

## License

[MIT](core/LICENSE)
