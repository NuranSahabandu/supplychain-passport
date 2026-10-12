# Visual Design Guide

## Colour palette
| Role | Hex | Usage |
|---|---|---|
| Primary purple | `#473068` | Headers, primary actions, active navigation |
| Deep purple | `#2E1E46` | Headings and dark surfaces |
| Teal accent | `#70D0CE` | Highlights, timeline markers |
| Soft lavender | `#F4F0F8` | Section backgrounds |
| White | `#FFFFFF` | Cards and main surfaces |
| Slate text | `#263238` | Main text |
| Muted grey | `#667085` | Secondary text |
| Success green | `#16794A` | Valid certification |
| Warning amber | `#9A6100` | Not yet valid / no expiry |
| Error red | `#B42318` | Expired / validation errors |
| Border | `#E4E7EC` | Card edges and dividers |

**CSS variables:**
```css
:root {
  --primary: #473068;
  --primary-dark: #2E1E46;
  --accent: #70D0CE;
  --surface-soft: #F4F0F8;
  --surface: #FFFFFF;
  --text: #263238;
  --muted: #667085;
  --success: #16794A;
  --warning: #9A6100;
  --danger: #B42318;
  --border: #E4E7EC;
}
```

## Suggested layout
- **Admin:** left sidebar on desktop, collapsible navigation on mobile; top bar with app name.
- **Products page:** search (optional), product cards/table, prominent Add Product action.
- **Product detail:** Overview | Supply Chain | Certifications | Passport tabs or sections.
- **Supply-chain timeline:** numbered vertical stages on mobile; horizontal or vertical on desktop.
- **Certifications:** table/cards with issuer, number, date range, clear status badge.
- **Public DPP:** hero with product name, SKU and image; product details; traceability timeline; certification section; last published date and self-reported disclaimer.

## Example public DPP wireframe
```text
+--------------------------------------------------+
| SupplyChain Passport            Product Passport |
+--------------------------------------------------+
| [Product image]  EcoGrip Pro                     |
|                  SKU: EGP-1001                   |
|                  Protective Gloves              |
+--------------------------------------------------+
| PRODUCT OVERVIEW                                 |
| Material: Recycled polyester and nitrile         |
| Made in: Sri Lanka                               |
+--------------------------------------------------+
| SUPPLY CHAIN                                     |
| 1 Fibre sourcing -> 2 Fabric -> 3 Assembly       |
|                  -> 4 Distribution               |
+--------------------------------------------------+
| CERTIFICATIONS                                   |
| ISO 9001   [Valid]                               |
| Sample Cert [Expired]                            |
| Self-reported; not independently verified        |
+--------------------------------------------------+
| Last published: [timestamp]                      |
+--------------------------------------------------+
```

## Accessibility
- Never communicate certificate status through colour alone; include text.
- Aim for WCAG AA contrast for text; dark text on teal is preferable to white text on teal.
- Ensure keyboard focus indicators, semantic headings and mobile-friendly tap targets.
- Fonts: Inter, system UI or another readable sans-serif.
