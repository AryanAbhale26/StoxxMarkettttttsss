import { useState, useEffect } from 'react';
import { warehouseService, Warehouse, Location } from '../services/warehouseService';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { Warehouse as WarehouseIcon, Plus, MapPin, Building } from 'lucide-react';

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWarehouseForm, setShowWarehouseForm] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  
  const [warehouseForm, setWarehouseForm] = useState({
    name: '',
    code: '',
    address: '',
  });

  const [locationForm, setLocationForm] = useState({
    warehouse_id: '',
    name: '',
    code: '',
    type: 'storage' as 'storage' | 'receiving' | 'shipping',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [warehousesData, locationsData] = await Promise.all([
        warehouseService.getAllWarehouses(),
        warehouseService.getAllLocations(),
      ]);
      setWarehouses(warehousesData);
      setLocations(locationsData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await warehouseService.createWarehouse(warehouseForm);
      toast.success('Warehouse created successfully');
      setWarehouseForm({ name: '', code: '', address: '' });
      setShowWarehouseForm(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create warehouse');
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await warehouseService.createLocation(locationForm);
      toast.success('Location created successfully');
      setLocationForm({ warehouse_id: '', name: '', code: '', type: 'storage' });
      setShowLocationForm(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create location');
    }
  };

  const getLocationsByWarehouse = (warehouseId: string) => {
    return locations.filter(loc => loc.warehouse_id === warehouseId);
  };

  const getLocationTypeBadge = (type: string) => {
    const styles: any = {
      storage: 'bg-blue-100 text-blue-800',
      receiving: 'bg-green-100 text-green-800',
      shipping: 'bg-purple-100 text-purple-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type] || styles.storage}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Warehouses & Locations</h2>
            <p className="text-gray-600 mt-1">Manage your storage locations</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowWarehouseForm(!showWarehouseForm)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Warehouse
            </button>
            <button
              onClick={() => setShowLocationForm(!showLocationForm)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Location
            </button>
          </div>
        </div>

        {/* Warehouse Form */}
        {showWarehouseForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create Warehouse</h3>
            <form onSubmit={handleCreateWarehouse} className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={warehouseForm.name}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Main Warehouse"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code *</label>
                <input
                  type="text"
                  required
                  value={warehouseForm.code}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="WH001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={warehouseForm.address}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Main St"
                />
              </div>
              <div className="col-span-3 flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Warehouse
                </button>
                <button
                  type="button"
                  onClick={() => setShowWarehouseForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Location Form */}
        {showLocationForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create Location</h3>
            <form onSubmit={handleCreateLocation} className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse *</label>
                <select
                  required
                  value={locationForm.warehouse_id}
                  onChange={(e) => setLocationForm({ ...locationForm, warehouse_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Warehouse</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} ({wh.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={locationForm.name}
                  onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Shelf A1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code *</label>
                <input
                  type="text"
                  required
                  value={locationForm.code}
                  onChange={(e) => setLocationForm({ ...locationForm, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="LOC-A1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  value={locationForm.type}
                  onChange={(e) => setLocationForm({ ...locationForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="storage">Storage</option>
                  <option value="receiving">Receiving</option>
                  <option value="shipping">Shipping</option>
                </select>
              </div>
              <div className="col-span-4 flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Create Location
                </button>
                <button
                  type="button"
                  onClick={() => setShowLocationForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Warehouses List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : warehouses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <WarehouseIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No warehouses</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new warehouse.</p>
            </div>
          ) : (
            warehouses.map((warehouse) => {
              const warehouseLocations = getLocationsByWarehouse(warehouse.id);
              
              return (
                <div key={warehouse.id} className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Building className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {warehouse.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Code: {warehouse.code} {warehouse.address && `• ${warehouse.address}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {warehouseLocations.length} location(s)
                      </div>
                    </div>
                  </div>
                  
                  {warehouseLocations.length > 0 && (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {warehouseLocations.map((location) => (
                          <div
                            key={location.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                  <h4 className="font-medium text-gray-900">{location.name}</h4>
                                </div>
                                <p className="text-sm text-gray-500 mb-2">Code: {location.code}</p>
                                {getLocationTypeBadge(location.type)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Warehouses;
