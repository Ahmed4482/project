import { useState, useEffect } from 'react';
import { Activity, Flame, Calendar, TrendingUp, User } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { statsAPI } from '../lib/api';
import { UserStats } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await statsAPI.getMe();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
      const demoStats: UserStats = {
        id: '1',
        user_id: 'demo',
        total_workouts: 142,
        calories_burned: 28450,
        active_days: 89,
        current_streak: 7,
        updated_at: new Date().toISOString(),
      };
      setStats(demoStats);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: Activity,
      label: 'Total Workouts',
      value: stats?.total_workouts || 0,
      color: 'from-blue-500 to-cyan-500',
      glow: 'shadow-blue-500/50',
    },
    {
      icon: Flame,
      label: 'Calories Burned',
      value: stats?.calories_burned.toLocaleString() || 0,
      color: 'from-orange-500 to-red-500',
      glow: 'shadow-orange-500/50',
    },
    {
      icon: Calendar,
      label: 'Active Days',
      value: stats?.active_days || 0,
      color: 'from-green-500 to-emerald-500',
      glow: 'shadow-green-500/50',
    },
    {
      icon: TrendingUp,
      label: 'Current Streak',
      value: `${stats?.current_streak || 0} days`,
      color: 'from-amber-500 to-yellow-500',
      glow: 'shadow-amber-500/50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/50 flex-shrink-0 overflow-hidden">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-white" />
          )}
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 bg-clip-text text-transparent mb-2">
            Welcome Back, {profile?.full_name || 'Champion'}
          </h1>
          <p className="text-gray-400">Your fitness journey continues</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <GlassCard key={index} hover className="animate-float" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg ${card.glow}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-400 text-sm mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-white">{card.value}</p>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-amber-500" />
            Progress Chart
          </h2>
          <div className="relative h-64">
            <div className="absolute inset-0 flex items-end justify-around space-x-2">
              {[65, 78, 82, 90, 75, 88, 95].map((height, index) => (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="w-full relative">
                    <div
                      className="w-full bg-gradient-to-t from-amber-500/80 to-orange-500/80 rounded-t-lg transition-all duration-500 hover:from-amber-400 hover:to-orange-400 group-hover:shadow-lg group-hover:shadow-amber-500/50"
                      style={{ height: `${height * 2.5}px` }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded text-xs text-amber-400 whitespace-nowrap">
                      {height}%
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { name: 'HIIT Training', time: '45 min', calories: 520 },
                { name: 'Strength Training', time: '60 min', calories: 380 },
                { name: 'Cardio Blast', time: '30 min', calories: 290 },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-amber-500/10 hover:border-amber-500/30 transition-all duration-300"
                >
                  <div>
                    <p className="text-white font-medium">{activity.name}</p>
                    <p className="text-sm text-gray-400">{activity.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-amber-400 font-bold">{activity.calories}</p>
                    <p className="text-xs text-gray-500">calories</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">AI Insights</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <p className="text-amber-400 font-medium mb-2">Great Progress!</p>
                <p className="text-sm text-gray-300">You're 15% ahead of your monthly goal. Keep up the excellent work!</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <p className="text-blue-400 font-medium mb-2">Recovery Tip</p>
                <p className="text-sm text-gray-300">Consider a rest day tomorrow to optimize muscle recovery.</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <p className="text-green-400 font-medium mb-2">Nutrition Alert</p>
                <p className="text-sm text-gray-300">Increase protein intake by 20g to support your current training.</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
