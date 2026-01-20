import './WaitlistModal.css';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function WaitlistModal({ onClose }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Check if user just authenticated via OAuth
  useEffect(() => {
    const checkSession = async () => {
      // Check URL for OAuth callback tokens
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      
      if (accessToken) {
        // Clear the hash from URL without reload
        window.history.replaceState(null, '', window.location.pathname);
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email) {
        // User authenticated, add to waitlist
        await addToWaitlist(session.user.email);
      }
      setCheckingAuth(false);
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email) {
        await addToWaitlist(session.user.email);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const addToWaitlist = async (email) => {
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    // Insert into supabase waitlist
    const { error: dbError } = await supabase
      .from('waitlist')
      .insert([{ email: cleanEmail }]);

    if (dbError) {
      if (dbError.code === '23505') {
        // Already on waitlist - still show success since they're verified
        setSuccess(true);
        setLoading(false);
        await supabase.auth.signOut();
        localStorage.removeItem('waitlist_pending');
        return;
      } else {
        setError('Something went wrong.');
        setLoading(false);
        return;
      }
    }

    // Insert into google sheets
    try {
      const res = await fetch(import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      if (!res.ok) {
        console.error('Sheets error:', res.status);
      }
    } catch (err) {
      console.error('Error adding to Sheets:', err);
    }

    // Sign out after adding to waitlist (cleanup)
    await supabase.auth.signOut();
    
    // Clear the pending flag
    localStorage.removeItem('waitlist_pending');
    
    setSuccess(true);
    setLoading(false);
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    
    // Store flag so we know to open modal after redirect
    localStorage.setItem('waitlist_pending', 'true');
    
    // Use the current origin (works for both localhost and production)
    const redirectUrl = window.location.origin;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      }
    });

    if (error) {
      setError('Failed to connect with Google.');
      setLoading(false);
      localStorage.removeItem('waitlist_pending');
    }
  };

  if (checkingAuth) {
    return (
      <div className="modal-backdrop">
        <div className="modal">
          <div className="loading-spinner"></div>
          <p className="loading-text">Verifying...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={success ? onClose : undefined}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {success ? (
          <>
            <div className="success-icon">✓</div>
            <h3>You're in!</h3>
            <p className="success-text">We'll be in touch soon.</p>
            <button className="close-btn" onClick={onClose}>Done</button>
          </>
        ) : (
          <>
            <h3>Join the waitlist</h3>
            <p className="modal-subtitle">Sign in to verify your email</p>

            <div className="oauth-buttons">
              <button 
                className="oauth-btn google-btn" 
                onClick={signInWithGoogle}
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            {loading && <p className="loading-text">Connecting...</p>}
            {error && <p className="error">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
