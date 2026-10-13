# SupplyChain Passport

Product traceability and a public **Digital Product Passport (DPP)** for a fictional work glove, *EcoGrip Pro*.

An admin registers a product, records its supply-chain journey, manages its compliance certificates and
publishes a customer-facing passport. Customers open the passport by link or QR code, with no login.

> ⚠ **Unsecured demo: there is no login.** Run it locally only; do not deploy it publicly.

## Features

**Must-have**
- **Products:** create, list, view, edit and delete, with server-side validation and unique SKUs.
- **Suppliers:** create, edit and delete. A supplier that is used in a supply-chain stage cannot be deleted (409 with a clear message).
- **Supply chain:** ordered stages per product, each carried out by a supplier. Add, edit, remove and move stages up/down.
- **Certifications:** name, issuer, number, issue/expiry dates and an evidence link. The status is **derived from the dates**: `Valid`, `Expired`, `Not yet valid` or `No expiry provided`.
- **Digital Product Passport:** preview the draft, publish it, then share the public link `/passport/<SKU>`.
  The public page only shows the **published snapshot**, so editing a product changes nothing publicly until you republish.
- **UI:** responsive layout from 360px phones to desktop, with loading, empty, error and success states on every screen.

**Bonus**
- Product search (name, SKU, category).
- QR code for the public passport link, with an SVG download.
- "Unpublished changes" notice when the draft differs from the published passport.

## Tech stack

| Part | Technology |
|---|---|
| API | Node.js 22, Express 5 (ES modules), Knex + mysql2, Zod for validation |
| Database | MySQL 8.4 |
| Frontend | React 19, Vite, React Router, plain CSS |
| Extra package | `qrcode.react` (QR code) |

The brief recommends Laravel + Vue. This project uses the equivalent Node/Express + React stack.

## Prerequisites

- **Node.js 22** or newer (`node -v`)
- **MySQL 8.4** (`mysql --version`), running locally
- **Git**

## Setup

### 1. Clone and install

```bash
git clone <repository-url>
cd supplychain-passport

cd server && npm install
cd ../client && npm install
cd ..
```

### 2. Create the database and user

`server/src/db/setup.sql` creates the `supplychain_passport` database and a local user
`scp_user` / `scp_password` that can only access that database.

```bash
mysql -u root -p < server/src/db/setup.sql
```

### 3. Configure the API

```bash
cp server/.env.example server/.env
```

Fill in `server/.env` (these values match `setup.sql`):

```ini
PORT=4000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=supplychain_passport
DB_USER=scp_user
DB_PASSWORD=scp_password
```

The client needs no configuration. In development, Vite forwards every `/api/...` request to
`http://localhost:4000` (see `client/vite.config.js`). If you change `PORT`, update that proxy too.

### 4. Create the tables and load the demo data

```bash
cd server
npm run migrate   # creates the 5 tables
npm run seed      # loads EcoGrip Pro, its 4 suppliers/stages and 3 certificates
```

> `npm run seed` **deletes all existing data** before inserting the demo data.
> `npm run db:reset` rolls back every migration, migrates again and seeds: a full clean start.

## Running the app

Use two terminals.

```bash
# Terminal 1: API on http://localhost:4000
cd server
npm run dev
```

```bash
# Terminal 2: website on http://localhost:5173
cd client
npm run dev
```

Then open:

| Page | URL |
|---|---|
| Admin (no login) | http://localhost:5173/admin/products |
| Public passport (after publishing) | http://localhost:5173/passport/EGP-1001 |
| API health check | http://localhost:4000/api/health |

**Demo login:** none. The admin area is open, which is why the app must only run locally.

The seed does **not** publish the passport. Open *EcoGrip Pro → Passport* and click **Publish** first.
Until then, the public URL shows a friendly "Passport not available" page.

## Demo data

Based on `sample-product.json` and `sample-certifications.csv` from the brief (fictional data only):

- **Product:** EcoGrip Pro, SKU `EGP-1001`
- **Supply chain:** fibre sourcing → fabric production → glove assembly → distribution (4 suppliers in Sri Lanka and the UK)
- **Certificates:** one expired, one valid and one with a future issue date. Together they show three of the four statuses.

## Testing

```bash
cd server
npm test        # unit tests for the certificate status rules (node:test)
```

The tests cover the date rules: UTC, both dates inclusive, a future issue date and a missing expiry.

