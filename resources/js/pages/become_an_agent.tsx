import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function BecomeAnAgent() {
    const { data, setData, post, processing, errors } = useForm({
        amount: 50
    });

    const handleBecomeAgent = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('become_a_dealer.update'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            <Head title="Become an Agent" />
            <div className="w-full max-w-sm">
                <div className="bg-slate-800 rounded-lg shadow-lg p-8">
                    <div className="flex flex-col items-center mb-8">
                        <img src='/datafraternity.png' alt="Logo" className="w-60 h-30 mb-6 rounded-lg" />
                        <h1 className="text-2xl font-bold text-gray-100 text-center">
                            Become a Dealer
                        </h1>
                        <p className="text-gray-100 text-sm text-center mt-2">
                            You may proceed to make payment if you’re able to make daily MTN sales of GHC 2,000  or more for this better deal.
                             Thank you and enjoy!
                        </p>
                    </div>
                    <form onSubmit={handleBecomeAgent} className="space-y-4">
                        <input type="hidden" name="amount" value="200" />
                        <Button 
                            className="w-full bg-blue-800 hover:bg-blue-600 text-white py-3 rounded-md font-medium transition-colors" 
                            disabled={processing}
                        >
                            {processing ? 'Processing...' : 'Pay GHS 200.00 to Become A Dealer'}
                        </Button>
                        {errors.message && <div className="text-red-500 text-xs mt-1">{errors.message}</div>}
                    </form>
                    <div className="mt-6 text-center">
                        <div className="text-sm">
                            <span className="mx-2 text-gray-400">•</span>
                            <Link href="/" className="text-blue-600 hover:underline">Home</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
