import { Home, CreditCard, Calendar, MessageSquare, User, LogOut, ChevronDown, Users } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const adminPrefix = profile?.is_admin ? '/admin' : '';

  const baseNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, route: 'dashboard' },
    { id: 'plans', label: 'Plans', icon: Calendar, route: 'plans' },
    { id: 'bookings', label: 'Bookings', icon: Calendar, route: 'bookings' },
    { id: 'chat', label: 'AI Coach', icon: MessageSquare, route: 'chat' },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, route: 'subscriptions' },
  ];

  const adminNavItems = profile?.is_admin 
    ? [...baseNavItems, { id: 'users', label: 'Users', icon: Users, route: 'users' }]
    : baseNavItems;

  const navItems = adminNavItems;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setShowDropdown(false);
  };

  const handleProfileClick = () => {
    navigate(`${adminPrefix}/profile`);
    setShowDropdown(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/50">
              <span className="text-black font-bold text-xl">SF</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              SmartFit
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                // Check if current path matches this item's route
                const currentPath = location.pathname;
                const expectedPath = `${adminPrefix}/${item.route}`;
                const isActive = currentPath === expectedPath || currentPath === `/${item.route}`;

                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(`${adminPrefix}/${item.route}`)}
                    className={`
                      relative px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2
                      ${isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 shadow-lg shadow-amber-500/20'
                        : 'text-gray-400 hover:text-amber-400 hover:bg-white/5'
                      }
                    `}
                  >
                    {isActive && (
                      <div className="absolute inset-0 rounded-lg border border-amber-500/50 animate-pulse" />
                    )}
                    <Icon className="w-5 h-5" />
                    <span className="font-medium hidden sm:block">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/5 border border-amber-500/30 hover:border-amber-500/60 transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/30 overflow-hidden flex-shrink-0">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="text-white font-medium hidden md:block">
                  {profile?.full_name || 'User'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 backdrop-blur-xl bg-gradient-to-br from-gray-900/95 to-gray-950/95 rounded-xl border border-amber-500/40 shadow-2xl shadow-black/50 overflow-hidden">
                  <div className="p-4 border-b border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                    <p className="text-white font-bold">{profile?.full_name}</p>
                    <p className="text-amber-300/80 text-sm truncate">{profile?.email}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleProfileClick}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-amber-500/20 text-amber-200 hover:text-amber-100 font-semibold transition-all duration-300"
                    >
                      <User className="w-5 h-5" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-500/30 text-red-300 hover:text-red-100 font-semibold transition-all duration-300"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
