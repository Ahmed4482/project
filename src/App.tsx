import { BrowserRouter as Router, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { Plans } from './pages/Plans';
import { Bookings } from './pages/Bookings';
import { Chat } from './pages/Chat';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Classes } from './pages/Classes';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current page from URL pathname
  const getCurrentPage = () => {
    const path = location.pathname;
    const isAdmin = profile?.is_admin;
    const adminPrefix = isAdmin ? '/admin' : '';
    
    if (path === '/login' || path === '/signup') return null; // Not on app pages
    if (path === '/' || path === '') return 'dashboard';
    if (path === `${adminPrefix}/dashboard` || path === '/dashboard') return 'dashboard';
    // New route mapping:
    if (path === `${adminPrefix}/plans` || path === '/plans') return 'bookings'; // /plans shows Bookings page
    if (path === `${adminPrefix}/bookings` || path === '/bookings') return 'classes'; // /bookings shows Classes page
    if (path === `${adminPrefix}/subscriptions` || path === '/subscriptions') return 'plans'; // /subscriptions shows Plans page
    if (path === `${adminPrefix}/chat` || path === '/chat') return 'chat';
    if (path === `${adminPrefix}/profile` || path === '/profile') return 'profile';
    if (path === `${adminPrefix}/users` || path === '/users') return 'users'; // Admin only
    return 'dashboard';
  };

  const currentPage = getCurrentPage();

  // Redirect to dashboard if on root
  if ((location.pathname === '/' || location.pathname === '') && user) {
    const adminPrefix = profile?.is_admin ? '/admin' : '';
    return <Navigate to={`${adminPrefix}/dashboard`} replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI0NSwgMTU4LCA1MCwgMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative">
          {location.pathname === '/signup' ? (
            <Signup onSwitchToLogin={() => navigate('/login')} />
          ) : (
            <Login onSwitchToSignup={() => navigate('/signup')} />
          )}
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'plans':
        return <Plans />;  // Now shows Subscriptions
      case 'bookings':
        return <Bookings />; // Now shows Plans
      case 'classes':
        return <Classes />; // Shows Bookings
      case 'chat':
        return <Chat />;
      case 'profile':
        return <Profile />;
      case 'users':
        // Import Users component when we create it
        return <div className="text-white text-center py-12"><h1 className="text-3xl">User Management (Coming Soon)</h1></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI0NSwgMTU4LCA1MCwgMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <Navigation currentPage={currentPage || 'dashboard'} onNavigate={() => {}} />

      <main className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
