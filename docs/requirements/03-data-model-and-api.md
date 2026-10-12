# Suggested Data Model and REST API

These are suggestions, not strict implementation requirements. Equivalent clean designs are acceptable.

## Entities

### `products`
`id`, `name`, `sku` (unique), `category`, `description`, `primary_material`, `manufacture_country`, `image_url` (nullable), timestamps.

### `suppliers`
`id`, `name`, `country`, `location` (nullable), `contact` (nullable), timestamps.

### `supply_chain_stages`
`id`, `product_id` (FK), `supplier_id` (FK), `stage_name`, `stage_order` (integer), timestamps. Prefer unique `(product_id, stage_order)`; handle reordering safely.

### `certifications`
`id`, `product_id` (FK), `name`, `issuer`, `certificate_number`, `issued_at`, `expires_at` (nullable), `evidence_url` (nullable), timestamps.

### `passport_snapshots`
`id`, `product_id` (FK, unique if storing latest only), `payload_json` (JSON), `published_at`, timestamps. A new publication may overwrite the latest snapshot or create a new version.

## Suggested endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/products` | List products |
| POST | `/api/products` | Create product |
| GET | `/api/products/{id}` | Product with stages and certifications |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |
| GET/POST | `/api/suppliers` | List/create suppliers |
| PUT/DELETE | `/api/suppliers/{id}` | Update/delete supplier |
| POST | `/api/products/{id}/stages` | Add stage |
| PUT/DELETE | `/api/stages/{id}` | Update/delete stage |
| POST | `/api/products/{id}/certifications` | Add certificate |
| PUT/DELETE | `/api/certifications/{id}` | Update/delete certificate |
| GET | `/api/products/{id}/passport-preview` | Admin draft preview |
| POST | `/api/products/{id}/publish` | Save public snapshot |
| GET | `/api/public/passports/{sku}` | Public snapshot only |

If auth is implemented, protect all admin endpoints. Public passport GET must be read-only.

## Suggested components
`ProductList`, `ProductForm`, `SupplierList`, `SupplyChainTimeline`, `CertificationTable`, `PassportPreview`, `PublicPassport`, `StatusBadge`.

## Date handling
Calculate certificate date status using the current calendar date in a clearly chosen timezone (UTC is acceptable). Consider issue and expiry dates inclusive; a certificate expires after the end of its expiry date. Do not save a permanently stale status value when it can be derived from dates. For published snapshots, store certificate dates and calculate status when displaying, so the displayed expiry status remains accurate as time passes without revealing unpublished edits.
