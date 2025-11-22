import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stockMovementService } from '../services/stockMovementService';
import { productService, Product } from '../services/productService';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { FileText, Save, Search } from 'lucide-react';

const Adjustments = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    location_id: '',
    counted_quantity: 0,
    notes: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadProducts();
      return;
    }
    
    try {
      const data = await productService.search(searchQuery);
      setProducts(data);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.product_id) {
      toast.error('Please select a product');
      return;
    }

    setLoading(true);

    try {
      await stockMovementService.adjust({
        product_id: formData.product_id,
        location_id: formData.location_id || undefined,
        counted_quantity: formData.counted_quantity,
        notes: formData.notes,
      });
      toast.success('Inventory adjustment created successfully');
      
      // Reset form
      setFormData({
        product_id: '',
        location_id: '',
        counted_quantity: 0,
        notes: '',
      });
      
      loadProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create adjustment');
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find(p => p.id === formData.product_id);

  return (
    <Layout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Inventory Adjustment</h2>
            <p className="text-gray-600 mt-1">Reconcile physical count with system stock</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Product
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                      placeholder="Search by name or SKU..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Product *
                </label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku}) - Current: {product.current_stock} {product.unit_of_measure}
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Stock Display */}
              {selectedProduct && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Current Stock</p>
                      <p className="text-xl font-bold text-gray-900">
                        {selectedProduct.current_stock} {selectedProduct.unit_of_measure}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="text-lg font-medium text-gray-900">{selectedProduct.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reorder Level</p>
                      <p className="text-lg font-medium text-gray-900">{selectedProduct.reorder_level}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location_id}
                    onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Storage location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Counted Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.counted_quantity}
                    onChange={(e) => setFormData({ ...formData, counted_quantity: parseFloat(e.target.value) || 0 })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Physical count"
                  />
                </div>
              </div>

              {/* Difference Display */}
              {selectedProduct && formData.counted_quantity !== 0 && (
                <div className={`p-4 rounded-lg ${
                  formData.counted_quantity > selectedProduct.current_stock
                    ? 'bg-green-50 border border-green-200'
                    : formData.counted_quantity < selectedProduct.current_stock
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}>
                  <p className="text-sm font-medium">
                    Difference: {' '}
                    <span className={`text-lg ${
                      formData.counted_quantity > selectedProduct.current_stock
                        ? 'text-green-700'
                        : formData.counted_quantity < selectedProduct.current_stock
                        ? 'text-red-700'
                        : 'text-gray-700'
                    }`}>
                      {formData.counted_quantity - selectedProduct.current_stock > 0 ? '+' : ''}
                      {(formData.counted_quantity - selectedProduct.current_stock).toFixed(2)} {selectedProduct.unit_of_measure}
                    </span>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Reason for adjustment..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {loading ? 'Creating...' : 'Create Adjustment'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/history')}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <FileText className="h-5 w-5 inline mr-2" />
                  View History
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Adjustments;
