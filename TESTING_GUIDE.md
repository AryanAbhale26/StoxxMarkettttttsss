# StockMaster - Complete UI Testing Guide

## Prerequisites
- Backend running on http://localhost:8000
- Frontend running on http://localhost:3000
- Empty or clean database for fresh testing

---

## 1. Authentication Testing

### A. Sign Up (New User Registration)
**Steps:**
1. Navigate to http://localhost:3000
2. Click "Sign Up" or navigate to `/signup`
3. Fill in the form:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `Test@1234` (min 8 chars)
   - Confirm Password: `Test@1234`
4. Click "Sign Up"

**Expected Results:**
- ✅ Success toast message appears
- ✅ Automatically redirected to `/login`
- ✅ Form validation shows errors for invalid inputs (weak password, email format, password mismatch)

### B. Login
**Steps:**
1. Navigate to `/login`
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `Test@1234`
3. Click "Sign In"

**Expected Results:**
- ✅ Success toast message
- ✅ Redirected to `/dashboard`
- ✅ Sidebar navigation appears
- ✅ User stays logged in on page refresh

### C. Forgot Password (Optional - Email Service Required)
**Steps:**
1. On login page, click "Forgot Password?"
2. Enter email: `test@example.com`
3. Check if OTP is sent (requires email service configuration)

**Expected Results:**
- ✅ Success message if email service is configured
- ✅ Error message if email service is not configured
- ✅ Can navigate back to login

---

## 2. Dashboard Testing

### View Dashboard KPIs
**Steps:**
1. After login, you should be on `/dashboard`
2. Observe the KPI cards at the top

**Expected Results:**
- ✅ Total Products count displayed
- ✅ Low Stock Items count (products below reorder level)
- ✅ Recent Movements count (last 30 days)
- ✅ Pending Orders count (draft/waiting/ready status)
- ✅ Cards show loading state initially, then data

---

## 3. Products Management Testing

### A. Create New Product
**Steps:**
1. Click "Products" in sidebar or navigate to `/products`
2. Click "+ New Product" button
3. Fill in the form:
   - Name: `Test Laptop`
   - SKU: `LAP-001` (must be unique)
   - Category: `Electronics`
   - Unit of Measure: `Units`
   - Current Stock: `50`
   - Reorder Level: `10`
   - Unit Price: `999.99`
4. Click "Create Product"

**Expected Results:**
- ✅ Success toast: "Product created successfully"
- ✅ Redirected to `/products` list
- ✅ New product appears in the table
- ✅ Validation errors for duplicate SKU, negative numbers, or empty required fields

### B. View Products List
**Steps:**
1. On `/products` page
2. Observe the products table

**Expected Results:**
- ✅ Products displayed with: SKU, Name, Category, Stock, Price, Status
- ✅ Stock status badge: "In Stock" (green) or "Low Stock" (red)
- ✅ Search bar visible at top
- ✅ Action buttons (Edit, Delete) for each product

### C. Edit Product
**Steps:**
1. Click "Edit" button on a product row
2. Modify fields:
   - Name: `Test Laptop Pro`
   - Current Stock: `75`
   - Unit Price: `1299.99`
3. Click "Update Product"

**Expected Results:**
- ✅ Success toast: "Product updated successfully"
- ✅ Redirected to products list
- ✅ Updated values reflected in the table
- ✅ Cancel button returns to list without saving

### D. Delete Product
**Steps:**
1. Click "Delete" button on a product
2. Confirm deletion in the dialog

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Success toast after confirmation
- ✅ Product removed from the list
- ✅ Deletion prevented if product has stock movements (backend validation)

### E. Search Products
**Steps:**
1. On products page, use the search bar
2. Type: `Laptop` or `LAP-001`

**Expected Results:**
- ✅ Table filters to show only matching products
- ✅ Search works for both name and SKU
- ✅ Shows "No products found" if no matches

---

## 4. Warehouse & Location Testing

### A. Create Warehouse
**Steps:**
1. Navigate to `/warehouses`
2. Click "+ New Warehouse" button
3. Fill in the form:
   - Name: `Main Warehouse`
   - Code: `WH-001`
   - Address: `123 Storage St`
   - Is Active: Checked
4. Click "Create Warehouse"

**Expected Results:**
- ✅ Success toast message
- ✅ Warehouse appears in the list
- ✅ Shows "Active" status badge
- ✅ Form validation for required fields

