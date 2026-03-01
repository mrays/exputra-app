'use client';

import { useState } from 'react';

export default function DebugPage() {
  const [invoiceId, setInvoiceId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckStatus = async () => {
    const id = invoiceId.trim();
    if (!id) {
      setError('Please enter Invoice ID');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(
        `/api/order/update-status?invoiceId=${encodeURIComponent(id)}`
      );
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || 'Failed to check status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    const id = invoiceId.trim();
    if (!id) {
      setError('Please enter Invoice ID');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/order/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: id }),
      });
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || 'Failed to update status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">💳 Payment Status Debug Tool</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-blue-900 mb-3">📋 Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>Enter your Invoice ID below (format: INV-DDMMYY-HHMMSS)</li>
          <li>Click "Check Status" to view current order status</li>
          <li>Click "Update to PAID" to manually update order status (for testing)</li>
          <li>Check the response below for order and domain details</li>
        </ol>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-6">Order Status Query</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice ID
            </label>
            <input
              type="text"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              placeholder="INV-300126-150330"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCheckStatus}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 font-medium transition-colors"
            >
              {loading ? 'Loading...' : 'Check Status'}
            </button>
            <button
              onClick={handleUpdateStatus}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium transition-colors"
            >
              {loading ? 'Loading...' : 'Update to PAID'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
            <p className="text-red-700 font-medium">❌ Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-300 rounded-lg p-4">
            <p className="text-green-700 font-bold mb-3">✅ {result.message || 'Success'}</p>
            <pre className="bg-white rounded p-3 text-xs overflow-auto border border-green-200">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-bold text-yellow-900 mb-2">⚠️ About This Tool</h3>
        <p className="text-yellow-800 text-sm mb-3">
          This debug page helps diagnose payment issues. You can:
        </p>
        <ul className="text-yellow-800 text-sm space-y-1">
          <li>• Check the current status of any order</li>
          <li>• View associated domain records</li>
          <li>• Manually update order status (for testing purposes only)</li>
        </ul>
      </div>
    </div>
  );
}

