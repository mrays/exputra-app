'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        // Force navigation
        window.location.href = '/admin/dashboard';
      } else {
        setError(data.message || 'Login gagal');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ maxWidth: '28rem', width: '100%' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>Admin Login</h1>
            <p style={{ color: '#4b5563', marginTop: '0.5rem' }}>Website Order System</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#dc2626' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ 
                width: '100%', 
                marginTop: '1.5rem', 
                padding: '0.75rem 1rem', 
                backgroundColor: loading ? '#a5f3fc' : '#06b6d4',
                color: 'white', 
                borderRadius: '0.5rem',
                fontWeight: '500',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? '0.5' : '1'
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <Link
                href="/admin/forgot-password"
                style={{ fontSize: '0.875rem', color: '#0891b2', textDecoration: 'none', fontWeight: '500' }}
              >
                Lupa Password?
              </Link>
            </div>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link href="/" style={{ fontSize: '0.875rem', color: '#4b5563', textDecoration: 'none' }}>
              ← Kembali ke Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
