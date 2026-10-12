# Functional Requirements

## Must-have (assessed)

### 1. Product management
- Create, list, view, edit and delete products (CRUD).
- Fields: name, unique SKU, category, description, primary material, country of manufacture, image URL (optional).
- Validate required fields and unique SKU; show useful success/error feedback.

### 2. Supplier and supply-chain tracking
- CRUD suppliers with name, country and optional location/contact text.
- Add, edit, remove and order supply-chain stages for a product.
- Each stage includes stage name, supplier, country (from supplier or explicitly recorded), and order number.
- Display the ordered stages in the product detail and public passport.

### 3. Compliance certifications
- Add, edit and delete certification records associated with a product.
- Fields: certification name, issuer, certificate number, issue date, expiry date, optional evidence URL.
- Compute date-based status: **Not yet valid** if issue date is in the future; **Expired** if expiry date is before today; otherwise **Valid**. If expiry date is absent, display **No expiry provided** rather than asserting validity.
- Validate expiry date is not earlier than issue date.
- Clearly label certificates as **self-reported / not independently verified**.

### 4. Digital Product Passport
- Public route, e.g. `/passport/EGP-1001`, accessible without admin login.
- Show product information, stages in order, certification name/issuer/status, and published timestamp.
- Provide Preview and Publish/Republish controls.
- **Publishing must save a snapshot**. Admin edits after publishing must not appear publicly until republished.
- Unpublished products must not have a public DPP.

### 5. UI/UX
- Responsive layouts for desktop and mobile.
- Products list, product editor/details, supplier management, certifications editor, DPP preview, public DPP.
- Loading, empty, error and success states; consistent visual styling.

## Optional enhancements (bonus only)
- QR code generated from the public passport URL.
- Product search/filter or certificate-expiry filtering.
- Basic admin authentication (Laravel Sanctum or session auth) and route protection.
- Image upload with validation instead of image URL.
- Automated tests beyond minimum smoke tests.

## Out of scope
- Real certificate validation; official GS1 identifiers; formal EU DPP conformity; blockchain; external integrations; complex roles.
