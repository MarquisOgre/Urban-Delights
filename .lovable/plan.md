# Integrated Ecommerce, Customers, Invoices, and Delivery

## What will be built

### Pricing Manager and storefront products
- Add tabs to Pricing Manager: **Recipe Pricing** and **Store Products**.
- Make recipe pricing the single source for storefront product names, enabled pack sizes, quantities, and prices.
- Replace the storefront’s fixed nine-product catalogue dependency: show enabled recipes assigned to storefront categories with configured pricing.
- Automatically create standard pack-price rows when a recipe is added to Pricing Manager, and refresh storefront prices immediately after edits.
- Keep product images, descriptions, categories, featured selections, and the public-store preview accessible in Store Products.

### Guest checkout and Customer Details
- Keep checkout open without customer sign-in.
- Save each customer’s name, phone, email, address, and notes with storefront orders.
- Add an admin-only **Customer Details** page showing contact information, order count, latest order, and total purchased, accessible from Orders.
- Ensure storefront checkout creates standard orders and items, so they appear in Orders and support editing and invoicing.

### Invoice improvements
- Print subtotal, discount percentage and amount, tax rate and amount, and final total.
- Print order notes in a dedicated section when present.
- Preserve the current logo, business details, and A4 print/PDF layout.

### Delivery Tracking
- Add expected delivery date and actual delivered date to each order.
- Add an admin-only **Delivery Tracking** page with order, customer, current status, expected date, actual date, and quick editing.
- Link each Orders row to its delivery record.
- Automatically set the actual date when marked delivered, while allowing admin correction.

## Technical details
- Apply one Lovable Cloud migration for customer records, order-to-customer linking, customer email, expected delivery date, actual delivery date, grants, indexes, and access rules.
- Update the public checkout function to validate input, match or create customer details, create invoice-ready orders atomically, and return the order identifier.
- Limit anonymous access to checkout placement; Customer Details, Orders, and Delivery Tracking remain admin-only.
- Use existing recipe, ingredient, and recipe-pricing data rather than creating another storefront pricing source.
- Refresh shared pricing data after edits so the public store does not show stale prices.

## Validation
- Verify adding and editing pricing updates public product cards and pack options.
- Place a guest order and confirm it appears in Orders and Customer Details.
- Verify printed/PDF invoices show discount, tax, and notes.
- Verify delivery status and expected/actual dates persist and remain linked from Orders.
- Check desktop and mobile layouts, plus clean build and runtime logs.
