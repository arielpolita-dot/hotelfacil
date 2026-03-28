import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) { setError('Missing authorization code'); return; }

    fetch(`${API_URL}/api/auth/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code, redirect_uri: `${window.location.origin}/auth/callback` }),
    })
      .then(r => { if (!r.ok) throw new Error('Auth failed'); return r.json(); })
      .then(() => { window.location.href = '/app'; })
      .catch(e => setError(e.message));
  }, [searchParams]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Autenticando...</p>
    </div>
  );
}
