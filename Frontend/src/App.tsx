import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductForm from './pages/ProductForm'
import Receipts from './pages/Receipts'
import ReceiptForm from './pages/ReceiptForm'
import ReceiptView from './pages/ReceiptView'
import Deliveries from './pages/Deliveries'
import DeliveryForm from './pages/DeliveryForm'
import DeliveryView from './pages/DeliveryView'
import Transfers from './pages/Transfers'
import TransferForm from './pages/TransferForm'
import TransferView from './pages/TransferView'
import Adjustments from './pages/Adjustments'
import History from './pages/History'
import Warehouses from './pages/Warehouses'
import LocationStockView from './pages/LocationStockView'
import LocationInventory from './pages/LocationInventory'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/products"
            element={
              <PrivateRoute>
                <Products />
              </PrivateRoute>
            }
          />
          <Route
            path="/products/new"
            element={
              <PrivateRoute>
                <ProductForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/products/edit/:id"
            element={
              <PrivateRoute>
                <ProductForm />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/receipts"
            element={
              <PrivateRoute>
                <Receipts />
              </PrivateRoute>
            }
          />
          <Route
            path="/receipts/new"
            element={
              <PrivateRoute>
                <ReceiptForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/receipts/view/:id"
            element={
              <PrivateRoute>
                <ReceiptView />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/deliveries"
            element={
              <PrivateRoute>
                <Deliveries />
              </PrivateRoute>
            }
          />
          <Route
            path="/deliveries/new"
            element={
              <PrivateRoute>
                <DeliveryForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/deliveries/view/:id"
            element={
              <PrivateRoute>
                <DeliveryView />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/transfers"
            element={
              <PrivateRoute>
                <Transfers />
              </PrivateRoute>
            }
          />
          <Route
            path="/transfers/new"
            element={
              <PrivateRoute>
                <TransferForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/transfers/view/:id"
            element={
              <PrivateRoute>
                <TransferView />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/adjustments"
            element={
              <PrivateRoute>
                <Adjustments />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/history"
            element={
              <PrivateRoute>
                <History />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/warehouses"
            element={
              <PrivateRoute>
                <Warehouses />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/location-stock"
            element={
              <PrivateRoute>
                <LocationStockView />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/location-inventory"
            element={
              <PrivateRoute>
                <LocationInventory />
              </PrivateRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
