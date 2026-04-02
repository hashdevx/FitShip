import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Search, Filter, Star, Zap, CheckCircle2, X, Navigation, Info, Dumbbell } from 'lucide-react';

interface Gym {
  id: string;
  name: string;
  monthly_fee: number;
  session_cost: number;
  address: string;
  verified_status: string;
  photos: string[];
  equipment: string[];
  location?: { lat: number; lng: number };
}

export default function Discover() {
  const { user, profile, refreshProfile } = useAuth();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const q = query(collection(db, 'gyms'), where('verified_status', '==', 'verified'));
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

  const handleCheckIn = async (gym: Gym) => {
    if (!user || !profile) return;
    if (profile.credits < gym.session_cost) {
      alert('Insufficient credits! Please recharge your wallet.');
      return;
    }

    setCheckingIn(true);
    try {
      // 1. Deduct credits from user
      await updateDoc(doc(db, 'users', user.uid), {
        credits: increment(-gym.session_cost)
      });

      // 2. Create transaction record
      const ownerShare = Math.floor(gym.session_cost * 0.8);
      const commission = gym.session_cost - ownerShare;

      await addDoc(collection(db, 'transactions'), {
        user_id: user.uid,
        gym_id: gym.id,
        amount: gym.session_cost,
        owner_share: ownerShare,
        commission: commission,
        type: 'check-in',
        timestamp: serverTimestamp()
      });

      // 3. Log workout (initial empty log)
      await addDoc(collection(db, 'workout_logs'), {
        user_id: user.uid,
        gym_id: gym.id,
        muscle_array: [],
        timestamp: serverTimestamp(),
        status: 'active'
      });

      setCheckInSuccess(true);
      await refreshProfile();
      setTimeout(() => {
        setCheckInSuccess(false);
        setSelectedGym(null);
      }, 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'transactions');
    } finally {
      setCheckingIn(false);
    }
  };

  const filteredGyms = gyms.filter(gym => 
    gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gym.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Discover Gyms</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by gym name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-200 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-3xl h-96 animate-pulse border border-gray-100"></div>
          ))}
        </div>
      ) : filteredGyms.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No gyms found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGyms.map((gym) => (
            <motion.div
              key={gym.id}
              layoutId={gym.id}
              onClick={() => setSelectedGym(gym)}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 cursor-pointer group"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={gym.photos?.[0] || `https://picsum.photos/seed/${gym.id}/800/600`}
                  alt={gym.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-gray-900">4.8</span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                    {gym.session_cost} Credits
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{gym.name}</h3>
                  <Zap className="w-5 h-5 text-indigo-600 fill-indigo-600" />
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{gym.address}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {gym.equipment?.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                      {item}
                    </span>
                  ))}
                  {gym.equipment?.length > 3 && (
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                      +{gym.equipment.length - 3} More
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Gym Detail Modal */}
      <AnimatePresence>
        {selectedGym && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGym(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              layoutId={selectedGym.id}
              className="relative bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setSelectedGym(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="h-72 relative">
                <img
                  src={selectedGym.photos?.[0] || `https://picsum.photos/seed/${selectedGym.id}/800/600`}
                  alt={selectedGym.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-8 left-8 text-white">
                  <h2 className="text-4xl font-bold mb-2">{selectedGym.name}</h2>
                  <p className="flex items-center gap-2 text-gray-200">
                    <MapPin className="w-5 h-5" />
                    {selectedGym.address}
                  </p>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className="bg-indigo-50 rounded-3xl p-6">
                    <p className="text-indigo-600 font-bold text-sm uppercase tracking-wider mb-1">Session Cost</p>
                    <p className="text-3xl font-black text-indigo-900">{selectedGym.session_cost} Credits</p>
                  </div>
                  <div className="bg-emerald-50 rounded-3xl p-6">
                    <p className="text-emerald-600 font-bold text-sm uppercase tracking-wider mb-1">Monthly Fee</p>
                    <p className="text-3xl font-black text-emerald-900">₹{selectedGym.monthly_fee}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-indigo-600" />
                    Available Equipment
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedGym.equipment?.map((item, idx) => (
                      <span key={idx} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleCheckIn(selectedGym)}
                    disabled={checkingIn || checkInSuccess}
                    className={`flex-1 py-5 rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-3 ${
                      checkInSuccess 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                    }`}
                  >
                    {checkingIn ? (
                      'Processing...'
                    ) : checkInSuccess ? (
                      <>
                        <CheckCircle2 className="w-6 h-6" />
                        Check-in Successful!
                      </>
                    ) : (
                      <>
                        <Zap className="w-6 h-6 fill-white" />
                        Check-in Now
                      </>
                    )}
                  </button>
                  <button className="p-5 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors">
                    <Navigation className="w-6 h-6" />
                  </button>
                </div>
                
                {profile && profile.credits < selectedGym.session_cost && (
                  <p className="mt-4 text-center text-red-500 text-sm font-medium flex items-center justify-center gap-2">
                    <Info className="w-4 h-4" />
                    Insufficient credits. Your balance: {profile.credits}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