### B. Add Locations to Warehouse
**Steps:**
1. On warehouse list, click on a warehouse card
2. Click "Add Location" or "Manage Locations"
3. Create locations:
   - Location 1: `Shelf A1`
   - Location 2: `Shelf A2`
   - Location 3: `Loading Dock`

**Expected Results:**
- ✅ Locations created successfully
- ✅ Locations listed under the warehouse
- ✅ Each location shows available for stock movements

**Note:** You need at least 2 locations for internal transfers to work properly.

---

## 5. Stock Receipts (Incoming Stock) Testing

### A. Create New Receipt (Draft Status)
**Steps:**
1. Navigate to `/receipts`
2. Click "+ New Receipt"
3. Fill in the form:
   - Reference: Auto-generated (REC-xxxxx)
   - Partner Name: `Supplier ABC`
   - Scheduled Date: Select tomorrow's date
   - Status: `Draft`
4. Add product lines:
   - Click "+ Add Product"
   - Select Product: `Test Laptop`
   - Quantity: `20`
   - Click "+ Add Product" again
   - Select another product
   - Quantity: `10`
5. Notes: `Initial stock purchase`
6. Click "Create Receipt"

**Expected Results:**
- ✅ Success toast
- ✅ Redirected to `/receipts` list
- ✅ New receipt visible with "Draft" status badge
- ✅ Shows date, partner name, number of items
- ✅ Product dropdown shows current stock levels
- ✅ Can add/remove multiple product lines

### B. View Receipt Details
**Steps:**
1. Click "View" button on the receipt you just created
2. Observe the receipt details page

**Expected Results:**
- ✅ Shows all receipt details: reference, status, dates, partner
- ✅ Product lines table with SKU, quantity, unit
- ✅ Status badge with icon
- ✅ Back button returns to receipts list
- ✅ Execute button NOT visible (status is draft)
- ✅ Notes displayed if provided

### C. Create Receipt with Ready Status
**Steps:**
1. Navigate to `/receipts/new`
2. Fill in form:
   - Partner Name: `Supplier XYZ`
   - Status: Select `Ready`
   - Add products with quantities
3. Click "Create Receipt"

**Expected Results:**
- ✅ Receipt created successfully
- ✅ Shows "Ready" status (blue badge)
- ✅ When viewing, "Execute Receipt" button is visible

### D. Execute Receipt (Update Stock)
**Steps:**
1. View a receipt with "Ready" status
2. Click "Execute Receipt" button
3. Confirm execution

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Success toast: "Receipt executed successfully"
- ✅ Status changes to "Done" (green badge)
- ✅ Execute button disappears
- ✅ "Executed At" timestamp appears
- ✅ Product stock levels increased in Products page
- ✅ Cannot execute again (button gone)

### E. Filter Receipts by Status
**Steps:**
1. On `/receipts` page
2. Click filter buttons: All, Draft, Ready, Done, Canceled

**Expected Results:**
- ✅ Table updates to show only receipts with selected status
- ✅ Active filter button highlighted in blue
- ✅ "No receipts found" message if no matches

---

## 6. Stock Deliveries (Outgoing Stock) Testing

### A. Create New Delivery
**Steps:**
1. Navigate to `/deliveries`
2. Click "+ New Delivery"
3. Fill in the form:
   - Reference: Auto-generated (DEL-xxxxx)
   - Partner Name: `Customer ABC`
   - Status: `Ready`
   - Add product lines:
     - Select a product (must have stock)
     - Quantity: `5` (less than available stock)
4. Click "Create Delivery"

**Expected Results:**
- ✅ Delivery created successfully
- ✅ Appears in deliveries list
- ✅ Shows current stock next to each product in dropdown
- ✅ Validation prevents delivering more than available stock

### B. Execute Delivery
**Steps:**
1. View the delivery with "Ready" status
2. Click "Execute Delivery" button
3. Confirm execution

**Expected Results:**
- ✅ Success toast
- ✅ Status changes to "Done"
- ✅ Product stock decreased in Products page
- ✅ If stock goes below reorder level, shows "Low Stock" badge
- ✅ Executed timestamp visible

### C. Attempt Delivery Without Stock
**Steps:**
1. Create delivery for a product
2. Set quantity higher than available stock
3. Try to create or execute

**Expected Results:**
- ✅ Backend validation error
- ✅ Error toast: "Insufficient stock"
- ✅ Delivery not executed
- ✅ Stock levels unchanged

---

## 7. Internal Transfers Testing

