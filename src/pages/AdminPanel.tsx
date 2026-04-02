import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  IndianRupee, 
  TrendingUp,
  Search,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

interface Gym {
  id: string;
  name: string;
  owner_id: string;
  monthly_fee: number;
  session_cost: number;
  verified_status: string;
  address: string;
  createdAt: any;
}

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('pending');

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const q = query(collection(db, 'gyms'), orderBy('verified_status', 'asc'));
        const querySnapshot = await getDocs(q);
        const gymList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gym));
        setGyms(gymList);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'gyms');
      } finally {
        setLoading(false);
      }
    };
    fetchGyms();
  }, []);

  const handleVerify = async (gymId: string, status: 'verified' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'gyms', gymId), { verified_status: status });
      setGyms(prev => prev.map(g => g.id === gymId ? { ...g, verified_status: status } : g));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'gyms');
    }
  };

  const filteredGyms = gyms.filter(g => filter === 'all' || g.verified_status === filter);

  if (!isAdmin) return <div className="p-20 text-center">Access Denied</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            Admin Control Center
          </h1>
          <p className="text-gray-500 font-medium">Manage gym onboarding and platform verification</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
          {(['all', 'pending', 'verified'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Pending Approvals</p>
          <p className="text-4xl font-black text-amber-500">{gyms.filter(g => g.verified_status === 'pending').length}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Total Partners</p>
          <p className="text-4xl font-black text-indigo-600">{gyms.length}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Platform Revenue</p>
          <p className="text-4xl font-black text-emerald-500">₹4.2L</p>
        </div>
      </div>

      {/* Gym List */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Gym Details</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-10">
                      <div className="h-4 bg-gray-50 rounded-full w-1/2"></div>
                    </td>
                  </tr>
                ))
              ) : filteredGyms.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-medium">
                    No gyms matching this filter
                  </td>
                </tr>
              ) : (
                filteredGyms.map((gym) => (
                  <tr key={gym.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{gym.name}</p>
                          <p className="text-sm text-gray-500 max-w-xs truncate">{gym.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div>
                        <p className="font-black text-gray-900">₹{gym.monthly_fee}</p>
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{gym.session_cost} Credits/Session</p>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        gym.verified_status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 
                        gym.verified_status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {gym.verified_status}
                      </span>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <div className="flex justify-end gap-2">
                        {gym.verified_status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleVerify(gym.id, 'verified')}
                              className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleVerify(gym.id, 'rejected')}
                              className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-colors">
                          <ExternalLink className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