- **API by hand:** `server/requests.http` has a request for every endpoint, including the 404/409/422 cases.
  Open it in VS Code with the REST Client extension.
- **Frontend checks:** `cd client && npm run lint` (oxlint) and `npm run build`.

## Project structure

```
server/
  src/
    routes/        URL → controller, with validation middleware on POST/PUT
    controllers/   handle one request each
    services/      shared logic (product detail, stages, passport snapshot)
    validators/    Zod schemas (shared helpers in common.js)
    middleware/    validate() and the error handler
    utils/         certificateStatus, findOrFail, HttpError, dates
    db/            migrations, seeds, setup.sql
  tests/           node:test unit tests
  requests.http    manual API requests
client/
  src/
    pages/         one file per screen (product tabs in pages/product-tabs/)
    components/    shared UI: TextField, SelectField, StatusBadge, PassportView, state components
    layouts/       AdminLayout (top bar, demo warning, responsive sidebar)
    api/client.js  the only place that calls fetch()
    hooks/         useFetch (loading / error / data)
    index.css      palette variables and all styles
```

## API

All endpoints are under `/api`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | API and database check |
| GET, POST | `/products` | List / create products |
| GET, PUT, DELETE | `/products/:id` | One product (GET includes stages and certificates with status) |
| GET, POST | `/suppliers` | List (with `stage_count`) / create suppliers |
| GET, PUT, DELETE | `/suppliers/:id` | One supplier (DELETE → 409 if used in a stage) |
| POST | `/products/:productId/stages` | Add a stage at the end |
| PUT | `/products/:productId/stages/order` | Save a new stage order (`{ stage_ids: [...] }`) |
| PUT, DELETE | `/stages/:id` | Edit / remove a stage |
| POST | `/products/:productId/certifications` | Add a certificate |
| PUT, DELETE | `/certifications/:id` | Edit / delete a certificate |
| GET | `/products/:id/passport-preview` | Draft passport + publication info |
| POST | `/products/:id/publish` | Publish (save a snapshot) |
| GET | `/public/passports/:sku` | Public passport, read from the snapshot only (404 if unknown or unpublished) |

**Error format:** validation errors return **422** `{ message, errors: { field: [messages] } }`.
Missing records return **404** `{ message }`, and conflicts return **409** `{ message }`.

## Architecture decisions

- **Published snapshot.** Publishing copies the public fields into `passport_snapshots.payload_json`.
  The public endpoint reads **only** that snapshot, never the live tables. This is why editing after publishing
  doesn't change the public page until you republish (AT-09, AT-10).
- **Status is derived, never stored.** Certificate status depends on today's date, so it is calculated on every
  read by one function (`server/src/utils/certificateStatus.js`), using UTC with both dates inclusive.
  The snapshot stores the dates, not the status, so a published certificate still turns "Expired" on time.
  The frontend never calculates status; it only displays what the API sends.
- **Suppliers are referenced, not copied.** Stages store a `supplier_id`. A supplier's details live in one place,
  and the database blocks deleting a supplier that is still used (`ON DELETE RESTRICT`).
- **Only public fields are published.** Internal ids, timestamps and supplier contact details are left out of the snapshot.
- **One passport component.** `PassportView` renders both the admin preview and the public page, so they cannot drift apart.
- **Validation on the server, always.** Zod schemas check every POST/PUT, and the forms show the server's messages under each field.
- **Accessibility.** Status is never shown by colour alone (each badge has text and a symbol). Text meets WCAG AA contrast,
  focus outlines are visible, tap targets are 44px, and the HTML is semantic.

## Known limitations

- **No authentication.** Anyone who can reach the app can edit data, so it must not be deployed.
- **Certificates are self-reported.** They are labelled "not independently verified", and no certification body is checked.
- **The QR code uses the current address.** It encodes the URL the admin is using (e.g. `http://localhost:5173/...`),
  so a phone can't open it while the app runs on localhost.
- **Images are links only.** A product image is a URL; there is no file upload.
- **No version history.** Each publish replaces the previous snapshot.
- **Limited automated tests.** Only the certificate status rules have unit tests; the API and UI were tested by hand
  (`requests.http` and the acceptance tests in the brief).

## AI tools used

Claude Code (Anthropic) was used as a coding assistant: planning, drafting code and reviewing it.
Every change was reviewed, tested and committed by me, and I can explain all of the code.
