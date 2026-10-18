# Next.js i18n with a GitHub Action

This repo shows how to translate a Next.js app's next-intl JSON messages automatically on every pull request with a GitHub Action. You add English strings to `messages/en.json` in a pull request. The [Localhero.ai](https://localhero.ai) action translates the new keys into Swedish, Polish and German and commits them to the same branch.

## How it works

The app is one Next.js App Router page using [next-intl](https://next-intl.dev), with a JSON file per locale in `messages/`. `localhero.json` sets English as the source and `sv`, `pl` and `de` as targets. When a pull request touches `messages/`, the workflow in `.github/workflows/localhero-translate.yml` compares the branch with its base and translates only the keys that are new or changed. ICU plurals get the forms each language needs. An English `one`/`other` message comes back in Polish with `one`, `few`, `many` and `other`. A separate CI workflow builds the app and fails if any locale is missing a key, an argument or a plural form.

## Setup

1. In your Next.js project, run `npx @localheroai/cli init`. It detects next-intl, suggests `messages/` as the path and writes `localhero.json`.
2. Let `init` create `.github/workflows/localhero-translate.yml`, or copy [the one in this repo](.github/workflows/localhero-translate.yml).
3. Get an API key at [localhero.ai/api-keys](https://localhero.ai/api-keys) and add it as the repository secret `LOCALHERO_API_KEY` (Settings → Secrets and variables → Actions).
4. Install the [Localhero.ai GitHub App](https://localhero.ai/docs/github-app). Without it the translation commit is pushed with `GITHUB_TOKEN` and GitHub won't start your other workflows on it.

## What a translation pull request looks like

Say a pull request adds this to `messages/en.json`:

```json
"pendingInvites": "{count, plural, one {# pending invite} other {# pending invites}}"
```

The `Translations complete` check fails first: `sv`, `pl` and `de` don't have the key yet. The action then pushes a commit titled `Update translations` to the branch, with the key added to all three files. In `messages/pl.json` it looks like this:

```json
"pendingInvites": "{count, plural, one {# oczekujące zaproszenie} few {# oczekujące zaproszenia} many {# oczekujących zaproszeń} other {# oczekującego zaproszenia}}"
```

It also comments on the pull request with a link to review the translations on Localhero.ai. CI runs again on the new commit and passes. Edits made during review are synced back to the branch as a `Sync translations` commit.

Add the `skip-translation` label to a pull request to skip it. Draft pull requests are skipped too.

## Run it locally

```bash
npm install
npm run dev                  # http://localhost:3000/en, /sv, /pl, /de
npm run check:translations   # the same check CI runs
```

`scripts/check-translations.mjs` parses every message with [@formatjs/icu-messageformat-parser](https://formatjs.github.io/docs/icu-messageformat-parser/) and compares each target with `en.json`. Delete a key from `messages/pl.json` or drop the `few` form from a plural and it exits with an error.

## More

The full guide for React, Next.js and other JSON setups is at [localhero.ai/docs/react](https://localhero.ai/docs/react).

## License

MIT
