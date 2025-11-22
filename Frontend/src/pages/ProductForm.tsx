import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService, ProductCreate, ProductUpdate } from '../services/productService';
import { warehouseService, Warehouse, Location } from '../services/warehouseService';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { Save, Loader2 } from 'lucide-react';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [checkingPrerequisites, setCheckingPrerequisites] = useState(true);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unit_of_measure: 'Units',
    description: '',
    reorder_level: 10,
    initial_stock: 0,
    warehouse_id: '',
    location_id: '',
  });

  useEffect(() => {
    checkPrerequisites();
  }, []);

  useEffect(() => {
    if (isEdit && id && !checkingPrerequisites) {
      loadProduct(id);
    }
  }, [id, isEdit, checkingPrerequisites]);

  useEffect(() => {
    if (formData.warehouse_id) {
      loadLocations();
    }
  }, [formData.warehouse_id]);

  const checkPrerequisites = async () => {
    try {
      const [warehousesData, locationsData] = await Promise.all([
        warehouseService.getAll(),
        warehouseService.getAllLocations(),
      ]);

      if (warehousesData.length === 0) {
        toast.error('Please create a warehouse first before adding products');
        navigate('/warehouses');
        return;
      }

      if (locationsData.length === 0) {
        toast.error('Please create at least one location before adding products');
        navigate('/warehouses');
        return;
      }

      setWarehouses(warehousesData);
      setLocations(locationsData);
    } catch (error) {
      toast.error('Failed to check prerequisites');
      navigate('/products');
    } finally {
      setCheckingPrerequisites(false);
    }
  };

  const loadLocations = async () => {
    try {
      const locationsData = await warehouseService.getAllLocations();
      setLocations(locationsData);
    } catch (error) {
      toast.error('Failed to load locations');
    }
  };

  const loadProduct = async (productId: string) => {
    try {
      const product = await productService.getById(productId);
      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category,
        unit_of_measure: product.unit_of_measure,
        description: product.description || '',
        reorder_level: product.reorder_level,
        initial_stock: product.current_stock,
        warehouse_id: '',
        location_id: '',
      });
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/products');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'reorder_level' || name === 'initial_stock' ? parseInt(value) || 0 : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEdit) {
      if (!formData.warehouse_id || !formData.location_id) {
        toast.error('Please select warehouse and location');
        return;
      }
    }

    setLoading(true);

    try {
      if (isEdit && id) {
        const updateData: ProductUpdate = {
          name: formData.name,
          sku: formData.sku,
          category: formData.category,
          unit_of_measure: formData.unit_of_measure,
          description: formData.description,
          reorder_level: formData.reorder_level,
        };
        await productService.update(id, updateData);
        toast.success('Product updated successfully');
      } else {
        const createData: ProductCreate = {
          name: formData.name,
          sku: formData.sku,
          category: formData.category,
          unit_of_measure: formData.unit_of_measure,
          description: formData.description,
          reorder_level: formData.reorder_level,
          initial_stock: formData.initial_stock,
          warehouse_id: formData.warehouse_id || undefined,
          location_id: formData.location_id || undefined,
        };
        await productService.create(createData);
        toast.success('Product created successfully');
      }
      navigate('/products');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to save product';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (checkingPrerequisites) {
    return (
      <Layout>
        <div className="p-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Checking prerequisites...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {isEdit ? 'Edit Product' : 'New Product'}
          </h2>

          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU / Code *
                  </label>
                  <input
                    type="text"
                    name="sku"
                    required
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter SKU"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter category"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit of Measure
                  </label>
                  <select
                    name="unit_of_measure"
                    value={formData.unit_of_measure}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Units">Units</option>
                    <option value="Kg">Kg</option>
                    <option value="Liters">Liters</option>
                    <option value="Boxes">Boxes</option>
                    <option value="Pieces">Pieces</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reorder Level
                  </label>
                  <input
                    type="number"
                    name="reorder_level"
                    min="0"
                    value={formData.reorder_level}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {!isEdit && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Warehouse *
                      </label>
                      <select
                        name="warehouse_id"
                        required
                        value={formData.warehouse_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select warehouse</option>
                        {warehouses.map((warehouse) => (
                          <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                      </label>
                      <select
                        name="location_id"
                        required
                        value={formData.location_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!formData.warehouse_id}
                      >
                        <option value="">Select location</option>
                        {locations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Initial Stock
                      </label>
                      <input
                        type="number"
                        name="initial_stock"
                        min="0"
                        value={formData.initial_stock}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product description"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 inline-flex items-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      {isEdit ? 'Update' : 'Create'} Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductForm;
