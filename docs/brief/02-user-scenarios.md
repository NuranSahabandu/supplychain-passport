# Sample User Scenarios

## Scenario A — Create a product
**As** a company administrator, **I want** to add EcoGrip Pro with SKU `EGP-1001`, category `Protective Gloves`, material `Recycled polyester and nitrile`, and a description, **so that** I can manage its supply-chain records.

**Steps:** Sign in (or access a clearly marked demo admin screen) → Products → Add Product → fill fields → Save.

**Expected:** Product appears in list; required-field errors are displayed; duplicate SKU is rejected.

## Scenario B — Build the supply chain
**As** an administrator, **I want** to add suppliers and assign them to ordered stages, **so that** a customer can understand the product journey.

**Example:** Recycled fibre sourcing (GreenFibre Ltd, Sri Lanka) → Fabric production (LankaTex Mills, Sri Lanka) → Glove assembly (SafeHands Manufacturing, Sri Lanka) → Distribution (GlobalWork Logistics, UK).

**Expected:** Stages show in their saved order with supplier and country; missing stage names or invalid ordering are handled.

## Scenario C — Manage certifications
**As** an administrator, **I want** to record an ISO 9001 certificate and an expired sample certificate, **so that** validity is clearly visible.

**Expected:** A certificate shows `Valid`, `Expired`, or `Not yet valid` based on issue/expiry dates (using the current date). The application does **not** claim the certification has been externally authenticated.

## Scenario D — Publish a passport
**As** an administrator, **I want** to publish the completed product information, **so that** customers can access a stable public view.

**Steps:** Open product → Preview → Publish → copy public URL.

**Expected:** Public page displays product details, ordered stages, certification summaries, and last published date. Later admin edits remain private until the administrator republishes.

## Scenario E — Customer views DPP
**As** a customer, **I want** to open a public product link on my phone, **so that** I can understand product origin and certification status.

**Expected:** Mobile-friendly page loads without login. Draft/unpublished products are inaccessible from the public endpoint. An unknown identifier gives a useful 404 state.

## Scenario F — Republish
**As** an administrator, **I want** to correct a supplier and republish, **so that** the public passport shows the newly approved details.

**Expected:** The previous public view stays unchanged until republishing; after republishing, it updates.
