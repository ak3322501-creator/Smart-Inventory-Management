# Smart Inventory Management System - Design Document

## Overview
This system manages products, suppliers, sales records, low-stock alerts, and predictive inventory forecasting. The backend uses Express and SQLite, while the frontend is built with React/Vite.

## Architecture
- Frontend: React application consuming REST APIs
- Backend: Express server exposing API endpoints
- Database: SQLite local database for fast prototyping

## Data Model
- `products`: id, name, sku, description, quantity, reorder_level, supplier_id, price
- `suppliers`: id, name, contact, email, address
- `sales`: id, product_id, quantity, sale_price, sold_at

## API Endpoints
- `GET /api/products` - list all products
- `POST /api/products` - add new product
- `GET /api/suppliers` - list all suppliers
- `POST /api/suppliers` - add supplier
- `GET /api/sales` - list sales history
- `POST /api/sales` - record sale
- `GET /api/alerts/low-stock` - low stock products
- `GET /api/prediction` - predictive reorder suggestions

## UI Flow
1. View current product inventory
2. Add new products and suppliers
3. Record sales to update stock levels
4. Review low-stock alerts
5. Check predictive inventory forecasts
