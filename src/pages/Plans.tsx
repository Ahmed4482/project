import { useState, useEffect } from 'react';
import { Check, Sparkles, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { PlanForm } from '../components/PlanForm';
import { planAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Plan } from '../types';

export function Plans() {
  const { profile } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const isAdmin = profile?.is_admin || false;

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await planAPI.getAll();
      setPlans(data);
    } catch (error) {
      console.error('Failed to load plans:', error);
      setError('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async (planData: Partial<Plan>) => {
    setError('');

    try {
      if (editingPlan) {
        console.log('Edit plan:', editingPlan.id, planData);
      } else {
        await planAPI.create(planData);
      }

      await loadPlans();
      setShowForm(false);
      setEditingPlan(null);
    } catch (err) {
      throw err;
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) {
      return;
    }

    setDeletingId(id);
    setError('');

    try {
      console.log('Delete plan:', id);
      await loadPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete plan');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setEditingPlan(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPlan(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 bg-clip-text text-transparent mb-4">
            Choose Your Path
          </h1>
          <p className="text-gray-400 text-lg">Transform your body with AI-powered training</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleCreateNew}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold shadow-lg shadow-amber-500/50 hover:shadow-xl hover:shadow-amber-500/60 transition-all duration-300 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Plan</span>
          </button>
        )}
      </div>

      {error && (
        <GlassCard>
          <div className="p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </GlassCard>
      )}

      {plans.length === 0 ? (
        <GlassCard>
          <div className="p-12 text-center">
            <p className="text-gray-400 text-lg mb-4">No plans available yet</p>
            {isAdmin && (
              <button
                onClick={handleCreateNew}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold shadow-lg shadow-amber-500/50 transition-all duration-300"
              >
                Create Your First Plan
              </button>
            )}
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <GlassCard
              key={plan.id}
              hover
              className={`relative ${plan.is_popular ? 'md:scale-105 md:-translate-y-4' : ''}`}
            >
              {plan.is_popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg shadow-amber-500/50 z-10">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                    <span className="text-white font-bold text-sm">MOST POPULAR</span>
                  </div>
                </div>
              )}

              {isAdmin && (
                <div className="absolute top-4 right-4 flex space-x-2 z-10">
                  <button
                    onClick={() => handleEditPlan(plan)}
                    className="w-10 h-10 rounded-lg bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all duration-300"
                  >
                    <Edit2 className="w-4 h-4 text-gray-900" />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    disabled={deletingId === plan.id}
                    className="w-10 h-10 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-red-400 flex items-center justify-center shadow-lg transition-all duration-300"
                  >
                    {deletingId === plan.id ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              )}

              <div className="relative overflow-hidden rounded-t-2xl h-48">
                <img
                  src={plan.image_url}
                  alt={plan.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <p className="text-gray-400 text-sm">{plan.description}</p>

                <div className="flex items-baseline space-x-2">
                  <span className="text-5xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-400">/{plan.duration.replace('per ', '')}</span>
                </div>

                <div className="space-y-3">
                  {Array.isArray(plan.features) && plan.features.map((feature: string, featureIndex: number) => (
                    <div key={featureIndex} className="flex items-start space-x-3 group">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/30 group-hover:shadow-lg transition-shadow">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`
                    w-full py-4 rounded-xl font-bold text-white transition-all duration-300
                    ${plan.is_popular
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/50 hover:shadow-xl hover:shadow-amber-500/60'
                      : 'bg-white/10 hover:bg-white/20 border border-amber-500/30 hover:border-amber-500/60'
                    }
                  `}
                >
                  Get Started
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <GlassCard>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">All Plans Include</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            {[
              { label: 'AI Coaching', icon: '🤖' },
              { label: 'Progress Tracking', icon: '📊' },
              { label: '24/7 Support', icon: '💬' },
              { label: 'Mobile App', icon: '📱' },
            ].map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-white/5 border border-amber-500/10 hover:border-amber-500/30 transition-all duration-300 hover:scale-105"
              >
                <div className="text-4xl mb-2">{item.icon}</div>
                <p className="text-white font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {showForm && (
        <PlanForm
          plan={editingPlan}
          onSave={handleSavePlan}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
}
