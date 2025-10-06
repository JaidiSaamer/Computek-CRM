# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Automations Feature (Added)

The app now supports creating layout automations from multiple ACTIVE orders.

Workflow:
1. Navigate to Orders and select at least two ACTIVE orders using the new checkboxes.
2. Click the Automate button that appears in the card header.
3. In the dialog choose a Sheet (fetched from `/api/v1/products/sheets`), optionally set bleed, margins, rotation allowance, name, and description.
4. Submit to start automation (POST `/api/v1/automate`).
5. View created automations in the Automations tab (GET `/api/v1/automate`).

Notes:
- Only staff/admin users see Automations navigation.
- Orders must be ACTIVE or they are rejected before dialog open.
- After a successful automation the selection is cleared automatically.

### Algorithm Types

| Type | When to Use | Pros | Trade-offs |
|------|-------------|------|-----------|
| Bottom Left Fill | General mixed jobs | Simple, fast | Not always optimal packing |
| Shelf | Items with similar heights | Predictable rows, fast | Wastes space with varied heights |
| Max Rects | Varied sizes, need efficiency | High packing efficiency | Slower, more complex |
| Gang | Multiple customers/jobs fairness | Balances allocation across jobs | May reduce raw efficiency |

If unsure, start with Bottom Left Fill; switch to Max Rects for tighter packing or Gang for fairness across multiple orders.

