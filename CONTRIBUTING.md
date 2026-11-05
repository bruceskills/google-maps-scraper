# Contributing

Thank you for wanting to contribute to **Google Maps Scraper**. This guide covers everything you need to open an issue or a pull request.

By contributing you agree with the [Code of Conduct](./CODE_OF_CONDUCT.md) and the [ISC license](./LICENSE).

---

## Before you start

### Reporting bugs

Open an issue with:

- **Description** of what happened and what was expected
- **Exact command** that reproduces the problem (with the flag values)
- **Version** (`npm run start -- --version`) and Node (`node -v`)
- **OS** (Linux/macOS/Windows) and detected browser (`npm run find-chrome`)
- **Log excerpt** (`logs/error.log` or `logs/combined.log`), with sensitive data removed

### Suggesting features

Describe the use case, the expected result and why the current behaviour does not solve it. Pull requests with a feature are very welcome — but opening the issue first avoids duplicated work.

---

## Development environment

```bash
git clone https://github.com/bruceskills/google-maps-scraper.git
cd google-maps-scraper
npm install
cp .env.example .env
npm run find-chrome
```

Validate the environment:

```bash
npm run type-check
npm run lint
npm run build
```

---

## Workflow

1. **Fork** the repository and create a branch from `main`:

   ```bash
   git checkout -b feat/nova-opcao
   ```

2. **Make your changes** and validate:

   ```bash
   npm run type-check
   npm run lint
   npm run format
   npm run build
   ```

3. **Commit** following [Conventional Commits](#conventional-commits):

   ```bash
   git commit -m "feat(parser): extrai o website quando ausente"
   ```

4. **Open the Pull Request** describing the change and the reason behind it.

5. Wait for the review. Change requests are normal — they are part of the process.

---

## Project conventions

### Code

- **Strict TypeScript** — `strict`, `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` are enabled. Avoid `any` unless it is really needed; prefer `unknown` plus narrowing.
- **2 spaces**, single quotes, semicolons — configured in `.prettierrc`.
- **Type imports** with `import type { X } from '...'`.
- **`@/` alias** for paths inside `src/`.
- **File header** as a comment, following the pattern already used in the project:

  ```ts
  // =========================================================================
  // src/utils/example.ts
  // Responsible for ...
  // =========================================================================
  ```

- **JSDoc** on exported functions, explaining the contract and the return value.

### Naming

| Item                  | Convention         | Example                |
| --------------------- | ------------------ | ---------------------- |
| Files                 | `kebab-case`       | `detail-fetcher.ts`    |
| Classes               | `PascalCase`       | `GoogleMapsScraper`    |
| Functions / variables | `camelCase`        | `buildSearchUrl`       |
| Constants             | `UPPER_SNAKE_CASE` | `DEFAULT_BROWSER_ARGS` |
| Types / interfaces    | `PascalCase`       | `SearchOptions`        |

### Folder structure

| Folder         | Responsibility                        |
| -------------- | ------------------------------------- |
| `src/browser/` | Puppeteer instance and page scrolling |
| `src/config/`  | Defaults, Chrome flags and logger     |
| `src/scraper/` | Scraping orchestration and phone pool |
| `src/types/`   | Shared contracts                      |
| `src/utils/`   | Isolated helper functions             |
| `public/`      | Assets (ASCII banner)                 |

Practical rule: `utils/` must not import anything from `scraper/` — the dependency always points the other way.

### Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

Types used in the project:

| Type       | Use                                       |
| ---------- | ----------------------------------------- |
| `feat`     | New functionality                         |
| `fix`      | Bug fix                                   |
| `refactor` | Internal change with no behaviour change  |
| `docs`     | Documentation                             |
| `test`     | Tests                                     |
| `chore`    | Maintenance (dependencies, build, config) |
| `perf`     | Performance improvement                   |

Examples:

```bash
git commit -m "feat(cli): adiciona a flag --pool-size"
git commit -m "fix(phone): normaliza telefone com 0 de discagem direta"
git commit -m "docs(readme): documenta as opções da CLI"
```

---

## Pull request checklist

- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm run format` was executed
- [ ] `npm run build` succeeds
- [ ] Issue or bug referenced in the PR body
- [ ] Test commands documented
- [ ] Behaviour changes explained (including in `README.md`)

---

## Tests

The project has no automated test suite yet. What exists today:

- `npm run type-check` — static type checking
- `npm run lint` — style and best practice rules
- `npm run build` — guarantees that the bundle compiles and the types are generated
- Manual runs against a real search (see `SETUP.md`)

Manual and integration tests are very welcome — especially coverage for `src/utils/phone.ts` and `src/utils/validation.ts`, which are pure functions and easy to test.

---

## License

By contributing you agree that your contribution is licensed under the [ISC license](./LICENSE).
