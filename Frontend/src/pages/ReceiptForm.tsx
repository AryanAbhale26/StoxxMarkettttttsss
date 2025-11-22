import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stockMovementService, StockMovementCreate, StockMovementLine } from '../services/stockMovementService';
import { productService, Product } from '../services/productService';
import { warehouseService, Location } from '../services/warehouseService';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2 } from 'lucide-react';

const ReceiptForm = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingPrerequisites, setCheckingPrerequisites] = useState(true);
  
  const [formData, setFormData] = useState({
    reference: `REC-${Date.now()}`,
    partner_name: '',
    destination_location_id: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    notes: '',
    status: 'draft' as 'draft' | 'waiting' | 'ready',
  });

  const [lines, setLines] = useState<StockMovementLine[]>([]);

  useEffect(() => {
    checkPrerequisites();
  }, []);

  const checkPrerequisites = async () => {
    try {
      const [productsData, locationsData] = await Promise.all([
        productService.getAll(),
        warehouseService.getAllLocations(),
      ]);

      if (locationsData.length === 0) {
        toast.error('Please create warehouse and locations first before creating receipts');
        navigate('/warehouses');
        return;
      }

      setProducts(productsData);
      setLocations(locationsData);
    } catch (error) {
      toast.error('Failed to load data');
      navigate('/receipts');
    } finally {
      setCheckingPrerequisites(false);
    }
  };

  const addLine = () => {
    if (products.length === 0) {
      toast.error('No products available');
      return;
    }

    const firstProduct = products[0];
    setLines([
      ...lines,
      {
        product_id: firstProduct.id,
        product_name: firstProduct.name,
        product_sku: firstProduct.sku,
        quantity: 1,
        unit_of_measure: firstProduct.unit_of_measure,
      },
    ]);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: string, value: any) => {
    const newLines = [...lines];
    
    if (field === 'product_id') {
      const product = products.find((p) => p.id === value);
      if (product) {
        newLines[index] = {
          ...newLines[index],
          product_id: product.id,
          product_name: product.name,
          product_sku: product.sku,
          unit_of_measure: product.unit_of_measure,
        };
      }
    } else {
      newLines[index] = { ...newLines[index], [field]: value };
    }
    
    setLines(newLines);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lines.length === 0) {
      toast.error('Please add at least one product line');
      return;
    }

    setLoading(true);

    try {
      const data: StockMovementCreate = {
        type: 'receipt',
        status: formData.status,
        reference: formData.reference,
        partner_name: formData.partner_name || undefined,
        destination_location_id: formData.destination_location_id || undefined,
        lines: lines,
        scheduled_date: formData.scheduled_date,
        notes: formData.notes,
      };

      await stockMovementService.create(data);
      toast.success('Receipt created successfully');
      navigate('/receipts');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create receipt');
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
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">New Receipt</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Receipt Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partner/Supplier
                  </label>
                  <input
                    type="text"
                    value={formData.partner_name}
                    onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Supplier name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination Location *
                  </label>
                  <select
                    required
                    value={formData.destination_location_id}
                    onChange={(e) => setFormData({ ...formData, destination_location_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="waiting">Waiting</option>
                    <option value="ready">Ready</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            {/* Product Lines */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Products</h3>
                <button
                  type="button"
                  onClick={addLine}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </button>
              </div>

              {lines.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No products added yet</p>
              ) : (
                <div className="space-y-3">
                  {lines.map((line, index) => (
                    <div key={index} className="flex gap-3 items-start border border-gray-200 rounded-lg p-3">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <select
                            value={line.product_id}
                            onChange={(e) => updateLine(index, 'product_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} ({product.sku}) - Stock: {product.current_stock}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={line.quantity}
                            onChange={(e) => updateLine(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Quantity"
                          />
                          <p className="text-xs text-gray-500 mt-1">{line.unit_of_measure}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-5 w-5 mr-2" />
                {loading ? 'Creating...' : 'Create Receipt'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/receipts')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ReceiptForm;
