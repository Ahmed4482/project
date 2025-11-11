import { useState, useEffect } from 'react';
import { User, Mail, Target, TrendingUp, Save, Edit2, CheckCircle, Upload, AlertCircle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../contexts/AuthContext';

export function Profile() {
  const { profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    fitness_goal: '',
    experience_level: 'beginner',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        fitness_goal: profile.fitness_goal || '',
        experience_level: profile.experience_level || 'beginner',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    const { error } = await updateProfile(formData);

    setSaving(false);

    if (!error) {
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        fitness_goal: profile.fitness_goal || '',
        experience_level: profile.experience_level || 'beginner',
      });
    }
    setIsEditing(false);
    setPreviewImage(null);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      setTimeout(() => setUploadError(''), 3000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      setTimeout(() => setUploadError(''), 3000);
      return;
    }

    // Compress and convert image
    const reader = new FileReader();
    reader.onloadend = async () => {
      const img = new Image();
      img.onload = async () => {
        // Create canvas and compress
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set max dimensions
        let { width, height } = img;
        const maxWidth = 500;
        const maxHeight = 500;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setPreviewImage(compressedBase64);

        // Upload to backend
        setUploading(true);
        setUploadError('');

        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch('http://localhost:5000/api/profiles/upload-avatar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ imageUrl: compressedBase64 })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Upload failed');
          }

          const data = await response.json();
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
          // Refresh profile data
          setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
          setUploadError('Failed to upload photo');
          console.error('Upload error:', error);
          setTimeout(() => setUploadError(''), 3000);
        } finally {
          setUploading(false);
        }
      };
      img.onerror = () => {
        setUploadError('Failed to load image');
        setTimeout(() => setUploadError(''), 3000);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
    { value: 'advanced', label: 'Advanced', description: 'Experienced athlete' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 bg-clip-text text-transparent mb-2">
            My Profile
          </h1>
          <p className="text-gray-400">Manage your personal information</p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold shadow-lg shadow-amber-500/50 hover:shadow-xl hover:shadow-amber-500/60 transition-all duration-300 flex items-center space-x-2"
          >
            <Edit2 className="w-5 h-5" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {saveSuccess && (
        <GlassCard>
          <div className="p-4 flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <p className="text-green-400 font-medium">Profile updated successfully!</p>
          </div>
        </GlassCard>
      )}

      {uploadError && (
        <GlassCard>
          <div className="p-4 flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <p className="text-red-400 font-medium">{uploadError}</p>
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/50 flex-shrink-0 overflow-hidden">
                  {previewImage || profile.avatar_url ? (
                    <img
                      src={previewImage || profile.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-amber-500 hover:bg-amber-600 text-white rounded-full p-2 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {formData.full_name || 'Your Name'}
                </h2>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{profile.email}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Member since {new Date(profile.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white placeholder-gray-500 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="experience_level" className="block text-sm font-medium text-gray-300 mb-2">
                  Experience Level
                </label>
                <div className="relative">
                  <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <select
                    id="experience_level"
                    value={formData.experience_level}
                    onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                  >
                    {experienceLevels.map((level) => (
                      <option key={level.value} value={level.value} className="bg-gray-900">
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="fitness_goal" className="block text-sm font-medium text-gray-300 mb-2">
                Fitness Goal
              </label>
              <div className="relative">
                <Target className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                <input
                  id="fitness_goal"
                  type="text"
                  value={formData.fitness_goal}
                  onChange={(e) => setFormData({ ...formData, fitness_goal: e.target.value })}
                  disabled={!isEditing}
                  placeholder="e.g., Lose 10 pounds, Build muscle, Run a marathon"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white placeholder-gray-500 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                rows={4}
                placeholder="Tell us about your fitness journey..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white placeholder-gray-500 outline-none transition-all duration-300 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {isEditing && (
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold shadow-lg shadow-amber-500/50 hover:shadow-xl hover:shadow-amber-500/60 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-amber-500/30 hover:border-amber-500/60 text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {experienceLevels.map((level, index) => (
          <GlassCard
            key={level.value}
            hover
            className={`${formData.experience_level === level.value ? 'border-amber-500/60' : ''}`}
          >
            <div className="p-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                index === 0 ? 'from-green-500 to-emerald-500' :
                index === 1 ? 'from-amber-500 to-orange-500' :
                'from-red-500 to-rose-500'
              } flex items-center justify-center mb-4 shadow-lg`}>
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{level.label}</h3>
              <p className="text-gray-400 text-sm">{level.description}</p>
              {formData.experience_level === level.value && (
                <div className="mt-4 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-amber-400 text-sm font-medium">Current level</span>
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
