# StockMaster - Multi-Tenant Inventory Management System

A comprehensive inventory management system with multi-tenant architecture, location-wise stock tracking, and complete warehouse management capabilities.
We have Deployed the website 

[StockMaster Login](https://stockmaster.closedsource.in/login)


## 🚀 Features

### Multi-Tenant Architecture
- **Organization-based isolation** - Complete data separation between organizations
- **User management** - Multiple users per organization with role-based access
- **Secure authentication** - JWT-based authentication with email verification

### Inventory Management
- **Product Management** - Create, update, and track products with SKU, categories, and units
- **Location-wise Stock Tracking** - Track inventory across multiple warehouses and locations
- **Real-time Stock Levels** - Automatic stock updates from all movements
- **Reorder Level Alerts** - Low stock notifications based on configurable thresholds
- **Initial Stock Assignment** - Assign products to specific locations during creation

### Warehouse & Location Management
- **Multiple Warehouses** - Manage multiple warehouse facilities
- **Location Hierarchy** - Organize storage locations within warehouses
- **Location Inventory View** - See all products in each location
- **Empty Location Visibility** - View all locations including those without stock

### Stock Movements
- **Receipts** - Incoming stock with destination location tracking
- **Deliveries** - Outgoing stock with source location tracking
- **Internal Transfers** - Move stock between locations
- **Inventory Adjustments** - Location-specific stock count adjustments
- **Status Workflow** - Draft → Waiting → Ready → Done → Canceled
- **Movement History** - Complete audit trail of all stock movements

### Dashboard & Analytics
- **Real-time Metrics** - Total products, stock value, low stock alerts
- **Recent Activity** - Latest stock movements and transactions
- **Stock Distribution** - Visual breakdown of inventory across locations
- **Product-level Analytics** - Detailed stock information per product

### Prerequisites Validation
- **Smart Forms** - Blocks form submission if prerequisites not met
- **Auto-redirect** - Guides users to create required entities first
- **Loading States** - Clear feedback during prerequisite checks

## 📋 Prerequisites

### Backend
- Python 3.8+
- MongoDB 4.4+
- SMTP server for email functionality

### Frontend
- Node.js 16+
- npm or yarn

## 🛠️ Installation

### Backend Setup

1. **Navigate to Backend directory:**
```bash
cd Backend
```

2. **Create virtual environment:**
```bash
python -m venv venv
```

3. **Activate virtual environment:**
```bash
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Windows (CMD)
venv\Scripts\activate.bat

# Linux/Mac
source venv/bin/activate
```

4. **Install dependencies:**
```bash
pip install -r requirements.txt
```

5. **Configure environment variables:**
Create a `.env` file in the Backend directory:
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=stockmaster
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=StockMaster
```

6. **Run the server:**
```bash
# Development mode with auto-reload
uvicorn main:app --reload

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```

The API will be available at:
- **Base URL**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/docs`
- **Alternative Docs**: `http://localhost:8000/redoc`

### Frontend Setup

1. **Navigate to Frontend directory:**
```bash
cd Frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Create a `.env` file in the Frontend directory:
```env
VITE_API_BASE_URL=http://localhost:8000
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Build for production:**
```bash
npm run build
```

The application will be available at `http://localhost:3000`

## 🏗️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (motor async driver)
- **Authentication**: JWT (PyJWT)
- **Validation**: Pydantic
- **Email**: aiosmtplib
- **CORS**: FastAPI CORS middleware

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Build Tool**: Vite

## 📁 Project Structure

```
StockMaster/
├── Backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── router.py
│   │   │       └── endpoints/
│   │   │           ├── auth.py
│   │   │           ├── products.py
│   │   │           ├── warehouses.py
│   │   │           ├── stock_movements.py
│   │   │           ├── location_stock.py
│   │   │           ├── dashboard.py
│   │   │           └── organizations.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── security.py
│   │   │   └── dependencies.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── product.py
│   │   │   ├── warehouse.py
│   │   │   ├── stock_movement.py
│   │   │   ├── location_stock.py
│   │   │   └── organization.py
│   │   └── services/
│   │       ├── auth_service.py
│   │       ├── product_service.py
│   │       ├── warehouse_service.py
│   │       ├── stock_movement_service.py
│   │       ├── location_stock_service.py
│   │       ├── dashboard_service.py
│   │       ├── organization_service.py
│   │       └── email_service.py
│   ├── main.py
│   ├── requirements.txt
│   └── migrate_organization_data.py
│
└── Frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.tsx
    │   │   └── PrivateRoute.tsx
    │   ├── contexts/
    │   │   └── AuthContext.tsx
    │   ├── pages/
    │   │   ├── Login.tsx
    │   │   ├── Signup.tsx
    │   │   ├── ForgotPassword.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── Products.tsx
    │   │   ├── ProductForm.tsx
    │   │   ├── Warehouses.tsx
    │   │   ├── Receipts.tsx
    │   │   ├── ReceiptForm.tsx
    │   │   ├── ReceiptView.tsx
    │   │   ├── Deliveries.tsx
    │   │   ├── DeliveryForm.tsx
    │   │   ├── DeliveryView.tsx
    │   │   ├── Transfers.tsx
    │   │   ├── TransferForm.tsx
    │   │   ├── TransferView.tsx
    │   │   ├── Adjustments.tsx
    │   │   ├── History.tsx
    │   │   ├── LocationInventory.tsx
    │   │   └── LocationStockView.tsx
    │   ├── services/
    │   │   ├── api.ts
    │   │   ├── authService.ts
    │   │   ├── productService.ts
    │   │   ├── warehouseService.ts
    │   │   ├── stockMovementService.ts
    │   │   ├── locationStockService.ts
    │   │   └── dashboardService.ts
    │   ├── config/
    │   │   └── api.ts
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── tailwind.config.js
```

## 🔌 API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /signup` - Register new user with organization
- `POST /login` - Login and receive JWT token
- `POST /forgot-password` - Request OTP for password reset
- `POST /verify-otp` - Verify OTP code
- `POST /reset-password` - Reset password with verified OTP

### Products (`/api/v1/products`)
- `GET /` - List all products (with pagination, category filter)
- `GET /{id}` - Get product by ID
- `POST /` - Create new product (with initial stock and location)
- `PUT /{id}` - Update product
- `DELETE /{id}` - Delete product
- `GET /search` - Search products by name or SKU
- `GET /low-stock` - Get products below reorder level

### Warehouses (`/api/v1/warehouses`)
- `GET /` - List all warehouses
- `GET /{id}` - Get warehouse by ID
- `POST /` - Create warehouse
- `PUT /{id}` - Update warehouse
- `DELETE /{id}` - Delete warehouse

### Locations (`/api/v1/warehouses/locations`)
- `GET /` - List all locations
- `GET /{id}` - Get location by ID
- `POST /` - Create location
- `PUT /{id}` - Update location
- `DELETE /{id}` - Delete location
- `GET /warehouse/{warehouse_id}` - Get locations by warehouse

### Stock Movements (`/api/v1/stock-movements`)
- `GET /` - List movements (filter by type, status)
- `GET /{id}` - Get movement by ID
- `POST /` - Create new movement (receipt, delivery, transfer)
- `PUT /{id}` - Update movement (status, notes, date)
- `POST /{id}/execute` - Execute movement and update stock
- `POST /adjust` - Perform inventory adjustment
- `GET /ledger/history` - Get stock ledger entries

### Location Stock (`/api/v1/location-stock`)
- `GET /product/{product_id}` - Get product stock across all locations
- `GET /location/{location_id}` - Get all products in a location
- `GET /products` - Get all products with location breakdown
- `GET /locations` - Get all locations with product summary

### Dashboard (`/api/v1/dashboard`)
- `GET /stats` - Get dashboard statistics
- `GET /recent-movements` - Get recent stock movements
- `GET /stock-distribution` - Get stock distribution by location

### Organizations (`/api/v1/organizations`)
- `GET /current` - Get current user's organization details

## 🔐 Authentication Flow

1. **Signup**: User creates account → Organization created → Email verification sent
2. **Login**: Email + Password → JWT token returned → Token stored in localStorage
3. **Forgot Password**: Email → OTP sent → OTP verified → New password set
4. **Protected Routes**: Token in Authorization header → Validated → User data returned

## 📊 Data Models

### User
- email, password (hashed), organization_id, created_at, verified

### Organization
- name, created_at, created_by

### Product
- name, sku, category, unit_of_measure, description, current_stock, reorder_level, organization_id

### Warehouse
- name, location, is_active, organization_id

### Location
- name, warehouse_id, is_active, organization_id

### Stock Movement
- type (receipt/delivery/internal/adjustment), status, reference, partner_name
- source_location_id, destination_location_id, lines[], scheduled_date, notes
- organization_id, created_at, executed_at

### Stock Ledger
- product_id, product_name, product_sku, location_id, movement_type, reference
- quantity, quantity_change, balance_after, timestamp, organization_id

## 🔄 Workflows

### Creating a Product with Initial Stock
1. User navigates to Products → New Product
2. System checks if warehouses and locations exist → Redirects if not
3. User fills product details + selects warehouse + location
4. User enters initial stock quantity
5. System creates product + creates stock ledger entry with location

### Receipt Flow (Incoming Stock)
1. Create receipt with destination location
2. Add product lines with quantities
3. Set status (draft/waiting/ready)
4. Execute receipt → Stock added to destination location → Ledger updated

### Delivery Flow (Outgoing Stock)
1. Create delivery with source location
2. Add product lines with quantities
3. Set partner name for delivery
4. Execute delivery → Stock removed from source location → Ledger updated

### Transfer Flow (Internal Movement)
1. Create transfer with source and destination locations
2. Add product lines with quantities
3. Execute transfer → 2 ledger entries created (source -qty, dest +qty)

### Adjustment Flow (Stock Count)
1. Select product and location
2. System shows current stock at that location
3. Enter counted quantity
4. System calculates difference
5. Adjustment created → Ledger updated → Total stock adjusted by difference

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
- Verify MongoDB is running: `mongod --version`
- Check connection string in `.env`
- Ensure database user has proper permissions

**Email Sending Fails:**
- For Gmail: Enable 2FA and create App Password
- Check SMTP settings and credentials
- Verify firewall allows SMTP port (587)

**Import Errors:**
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

### Frontend Issues

**API Connection Error:**
- Verify backend is running on port 8000
- Check `VITE_API_BASE_URL` in `.env`
- Check browser console for CORS errors

**Build Fails:**
- Clear node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`
- Check Node version: `node --version` (should be 16+)

**Page Reload Logout:**
- Already fixed with loading state in AuthContext
- Token persists in localStorage

## 🚀 Deployment

### Backend Deployment

**Using Gunicorn (Production):**
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

**Using Docker:**
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Deployment

**Build for production:**
```bash
npm run build
# Output in dist/ folder
```

**Deploy to Vercel/Netlify:**
- Build command: `npm run build`
- Output directory: `dist`
- Set environment variable: `VITE_API_BASE_URL`

## 📝 Migration Scripts

### Migrate Existing Data to Multi-Tenant

If you have existing data before multi-tenant implementation:

```bash
cd Backend
python migrate_organization_data.py
```

This script:
- Creates default organization for existing users
- Assigns organization_id to all collections
- Maintains data integrity

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Development Team** - Initial work - [StockMaster]

## 🙏 Acknowledgments

- FastAPI for the amazing backend framework
- React team for the frontend library
- MongoDB for the flexible database
- Tailwind CSS for beautiful styling
- All contributors and testers
