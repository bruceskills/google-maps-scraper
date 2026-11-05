# Credits

**Google Maps Scraper** is maintained by **Bruno César ([@bruceskills](https://github.com/bruceskills))** — [bruceskills@gmail.com](mailto:bruceskills@gmail.com).

---

## Author

| Name                                                             | Role                                                                             |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Bruno César** ([@bruceskills](https://github.com/bruceskills)) | Developer and maintainer — [bruceskills@gmail.com](mailto:bruceskills@gmail.com) |

---

## ASCII art

The banner printed at the beginning of every run (`public/.bruce.art`) was created for this project and is loaded at runtime by [`src/utils/ascii-art.util.ts`](./src/utils/ascii-art.util.ts).

---

## Dependencies

This project would not exist without the work of these libraries.

### Runtime

| Project                                             | Role                                                     |
| --------------------------------------------------- | -------------------------------------------------------- |
| [Puppeteer](https://github.com/puppeteer/puppeteer) | Chrome automation: navigation, scrolling and DOM reading |
| [Winston](https://github.com/winstonjs/winston)     | Structured logging to the console and to files           |
| [Commander](https://github.com/tj/commander.js)     | CLI argument parsing                                     |
| [dotenv](https://github.com/motdotla/dotenv)        | Loading the variables from the `.env` file               |

### Development

| Project                                                                               | Role                                              |
| ------------------------------------------------------------------------------------- | ------------------------------------------------- |
| [TypeScript](https://github.com/microsoft/TypeScript)                                 | Static typing (through `@typescript/typescript6`) |
| [tsup](https://github.com/egoist/tsup)                                                | Bundling (CJS + ESM + `.d.ts`) with esbuild       |
| [tsx](https://github.com/privatenumber/tsx)                                           | Running TypeScript in watch mode                  |
| [ESLint](https://github.com/eslint/eslint)                                            | Linting with type-aware rules                     |
| [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint)           | Lint rules specific to TypeScript                 |
| [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)          | Turns off the ESLint formatting rules             |
| [eslint-plugin-unused-imports](https://github.com/un-ts/eslint-plugin-unused-imports) | Detects unused imports                            |
| [Prettier](https://github.com/prettier/prettier)                                      | Code formatting                                   |

### Acknowledgements

- **Google Maps** — for the public structure that makes this kind of collection possible.
- **The Puppeteer community** — for the documentation and the examples that inspired the selector reading.
- **Everyone who reports a bug and opens a pull request** — the project grows because of them.

---

## Related projects

- [Puppeteer](https://github.com/puppeteer/puppeteer) — browser automation
- [Placemark](https://github.com/janjakubnanista/placemark) — an equivalent CLI written in Node
- [Outscraper](https://outscraper.com/) — commercial maps data APIs

---

## License

Distributed under the [ISC license](./LICENSE).
