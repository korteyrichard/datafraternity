import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Head, usePage } from '@inertiajs/react';

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
}

interface OrdersPageProps {
  orders: Order[];
  auth: any;
  totalSales: number;
  todaySales: number;
  pendingOrders: number;
  processingOrders: number;
  filters: {
    beneficiary_number?: string;
    order_id?: string;
  };
  [key: string]: any;
}

export default function OrdersPage() {
  const { orders, auth, totalSales, todaySales, pendingOrders, processingOrders, filters } = usePage<OrdersPageProps>().props;
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [networkFilter, setNetworkFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [beneficiaryFilter, setBeneficiaryFilter] = useState(filters?.beneficiary_number || '');
  const [orderIdFilter, setOrderIdFilter] = useState(filters?.order_id || '');

  // Extract unique networks and statuses for filter dropdowns
  const networks = Array.from(new Set(orders.map(o => o.network).filter(Boolean)));
  const statuses = Array.from(new Set(orders.map(o => o.status).filter(Boolean)));

  const filteredOrders = orders.filter(order => {
    const matchesNetwork = !networkFilter || order.network === networkFilter;
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesBeneficiary = !beneficiaryFilter || 
      (order.beneficiary_number && order.beneficiary_number.includes(beneficiaryFilter)) ||
      order.products.some(product => product.pivot?.beneficiary_number?.includes(beneficiaryFilter));
    const matchesOrderId = !orderIdFilter || order.id.toString().includes(orderIdFilter);
    return matchesNetwork && matchesStatus && matchesBeneficiary && matchesOrderId;
  });

  const handleExpand = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
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

  return (
    <DashboardLayout 
      user={auth?.user} 
      header={
        <h2 className="font-bold text-2xl text-gray-800 dark:text-gray-200 leading-tight flex items-center gap-2">
          <span className="inline-block w-2 h-6 bg-blue-600 rounded mr-2"></span>My Orders
        </h2>
      }
    >
      <Head title="Orders" />
      
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Stats Cards */}
          <div className="mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-900 rounded-lg shadow-lg p-4">
                <p className="text-white/80 text-sm">Total Sales</p>
                <p className="text-xl font-bold text-white">GHS {totalSales}</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-4">
                <p className="text-blue-900 text-sm">Today's Sales</p>
                <p className="text-xl font-bold text-blue-900">GHS {todaySales}</p>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-4">
                <p className="text-white/80 text-sm">Pending Orders</p>
                <p className="text-xl font-bold text-white">{pendingOrders}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-4">
                <p className="text-white/80 text-sm">Processing Orders</p>
                <p className="text-xl font-bold text-white">{processingOrders}</p>
              </div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg overflow-hidden border border-blue-100">
            
            {/* Filter Section */}
            <div className="p-4 bg-blue-50 border-b border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Network:</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    value={networkFilter}
                    onChange={e => setNetworkFilter(e.target.value)}
                  >
                    <option value="">All Networks</option>
                    {networks.map(network => (
                      <option key={network} value={network}>{network}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status:</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beneficiary Number:</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    placeholder="Search by beneficiary number"
                    value={beneficiaryFilter}
                    onChange={e => setBeneficiaryFilter(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order ID:</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    placeholder="Search by order ID"
                    value={orderIdFilter}
                    onChange={e => setOrderIdFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-blue-400 text-lg mb-2">No orders found</div>
                <div className="text-blue-500 text-sm">Try adjusting your filters or place your first order</div>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="overflow-x-auto hidden lg:block">
                  <table className="min-w-full divide-y divide-gray-400 dark:divide-gray-600 border border-gray-400 dark:border-gray-600">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-400 dark:border-gray-600">Order ID</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-400 dark:border-gray-600">Date & Time</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-400 dark:border-gray-600">Network</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-400 dark:border-gray-600">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-400 dark:border-gray-600">Beneficiary</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-400 dark:border-gray-600">Total</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredOrders.map(order => (
                        <React.Fragment key={order.id}>
                          <tr className="hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200">
                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-400 dark:border-gray-600">
                              <div className="text-sm font-bold text-gray-900 dark:text-gray-100">#{order.id}</div>
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
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
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
                              <div className="text-sm text-gray-700 dark:text-gray-200">
                                {order.products[0]?.size || '-'}
                              </div>
                            </td>
                          </tr>
                          {expandedOrder === order.id && (
                            <tr>
                              <td colSpan={7} className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Order Information</h4>
                                      <div className="space-y-1 text-sm">
                                        <div><span className="text-gray-500 dark:text-gray-400">Order ID:</span> <span className="font-medium text-gray-900 dark:text-gray-100">#{order.id}</span></div>
                                        <div><span className="text-gray-500 dark:text-gray-400">Status:</span> <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusBadgeColor(order.status)}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></div>
                                        <div><span className="text-gray-500 dark:text-gray-400">Network:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{order.network || 'N/A'}</span></div>
                                        <div><span className="text-gray-500 dark:text-gray-400">Total Amount:</span> <span className="font-bold text-gray-900 dark:text-gray-100">GHS {order.total.toLocaleString()}</span></div>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Products Ordered</h4>
                                      <div className="space-y-2">
                                        {order.products.map(product => (
                                          <div key={product.id} className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex justify-between items-start">
                                              <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                  {product.name} {product.size ? `(${product.size})` : ''}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                  Quantity: {product.pivot.quantity}
                                                </div>
                                                {product.pivot.beneficiary_number && (
                                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Beneficiary: {product.pivot.beneficiary_number}
                                                  </div>
                                                )}
                                              </div>
                                              <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                GHS {product.pivot.price.toLocaleString()}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Table */}
                <div className="lg:hidden overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-400 dark:divide-gray-600 border border-gray-400 dark:border-gray-600">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase border-r border-gray-400 dark:border-gray-600">Order</th>
                        <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase border-r border-gray-400 dark:border-gray-600">Network</th>
                        <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase border-r border-gray-400 dark:border-gray-600">Status</th>
                        <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase border-r border-gray-400 dark:border-gray-600">Beneficiary</th>
                        <th className="px-3 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredOrders.map(order => (
                        <React.Fragment key={order.id}>
                          <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                            <td className="px-3 py-3 border-r border-gray-400 dark:border-gray-600">
                              <div className="text-sm font-bold text-gray-900 dark:text-gray-100">#{order.id}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(order.created_at).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(order.created_at).toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="px-3 py-3 border-r border-gray-400 dark:border-gray-600">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${getNetworkBadgeColor(order.network)}`}>
                                {order.network || 'N/A'}
                              </span>
                            </td>
                            <td className="px-3 py-3 border-r border-gray-400 dark:border-gray-600">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
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
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {order.products[0]?.size || '-'}
                              </div>
                            </td>
                          </tr>
                          {expandedOrder === order.id && (
                            <tr>
                              <td colSpan={5} className="px-3 py-3 bg-gray-50 dark:bg-gray-800">
                                <div className="text-xs space-y-2">
                                  <div><span className="font-medium">Items:</span> {order.products.length}</div>
                                  <div className="space-y-1">
                                    <div className="font-medium">Products:</div>
                                    {order.products.map(product => (
                                      <div key={product.id} className="ml-2 text-gray-600 dark:text-gray-400">
                                        • {product.name} {product.size ? `(${product.size})` : ''} - GHS {product.pivot.price}
                                        {product.pivot.beneficiary_number && (
                                          <div className="ml-2 text-xs">Beneficiary: {product.pivot.beneficiary_number}</div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}