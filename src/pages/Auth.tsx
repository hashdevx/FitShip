import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Zap, CheckCircle2 } from 'lucide-react';

export default function Auth() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectRole = async (role: 'user' | 'owner') => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { role });
      navigate(role === 'owner' ? '/owner' : '/discover');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user && profile && !profile.role) {
    // Role selection for new users
    return (
      <div className="min-h-[calc(100-64px)] flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Fitship!</h1>
            <p className="text-xl text-gray-600">How would you like to use the platform?</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectRole('user')}
              className="bg-white p-8 rounded-3xl border-2 border-transparent hover:border-indigo-600 shadow-xl text-left group transition-all"
            >
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                <User className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">I'm a Gym Goer</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Access any partner gym
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Pay per session with credits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  AI Muscle tracking & logs
                </li>
              </ul>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectRole('owner')}
              className="bg-white p-8 rounded-3xl border-2 border-transparent hover:border-indigo-600 shadow-xl text-left group transition-all"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
                <Shield className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">I'm a Gym Owner</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Free CRM for 90 days
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Earn from Fitship global users
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Manage local memberships
                </li>
              </ul>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    navigate(profile?.role === 'owner' ? '/owner' : '/discover');
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 lg:p-12"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-6">
            <Zap className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Join the fitness revolution in India</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-100 rounded-xl font-bold text-gray-900 hover:border-indigo-600 transition-all disabled:opacity-50"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <p className="mt-8 text-center text-xs text-gray-400 uppercase tracking-widest font-bold">
          Har Gym Tera Gym
        </p>
      </motion.div>
    </div>
  );
}
