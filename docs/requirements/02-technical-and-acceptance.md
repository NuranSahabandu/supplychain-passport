# Technical Expectations and Acceptance Criteria

## Recommended architecture
- **Backend:** Laravel, REST API, validation using Form Requests where practical.
- **Frontend:** Vue.js with reusable components and clear routing.
- **Database:** MySQL (SQLite is acceptable for simple local demonstration if documented).
- **Source control:** Git with readable commits.

## Minimum quality expectations
- Database migrations and sample seeder or import instructions.
- Relationships rather than duplicating supplier data across stages.
- API errors returned consistently (e.g. 422 validation, 404 missing resource).
- Inputs validated on server, not only frontend.
- Do not expose private admin routes without a clear warning: if authentication is omitted, mark the application as an **unsecured demo**, run locally, and do not deploy it publicly with write access.
- No secrets or `.env` files committed; provide `.env.example`.
- Handle loading and failed requests in UI.
- Use accessible labels and sufficient contrast.

## Acceptance test cases
| ID | Action | Expected result |
|---|---|---|
| AT-01 | Create product with valid fields | Product saved and visible in list |
| AT-02 | Create second product with same SKU | Server rejects with validation message |
| AT-03 | Add 4 stages in specified order | Product and DPP show same ordered sequence |
| AT-04 | Add certificate with past expiry | Displays Expired |
| AT-05 | Add certificate with future issue date | Displays Not yet valid |
| AT-06 | Add expiry before issue date | Validation error |
| AT-07 | Open unpublished passport URL | 404 or explicit unavailable state, without draft details |
| AT-08 | Publish product | Public DPP becomes accessible |
| AT-09 | Edit product after publishing | Public DPP stays unchanged |
| AT-10 | Republish product | Public DPP reflects approved changes |
| AT-11 | Open unknown SKU | Friendly 404 / not found |
| AT-12 | Open DPP on phone-sized viewport | Content remains usable without horizontal overflow |

## Important implementation note
Store a serialized JSON snapshot of the public fields at publish time (e.g. `passport_snapshots.payload_json`, `published_at`) or an equivalent immutable published representation. The public API must read this snapshot, **not** current editable tables.
