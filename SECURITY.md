# Security Policy

Thank you for taking the security of **Google Maps Scraper** seriously. This page explains how to report a vulnerability and what to expect from each side.

---

## Supported versions

| Version | Receives security fixes |
| ------- | ----------------------- |
| `1.0.x` | Yes                     |
| `< 1.0` | No                      |

---

## Reporting a vulnerability

**Do not open a public issue** for security problems — public issues are visible to everyone and can be exploited before a patch exists.

Use one of the private channels:

1. **GitHub Security Advisories** (recommended) — _Security_ tab of the repository, _Report a vulnerability_ button.
2. **Email** — [bruceskills@gmail.com](mailto:bruceskills@gmail.com) with the subject `[SECURITY]`.

### What to include

- Description of the vulnerability and its estimated impact
- Steps to reproduce (command, flags and environment)
- Version of the package, of Node and of the browser
- Relevant logs or output, with personal data removed
- A suggested fix, if you have one

### What happens next

| Stage                                 | Deadline                 |
| ------------------------------------- | ------------------------ |
| Acknowledgement of receipt            | within 48 hours          |
| Initial assessment and classification | within 7 days            |
| Fix and release                       | agreed with the reporter |

The reporter is kept informed throughout the process. The issue is published together with the fix, with the credits you prefer (or anonymously, if that is your choice).

---

## What is not a vulnerability

- The expected behaviour of the scraper (collecting data from public pages).
- Network failures, Google timeouts or CAPTCHAs — these are limitations of the target, not defects in the code.
- Imprecise or incomplete results (address, phone number, category).
- The need to adjust the Chromium flags for a specific environment.
- Using collected data in breach of the LGPD/GDPR or of the Google Terms of Service: that is a usage problem, not a technical flaw.

---

## Best practices for users

- **Do not share your `.env`** — it may contain tokens and internal routes.
- **Do not commit results with personal data** about private individuals beyond what is needed (the `.gitignore` already ignores the JSON files generated in the project root).
- **Treat the collected data as PII** — apply the LGPD: legal basis, purpose, minimisation and retention period.
- **Do not use the scraper for spam, discrimination or re-identification.**
- **Keep the package up to date** — `npm update` / `npm audit`.

---

## Responsible use

Automating access to public pages is a common practice, but it is not an automatic authorization. Respect:

- the [Google Terms of Service](https://policies.google.com/terms);
- the applicable data protection law (LGPD, GDPR);
- the rights of the owners of the data being collected.

The maintainer is not responsible for misuse of the tool.

---

## Contact

Security questions that are **not** vulnerabilities can be sent to
[bruceskills@gmail.com](mailto:bruceskills@gmail.com).
