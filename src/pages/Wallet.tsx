import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, addDoc, serverTimestamp, doc, updateDoc, increment, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { motion } from 'motion/react';
import { Wallet as WalletIcon, CreditCard, History, Zap, ArrowUpRight, ArrowDownLeft, CheckCircle2, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  amount: number;
  type: 'recharge' | 'check-in';
  timestamp: any;
  gym_id?: string;
}

export default function Wallet() {
  const { user, profile, refreshProfile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [recharging, setRecharging] = useState(false);
  const [success, setSuccess] = useState(false);

  const creditPacks = [
    { credits: 500, price: 500, bonus: 0 },
    { credits: 1000, price: 950, bonus: 50 },
    { credits: 2500, price: 2200, bonus: 300 },
    { credits: 5000, price: 4000, bonus: 1000 },
  ];

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'transactions'),
          where('user_id', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        const txList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
        setTransactions(txList);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user]);

  const handleRecharge = async (pack: typeof creditPacks[0]) => {
    if (!user) return;
    setRecharging(true);
    try {
      // Simulate payment gateway
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 1. Update user credits
      await updateDoc(doc(db, 'users', user.uid), {
        credits: increment(pack.credits + pack.bonus)
      });

      // 2. Log transaction
      await addDoc(collection(db, 'transactions'), {
        user_id: user.uid,
        amount: pack.credits + pack.bonus,
        type: 'recharge',
        timestamp: serverTimestamp()
      });

      setSuccess(true);
      await refreshProfile();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'transactions');
    } finally {
      setRecharging(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Balance & Packs */}
        <div className="lg:col-span-7 space-y-8">
          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-600 rounded-[2.5rem] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-200"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                  <WalletIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold">Fitship Wallet</h2>
              </div>
              <p className="text-indigo-100 text-sm font-medium uppercase tracking-widest mb-2">Available Balance</p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-6xl font-black">{profile?.credits || 0}</span>
                <span className="text-2xl font-bold text-indigo-200">Credits</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-sm font-medium">
                  1 Credit = ₹1
                </div>
                <div className="px-4 py-2 bg-emerald-400/20 backdrop-blur-md rounded-xl border border-emerald-400/30 text-sm font-medium text-emerald-100 flex items-center gap-2">
                  <Zap className="w-4 h-4 fill-emerald-400" />
                  Instant Check-in
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recharge Packs */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-indigo-600" />
              Buy Credit Packs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {creditPacks.map((pack, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRecharge(pack)}
                  disabled={recharging}
                  className="bg-white p-6 rounded-3xl border-2 border-gray-100 hover:border-indigo-600 transition-all text-left relative group shadow-sm hover:shadow-md"
                >
                  {pack.bonus > 0 && (
                    <span className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">
                      +{pack.bonus} Bonus
                    </span>
                  )}
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Pack {idx + 1}</p>
                  <p className="text-3xl font-black text-gray-900 mb-4">{pack.credits} <span className="text-lg font-bold text-gray-400">Credits</span></p>
                  <div className="flex justify-between items-center">
                    <p className="text-xl font-bold text-indigo-600 flex items-center">
                      <IndianRupee className="w-4 h-4" />
                      {pack.price}
                    </p>
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                      <Zap className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm h-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <History className="w-6 h-6 text-indigo-600" />
              Recent Activity
            </h3>
            
            <div className="space-y-6">
              {loading ? (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="w-1/2 h-3 bg-gray-100 rounded-full"></div>
                      <div className="w-1/3 h-2 bg-gray-50 rounded-full"></div>
                    </div>
                  </div>
                ))
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 font-medium">No transactions yet</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                        tx.type === 'recharge' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {tx.type === 'recharge' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 capitalize">{tx.type.replace('-', ' ')}</p>
                        <p className="text-xs text-gray-400 font-medium">
                          {tx.timestamp?.toDate ? format(tx.timestamp.toDate(), 'MMM dd, hh:mm a') : 'Just now'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-lg ${
                        tx.type === 'recharge' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {tx.type === 'recharge' ? '+' : '-'}{tx.amount}
                      </p>
                      <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Credits</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button className="w-full mt-10 py-4 text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
              View Full Statement
            </button>
          </div>
        </div>
      </div>

      {/* Success Overlay */}
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
        >
          <CheckCircle2 className="w-6 h-6" />
          Recharge Successful!
        </motion.div>
      )}
    </div>
  );
}
