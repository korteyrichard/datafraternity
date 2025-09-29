<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Cart;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Services\OrderPusherService;
use App\Models\Setting;
use App\Models\Transaction;

class OrdersController extends Controller
{
    // Display a listing of the user's orders
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = Order::with(['products' => function($query) {
            $query->withPivot('quantity', 'price', 'beneficiary_number', 'product_variant_id');
        }])->where('user_id', $user->id);
        
        // Apply beneficiary number filter
        if ($request->filled('beneficiary_number')) {
            $beneficiaryNumber = $request->get('beneficiary_number');
            $query->where(function($q) use ($beneficiaryNumber) {
                $q->where('beneficiary_number', 'like', '%' . $beneficiaryNumber . '%')
                  ->orWhereHas('products', function($productQuery) use ($beneficiaryNumber) {
                      $productQuery->wherePivot('beneficiary_number', 'like', '%' . $beneficiaryNumber . '%');
                  });
            });
        }
        
        // Apply order ID filter
        if ($request->filled('order_id')) {
            $orderId = $request->get('order_id');
            $query->where('id', 'like', '%' . $orderId . '%');
        }
        
        $orders = $query->latest()->get();
        
        // Transform orders to include variant information
        $orders = $orders->map(function($order) {
            $order->products = $order->products->map(function($product) {
                if ($product->pivot->product_variant_id) {
                    $variant = \App\Models\ProductVariant::find($product->pivot->product_variant_id);
                    if ($variant && isset($variant->variant_attributes['size'])) {
                        $product->size = strtoupper($variant->variant_attributes['size']);
                    }
                }
                return $product;
            });
            return $order;
        });
        
        // Calculate dashboard stats
        $totalSales = \App\Models\Transaction::where('user_id', $user->id)
            ->where('status', 'completed')
            ->where('type', 'order')
            ->sum('amount');
            
        $todaySales = \App\Models\Transaction::where('user_id', $user->id)
            ->where('status', 'completed')
            ->where('type', 'order')
            ->whereDate('created_at', today())
            ->sum('amount');
            
        $pendingOrdersCount = Order::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'PENDING'])
            ->count();
            
        $processingOrdersCount = Order::where('user_id', $user->id)
            ->whereIn('status', ['processing', 'PROCESSING'])
            ->count();

        return Inertia::render('Dashboard/orders', [
            'orders' => $orders,
            'totalSales' => $totalSales ?? 0,
            'todaySales' => $todaySales ?? 0,
            'pendingOrders' => $pendingOrdersCount ?? 0,
            'processingOrders' => $processingOrdersCount ?? 0,
            'filters' => [
                'beneficiary_number' => $request->get('beneficiary_number'),
                'order_id' => $request->get('order_id'),
            ],
        ]);
    }

    // Handle checkout and create separate orders for each network
    public function checkout(Request $request)
    {
        Log::info('Checkout process started.');
        $user = Auth::user();

        $cartItems = Cart::where('user_id', $user->id)->with(['product', 'productVariant'])->get();
        Log::info('Cart items fetched.', ['cartItemsCount' => $cartItems->count()]);

        if ($cartItems->isEmpty()) {
            Log::warning('Cart is empty for user.', ['userId' => $user->id]);
            return redirect()->back()->with('error', 'Cart is empty');
        }

        // Calculate total by summing the price of each cart item
        $total = $cartItems->sum(function ($item) {
            return (float) ($item->price ?? ($item->productVariant->price ?? 0));
        });
        Log::info('Total calculated.', ['total' => $total, 'walletBalance' => $user->wallet_balance]);

        // Check if user has enough wallet balance
        if ($user->wallet_balance < $total) {
            Log::warning('Insufficient wallet balance.', ['userId' => $user->id, 'walletBalance' => $user->wallet_balance, 'total' => $total]);
            return redirect()->back()->with('error', 'Insufficient wallet balance. Top up to proceed with the purchase.');
        }

        Log::info('Creating separate orders for each cart item.', ['cartItemsCount' => $cartItems->count()]);

        DB::beginTransaction();
        Log::info('Database transaction started.');
        try {
            // Deduct wallet balance (use bcsub for decimal math and cast to float for decimal:2)
            $user->wallet_balance = (float) bcsub((string) $user->wallet_balance, (string) $total, 2);
            $user->save();
            Log::info('Wallet balance deducted.', ['userId' => $user->id, 'newWalletBalance' => $user->wallet_balance]);

            $createdOrders = [];

            // Create separate order for each cart item
            foreach ($cartItems as $item) {
                $itemTotal = (float) ($item->price ?? ($item->productVariant->price ?? 0));
                $network = $item->product->network;

                // Create the order for this item
                $order = Order::create([
                    'user_id' => $user->id,
                    'status' => strtolower($network) === 'ishare' ? 'completed' : 'pending',
                    'total' => $itemTotal,
                    'beneficiary_number' => $item->beneficiary_number,
                    'network' => $network,
                ]);
                Log::info('Order created for cart item.', ['orderId' => $order->id, 'network' => $network, 'total' => $itemTotal, 'beneficiaryNumber' => $item->beneficiary_number]);

                // Attach the product to the order
                $order->products()->attach($item->product_id, [
                    'quantity' => (int) ($item->quantity ?? 1),
                    'price' => $itemTotal,
                    'beneficiary_number' => $item->beneficiary_number,
                    'product_variant_id' => $item->product_variant_id,
                ]);
                Log::info('Product attached to order.', ['orderId' => $order->id, 'productId' => $item->product_id, 'beneficiaryNumber' => $item->beneficiary_number]);

                // Create a transaction record for this order
                \App\Models\Transaction::create([
                    'user_id' => $user->id,
                    'order_id' => $order->id,
                    'amount' => $itemTotal,
                    'status' => 'completed',
                    'type' => 'order',
                    'description' => 'Order placed for ' . $network . ' data/airtime.',
                ]);
                Log::info('Transaction created for order.', ['orderId' => $order->id, 'network' => $network]);

                $createdOrders[] = $order;
            }

            // Clear user's cart
            Cart::where('user_id', $user->id)->delete();
            Log::info('Cart cleared.', ['userId' => $user->id]);

            DB::commit();
            Log::info('Database transaction committed.');

            // Push orders to external API
            $orderPusherEnabled = (bool) Setting::get('order_pusher_enabled', 1);
            
            foreach ($createdOrders as $order) {
                try {
                    if ($orderPusherEnabled) {
                        $orderPusher = new OrderPusherService();
                        $orderPusher->pushOrderToApi($order);
                        Log::info('Order pushed to API', ['orderId' => $order->id, 'network' => $order->network]);
                    } else {
                        Log::info('Order pusher disabled', ['orderId' => $order->id, 'network' => $order->network]);
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to push order to external API', ['orderId' => $order->id, 'network' => $order->network, 'error' => $e->getMessage()]);
                }
            }

            $orderCount = count($createdOrders);
            $successMessage = $orderCount === 1 
                ? 'Order placed successfully!' 
                : "$orderCount orders placed successfully!";

            return redirect()->route('dashboard.orders')->with('success', $successMessage);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Checkout failed during transaction.', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return redirect()->back()->with('error', 'Checkout failed: ' . $e->getMessage());
        }
    }
}