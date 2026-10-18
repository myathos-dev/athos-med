# Athos Med

A telehealth portal (in progress) where patients order peptides and other medications through **sync** (live) or **async** visits, built on [Medplum](https://github.com/medplum/medplum).

> **Mock data only.** Products in `mock-data/` are sample data. This project does not store or process real patient or health information.

## Status

The app starts from my Athos CRM: three sales pages (Sales Hub, Lead Queue, Leads Dashboard) moved off Softr into a standalone Node.js web app. Turning it into the telehealth portal is the work in [ROADMAP.md](ROADMAP.md).

## Who it's for

- **Patients**: browse products and order through a sync or async visit.
- **Clinicians**: run visits and review orders.

## Built with

- **Node.js + Express**: web server and API (`server/`)
- **React + Vite**: web interface (`src/`)
- **TanStack Query** and **sonner**: data loading and notifications
- **Medplum** (`external/medplum`, git submodule): the backend for patients, visits and orders

## Project layout

```
server/            Express server: API routes, serves the web app
src/
  App.jsx          Page routing
  blocks/          The app's pages (SalesHub, WorkQueue, LeadsDashboard)
  lib/             Data and user hooks the pages use
mock-data/         Mock product catalog
external/
  medplum/         Medplum (git submodule)
```

## Run it

Requirements: Node.js 20 or newer.

```bash
git clone --recurse-submodules https://github.com/myathos-dev/athos-med.git
cd athos-med
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:3000.

For a production build:

```bash
npm run build
npm start
```

### Configuration

Settings go in `.env` (copied from `.env.example`). Never commit `.env`.

| Variable | What it does |
|---|---|
| `PORT` | Port the app runs on (default 3000) |
| `DEV_USER_ID`, `DEV_USER_NAME`, `DEV_USER_EMAIL` | Local development user |
| `DEV_USER_ROLE` | `Admin` sees all records; any other value sees only records assigned to that user |

## License

[GNU Affero General Public License v3.0](LICENSE).

Medplum is a separate project included as a git submodule, under its own license (Apache 2.0).
