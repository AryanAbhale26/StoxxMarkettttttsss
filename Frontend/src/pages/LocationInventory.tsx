import { useState, useEffect } from 'react';
import { locationStockService, LocationStockSummary } from '../services/locationStockService';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { Warehouse, Package, MapPin, Search } from 'lucide-react';

const LocationInventory = () => {
  const [locations, setLocations] = useState<LocationStockSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const data = await locationStockService.getAllLocationsStockSummary();
      setLocations(data);
    } catch (error) {
      toast.error('Failed to load location inventory');
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations.filter(
    (location) =>
      location.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.warehouse_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTotalStock = (products: any[]) => {
    return products.reduce((sum, p) => sum + p.quantity, 0);
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Location Inventory</h2>
              <p className="text-gray-600 mt-1">View all products in each location</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-5 w-5" />
              <span>{locations.length} Locations</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by location or warehouse name..."
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
        ) : filteredLocations.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-500">No locations with stock found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredLocations.map((location) => (
              <div key={location.location_id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Location Header */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        {location.location_name}
                      </h3>
                      <p className="text-green-100 text-sm mt-1 flex items-center">
                        <Warehouse className="h-4 w-4 mr-1" />
                        {location.warehouse_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-100">Total Units</p>
                      <p className="text-2xl font-bold">{getTotalStock(location.products)}</p>
                    </div>
                  </div>
                </div>

                {/* Products List */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      Products ({location.total_products})
                    </h4>
                  </div>

                  {location.products.length > 0 ? (
                    <div className="space-y-3">
                      {location.products.map((product) => (
                        <div
                          key={product.product_id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{product.product_name}</p>
                            <p className="text-xs text-gray-500">SKU: {product.product_sku}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">{product.quantity}</p>
                            <p className="text-xs text-gray-500">units</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p>No products in this location</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LocationInventory;
