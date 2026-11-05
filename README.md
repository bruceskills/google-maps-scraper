# Google Maps Scraper

CLI that extracts business listings from **Google Maps** by search term and region, saving the result to JSON.

Every run builds the search URL (`term near district, city ST`), scrolls the results page until the requested limit is reached, collects the data of each listing and — optionally — opens the cards to recover phone numbers that are not shown in the list.

```bash
npm run dev  -- -t "pet shop" -d "Jardim Ademar" -c "São Paulo" -s SP -l 20 --fetch-phone-details --headless
npm run start -- -t "pet shop" -d "Jardim Ademar" -c "São Paulo" -s SP -l 20 --fetch-phone-details --headless


npm link
google-maps-scraper --help
```

---

## Features

- **Region aware search** — builds the query with term, district, city and state.
- **Smart scrolling** — scrolls until the result limit is met, with stall detection (it stops when the list stops growing).
- **Complete extraction** — name, category, address, phone, website, latitude, longitude, place URL and `dataId`.
- **Phone recovery** — with `--fetch-phone-details`, opens each card and reads the contact button; uses a pool of browsers in parallel to speed things up.
- **Live progress** — progress bar in the terminal while phones are being fetched.
- **JSON output** — file named automatically (`<term>-<district>-<city>-<state>.json`).
- **Structured logs** — Winston on the console plus files under `logs/`.
- **ASCII splash** — banner loaded from `public/.bruce.art`.

---

## Requirements

| Item              | Version                                     |
| ----------------- | ------------------------------------------- |
| Node.js           | `>= 20`                                     |
| npm               | `>= 10`                                     |
| Chrome / Chromium | any recent version (detected automatically) |

Full setup details: [SETUP.md](./SETUP.md)

---

## Getting started

### 1. Install the dependencies

```bash
git clone https://github.com/bruceskills/google-maps-scraper.git
cd google-maps-scraper
npm install
```

### 2. Configure the environment

```bash
cp .env.example .env
npm run find-chrome
```

`find-chrome` looks for the browser installed on the system (`google-chrome`, `google-chrome-stable`, `chromium-browser` or `chromium`) and writes the path to `CHROME_PATH` in the `.env` file.

### 3. Run

```bash
npm run dev -- -t "pet shop" -d "Jardim Ademar" -c "São Paulo" -s SP -l 20 --fetch-phone-details --headless
```

### 4. Install as a global command (optional)

```bash
npm link
google-maps-scraper --help
```

---

## CLI options

| Option                          | Description                                        | Default |
| ------------------------------- | -------------------------------------------------- | ------- |
| `-t, --term <value>`            | Search term (e.g. `pet shop`)                      | —       |
| `-d, --district <value>`        | District                                           | —       |
| `-c, --city <value>`            | City                                               | —       |
| `-s, --state <value>`           | State (UF)                                         | —       |
| `-l, --limit <number>`          | Maximum number of results                          | `50`    |
| `--scroll-delay <number>`       | Delay between scrolls (ms)                         | `1000`  |
| `--max-scrolls <number>`        | Maximum number of scrolls                          | `50`    |
| `--fetch-phone-details`         | Open each card to look for the phone number        | `false` |
| `--detail-fetch-delay <number>` | Delay between card clicks (ms)                     | `1000`  |
| `--pool-size <number>`          | Size of the browser pool used by the parallel mode | `3`     |
| `--headless`                    | Run the browser without a visible window           | `true`  |
| `-V, --version`                 | Package version                                    | `1.0.0` |
| `-h, --help`                    | CLI help                                           | —       |

The descriptions above are the ones currently printed by `--help` (the CLI help text is written in Portuguese).

> The `--` after `npm run dev` / `npm run start` is required: it forwards the flags to the script instead of to npm.

---

## Output

The result is written to the current directory as `<term>-<district>-<city>-<state>.json`:

