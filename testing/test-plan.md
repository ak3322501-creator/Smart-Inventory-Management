# Smart Inventory Management System Test Plan

## Test Objectives
- Verify API endpoints return correct inventory data
- Confirm product creation and sales recording update stock
- Ensure low-stock alert logic works correctly
- Validate predictive reorder calculations
- Check frontend displays data and submits forms properly

## Backend Tests
- GET `/api/products` returns product list
- POST `/api/products` creates a new product
- POST `/api/sales` decreases stock quantity
- GET `/api/alerts/low-stock` lists products under reorder level
- GET `/api/prediction` returns forecast data with suggested reorder

## Frontend Verification
- Load products, suppliers, sales, and alerts successfully
- Add supplier and verify it appears in UI
- Add product and verify it appears in inventory table
- Record sale and confirm stock decrement

## Manual Testing Steps
1. Run `npm install` inside both `backend` and `frontend`
2. Initialize the database with `node init-db.js`
3. Start backend: `npm start`
4. Start frontend: `npm run dev`
5. Use the form interfaces to add products, suppliers, and sales
6. Confirm low stock items appear under alerts
7. Confirm prediction panel updates with stock and reorder suggestions
