import DashboardLayout from '../../layouts/DashboardLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import React, { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/icon';
import { Link } from '@inertiajs/react';



interface Order {
  id: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  network: string;
  expiry: string;
  product_type: 'customer_products' | 'agent_product' | 'dealer_product';
}

interface CartItem {
  id: number;
  product_id: number;
  quantity: string;
  beneficiary_number: string;
  product: {
    name: string;
    price: number;
    network: string;
    expiry: string;
  };
}

interface DashboardProps extends PageProps {
  cartCount: number;
  cartItems: CartItem[];
  walletBalance: number;
  orders: Order[];
  totalSales: number;
  todaySales: number;
  pendingOrders: number;
  processingOrders: number;
  products: Product[];
}

export default function Dashboard({ auth }: DashboardProps) {
  const { cartCount, cartItems, walletBalance: initialWalletBalance, orders, totalSales, todaySales, pendingOrders, processingOrders, products } = usePage<DashboardProps>().props;

  const [walletBalance, setWalletBalance] = useState(initialWalletBalance ?? 0);
  const [addAmount, setAddAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);





  const handleRemoveFromCart = (cartId: number) => {
    router.delete(route('remove.from.cart', cartId));
  };



  return (
    <DashboardLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Dashboard</h2>}
    >
      <Head title="Dashboard" />



      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <div className="px-4 sm:px-8 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-300 dark:border-gray-600 shadow-lg bg-white dark:bg-gray-700 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">{auth.user.name.charAt(0)}</span>
            </div>
            <div className="text-gray-800 dark:text-gray-200">
              <h1 className="text-3xl font-bold">{auth.user.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 font-medium">{auth.user.role.toUpperCase()}</p>
            </div>
            {/* Action Buttons Section */}
            {auth.user.role === 'customer' && (
              <div className="ml-auto">
                <Link
                  href={route('become_an_agent')}
                  className="inline-block px-6 py-2 text-white font-medium rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:-translate-y-0.5 transition-all duration-300"
                >
                  Become A Dealer
                </Link>
              </div>
            )}
          </div>
        </div>

       

        {/* Wallet Section */}
        <div className="px-4 sm:px-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-4 sm:p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <div>
                <p className="text-white/80 text-sm mb-1">Wallet Balance</p>
                <p className="text-lg sm:text-lg font-bold text-white">GHS {walletBalance}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-white/80 text-sm mb-2">Wallet Top Up</p>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <input 
                    type="number" 
                    placeholder="Enter Amount" 
                    value={addAmount}
                    onChange={e => setAddAmount(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm w-full sm:w-40 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <button 
                    onClick={async () => {
                      if (!addAmount) return;
                      setIsAdding(true);
                      try {
                        const response = await fetch('/dashboard/wallet/add', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                          },
                          body: JSON.stringify({ amount: addAmount }),
                        });
                        const data = await response.json();
                        if (data.success && data.payment_url) {
                          window.location.href = data.payment_url;
                        } else {
                          alert(data.message || 'Failed to initialize payment.');
                        }
                      } catch (err) {
                        alert('Error initializing payment.');
                      } finally {
                        setIsAdding(false);
                      }
                    }}
                    disabled={!addAmount || isAdding}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 w-full sm:w-auto disabled:opacity-50"
                  >
                    {isAdding ? 'Processing...' : 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Main Content Grid */}
        <div className="px-4 sm:px-8 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">Available Networks</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* MTN Card */}
                <div 
                  onClick={() => router.visit(route('product.single', { network: 'MTN' }))}
                  className="cursor-pointer bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-xl p-6 text-white hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <img src="/mtnlogo.jpeg" alt="MTN" className="w-12 h-12 object-contain rounded-lg" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">MTN</h4>
                      <p className="text-white/80 text-sm">Data Bundles</p>
                      <p className="text-white/60 text-xs mt-1">Click to view packages</p>
                    </div>
                  </div>
                </div>

                {/* Telecel Card */}
                <div 
                  onClick={() => router.visit(route('product.single', { network: 'TELECEL' }))}
                  className="cursor-pointer bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-6 text-white hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <img src="/telecellogo.png" alt="Telecel" className="w-12 h-12 object-contain rounded-lg" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">Telecel</h4>
                      <p className="text-white/80 text-sm">Data Bundles</p>
                      <p className="text-white/60 text-xs mt-1">Click to view packages</p>
                    </div>
                  </div>
                </div>

                {/* AT iShare Card */}
                <div 
                  onClick={() => router.visit(route('product.single', { network: 'ISHARE' }))}
                  className="cursor-pointer bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <img src="/atlogo.png" alt="AT iShare" className="w-12 h-12 object-contain rounded-lg" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">AT - iShare</h4>
                      <p className="text-white/80 text-sm">Data Bundles</p>
                      <p className="text-white/60 text-xs mt-1">Click to view packages</p>
                    </div>
                  </div>
                </div>

                {/* AT BigTime Card */}
                <div 
                  onClick={() => router.visit(route('product.single', { network: 'BIGTIME' }))}
                  className="cursor-pointer bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <img src="/atlogo.png" alt="AT BigTime" className="w-12 h-12 object-contain rounded-lg" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">AT - BigTime</h4>
                      <p className="text-white/80 text-sm">Data Bundles</p>
                      <p className="text-white/60 text-xs mt-1">Click to view packages</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Cart Button */}
        {cartCount > 0 && (
          <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
            <button
              onClick={() => router.visit('/cart')}
              className="relative bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-full p-4 shadow-2xl transform hover:scale-110 transition-all duration-300 animate-bounce"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