### A. Create Internal Transfer
**Steps:**
1. Navigate to `/transfers`
2. Click "+ New Transfer"
3. Fill in the form:
   - Reference: Auto-generated (TRF-xxxxx)
   - Source Location: Select `Shelf A1`
   - Destination Location: Select `Shelf A2`
   - Status: `Ready`
   - Add product lines:
     - Select product
     - Quantity: `10`
4. Click "Create Transfer"

**Expected Results:**
- ✅ Transfer created successfully
- ✅ Source and destination locations must be different (validation)
- ✅ Both location dropdowns populated from warehouses
- ✅ Transfer appears in list

### B. Execute Transfer
**Steps:**
1. View transfer with "Ready" status
2. Click "Execute Transfer" button
3. Confirm execution

**Expected Results:**
- ✅ Success toast
- ✅ Status changes to "Done"
- ✅ Stock moved between locations (check in backend/database)
- ✅ Executed timestamp shown

### C. View Transfer Details
**Steps:**
1. Click "View" on a transfer
2. Observe details page

**Expected Results:**
- ✅ Shows source and destination location names
- ✅ Product lines table
- ✅ Status badge
- ✅ Execute button visible for "Ready" status only

---

## 8. Inventory Adjustments Testing

### A. Create Adjustment
**Steps:**
1. Navigate to `/adjustments`
2. Click "+ New Adjustment"
3. Fill in the form:
   - Select Product: `Test Laptop`
   - Location: `Shelf A1` (optional)
   - Counted Quantity: `55` (different from current stock)
   - Notes: `Physical count adjustment`
4. Click "Create Adjustment"

**Expected Results:**
- ✅ Success toast
- ✅ Stock quantity updated to counted quantity
- ✅ Adjustment appears in history
- ✅ Can be positive or negative adjustment
- ✅ Notes saved for audit trail

### B. Verify Stock After Adjustment
**Steps:**
1. Go to `/products`
2. Find the adjusted product
3. Check current stock

**Expected Results:**
- ✅ Stock matches the counted quantity from adjustment
- ✅ Adjustment reflected immediately

---

## 9. Move History (Ledger) Testing

### A. View Complete History
**Steps:**
1. Navigate to `/history`
2. Observe the stock movement history table

**Expected Results:**
- ✅ Shows all stock movements (receipts, deliveries, transfers, adjustments)
- ✅ Each entry shows:
  - Date/time
  - Movement type with colored icon (receipt=green, delivery=red, transfer=blue, adjustment=orange)
  - Product name and SKU
  - Location
  - Quantity change (+/-)
  - Balance after movement
  - Reference number
  - Created by user
- ✅ Ordered by most recent first

### B. Filter by Movement Type
**Steps:**
1. Use the movement type filter dropdown
2. Select: Receipt, Delivery, Internal, Adjustment, or All

**Expected Results:**
- ✅ Table shows only selected movement type
- ✅ Icon and color match movement type
- ✅ Can switch between filters

### C. Search History
**Steps:**
1. Use the search bar
2. Search by:
   - Product name: `Laptop`
   - SKU: `LAP-001`
   - Reference: `REC-xxxxx`

**Expected Results:**
- ✅ Table filters to show matching entries
- ✅ Shows "No movements found" if no matches
- ✅ Search works across all fields

### D. Filter by Date Range
**Steps:**
1. Select start date (e.g., 1 week ago)
2. Select end date (today)
3. Click "Apply" or filters automatically

**Expected Results:**
- ✅ Shows only movements within date range
- ✅ Can clear date filters
- ✅ Validation ensures end date >= start date

---

## 10. Navigation & UI Testing

### A. Sidebar Navigation
**Steps:**
1. Click each menu item in sidebar:
   - Dashboard
   - Products
   - Receipts
   - Deliveries
   - Transfers
   - Adjustments
   - History
   - Warehouses

**Expected Results:**
- ✅ Each link navigates to correct page
- ✅ Active menu item highlighted
- ✅ All pages load without errors
- ✅ Sidebar remains visible on all pages

### B. Logout
**Steps:**
1. Click "Logout" button in sidebar
2. Confirm logout

**Expected Results:**
- ✅ Redirected to `/login`
- ✅ Cannot access protected routes after logout
- ✅ Attempting to visit `/dashboard` redirects to login
- ✅ Token cleared from localStorage

### C. Protected Routes
**Steps:**
1. Logout
2. Try to access directly:
   - http://localhost:3000/dashboard
   - http://localhost:3000/products
   - http://localhost:3000/receipts

