import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stockMovementService, StockMovement } from '../services/stockMovementService';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { Repeat, Plus, CheckCircle, Clock, XCircle } from 'lucide-react';

const Transfers = () => {
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadTransfers();
  }, [filterStatus]);

  const loadTransfers = async () => {
    try {
      const params: any = { movement_type: 'internal' };
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      const data = await stockMovementService.getAll(params);
      setTransfers(data);
    } catch (error) {
      toast.error('Failed to load transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async (id: string) => {
    if (!confirm('Execute this transfer? Stock will be moved between locations.')) {
      return;
    }

    try {
      await stockMovementService.execute(id);
      toast.success('Transfer executed successfully');
      loadTransfers();
    } catch (error) {
      toast.error('Failed to execute transfer');
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Internal Transfers</h2>
            <p className="text-gray-600 mt-1">Stock movements between locations</p>
          </div>
          <button
            onClick={() => navigate('/transfers/new')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Transfer
          </button>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <div className="flex gap-2">
            {['all', 'draft', 'waiting', 'ready', 'done', 'canceled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Transfers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : transfers.length === 0 ? (
            <div className="text-center py-12">
              <Repeat className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transfers</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new internal transfer.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From → To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lines
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transfers.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transfer.reference || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transfer.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transfer.source_location_name || 'N/A'} → {transfer.dest_location_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transfer.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transfer.lines?.length || 0} item(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {transfer.status === 'ready' && (
                        <button
                          onClick={() => handleExecute(transfer.id)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Execute
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/transfers/view/${transfer.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Transfers;
