'use client';

import { useState, useEffect } from 'react';
import { Mail, Unlink, Loader } from 'lucide-react';
import Button from '@/components/Button';

interface GoogleAuthStatus {
  isConnected: boolean;
  email?: string;
  expiresAt?: string;
}

export default function GmailOAuthSettings() {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<GoogleAuthStatus>({
    isConnected: false,
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAuthStatus();
  }, []);

  const fetchAuthStatus = async () => {
    try {
      const res = await fetch('/api/admin/oauth/status');
      if (res.ok) {
        const data = await res.json();
        setAuthStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch auth status:', error);
    }
  };

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (!clientId || !clientSecret) {
        setMessage({
          type: 'error',
          text: 'Client ID dan Secret wajib diisi',
        });
        setLoading(false);
        return;
      }

      const res = await fetch('/api/admin/oauth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, clientSecret }),
      });

      const data = await res.json();

      if (res.ok && data.authUrl) {
        // Redirect ke Google OAuth
        window.location.href = data.authUrl;
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Gagal memulai autentikasi',
        });
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Terjadi kesalahan',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus autentikasi Gmail?')) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/oauth/disconnect', {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: 'success',
          text: 'Autentikasi Gmail berhasil dihapus',
        });
        setAuthStatus({ isConnected: false });
        setClientId('');
        setClientSecret('');
        // Refresh setelah 2 detik
        setTimeout(fetchAuthStatus, 2000);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Gagal menghapus autentikasi',
        });
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Terjadi kesalahan',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Mail className="text-blue-600" size={24} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Gmail OAuth Settings</h2>
          <p className="text-sm text-gray-600">
            Autentikasi dengan akun Google untuk mengirim email
          </p>
        </div>
      </div>

      {/* Auth Status */}
      <div className="mb-6 p-4 rounded-lg border-2 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Status Autentikasi</p>
            {authStatus.isConnected ? (
              <div className="mt-2">
                <p className="text-sm text-green-700 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Terhubung
                </p>
                {authStatus.email && (
                  <p className="text-xs text-gray-600 mt-1">Email: {authStatus.email}</p>
                )}
                {authStatus.expiresAt && (
                  <p className="text-xs text-gray-600">
                    Expired: {new Date(authStatus.expiresAt).toLocaleDateString('id-ID')}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600 mt-2">Belum terhubung dengan Gmail</p>
            )}
          </div>
          {authStatus.isConnected && (
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Unlink size={18} />
              <span className="text-sm font-medium">Disconnect</span>
            </button>
          )}
        </div>
      </div>

      {!authStatus.isConnected && (
        <>
          <form onSubmit={handleAuthenticate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client ID
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="123456789-xxx.apps.googleusercontent.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Dapatkan dari Google Cloud Console - OAuth 2.0 Credentials
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Secret
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="GOCSPX-xxx..."
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showSecret ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 18a8 8 0 100-16 8 8 0 000 16zm0-14a6 6 0 110 12 6 6 0 010-12z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Client Secret akan disimpan dengan aman di server
              </p>
            </div>

            {message.text && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.type === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              fullWidth
            >
              {loading && <Loader className="w-4 h-4 animate-spin mr-2" />}
              Autentikasi dengan Gmail
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Cara Setup Google OAuth:</h3>
            <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
              <li>Buka <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
              <li>Buat project baru atau pilih existing</li>
              <li>Aktifkan Gmail API di APIs & Services</li>
              <li>Buat OAuth 2.0 Credentials (Desktop Application)</li>
              <li>Masukkan Redirect URI: <code className="bg-white px-2 py-1 rounded text-xs">{process.env.NEXT_PUBLIC_APP_URL}/api/admin/oauth/callback</code></li>
              <li>Copy Client ID dan Secret ke form di atas</li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
}
