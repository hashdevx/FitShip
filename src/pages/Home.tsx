import React from 'react';
import { motion } from 'motion/react';
import { Zap, Shield, MapPin, Dumbbell, ArrowRight, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const features = [
    {
      icon: MapPin,
      title: "Fitness Passport",
      description: "Access any partner gym in India with a single credit-based system. No multiple memberships needed."
    },
    {
      icon: Zap,
      title: "Fitship Formula",
      description: "Pay only for what you use. Credits are calculated based on the gym's monthly fee. Fair and transparent."
    },
    {
      icon: Dumbbell,
      title: "AI Muscle Tracker",
      description: "Log your workouts and let our AI analyze your muscle balance. Never neglect a muscle group again."
    },
    {
      icon: Shield,
      title: "Gym Management",
      description: "Gym owners get a powerful CRM to manage permanent members and earn extra from Fitship users."
    }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 mb-6">
                  <Zap className="w-4 h-4 mr-2 fill-indigo-700" />
                  Har Gym Tera Gym
                </span>
                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-tight">
                  India's First <span className="text-indigo-600">Hybrid Gym</span> Aggregator
                </h1>
                <p className="text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
                  Fitship gives you the freedom to train anywhere. One wallet, hundreds of gyms, and AI-powered tracking to keep your progress on point.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/discover"
                    className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                  >
                    Find a Gym
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/auth"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-bold rounded-xl border-2 border-gray-100 hover:border-indigo-600 transition-all"
                  >
                    Partner with Us
                  </Link>
                </div>
              </motion.div>
            </div>
            <div className="hidden lg:block lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -top-10 -left-10 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="relative bg-gray-900 rounded-3xl p-8 shadow-2xl">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-500 rounded-lg"></div>
                      <div className="w-24 h-3 bg-gray-700 rounded-full"></div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-800"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-32 bg-gray-800 rounded-2xl p-4 flex flex-col justify-between">
                      <div className="w-1/2 h-2 bg-gray-700 rounded-full"></div>
                      <div className="flex justify-between items-end">
                        <div className="w-1/3 h-8 bg-indigo-500 rounded-lg"></div>
                        <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-gray-800 rounded-2xl p-4">
                        <div className="w-1/2 h-2 bg-gray-700 rounded-full mb-4"></div>
                        <div className="w-full h-8 bg-purple-500 rounded-lg"></div>
                      </div>
                      <div className="h-24 bg-gray-800 rounded-2xl p-4">
                        <div className="w-1/2 h-2 bg-gray-700 rounded-full mb-4"></div>
                        <div className="w-full h-8 bg-emerald-500 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Everything you need to stay fit</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Fitship combines the best of gym management and user discovery to create a seamless fitness ecosystem.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Credit Model Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-600 rounded-3xl p-8 lg:p-16 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
            <div className="relative z-10 lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6">The Fitship Formula</h2>
                <p className="text-indigo-100 text-lg mb-8 leading-relaxed">
                  We believe in fair pricing. Our credit system is derived directly from the gym's monthly fee, ensuring you pay exactly what a local member would, plus a small convenience factor.
                </p>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <p className="text-sm font-medium text-indigo-200 mb-2 uppercase tracking-wider">Session Cost Calculation</p>
                  <p className="text-2xl font-mono font-bold">
                    (Monthly Fee / 30) * 2
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-sm text-indigo-100">
                      Example: ₹1500 Monthly Fee = <span className="font-bold text-white">100 Credits</span> per session
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-12 lg:mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                    <p className="text-3xl font-bold mb-1">80%</p>
                    <p className="text-sm text-indigo-200">Goes to Gym Owner</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                    <p className="text-3xl font-bold mb-1">20%</p>
                    <p className="text-sm text-indigo-200">Fitship Commission</p>
                  </div>
                  <div className="col-span-2 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                    <p className="text-xl font-bold mb-1">90 Days Free</p>
                    <p className="text-sm text-indigo-200">Trial for Gym Owners to use our SaaS CRM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
