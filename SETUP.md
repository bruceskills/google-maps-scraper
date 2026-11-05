# Setup

Complete installation, configuration and troubleshooting guide for **Google Maps Scraper**.

---

## 1. Requirements

| Item              | Version | How to check                              |
| ----------------- | ------- | ----------------------------------------- |
| Node.js           | `>= 20` | `node -v`                                 |
| npm               | `>= 10` | `npm -v`                                  |
| Chrome / Chromium | recent  | `which google-chrome \|\| which chromium` |

> Node 20+ is required because the project uses native Node modules (`module: node20`) and the bundle is generated for `node20`.

---

## 2. Installation

```bash
git clone https://github.com/bruceskills/google-maps-scraper.git
cd google-maps-scraper
npm install
```

`npm install` downloads Puppeteer, which already ships its own Chrome — but the project uses the **system Chrome** (see step 4).

---

## 3. Configure the `.env`

```bash
cp .env.example .env
```

The `.env` file is **mandatory**: the CLI loads the variables with `dotenv` on startup and fails with `Config file not found` when it is missing.

Initial content:

```env
GOOGLE_MAPS_URL=https://www.google.com/maps/search/
CHROME_ARGS="--no-sandbox --disable-dev-shm-usage --disable-gpu --disable-setuid-sandbox --disable-webgl --disable-features=TranslateUI,BackgroundNetworking,Sync --start-maximized"
```

| Variable          | Required | Description                                             |
| ----------------- | -------- | ------------------------------------------------------- |
| `GOOGLE_MAPS_URL` | no       | Base URL used for the searches                          |
| `CHROME_ARGS`     | no       | Chromium flags (separated by spaces, inside the quotes) |
| `CHROME_PATH`     | no       | Path of the browser executable                          |

The `.env` is listed in `.gitignore` — it must never be committed.

---

## 4. Detect the browser

```bash
npm run find-chrome
```

Expected output:

```
Browser detected: google-chrome -> /usr/bin/google-chrome
CHROME_PATH saved in /home/user/google-maps-scraper/.env
```

The script tests, **in this order**:

1. `which google-chrome`
2. `which google-chrome-stable`
3. `which chromium-browser`
4. `which chromium`

If none of them exists, it scans the `PATH` manually and, if it still fails, prints an error and exits with code `1`.

Other modes:

```bash
node find-chrome.mjs --print     # only prints the path
node find-chrome.mjs --no-write  # detects without touching the .env
```

---

## 5. Validate the environment

```bash
npm run type-check   # tsc6 --noEmit
npm run lint         # eslint .
npm run build        # generates dist/
```

Then register the command globally and check the help output:

```bash
npm link
google-maps-scraper --help
```

---

## 6. First run

```bash
npm run dev -- -t "pet shop" -d "Jardim Ademar" -c "São Paulo" -s SP -l 20 --fetch-phone-details --headless
```

Or, using the bundle:

```bash
npm run build
npm run start -- -t "pet shop" -d "Jardim Ademar" -c "São Paulo" -s SP -l 20 --fetch-phone-details --headless
```

The file `pet-shop-jardim-ademar-sao-paulo-sp.json` is created in the current directory.

> **Note:** the `--` after `npm run dev` / `npm run start` is required. Without it, npm consumes the flags and the command fails.

---

## 7. Troubleshooting

### `Error: Config file not found: /path/to/.env`

The `.env` does not exist in the current directory. Run `cp .env.example .env` from the project root.

### `ASCII art file not found: .bruce.art`

The splash is searched from the **current directory** (and up to 5 levels above it) inside `public/`. If you ran the command from another directory the file is not found — the message is only informational and the collection continues normally. To install the banner globally, run `npm link` from the project root.

### `Error starting browser` / `Failed to launch the browser process`

The browser path is wrong or the executable does not exist:

```bash
npm run find-chrome
```

To force a specific path:

```env
CHROME_PATH=/usr/bin/chromium-browser
```

### `No usable sandbox!` or `Running as root without --no-sandbox`

In containers and as root, keep `--no-sandbox` in `CHROME_ARGS` (it is there by default). If you removed it, add it back to the `.env`.

### The search returns no results

- Check the query in the browser: the URL is built as `term near district, city ST`.
- Try to increase the delay between scrolls: `--scroll-delay 2500`.
- Increase the maximum number of scrolls: `--max-scrolls 100`.
- Google may show a CAPTCHA after several requests — slow down.

### Phone numbers come back as `N/A`

Many listings do not show the phone number. Use `--fetch-phone-details` to open the cards. To speed it up, increase the pool:

```bash
--fetch-phone-details --pool-size 5
```

Every worker of the pool is a full browser — use it in moderation.

### The run is slow

The cost comes from the scroll time and the phone lookup. Adjust:

| Flag                 | Effect                                                      |
| -------------------- | ----------------------------------------------------------- |
| `--scroll-delay 500` | Less waiting between scrolls (higher risk of missing items) |
| `--max-scrolls 20`   | Limits the number of scroll iterations                      |
| `--limit 50`         | Reduces the final amount of results                         |

### `error TS5108: Option 'esModuleInterop=false' has been removed`

Do not edit the compiler flags by hand — the project uses the stable TypeScript 6 release (the `typescript` alias pointing to `@typescript/typescript6`), exposed through the `tsc6` binary.

---

## 8. Logs

Logs are written to `logs/`:

| File                | Content      |
| ------------------- | ------------ |
| `logs/error.log`    | Errors only  |
| `logs/combined.log` | Full history |

The level can be changed through an environment variable:

```env
LOG_LEVEL=debug
```

The `logs/` folder is ignored by Git.

---

## 9. Global installation (optional)

```bash
npm link
google-maps-scraper --help
```

`npm link` creates a global symlink pointing to the `dist/` of this copy of the project. To remove it:

```bash
npm unlink -g google-maps-scraper
```

---

## 10. Updating

```bash
git pull
npm install
npm run build
```

If the browser flags change in `.env.example`, copy the file again (`cp .env.example .env`, or update only the `CHROME_ARGS` line) and run `npm run find-chrome` once more.
