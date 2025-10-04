<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Order Debug ===\n";

// Check database connection
try {
    $orders = \App\Models\Order::whereIn('status', ['pending', 'processing'])->get();
    echo "Found " . $orders->count() . " orders to sync\n";
    
    foreach ($orders as $order) {
        echo "Order ID: {$order->id}, Status: {$order->status}, Reference: {$order->reference_id}\n";
    }
    
    if ($orders->count() > 0) {
        echo "\n=== Testing Sync Service ===\n";
        $smsService = app(\App\Services\MoolreSmsService::class);
        $syncService = new \App\Services\OrderStatusSyncService($smsService);
        $syncService->syncOrderStatuses();
        echo "Sync completed - check logs\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}