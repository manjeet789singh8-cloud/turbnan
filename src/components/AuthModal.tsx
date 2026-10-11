import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from '../firebase';
import { RESTAURANT_INFO } from '../data/menuData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userDisplayName?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setErrorMessage('');
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setSuccessNotice(`Welcome back, ${result.user.displayName || result.user.email}!`);
      window.setTimeout(() => {
        onSuccess(result.user.displayName || undefined);
        onClose();
      }, 700);
    } catch (err: unknown) {
      console.error('Google Auth Error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('popup-closed-by-user')) {
        setErrorMessage('Sign in was canceled. Please try again.');
      } else {
        setErrorMessage(
          'Could not complete Google authentication. Please try again or use email sign-in.'
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
        if (fullName.trim()) {
          await updateProfile(userCredential.user, {
            displayName: fullName.trim(),
          });
        }
        setSuccessNotice('Account created successfully with Firebase!');
        window.setTimeout(() => {
          onSuccess(fullName.trim() || userCredential.user.email || undefined);
          onClose();
        }, 800);
      } else {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
        setSuccessNotice('Signed in successfully with Firebase!');
        window.setTimeout(() => {
          onSuccess(userCredential.user.displayName || userCredential.user.email || undefined);
          onClose();
        }, 800);
      }
    } catch (err: unknown) {
      console.error('Email Auth Error:', err);
      const code = (err as { code?: string }).code || '';
      if (code === 'auth/operation-not-allowed') {
        setErrorMessage(
          'Email/Password provider is not yet toggled on in your Firebase Console. Please use Google Sign In above, which is pre-configured and active!'
        );
      } else if (code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this email already exists. Try signing in instead.');
      } else if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        setErrorMessage('Invalid email or password. Please verify your credentials.');
      } else if (code === 'auth/weak-password') {
        setErrorMessage('Password is too weak. Please choose a stronger password.');
      } else {
        setErrorMessage(
          (err as { message?: string }).message || 'Authentication error. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#18191D] border border-white/[0.12] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-neutral-900 to-[#202227] border-b border-white/[0.08] flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold text-amber-400">
                {RESTAURANT_INFO.name}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Firebase Auth
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {mode === 'signin'
                ? 'Sign in to access your orders, favorites & saved addresses'
                : 'Create an account to save your delivery preferences'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Sign In vs Sign Up Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-white/[0.08] rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage('');
                setSuccessNotice('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center ${
                mode === 'signin'
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-100'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage('');
                setSuccessNotice('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center ${
                mode === 'signup'
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-100'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Feedback alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* 1-Click Google Sign In (Recommended) */}
          <div className="space-y-2">
            <button
              type="button"
              disabled={googleLoading || loading}
              onClick={handleGoogleAuth}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-3 disabled:opacity-60 shadow-md"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>
                {mode === 'signin' ? 'Continue with Google' : 'Sign Up with Google'}
              </span>
            </button>
            <p className="text-[11px] text-center text-neutral-400">
              Instant 1-click Google OAuth setup through Firebase
            </p>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/[0.08] w-full" />
            <span className="bg-[#18191D] px-3 text-[11px] text-neutral-500 uppercase tracking-wider font-medium">
              or with email &amp; password
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="space-y-1.5">
                  <label
                    htmlFor="auth-fullname"
                    className="block text-xs font-medium text-neutral-300"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-fullname"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Manjeet Singh"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-neutral-900 border border-white/[0.1] rounded-xl text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="auth-phone"
                    className="block text-xs font-medium text-neutral-300"
                  >
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765-43210"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs font-mono bg-neutral-900 border border-white/[0.1] rounded-xl text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="auth-email"
                className="block text-xs font-medium text-neutral-300"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-neutral-900 border border-white/[0.1] rounded-xl text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="auth-password"
                className="block text-xs font-medium text-neutral-300"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-neutral-900 border border-white/[0.1] rounded-xl text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-950" />}
              <span>
                {mode === 'signin' ? 'Sign In to Your Account' : 'Create Firebase Account'}
              </span>
            </button>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-neutral-950/70 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-neutral-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted with Firebase</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
              setErrorMessage('');
              setSuccessNotice('');
            }}
            className="text-amber-400 hover:underline cursor-pointer"
          >
            {mode === 'signin' ? 'Need an account? Sign Up' : 'Already registered? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};
