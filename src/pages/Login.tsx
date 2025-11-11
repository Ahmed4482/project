import { useState } from 'react';
import { LogIn, Mail, Lock, AlertCircle, Copy, Check } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  onSwitchToSignup: () => void;
}

export function Login({ onSwitchToSignup }: LoginProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminCreds, setShowAdminCreds] = useState(false);
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const fillAdminCredentials = () => {
    setEmail('admin@gmail.com');
    setPassword('admin');
    setShowAdminCreds(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/50 animate-float">
            <span className="text-black font-bold text-3xl">SF</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-400">Sign in to continue your fitness journey</p>
        </div>

        <GlassCard>
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white placeholder-gray-500 outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white placeholder-gray-500 outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold shadow-lg shadow-amber-500/50 hover:shadow-xl hover:shadow-amber-500/60 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-amber-500/20">
              <p className="text-center text-gray-400 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={onSwitchToSignup}
                  className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  Sign up
                </button>
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-amber-500/20">
              <button
                type="button"
                onClick={() => setShowAdminCreds(!showAdminCreds)}
                className="w-full py-2 text-center text-xs text-gray-500 hover:text-amber-400 transition-colors font-medium"
              >
                {showAdminCreds ? '▼ Admin Credentials' : '▶ Admin Credentials'}
              </button>
              
              {showAdminCreds && (
                <div className="mt-4 space-y-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Email:</p>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-amber-500/20 text-amber-400 text-sm font-mono">
                        admin@gmail.com
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('admin@gmail.com', 'email')}
                        className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 transition-colors"
                        title="Copy email"
                      >
                        {copiedField === 'email' ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-amber-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 mb-2">Password:</p>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-amber-500/20 text-amber-400 text-sm font-mono">
                        admin
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('admin', 'password')}
                        className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 transition-colors"
                        title="Copy password"
                      >
                        {copiedField === 'password' ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-amber-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={fillAdminCredentials}
                    className="w-full mt-2 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/50 text-amber-400 text-sm font-medium transition-all duration-300"
                  >
                    Fill Credentials
                  </button>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
