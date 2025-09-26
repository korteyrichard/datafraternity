import DashboardLayout from '../../layouts/DashboardLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Product {
  id: number;
  name: string;
  price: number;
  network: string;
  expiry: string;
  product_type: 'customer_products' | 'agent_product' | 'dealer_product';
}

interface SingleProductProps extends PageProps {
  network: string;
  products: Product[];
  cartCount: number;
}

export default function SingleProduct({ auth }: SingleProductProps) {
  const { network, products, cartCount } = usePage<SingleProductProps>().props;
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bundleSize, setBundleSize] = useState('');
  const [bulkNumbers, setBulkNumbers] = useState('');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableSizes, setAvailableSizes] = useState<Array<{value: string, label: string, price: number}>>([]);
  const [loadingSizes, setLoadingSizes] = useState(false);
  const [showBulkInput, setShowBulkInput] = useState(false);

  // Network configuration
  const networkConfig = {
    MTN: {
      name: 'MTN',
      icon: '/mtnlogo.jpeg',
      bgColor: 'bg-gradient-to-br from-yellow-600 to-yellow-800',
      color: 'text-yellow-800'
    },
    TELECEL: {
      name: 'Telecel',
      icon: '/telecellogo.png',
      bgColor: 'bg-gradient-to-br from-red-600 to-red-800',
      color: 'text-red-800'
    },
    ISHARE: {
      name: 'AT - iShare',
      icon: '/atlogo.png',
      bgColor: 'bg-gradient-to-br from-blue-600 to-blue-800',
      color: 'text-blue-800'
    },
    BIGTIME: {
      name: 'AT - BigTime',
      icon: '/atlogo.png',
      bgColor: 'bg-gradient-to-br from-blue-600 to-blue-800',
      color: 'text-blue-800'
    }
  };

  const currentNetwork = networkConfig[network as keyof typeof networkConfig];

  // Filter products based on user role
  const filteredProducts = products?.filter(product => {
    if (auth.user.role === 'customer') {
      return product.product_type === 'customer_products';
    } else if (auth.user.role === 'agent') {
      return product.product_type === 'agent_product';
    } else if (auth.user.role === 'dealer') {
      return product.product_type === 'dealer_product';
    } else if (auth.user.role === 'admin') {
      return product.product_type === 'dealer_product';
    }
    return false;
  }) || [];

  const fetchBundleSizes = async (networkName: string) => {
    setLoadingSizes(true);
    try {
      const response = await fetch(`/api/bundle-sizes?network=${networkName}`);
      const data = await response.json();
      if (data.success) {
        setAvailableSizes(data.sizes);
      } else {
        setAvailableSizes([]);
      }
    } catch (error) {
      console.error('Error fetching bundle sizes:', error);
      setAvailableSizes([]);
    } finally {
      setLoadingSizes(false);
    }
  };

  useEffect(() => {
    if (network) {
      fetchBundleSizes(network);
    }
  }, [network]);

  const handleAddSingle = () => {
    if (!phoneNumber || !bundleSize) return;
    
    router.post(route('add.to.cart'), {
      network: network,
      quantity: bundleSize,
      beneficiary_number: phoneNumber,
    }, {
      onSuccess: () => {
        setPhoneNumber('');
        setBundleSize('');
      },
      onError: (errors) => {
        if (errors.error) {
          alert(errors.error);
        } else {
          alert('An error occurred while adding to cart');
        }
      }
    });
  };

  const handleProcessExcel = async () => {
    if (!excelFile) return;
    
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', excelFile);
    formData.append('network', network);
    
    try {
      const response = await fetch('/process-excel-to-cart', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: formData,
      });
      
      const data = await response.json();
      if (data.success) {
        setExcelFile(null);
        router.reload();
      } else {
        alert(data.message || 'Failed to process Excel file');
      }
    } catch (error) {
      alert('Error processing Excel file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessBulk = async () => {
    if (!bulkNumbers.trim()) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('/process-bulk-to-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          numbers: bulkNumbers,
          network: network
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setBulkNumbers('');
        router.reload();
      } else {
        alert(data.message || 'Failed to process bulk numbers');
      }
    } catch (error) {
      alert('Error processing bulk numbers');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'text/csv' || 
          file.type === 'application/csv' ||
          file.name.endsWith('.csv')) {
        setExcelFile(file);
      } else {
        alert('Please select a valid CSV file (.csv)');
        e.target.value = '';
      }
    }
  };

  return (
    <DashboardLayout
      user={auth.user}
      header={
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.visit(route('dashboard'))}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← Back to Dashboard
          </button>
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {currentNetwork?.name} Data Bundles
          </h2>
        </div>
      }
    >
      <Head title={`${currentNetwork?.name} Data Bundles`} />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="px-4 sm:px-8 py-8">
          {/* Product Card - Always Expanded */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden max-w-4xl mx-auto">
            {/* Network Header */}
            <div className={`${currentNetwork?.bgColor} p-6`}>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
                  <img 
                    src={currentNetwork?.icon} 
                    alt={`${currentNetwork?.name} logo`} 
                    className="w-12 h-12 object-contain rounded-lg" 
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{currentNetwork?.name}</h1>
                  <p className="text-white/80">Data Bundle Packages</p>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            <div className={`${currentNetwork?.bgColor} p-6 space-y-6`}>
              {/* Excel Upload Section */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  Upload CSV File
                </label>
                <div className="flex flex-col space-y-3">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="px-3 py-2 bg-white rounded border-0 text-gray-700 text-sm"
                    placeholder="Choose File"
                  />
                  <Button 
                    onClick={handleProcessExcel}
                    disabled={!excelFile || isProcessing}
                    className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded font-medium w-fit"
                  >
                    {isProcessing ? 'Processing...' : 'Upload CSV'}
                  </Button>
                </div>
              </div>

              {/* Bulk Text Input Section */}
              <div>
                <button 
                  onClick={() => setShowBulkInput(!showBulkInput)}
                  className="px-4 py-2 bg-gray-800 text-white rounded font-medium mb-3"
                >
                  📦 Bulk Text Input Orders
                </button>
                {showBulkInput && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="0241234567 5&#10;0558765432 10&#10;0501234567 3"
                      value={bulkNumbers}
                      onChange={(e) => setBulkNumbers(e.target.value)}
                      rows={4}
                      className="w-full bg-white text-gray-700"
                    />
                    <Button 
                      onClick={handleProcessBulk}
                      disabled={!bulkNumbers.trim() || isProcessing}
                      className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded font-medium"
                    >
                      {isProcessing ? 'Processing...' : 'Add Bulk to Cart'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Single Order Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Beneficiary Phone Number <span className="text-red-300">(Required)</span>
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter Beneficiary Number here"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    className="bg-white text-gray-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Data Volume <span className="text-red-300">(Required)</span>
                  </label>
                  <Select value={bundleSize} onValueChange={setBundleSize}>
                    <SelectTrigger className="bg-white text-gray-700">
                      <SelectValue placeholder={loadingSizes ? "Loading..." : "Select a package"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label} - GHS {size.price}
                        </SelectItem>
                      ))}
                      {availableSizes.length === 0 && !loadingSizes && (
                        <SelectItem value="no-sizes" disabled>
                          No sizes available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-yellow-100 p-3 rounded text-xs text-yellow-800">
                PLEASE VERIFY THE PHONE NUMBER BEFORE PROCEEDING TO AVOID SENDING DATA TO A WRONG NUMBER
              </div>

              <Button 
                onClick={handleAddSingle}
                disabled={!phoneNumber || !bundleSize || isProcessing}
                className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white rounded font-semibold"
              >
                Add to Basket
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Cart Button */}
        {cartCount > 0 && (
          <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
            <button
              onClick={() => router.visit('/cart')}
              className="relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full p-4 shadow-2xl transform hover:scale-110 transition-all duration-300 animate-bounce"
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