**Expected Results:**
- ✅ All protected routes redirect to `/login`
- ✅ After login, can access all pages
- ✅ No data visible to unauthenticated users

---

## 11. Data Validation Testing

### A. Form Validation
**Test each form with invalid data:**

**Products:**
- ❌ Empty name → Error: "Required"
- ❌ Empty SKU → Error: "Required"
- ❌ Negative stock → Error: "Must be positive"
- ❌ Negative price → Error: "Must be positive"
- ❌ Duplicate SKU → Backend error toast

**Receipts/Deliveries:**
- ❌ No product lines → Error: "Add at least one product"
- ❌ Zero quantity → Error: "Quantity must be > 0"
- ❌ Empty partner name → Warning or auto-fill "N/A"

**Transfers:**
- ❌ Same source & destination → Error: "Must be different"
- ❌ No products added → Error message

**Expected Results:**
- ✅ All form fields validated
- ✅ Error messages displayed in red
- ✅ Cannot submit invalid forms
- ✅ Backend validation catches edge cases

### B. Stock Constraints
**Test inventory rules:**

1. **Delivery with insufficient stock:**
   - Product stock: 10 units
   - Try to deliver: 20 units
   - ✅ Error: "Insufficient stock"

2. **Negative stock prevention:**
   - Execute delivery that would create negative stock
   - ✅ Backend prevents execution
   - ✅ Stock remains unchanged

3. **Concurrent operations:**
   - Two users try to deliver same stock simultaneously
   - ✅ Only one succeeds
   - ✅ Other gets insufficient stock error

---

## 12. End-to-End Workflow Testing

### Complete Purchase-to-Sale Flow
**Scenario:** Buy inventory → Store → Sell to customer

**Steps:**
1. **Create Product:**
   - Name: `Widget X`
   - SKU: `WID-001`
   - Initial Stock: `0`
   - Reorder Level: `5`

2. **Create Warehouse & Locations:**
   - Warehouse: `Main Storage`
   - Location 1: `Receiving Area`
   - Location 2: `Shelf B1`

3. **Receive Stock:**
   - Create receipt from "Supplier ABC"
   - Add 50 units of Widget X
   - Status: Ready
   - Execute receipt
   - ✅ Stock now: 50 units

4. **Transfer to Storage:**
   - Create internal transfer
   - From: Receiving Area
   - To: Shelf B1
   - Quantity: 50 units
   - Execute transfer
   - ✅ Stock moved to shelf

5. **Sell to Customer:**
   - Create delivery to "Customer XYZ"
   - Quantity: 15 units
   - Status: Ready
   - Execute delivery
   - ✅ Stock now: 35 units

6. **Physical Count Adjustment:**
   - Count reveals 33 units (2 damaged)
   - Create adjustment
   - Counted: 33 units
   - ✅ Stock adjusted to 33

7. **Verify History:**
   - Go to `/history`
   - ✅ Should see 4 entries:
     1. Receipt: +50
     2. Transfer: 50 moved
     3. Delivery: -15
     4. Adjustment: -2

**Expected Results:**
- ✅ All operations complete successfully
- ✅ Stock levels accurate throughout
- ✅ History reflects all movements
- ✅ No data inconsistencies

---

## 13. Error Handling Testing

### A. Network Errors
**Steps:**
1. Stop the backend server
2. Try to create a product or login

**Expected Results:**
- ✅ Error toast with network error message
- ✅ App doesn't crash
- ✅ Can retry after backend restarts

### B. 401 Unauthorized
**Steps:**
1. Manually delete token from localStorage
2. Try to access any protected page

**Expected Results:**
- ✅ Redirected to login
- ✅ No infinite redirect loop
- ✅ Can login again successfully

### C. 404 Not Found
**Steps:**
1. Navigate to `/products/view/invalid-id`
2. Or manually enter wrong product ID in URL

**Expected Results:**
- ✅ Error toast or "Not found" message
- ✅ Option to go back to list
- ✅ App remains functional

---

## 14. Browser Compatibility Testing

**Test on multiple browsers:**
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if available)

**Check:**
- ✅ All pages load correctly
- ✅ Forms work properly
- ✅ Date pickers function
- ✅ Styling consistent
- ✅ No console errors

---

## 15. Performance & Usability Testing

### A. Large Data Sets
**Steps:**
1. Create 100+ products
2. Create 50+ stock movements
3. Navigate through pages

**Expected Results:**
- ✅ Pages load within 2-3 seconds
- ✅ No UI freezing
- ✅ Tables render properly
- ✅ Search/filter remains responsive

