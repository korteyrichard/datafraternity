import React, { useState } from 'react';
import { AdminLayout } from '../../layouts/admin-layout';
import { Head, usePage, router } from '@inertiajs/react';
import Pagination from '@/components/pagination';

interface Product {
  id: number;
  name: string;
  price: number;
  size?: string;
  pivot: {
    quantity: number;
    price: number;
    beneficiary_number?: string;
  };
}

interface Order {
  id: number;
  total: number;
  status: string;
  created_at: string;
  network?: string;
  beneficiary_number?: string;
  products: Product[];
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface PaginatedOrders {
  data: Order[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
}

interface AdminOrdersPageProps {
  orders: PaginatedOrders;
  auth: any;
  filterNetwork: string;
  filterStatus: string;
  searchOrderId: string;
  searchBeneficiaryNumber: string;
  dailyTotalSales: number;
  [key: string]: any;
}

export default function AdminOrders() {
  const {
    orders,
    auth,
    filterNetwork: initialNetworkFilter,
    filterStatus: initialStatusFilter,
    searchOrderId: initialSearchOrderId,
    searchBeneficiaryNumber: initialSearchBeneficiaryNumber,
    dailyTotalSales,
  } = usePage<AdminOrdersPageProps>().props;


  const [networkFilter, setNetworkFilter] = useState(initialNetworkFilter);
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [searchOrderId, setSearchOrderId] = useState(initialSearchOrderId);
  const [searchBeneficiaryNumber, setSearchBeneficiaryNumber] = useState(initialSearchBeneficiaryNumber);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] = useState('');

  const networks = Array.from(new Set(orders.data.map(o => o.network).filter(Boolean)));

  const handleFilterChange = (filterName: string, value: string) => {
    const newFilters: Record<string, string> = {};
    
    const network = filterName === 'network' ? value : networkFilter;
    const status = filterName === 'status' ? value : statusFilter;
    const orderId = filterName === 'order_id' ? value : searchOrderId;
    const beneficiaryNumber = filterName === 'beneficiary_number' ? value : searchBeneficiaryNumber;
    
    if (network) newFilters.network = network;
    if (status) newFilters.status = status;
    if (orderId) newFilters.order_id = orderId;
    if (beneficiaryNumber) newFilters.beneficiary_number = beneficiaryNumber;
    
    setNetworkFilter(network);
    setStatusFilter(status);
    setSearchOrderId(orderId);
    setSearchBeneficiaryNumber(beneficiaryNumber);
    router.get(route('admin.orders'), newFilters, { preserveState: true, replace: true });
  };



  const getNetworkBadgeColor = (network?: string) => {
    if (!network) return 'bg-gray-200 text-gray-700';
    if (network.toLowerCase() === 'telecel') return 'bg-red-200 text-red-700';
    if (network.toLowerCase() === 'mtn') return 'bg-yellow-200 text-yellow-700';
    if (network.toLowerCase().includes('bigtime') || network.toLowerCase().includes('ishare') || network.toLowerCase().includes('at data') || network.toLowerCase().includes('at (big')) return 'bg-blue-200 text-blue-700';
    return 'bg-purple-200 text-purple-700';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-200 text-green-700';
      case 'pending':
        return 'bg-orange-200 text-orange-700';
      case 'failed':
        return 'bg-red-200 text-red-700';
      case 'processing':
        return 'bg-blue-200 text-blue-700';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const handleDeleteOrder = (orderId: number) => {
    if (confirm('Are you sure you want to delete this order?')) {
      router.delete(route('admin.orders.delete', orderId), {
        onSuccess: () => router.reload(),
        onError: () => alert('Failed to delete order.'),
      });
    }
  };

  const handleStatusChange = (orderId: number, newStatus: string) => {
    router.put(route('admin.orders.updateStatus', orderId), { status: newStatus }, {
      onSuccess: () => router.reload(),
      onError: () => alert('Failed to update order status.'),
    });
  };

  const handleSelectOrder = (orderId: number) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    setSelectedOrders(selectedOrders.length === orders.data.length ? [] : orders.data.map(o => o.id));
  };

  const handleBulkStatusUpdate = () => {
    if (selectedOrders.length === 0 || !bulkStatus) return;
    
    router.put(route('admin.orders.bulkUpdateStatus'), {
      order_ids: selectedOrders,
      status: bulkStatus
    }, {
      onSuccess: () => {
        setSelectedOrders([]);
        setBulkStatus('');
        router.reload();
      },
      onError: () => alert('Failed to update order statuses.'),
    });
  };

  return (
    <AdminLayout
      user={auth?.user}
      header={<h2 className="text-3xl font-bold text-gray-800 dark:text-white">Orders</h2>}
    >
      <Head title="Admin Orders" />
      <div className="max-w-6xl mx-auto py-10 px-2 sm:px-4">
        {/* Daily Sales Summary */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20 mb-6">
          <h3 className="text-lg font-semibold text-white/90 mb-2">Today's Sales Summary</h3>
          <p className="text-3xl font-bold text-white">GHS {dailyTotalSales || '0.00'}</p>
        </div>
        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-800 dark:to-indigo-700 border border-indigo-200 dark:border-indigo-600 rounded-2xl p-6 shadow-lg mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                {selectedOrders.length} order(s) selected
              </span>
              <div className="flex gap-2">
                <select
                  className="px-3 py-1.5 rounded-lg border border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-800 text-sm"
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                >
                  <option value="">Change status to...</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={handleBulkStatusUpdate}
                  disabled={!bulkStatus}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update
                </button>
                <button
                  onClick={async () => {
                    try {
                      // Fetch fresh CSRF token
                      const response = await fetch('/sanctum/csrf-cookie', { credentials: 'same-origin' });
                      
                      const form = document.createElement('form');
                      form.method = 'POST';
                      form.action = route('admin.orders.export');
                      form.style.display = 'none';
                      
                      const csrfInput = document.createElement('input');
                      csrfInput.type = 'hidden';
                      csrfInput.name = '_token';
                      csrfInput.value = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                      form.appendChild(csrfInput);
                      
                      selectedOrders.forEach(orderId => {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = 'order_ids[]';
                        input.value = orderId.toString();
                        form.appendChild(input);
                      });
                      
                      document.body.appendChild(form);
                      form.submit();
                      document.body.removeChild(form);
                    } catch (error) {
                      alert('Failed to export orders. Please try again.');
                    }
                  }}
                  className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search by Order ID</label>
            <input
              type="text"
              placeholder="Enter order ID..."
              className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:ring focus:ring-blue-500 text-sm"
              value={searchOrderId}
              onChange={(e) => handleFilterChange('order_id', e.target.value)}
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search by Beneficiary Number</label>
            <input
              type="text"
              placeholder="Enter beneficiary number..."
              className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:ring focus:ring-blue-500 text-sm"
              value={searchBeneficiaryNumber}
              onChange={(e) => handleFilterChange('beneficiary_number', e.target.value)}
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Network</label>
            <select
              className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:ring focus:ring-blue-500 text-sm"
              value={networkFilter}
              onChange={(e) => handleFilterChange('network', e.target.value)}
            >
              <option value="">--select network--</option>
              {networks.map(network => (
                <option key={network} value={network}>{network}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status</label>
            <select
              className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:ring focus:ring-blue-500 text-sm"
              value={statusFilter}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">--select status--</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden border border-blue-100">
          {orders.data.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-blue-400 text-lg mb-2">No orders found</div>
              <div className="text-blue-500 text-sm">Try adjusting your filters</div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="overflow-x-auto hidden lg:block">
                <table className="min-w-full divide-y divide-gray-400 dark:divide-gray-600 border border-gray-400 dark:border-gray-600">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-400 dark:border-gray-600">
                        <input
                          type="checkbox"
                          checked={selectedOrders.length === orders.data.length && orders.data.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-400 dark:border-gray-600">Order ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-400 dark:border-gray-600">User</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-400 dark:border-gray-600">Date & Time</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-400 dark:border-gray-600">Network</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-400 dark:border-gray-600">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-400 dark:border-gray-600">Beneficiary</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-400 dark:border-gray-600">Total</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                    {orders.data.map((order) => (
                        <tr key={order.id} className="hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200">
                          <td className="px-6 py-4 whitespace-nowrap border-r border-gray-400 dark:border-gray-600">
                            <input
                              type="checkbox"
                              checked={selectedOrders.includes(order.id)}
                              onChange={() => handleSelectOrder(order.id)}
                              className="rounded border-gray-300 dark:border-gray-600"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap border-r border-gray-400 dark:border-gray-600">
                            <div className="text-sm font-bold text-gray-900 dark:text-gray-100">#{order.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap border-r border-gray-400 dark:border-gray-600">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900 dark:text-gray-100">{order.user?.name || 'Unknown User'}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{order.user?.email || 'No email'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap border-r border-gray-400 dark:border-gray-600">
                            <div className="text-sm text-gray-700 dark:text-gray-200">
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(order.created_at).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap border-r border-gray-400 dark:border-gray-600">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getNetworkBadgeColor(order.network)}`}>
                              {order.network || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap border-r border-gray-400 dark:border-gray-600">
                            <select
                              className="px-2 py-1 rounded-md text-xs dark:bg-gray-800 bg-gray-100"
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap border-r border-gray-400 dark:border-gray-600">
                            <div className="text-sm text-gray-700 dark:text-gray-200">
                              {order.products[0]?.pivot?.beneficiary_number || order.beneficiary_number || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right border-r border-gray-400 dark:border-gray-600">
                            <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                              GHS {order.total.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="text-red-500 hover:underline text-xs"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Table */}
              <div className="lg:hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-400 dark:divide-gray-600 border border-gray-400 dark:border-gray-600">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase border-r border-gray-400 dark:border-gray-600">
                        <input
                          type="checkbox"
                          checked={selectedOrders.length === orders.data.length && orders.data.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase border-r border-gray-400 dark:border-gray-600">Order</th>
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase border-r border-gray-400 dark:border-gray-600">Network</th>
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase border-r border-gray-400 dark:border-gray-600">Status</th>
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase border-r border-gray-400 dark:border-gray-600">Beneficiary</th>
                      <th className="px-3 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                    {orders.data.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                          <td className="px-3 py-3 border-r border-gray-400 dark:border-gray-600">
                            <input
                              type="checkbox"
                              checked={selectedOrders.includes(order.id)}
                              onChange={() => handleSelectOrder(order.id)}
                              className="rounded border-gray-300 dark:border-gray-600"
                            />
                          </td>
                          <td className="px-3 py-3 border-r border-gray-400 dark:border-gray-600">
                            <div className="text-sm font-bold text-gray-900 dark:text-gray-100">#{order.id}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(order.created_at).toLocaleTimeString()}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                              {order.user?.name || 'Unknown User'}
                            </div>
                          </td>
                          <td className="px-3 py-3 border-r border-gray-400 dark:border-gray-600">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getNetworkBadgeColor(order.network)}`}>
                              {order.network || 'N/A'}
                            </span>
                          </td>
                          <td className="px-3 py-3 border-r border-gray-400 dark:border-gray-600">
                            <select
                              className="px-2 py-1 rounded-md text-xs dark:bg-gray-800 bg-gray-100 w-full"
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-3 py-3 border-r border-gray-400 dark:border-gray-600">
                            <div className="text-xs text-gray-700 dark:text-gray-200">
                              {order.products[0]?.pivot?.beneficiary_number || order.beneficiary_number || '-'}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                              GHS {order.total.toLocaleString()}
                            </div>
                            <div className="mt-1">
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="text-red-500 hover:underline text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        
        {/* Pagination */}
        <Pagination data={orders} />
      </div>
    </AdminLayout>
  );
}
