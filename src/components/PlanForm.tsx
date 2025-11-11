import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Plan } from '../types';

interface PlanFormProps {
  plan?: Plan | null;
  onSave: (planData: Partial<Plan>) => Promise<void>;
  onCancel: () => void;
}

export function PlanForm({ plan, onSave, onCancel }: PlanFormProps) {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    description: plan?.description || '',
    price: plan?.price?.toString() || '',
    duration: plan?.duration || 'per month',
    image_url: plan?.image_url || '',
    is_popular: plan?.is_popular || false,
  });
  const [features, setFeatures] = useState<string[]>(
    Array.isArray(plan?.features) ? plan.features : []
  );
  const [newFeature, setNewFeature] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.description || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    if (features.length === 0) {
      setError('Please add at least one feature');
      return;
    }

    setSaving(true);

    try {
      await onSave({
        ...formData,
        price: parseFloat(formData.price),
        features: features,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {plan ? 'Edit Plan' : 'Create New Plan'}
            </h2>
            <button
              onClick={onCancel}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Plan Name *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Pro Plan"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white placeholder-gray-500 outline-none transition-all duration-300"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Describe this plan..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white placeholder-gray-500 outline-none transition-all duration-300 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="29.99"
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white placeholder-gray-500 outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-2">
                  Duration *
                </label>
                <select
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white outline-none transition-all duration-300 appearance-none"
                >
                  <option value="per month" className="bg-gray-900">per month</option>
                  <option value="per year" className="bg-gray-900">per year</option>
                  <option value="per week" className="bg-gray-900">per week</option>
                  <option value="one-time" className="bg-gray-900">one-time</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-300 mb-2">
                Image URL
              </label>
              <input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://images.pexels.com/..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white placeholder-gray-500 outline-none transition-all duration-300"
              />
            </div>

            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_popular}
                  onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                  className="w-5 h-5 rounded border-amber-500/30 bg-white/5 text-amber-500 focus:ring-2 focus:ring-amber-500/50"
                />
                <span className="text-gray-300 font-medium">Mark as Popular Plan</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Features *
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  placeholder="Add a feature..."
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white placeholder-gray-500 outline-none transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold shadow-lg shadow-amber-500/50 transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {features.length > 0 && (
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-amber-500/10"
                    >
                      <span className="text-gray-300 text-sm">{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-4 pt-4 border-t border-amber-500/20">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold shadow-lg shadow-amber-500/50 hover:shadow-xl hover:shadow-amber-500/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="flex-1 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-amber-500/30 hover:border-amber-500/60 text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </GlassCard>
    </div>
  );
}