### B. Loading States
**Expected on all pages:**
- ✅ Loading spinner shows while fetching data
- ✅ Skeleton screens or placeholders
- ✅ "Loading..." text if appropriate
- ✅ No blank pages during data fetch

### C. Empty States
**Expected when no data:**
- ✅ "No products found" message
- ✅ "No receipts yet" with create button
- ✅ "No movements in history" message
- ✅ Helpful empty state illustrations or text

---

## Common Issues & Troubleshooting

### Issue: "Invalid Date" in tables
**Solution:** Already fixed - should show proper dates now

### Issue: Cannot view receipt/delivery/transfer
**Solution:** Already fixed - view pages created with all details

### Issue: Logout loop
**Solution:** Already fixed - interceptor checks current path

### Issue: Products don't load
**Check:**
- Backend running on port 8000
- MongoDB running and accessible
- No CORS errors in browser console
- Token valid in localStorage

### Issue: Cannot create stock movements
**Check:**
- At least one product exists
- Warehouses and locations created (for transfers)
- All required fields filled
- Product has sufficient stock (for deliveries)

---

## Testing Checklist Summary

### Authentication ✓
- [ ] Sign up new user
- [ ] Login with credentials
- [ ] Logout
- [ ] Protected routes redirect to login

### Products ✓
- [ ] Create product
- [ ] Edit product
- [ ] Delete product
- [ ] Search products
- [ ] View low stock items

### Warehouses ✓
- [ ] Create warehouse
- [ ] Add locations
- [ ] View warehouse list

### Receipts ✓
- [ ] Create receipt (draft)
- [ ] Create receipt (ready)
- [ ] View receipt details
- [ ] Execute receipt
- [ ] Filter by status
- [ ] Stock increases after execution

### Deliveries ✓
- [ ] Create delivery
- [ ] Execute delivery
- [ ] View delivery details
- [ ] Stock decreases after execution
- [ ] Cannot deliver more than stock

### Transfers ✓
- [ ] Create internal transfer
- [ ] Execute transfer
- [ ] View transfer details
- [ ] Validate different locations

### Adjustments ✓
- [ ] Create inventory adjustment
- [ ] Stock updates immediately
- [ ] Notes saved for audit

### History ✓
- [ ] View all movements
- [ ] Filter by type
- [ ] Search by product/SKU/reference
- [ ] Date range filter
- [ ] Shows correct balance after each movement

### Dashboard ✓
- [ ] KPIs display correctly
- [ ] All counts accurate

### UI/UX ✓
- [ ] All navigation links work
- [ ] Loading states show
- [ ] Error messages clear
- [ ] Success toasts appear
- [ ] Forms validate properly
- [ ] Responsive on different screens

---

## Expected System Behavior Summary

### Stock Levels
- ✅ Receipts **increase** stock
- ✅ Deliveries **decrease** stock
- ✅ Transfers **move** stock (no net change)
- ✅ Adjustments **set** stock to counted value

### Status Workflow
- **Draft** → Can edit, cannot execute
- **Waiting** → Awaiting approval
- **Ready** → Can execute
- **Done** → Executed, final
- **Canceled** → Voided

### User Experience
- ✅ All actions give immediate feedback (toast)
- ✅ Loading states prevent double-clicks
- ✅ Errors explain what went wrong
- ✅ Navigation intuitive and consistent
- ✅ Data persists after page refresh

---

## Test Data Suggestions

### Sample Products
1. Laptop - SKU: LAP-001 - Price: $999
2. Mouse - SKU: MOU-001 - Price: $25
3. Keyboard - SKU: KEY-001 - Price: $75
4. Monitor - SKU: MON-001 - Price: $350
5. Headset - SKU: HED-001 - Price: $120

### Sample Warehouses
1. Main Warehouse (WH-001)
   - Receiving Area
   - Shelf A1, A2, A3
   - Shelf B1, B2, B3
   - Loading Dock

2. Retail Store (WH-002)
   - Display Area
   - Back Room
   - Counter

### Sample Partners
- **Suppliers:** Supplier ABC, Tech Distributors Inc, Global Parts Ltd
- **Customers:** Customer XYZ, Retail Corp, Business Solutions LLC

---

## Notes
- Test with realistic data (proper names, quantities, dates)
- Check browser console for any errors (F12)
- Test both happy paths and error scenarios
- Verify data consistency across different pages
- Test as both admin and regular user if roles implemented

**Estimated Testing Time:** 2-3 hours for complete manual testing
