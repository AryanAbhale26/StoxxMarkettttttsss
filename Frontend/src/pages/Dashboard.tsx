import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService, DashboardKPIs } from '../services/dashboardService';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  ShoppingCart,
  TrendingDown,
  BarChart3,
  Plus,
  Search
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await dashboardService.getKPIs();
      setKpis(data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to load dashboard data';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Overview of your inventory operations</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={() => navigate('/products/new')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </button>
          <button
            onClick={() => navigate('/receipts/new')}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <TrendingDown className="h-5 w-5 mr-2" />
            New Receipt
          </button>
          <button
            onClick={() => navigate('/deliveries/new')}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            New Delivery
          </button>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Search className="h-5 w-5 mr-2" />
            View Products
          </button>
        </div>

        {/* KPI Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Products */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Products</p>
                    <p className="text-3xl font-bold text-gray-900">{kpis?.total_products || 0}</p>
                  </div>
                  <div className="bg-blue-100 rounded-full p-3">
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Low Stock Items */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/products')}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
                    <p className="text-3xl font-bold text-yellow-600">{kpis?.low_stock_items || 0}</p>
                  </div>
                  <div className="bg-yellow-100 rounded-full p-3">
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* Out of Stock */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
                    <p className="text-3xl font-bold text-red-600">{kpis?.out_of_stock_items || 0}</p>
                  </div>
                  <div className="bg-red-100 rounded-full p-3">
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  </div>
                </div>
              </div>

              {/* Total Stock Value */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Stock Units</p>
                    <p className="text-3xl font-bold text-green-600">{kpis?.total_stock_value || 0}</p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/receipts')}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pending Receipts</h3>
                  <ShoppingCart className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{kpis?.pending_receipts || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Incoming orders</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/deliveries')}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pending Deliveries</h3>
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{kpis?.pending_deliveries || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Outgoing orders</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/transfers')}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Internal Transfers</h3>
                  <BarChart3 className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{kpis?.internal_transfers || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Between locations</p>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
