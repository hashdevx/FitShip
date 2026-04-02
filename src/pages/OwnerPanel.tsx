import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, addDoc, serverTimestamp, doc, updateDoc, increment, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  Zap, 
  Wallet, 
  Plus, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ArrowUpRight,
  Settings,
  Image as ImageIcon,
  Dumbbell
} from 'lucide-react';
import { format } from 'date-fns';

interface Gym {
  id: string;
  name: string;
  monthly_fee: number;
  session_cost: number;
  verified_status: string;
  trial_end_date: any;
  owner_id: string;
}

interface Member {
  id: string;
  name: string;
  phone: string;
  expiry: string;
  type: 'permanent' | 'global';
}

export default function OwnerPanel() {
  const { user, profile } = useAuth();
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddGym, setShowAddGym] = useState(false);
  const [newGym, setNewGym] = useState({ name: '', monthly_fee: 1500, address: '' });
  const [members, setMembers] = useState<Member[]>([
    { id: '1', name: 'Rahul Sharma', phone: '9876543210', expiry: '2026-05-10', type: 'permanent' },
    { id: '2', name: 'Priya Singh', phone: '9822334455', expiry: '2026-04-20', type: 'global' },
  ]);

  useEffect(() => {
    const fetchGym = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'gyms'), where('owner_id', '==', user.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const gymData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Gym;
          setGym(gymData);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'gyms');
      } finally {
        setLoading(false);
      }
    };
    fetchGym();
  }, [user]);

  const handleCreateGym = async () => {
    if (!user) return;
    try {
      const session_cost = Math.floor((newGym.monthly_fee / 30) * 2);
      const trial_end = new Date();
      trial_end.setDate(trial_end.getDate() + 90);

      const gymRef = await addDoc(collection(db, 'gyms'), {
        ...newGym,
        owner_id: user.uid,
        session_cost,
        verified_status: 'pending',
        trial_end_date: trial_end.toISOString(),
        equipment: ['Treadmill', 'Dumbbells', 'Bench Press'],
        photos: []
      });

      setGym({ id: gymRef.id, ...newGym, session_cost, verified_status: 'pending', trial_end_date: trial_end.toISOString(), owner_id: user.uid });
      setShowAddGym(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'gyms');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  if (!gym) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Zap className="w-12 h-12 text-indigo-600 fill-indigo-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Register Your Gym</h1>
        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
          Join the Fitship network and start managing your gym with our powerful SaaS tools. Earn extra revenue from global users.
        </p>
        
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 text-left space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Gym Name</label>
            <input
              type="text"
              placeholder="e.g. Powerhouse Fitness"
              value={newGym.name}
              onChange={(e) => setNewGym({ ...newGym, name: e.target.value })}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Monthly Fee (₹)</label>
            <input
              type="number"
              value={newGym.monthly_fee}
              onChange={(e) => setNewGym({ ...newGym, monthly_fee: parseInt(e.target.value) })}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <p className="mt-2 text-xs text-gray-400">Fitship session cost will be ₹{Math.floor((newGym.monthly_fee / 30) * 2)}</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Address</label>
            <textarea
              placeholder="Full address of your gym..."
              value={newGym.address}
              onChange={(e) => setNewGym({ ...newGym, address: e.target.value })}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-32"
            />
          </div>
          <button
            onClick={handleCreateGym}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            Submit for Verification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{gym.name}</h1>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              gym.verified_status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {gym.verified_status}
            </span>
          </div>
          <p className="text-gray-500 font-medium">Owner Dashboard • Trial ends in 82 days</p>
        </div>
        <div className="flex gap-3">
          <button className="p-4 bg-white border border-gray-200 rounded-2xl text-gray-500 hover:text-indigo-600 transition-colors shadow-sm">
            <Settings className="w-6 h-6" />
          </button>
          <button className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            <Plus className="w-5 h-5" />
            Add Member
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Members', value: '142', icon: Users, color: 'indigo' },
          { label: 'Today\'s Check-ins', value: '28', icon: Zap, color: 'amber' },
          { label: 'Pending Payout', value: '₹12,450', icon: Wallet, color: 'emerald' },
          { label: 'Growth', value: '+12%', icon: TrendingUp, color: 'purple' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className={`w-12 h-12 bg-${stat.color}-50 rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Member Management */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Member Directory</h3>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold uppercase tracking-widest">All</button>
                <button className="px-4 py-2 text-gray-400 hover:bg-gray-50 rounded-xl text-xs font-bold uppercase tracking-widest">Permanent</button>
                <button className="px-4 py-2 text-gray-400 hover:bg-gray-50 rounded-xl text-xs font-bold uppercase tracking-widest">Global</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Member</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Expiry</th>
                    <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-500">
                            {member.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{member.name}</p>
                            <p className="text-xs text-gray-400">{member.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          member.type === 'permanent' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {member.type}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {format(new Date(member.expiry), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="text-indigo-600 font-bold text-sm hover:underline">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions & Profile */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Gym Profile</h3>
            <div className="space-y-6">
              <div className="aspect-video bg-gray-100 rounded-3xl flex items-center justify-center border-2 border-dashed border-gray-200 group cursor-pointer hover:border-indigo-300 transition-colors">
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2 group-hover:text-indigo-400" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Upload Photos</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Equipment List</p>
                <div className="flex flex-wrap gap-2">
                  {['Treadmill', 'Dumbbells', 'Bench Press'].map(item => (
                    <span key={item} className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-xl text-xs font-medium border border-gray-100">
                      {item}
                    </span>
                  ))}
                  <button className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm font-bold text-gray-900">Monthly Fee</p>
                  <p className="text-lg font-black text-indigo-600">₹{gym.monthly_fee}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-gray-900">Session Cost</p>
                  <p className="text-lg font-black text-indigo-600">{gym.session_cost} Credits</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <h3 className="text-xl font-bold mb-4">Need Help?</h3>
            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
              Our partner support team is available 24/7 to help you with onboarding and payouts.
            </p>
            <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
