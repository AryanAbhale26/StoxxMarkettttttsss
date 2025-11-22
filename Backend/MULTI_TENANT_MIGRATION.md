# Multi-Tenant Data Isolation - Migration Guide

## Overview
This document describes the multi-tenant architecture implementation that ensures complete data isolation between different organizations (users).

## What Changed

### 1. Organization-Based Multi-Tenancy
- Each user is automatically assigned to an organization upon signup
- All data (products, warehouses, locations, stock movements, ledger entries) is scoped to an organization
- Users can only access data belonging to their organization

### 2. Database Schema Updates
Added `organization_id` field to the following models:
- **StockMovementInDB** (`app/models/stock_movement.py`)
- **LocationInDB** (`app/models/warehouse.py`)

Note: `organization_id` was previously added to:
- UserInDB
- ProductInDB
- WarehouseInDB

### 3. Service Layer Updates
All service methods now:
1. Accept `user_email` parameter
2. Use `_get_user_org_id(user_email)` helper to retrieve user's organization_id
3. Filter all database queries by `organization_id`

Updated services:
- `stock_movement_service.py` - All CRUD operations + ledger
- `warehouse_service.py` - Warehouses and locations
- `location_stock_service.py` - Location-wise stock tracking

Previously updated:
- `product_service.py`
- `dashboard_service.py`

### 4. API Endpoint Updates
All endpoints now pass `current_user["email"]` to service methods:
- `/api/v1/stock-movements/*` - All movement operations
- `/api/v1/warehouses/*` - Warehouse and location operations
- `/api/v1/location-stock/*` - Location stock tracking

Previously updated:
- `/api/v1/products/*`
- `/api/v1/dashboard`

### 5. Ledger Entries
Stock ledger entries now include `organization_id`:
- Internal transfers (2 entries per transfer)
- Receipts and deliveries
- Inventory adjustments

## Data Migration

### Running the Migration Script
The migration script `migrate_organization_data.py` updates existing data:

```bash
cd Backend
python migrate_organization_data.py
```

The script:
1. Maps users to their organizations
2. Updates products by matching `created_by` email
3. Updates warehouses (assigns to first org if no creator)
4. Updates locations (matches warehouse's organization)
5. Updates stock movements by `created_by` email
6. Updates stock ledger entries by `created_by` email

### Important Notes
- Run the migration script **only once** after deploying the changes
- Backup your database before running the migration
- The script is idempotent (safe to run multiple times)
- Records without a `created_by` email will be assigned to the first organization

## Testing Data Isolation

### Test Scenario 1: New User Signup
1. Create a new user account
2. Log in with the new account
3. Verify that the product list is empty
4. Create a product
5. Log out and create another new user
6. Verify the second user cannot see the first user's product

### Test Scenario 2: Existing User Data
1. Log in with an existing user
2. Verify only their organization's data is visible:
   - Products
   - Stock movements (receipts, deliveries, transfers, adjustments)
   - Warehouses and locations
   - Dashboard KPIs
   - Stock history

### Test Scenario 3: Stock Operations
1. Create a receipt for a product
2. Execute the receipt
3. Create a delivery
4. Verify ledger entries include organization_id
5. Log in with a different user
6. Verify they cannot see the stock movements or ledger entries

## Collaborator Feature (Future)
The organization system supports collaborators:
- Users can be added to an organization with roles (owner/admin/member)
- API endpoints exist at `/api/v1/organizations/*`
- Frontend UI for collaborator management is pending

## Security Considerations
- All queries filter by `organization_id` at the service layer
- Users cannot access data outside their organization through API
- Organization assignment happens during user creation (immutable)
- Future: Add role-based permissions within organizations

## Troubleshooting

### Issue: User sees other users' data
- Ensure the migration script has been run
- Verify user has `organization_id` in database
- Check service methods include organization_id filter
- Verify endpoints pass `current_user["email"]` to services

### Issue: Products/movements not showing for existing user
- Check if records have `organization_id` field
- Run migration script if not already run
- Verify user's `organization_id` matches records

### Issue: New records not isolated
- Check if service layer adds `organization_id` during creation
- Verify model includes `organization_id` field
- Check database records have the field populated
