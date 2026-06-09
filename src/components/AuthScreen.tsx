import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  googleProvider,
  auth
} from '../firebase';
import { isFirebaseConfigured } from '../db';
import { motion } from 'motion/react';
import { Flame, Mail, Lock, LogIn, Sparkles, UserPlus } from 'lucide-react';

interface AuthScreenProps {
  onSuccess: (userId: string, email: string, name: string) => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fallback simulator handler if Firebase config keys are absent
  const handleSimulatedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onSuccess("simulated_pioneer_101", email || "pioneer@genify.io", name || "GenFlow Pioneer");
      setLoading(false);
    }, 800);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isFirebaseConfigured) {
      handleSimulatedSubmit(e);
      return;
    }

    if (!email || !password) {
      setError('Please fill in all email and password fields.');
      return;
    }

    if (isSignUp && !name) {
      setError('Please provide your name.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        onSuccess(credential.user.uid, credential.user.email || email, name);
      } else {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        onSuccess(credential.user.uid, credential.user.email || email, credential.user.displayName || "Explorer");
      }
    } catch (err: any) {
      console.error(err);
      let readableError = err.message || "Authentication attempt failed.";
      if (err.code === 'auth/invalid-credential') readableError = "Invalid email or password credential.";
      if (err.code === 'auth/email-already-in-use') readableError = "This email is already registered.";
      if (err.code === 'auth/weak-password') readableError = "Password should be at least 6 characters.";
      setError(readableError);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    
    if (!isFirebaseConfigured) {
      setLoading(true);
      setTimeout(() => {
        onSuccess("simulated_pioneer_101", "pioneer@genify.io", "Google Pioneer");
        setLoading(false);
      }, 600);
      return;
    }

    setLoading(true);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      onSuccess(
        credential.user.uid, 
        credential.user.email || "", 
        credential.user.displayName || "Google Pioneer"
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google Authentication failed. Please verify your config.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-screen-container" className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm bg-[#0f1e35]/90 backdrop-blur-2xl rounded-[32px] p-6 md:p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
      >
        {/* Brand Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="mx-auto w-14 h-14 rounded-full bg-[#2563eb] flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(37,99,235,0.6)]">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extralight tracking-tight text-white leading-tight">
            Gen<span className="font-normal text-blue-400">Flow</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] font-light text-slate-400/80 mt-1">By Genify</p>
          <p className="text-xs text-slate-400 italic mt-3 font-light">"Set. Do. Reflect."</p>
        </div>

        {/* Floating Developer Instruction Warning */}
        {!isFirebaseConfigured && (
          <div className="mb-6 p-3 text-[10px] rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
            <div className="font-semibold flex items-center gap-1.5 mb-1 text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Sandbox Simulator active
            </div>
            Persistence is local. To set up Cloud DB, paste your keys in <code className="font-mono bg-amber-500/10 px-1 py-0.5 rounded text-white font-bold text-[9px]">src/firebase-applet-config.json</code>
          </div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/20 text-red-400"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4 relative z-10">
          {isSignUp && (
            <div>
              <label className="block text-[9px] font-medium text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Your Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Satoshi Nakamoto" 
                  className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-300 font-light"
                />
                <UserPlus className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[9px] font-medium text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-300 font-light"
              />
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-medium text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-300 font-light"
              />
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-11 rounded-full bg-[#2563eb] hover:bg-blue-500 active:scale-[0.98] text-white font-medium text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : isSignUp ? (
              <>
                <UserPlus className="w-4 h-4" /> Register & Begin
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Start Focus Session
              </>
            )}
          </button>
        </form>

        <div className="relative my-6 text-center z-10">
          <span className="absolute inset-x-0 top-3 border-t border-white/10"></span>
          <span className="relative inline-block bg-[#0f1e35] px-3 text-[9px] text-slate-500 tracking-wider font-semibold">OR CONTINUE WITH</span>
        </div>

        <button 
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full h-11 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 active:scale-[0.98] text-white font-medium text-xs tracking-wider uppercase flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer disabled:opacity-50 z-10 relative"
        >
          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.125C18.465 1.91 15.65 1 12.24 1c-6.075 0-11 4.925-11 11s4.925 11 11 11c6.338 0 10.56-4.45 10.56-10.75 0-.725-.075-1.275-.175-1.965H12.24z"
            />
          </svg>
          Google Account
        </button>

        {/* Toggle Mode */}
        <div className="mt-6 text-center text-xs text-slate-400 relative z-10 font-light">
          {isSignUp ? "Already have an account? " : "New to GenFlow? "}
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-400 hover:underline font-semibold transition-all duration-200"
          >
            {isSignUp ? "Sign In Instead" : "Create Account Now"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