```json
[
  {
    "url": "https://www.google.com/maps/search/?q=pet+shop+perto+de+Jardim+Ademar%2C+S%C3%A3o+Paulo+SP",
    "query": "pet shop perto de Jardim Ademar, São Paulo SP",
    "term": "pet shop",
    "district": "Jardim Ademar",
    "city": "São Paulo",
    "state": "SP",
    "title": "Pet Shop Du Amigos",
    "type": "Pet Shop",
    "address": "R. Luís Stolb, 400",
    "phone": "(11) 91326-7527",
    "latitude": "-23.6748763",
    "longitude": "-46.6419279",
    "placeUrl": "https://www.google.com/maps/place/Pet+Shop+Du+Amigos/data=!4m7!...",
    "dataId": "0x94ce45455269c1f3:0x8ce784fb339a44b9"
  }
]
```

Fields of each entry:

| Field                    | Description                                   |
| ------------------------ | --------------------------------------------- |
| `title`                  | Business name                                 |
| `type`                   | Category ("Pet Shop", "Veterinary Clinic"...) |
| `address`                | Street address                                |
| `phone`                  | Normalized phone `(DDD) 99999-9999` or `N/A`  |
| `website`                | Website (when listed)                         |
| `latitude` / `longitude` | Coordinates                                   |
| `placeUrl`               | Place URL on Maps                             |
| `dataId`                 | Place identifier                              |
| `url` / `query`          | URL and query used for the search             |

---

## Project structure

```
src/
├── browser/
│   ├── browser-manager.ts     # Puppeteer instance, heavy resource blocking
│   └── scroll-handler.ts      # scrolling through the results page
├── config/
│   ├── constants.ts           # defaults + Chrome flags loaded from .env
│   └── logger.ts              # Winston (console + files)
├── scraper/
│   ├── google-maps-scraper.ts # orchestrates the scraping flow
│   └── parallel-phone-fetcher.ts # browser pool used to fetch phone numbers
├── types/
│   └── index.ts               # contracts (Place, SearchOptions, ScraperResult...)
├── utils/
│   ├── ascii-art.util.ts      # terminal splash
│   ├── detail-fetcher.ts      # phone number from the detail panel
│   ├── parser.ts              # listing extraction
│   ├── phone.ts               # Brazilian phone normalization
│   ├── url-builder.ts         # search URL builder
│   └── validation.ts          # filter validation
├── main.ts                    # CLI entrypoint
public/
└── .bruce.art                 # ASCII banner
```

---

## Scripts

| Script                | Description                                                        |
| --------------------- | ------------------------------------------------------------------ |
| `npm run dev`         | Runs the CLI in watch mode (tsx)                                   |
| `npm run find-chrome` | Detects the system browser and writes `CHROME_PATH` to the `.env`  |
| `npm run build`       | Validates types (`tsc6 --noEmit`) and bundles the project (`tsup`) |
| `npm run start`       | Runs the bundle generated in `dist/`                               |
| `npm run type-check`  | Type checking only                                                 |
| `npm run lint`        | ESLint over the whole project                                      |
| `npm run lint:fix`    | ESLint with auto-fix                                               |
| `npm run format`      | Prettier over `src/`, the root `.mjs` files and the docs           |

---

## Environment variables

| Variable          | Required | Description                                                |
| ----------------- | -------- | ---------------------------------------------------------- |
| `GOOGLE_MAPS_URL` | no       | Base URL used for the searches (default in `.env.example`) |
| `CHROME_ARGS`     | no       | Chromium flags, separated by spaces                        |
| `CHROME_PATH`     | no       | Path of the browser executable (use `npm run find-chrome`) |

---

## Responsible use

This project automates access to public Google Maps pages. Use it in compliance with the [Google Terms of Service](https://policies.google.com/terms), the applicable law (LGPD/GDPR) and the rights of the businesses being collected. Do not use the data for spam, discrimination or the re-identification of individuals.

---

## Documentation

- [SETUP.md](./SETUP.md) — installation and troubleshooting
- [CONTRIBUTING.md](./CONTRIBUTING.md) — how to contribute
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) — code of conduct
- [SECURITY.md](./SECURITY.md) — security policy
- [CREDITS.md](./CREDITS.md) — credits and dependencies
- [LICENSE](./LICENSE) — ISC license

---

## Author

**Bruno César ([@bruceskills](https://github.com/bruceskills))** — [bruceskills@gmail.com](mailto:bruceskills@gmail.com)

## License

[ISC](./LICENSE)
