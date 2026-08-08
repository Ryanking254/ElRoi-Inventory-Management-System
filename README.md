# Elroi Inventory – Expo App (Pure JavaScript)

Owner-focused inventory management mobile app for Elroi Shop.

## Features
- **Dashboard** – Today’s revenue/profit, stock value, low-stock alerts, quick actions, revenue & profit line chart
- **Inventory** – List, search, filter by category, add new items (name + category + cost + sell price + initial stock)
- **Record Sale** – Select item → quantity → amount sold for → automatic profit/loss calculation vs cost price
- **Adjust Stock** – Add or remove stock with notes
- **History** – Full ledger of IN / OUT / SALE / ADJUST movements with filters
- **Reports** – Calendar date-range picker + line graphs for revenue & profit over any period
- **Team** – Invite staff/owners by email + role
- **Settings** – Shop info placeholders

## Tech
- Expo SDK 52 + Expo Router (file-based navigation)
- Pure JavaScript (no TypeScript)
- react-native-chart-kit (line charts)
- react-native-calendars
- Mock data included so you can run immediately
- Designed to connect later to a Vercel-hosted Node/Next.js API

## Design
Inspired by the eco/green dashboard UI you shared:
- Deep green primary (`#0d4f3c`)
- Clean white cards
- Soft shadows
- Metric cards + progress indicators style

## Run it
```bash
cd elroi-inventory
npm install
npx expo start
```

Then open in Expo Go (Android/iOS) or press `w` for web.

## Next steps (backend)
1. Create a Vercel project with API routes (or Express)
2. Use Prisma + Vercel Postgres for the models we mapped earlier
3. Replace the mock data calls in `lib/` and screens with `fetch` to your API
4. Add Auth.js / Supabase Auth for real login + invite tokens

## Project structure
```
app/
  (auth)/login.js
  (tabs)/          # Dashboard, Inventory, History, Reports, More
  add-item.js
  record-sale.js
  adjust-stock.js
  invite.js
components/
constants/
data/mockData.js
lib/calculations.js
```
