import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { stockMovementService, StockMovement } from '../services/stockMovementService';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { ArrowLeft, Package, CheckCircle, Clock, XCircle } from 'lucide-react';

const ReceiptView = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [receipt, setReceipt] = useState<StockMovement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadReceipt();
    }
  }, [id]);

  const loadReceipt = async () => {
    if (!id) return;
    
    try {
      const data = await stockMovementService.getById(id);
      setReceipt(data);
    } catch (error) {
      toast.error('Failed to load receipt');
      navigate('/receipts');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!id || !confirm('Execute this receipt? Stock levels will be updated.')) {
      return;
    }

    try {
      await stockMovementService.execute(id);
      toast.success('Receipt executed successfully');
      loadReceipt();
    } catch (error) {
      toast.error('Failed to execute receipt');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      draft: 'bg-gray-100 text-gray-800',
      waiting: 'bg-yellow-100 text-yellow-800',
      ready: 'bg-blue-100 text-blue-800',
      done: 'bg-green-100 text-green-800',
      canceled: 'bg-red-100 text-red-800',
    };

    const icons: any = {
      draft: Clock,
      waiting: Clock,
      ready: CheckCircle,
      done: CheckCircle,
      canceled: XCircle,
    };

    const Icon = icons[status] || Clock;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.draft}`}>
        <Icon className="h-4 w-4 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!receipt) {
    return (
      <Layout>
        <div className="p-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Receipt not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/receipts')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Receipt: {receipt.reference}</h2>
                <p className="text-gray-600 mt-1">Incoming Stock Movement</p>
              </div>
            </div>
            <div>
              {receipt.status === 'ready' && (
                <button
                  onClick={handleExecute}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Execute Receipt
                </button>
              )}
            </div>
          </div>

          {/* Receipt Details */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Details</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Reference</label>
                <p className="text-gray-900">{receipt.reference}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                {getStatusBadge(receipt.status)}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
                <p className="text-gray-900">
                  {receipt.created_at ? new Date(receipt.created_at).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Scheduled Date</label>
                <p className="text-gray-900">
                  {receipt.scheduled_date ? new Date(receipt.scheduled_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Partner</label>
                <p className="text-gray-900">{receipt.partner_name || 'N/A'}</p>
              </div>
              {receipt.executed_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Executed At</label>
                  <p className="text-gray-900">{new Date(receipt.executed_at).toLocaleString()}</p>
                </div>
              )}
            </div>
            {receipt.notes && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">Notes</label>
                <p className="text-gray-900">{receipt.notes}</p>
              </div>
            )}
          </div>

          {/* Product Lines */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Products</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {receipt.lines.map((line, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{line.product_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {line.product_sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {line.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {line.unit_of_measure}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReceiptView;
