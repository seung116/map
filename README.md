# Korea Travel Map

## Local run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

This repository is set up for GitHub Pages.

1. Push changes to `main`.
2. In GitHub repository settings, enable Pages deployment from GitHub Actions if prompted.
3. Every push to `main` will build and deploy automatically.

## Shared storage

If you want records to sync across phones, create a Firebase project on the free Spark plan, enable Firestore, and set the values from `.env.example` in a local `.env` file.
