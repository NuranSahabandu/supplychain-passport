# Problem Statement

## Background
Modern brands need to understand where their products come from, which suppliers contribute to them, and whether relevant compliance documents are valid. Information is often scattered across spreadsheets, emails, and separate supplier systems. Customers also have limited access to trustworthy product information.

A **Digital Product Passport (DPP)** is a digital view of product information that can be shared using a link or QR code. For this assignment, the DPP is a simplified educational implementation, **not a claim of legal or regulatory compliance**.

## The challenge
Create **SupplyChain Passport**, a responsive application for a fictional reusable work glove called **EcoGrip Pro**. A company administrator must be able to:

1. Register and update products.
2. Add suppliers and ordered supply-chain stages.
3. Record compliance certifications, including issuer, reference number, issue date, expiry date and status.
4. Publish a read-only DPP page showing approved product information, traceability and certification status.

Customers should be able to view a published DPP without signing in. Internal draft data must not become public automatically.

## Users
- **Company Admin:** maintains product, suppliers, stages and certifications; publishes DPP.
- **Customer:** opens a public passport and views published details.

## Expected outcome
A working, documented, easy-to-run mini application demonstrating basic frontend, backend, database design, validation, and thoughtful user experience.

## Boundaries
- One organization is enough; multi-tenant permissions are not required.
- Certification records are self-declared sample data, not verified against external registries.
- No payment gateway, IoT, blockchain, AI, or external ERP integration is needed.
- A simple publish snapshot is sufficient; full version history is optional.
