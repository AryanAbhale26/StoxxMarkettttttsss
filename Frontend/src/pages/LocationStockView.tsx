import { useState, useEffect } from 'react';
import { locationStockService, ProductLocationStock } from '../services/locationStockService';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { Package, MapPin, Search, TrendingUp } from 'lucide-react';

const LocationStockView = () => {
  const [productsStock, setProductsStock] = useState<ProductLocationStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProductsStock();
  }, []);

  const loadProductsStock = async () => {
    try {
      const data = await locationStockService.getAllProductsLocationStock();
      setProductsStock(data);
    } catch (error) {
      toast.error('Failed to load location stock data');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = productsStock.filter(
    (product) =>
      product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.product_sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Location-Wise Stock</h2>
              <p className="text-gray-600 mt-1">View product quantities across all locations</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="h-5 w-5" />
              <span>{productsStock.length} Products</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-500">No products found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredProducts.map((product) => (
              <div key={product.product_id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Product Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{product.product_name}</h3>
                      <p className="text-blue-100 text-sm">SKU: {product.product_sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-100">Total Stock</p>
                      <p className="text-3xl font-bold">{product.total_stock}</p>
                    </div>
                  </div>
                </div>

                {/* Locations */}
                {product.locations.length > 0 ? (
                  <div className="p-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Stock by Location
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {product.locations.map((location) => (
                        <div
                          key={location.location_id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{location.location_name}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {((location.quantity / product.total_stock) * 100).toFixed(1)}% of total
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-600">{location.quantity}</p>
                              <p className="text-xs text-gray-500">units</p>
                            </div>
                          </div>
                          {/* Progress Bar */}
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{
                                  width: `${(location.quantity / product.total_stock) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <MapPin className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p>No location data available</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LocationStockView;
