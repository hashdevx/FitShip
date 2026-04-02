import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, limit, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, History, Zap, CheckCircle2, Info, Calendar, TrendingUp, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface WorkoutLog {
  id: string;
  muscle_array: string[];
  timestamp: any;
  gym_id: string;
  intensity?: string;
  status?: string;
}

const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core'
];

export default function Workouts() {
  const { user, profile, refreshProfile } = useAuth();
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLog, setActiveLog] = useState<WorkoutLog | null>(null);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'workout_logs'),
          where('user_id', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(30)
        );
        const querySnapshot = await getDocs(q);
        const logList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkoutLog));
        setLogs(logList);
        
        // Check for active session (status == 'active')
        const active = logList.find(l => l.status === 'active');
        if (active) setActiveLog(active);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'workout_logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [user]);

  const handleSaveLog = async () => {
    if (!activeLog || selectedMuscles.length === 0) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'workout_logs', activeLog.id), {
        muscle_array: selectedMuscles,
        status: 'completed',
        intensity: 'medium'
      });
      
      // Update local state
      setLogs(prev => prev.map(l => l.id === activeLog.id ? { ...l, muscle_array: selectedMuscles, status: 'completed' } : l));
      setActiveLog(null);
      setSelectedMuscles([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'workout_logs');
    } finally {
      setSaving(false);
    }
  };

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles(prev => 
      prev.includes(muscle) ? prev.filter(m => m !== muscle) : [...prev, muscle]
    );
  };

  // AI Analysis Data
  const muscleFrequency = MUSCLE_GROUPS.map(muscle => {
    const count = logs.filter(log => log.muscle_array?.includes(muscle)).length;
    return { muscle, count };
  });

  const neglectedMuscles = muscleFrequency
    .filter(m => m.count === 0)
    .map(m => m.muscle);

  const chartData = muscleFrequency.map(m => ({
    subject: m.muscle,
    A: m.count,
    fullMark: Math.max(...muscleFrequency.map(x => x.count), 5)
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: AI Analysis & Heatmap */}
        <div className="lg:col-span-8 space-y-8">
          {/* AI Insights Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-[2.5rem] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full -mr-48 -mt-48 blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-500/20 backdrop-blur-md rounded-2xl border border-indigo-500/30">
                  <Zap className="w-8 h-8 text-indigo-400 fill-indigo-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">AI Muscle Analysis</h2>
                  <p className="text-indigo-300 text-sm">Based on your last 30 sessions</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                      <Radar
                        name="Frequency"
                        dataKey="A"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                    <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      AI Recommendation
                    </h4>
                    {neglectedMuscles.length > 0 ? (
                      <p className="text-lg leading-relaxed">
                        You haven't trained <span className="text-indigo-400 font-bold">{neglectedMuscles.slice(0, 2).join(' & ')}</span> in your recent sessions. Consider adding them to your next workout!
                      </p>
                    ) : (
                      <p className="text-lg leading-relaxed">
                        Excellent balance! You're hitting all major muscle groups consistently. Keep up the great work.
                      </p>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                      <p className="text-2xl font-black">{logs.length}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Total Sessions</p>
                    </div>
                    <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                      <p className="text-2xl font-black text-emerald-400">{muscleFrequency.filter(m => m.count > 0).length}/10</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Muscle Coverage</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Active Session Log */}
          <AnimatePresence>
            {activeLog && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[2.5rem] p-8 border-2 border-indigo-100 shadow-xl shadow-indigo-50"
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Log Active Session</h3>
                    <p className="text-gray-500">What did you train today?</p>
                  </div>
                  <div className="bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-bold animate-pulse">
                    LIVE SESSION
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
                  {MUSCLE_GROUPS.map(muscle => (
                    <button
                      key={muscle}
                      onClick={() => toggleMuscle(muscle)}
                      className={`py-4 rounded-2xl font-bold text-sm transition-all border-2 ${
                        selectedMuscles.includes(muscle)
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                          : 'bg-white border-gray-100 text-gray-500 hover:border-indigo-200'
                      }`}
                    >
                      {muscle}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleSaveLog}
                  disabled={saving || selectedMuscles.length === 0}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {saving ? 'Saving...' : (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      Complete Session
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Muscle Heatmap (Visual Representation) */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Muscle Heatmap
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {muscleFrequency.map((m, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="h-24 bg-gray-50 rounded-2xl relative overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.min((m.count / 5) * 100, 100)}%` }}
                      className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ${
                        m.count > 3 ? 'bg-emerald-400' : m.count > 0 ? 'bg-indigo-400' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase text-center tracking-widest">{m.muscle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm h-full">
            <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              Workout History
            </h3>
            
            <div className="space-y-8">
              {loading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse space-y-3">
                    <div className="w-1/2 h-4 bg-gray-100 rounded-full"></div>
                    <div className="w-full h-20 bg-gray-50 rounded-2xl"></div>
                  </div>
                ))
              ) : logs.filter(l => l.status === 'completed').length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 font-medium">No completed sessions</p>
                </div>
              ) : (
                logs.filter(l => l.status === 'completed').map((log) => (
                  <div key={log.id} className="relative pl-8 border-l-2 border-gray-100 pb-8 last:pb-0">
                    <div className="absolute left-[-9px] top-0 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white shadow-sm"></div>
                    <div className="mb-2 flex justify-between items-center">
                      <p className="font-bold text-gray-900">
                        {log.timestamp?.toDate ? format(log.timestamp.toDate(), 'MMMM dd, yyyy') : 'Recently'}
                      </p>
                      <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md uppercase tracking-widest">
                        Medium Intensity
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {log.muscle_array?.map((m, idx) => (
                        <span key={idx} className="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
