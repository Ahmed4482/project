import { useState, useEffect } from 'react';
import { Calendar, Clock, User, DollarSign, AlertCircle, CheckCircle, XCircle, Filter, Search } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../contexts/AuthContext';
import { bookingAPI } from '../lib/api';
import { Booking } from '../types';

export function Classes() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const bookingsData = await bookingAPI.getAll();
      setBookings(bookingsData);
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    };
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingAPI.update(bookingId, { status: 'cancelled' });
      setSuccessMessage('Booking cancelled successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadData();
    } catch (err) {
      setError('Failed to cancel booking');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'from-blue-500 to-cyan-500';
      case 'completed':
        return 'from-green-500 to-emerald-500';
      case 'cancelled':
        return 'from-red-500 to-rose-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusGlow = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'shadow-blue-500/50';
      case 'completed':
        return 'shadow-green-500/50';
      case 'cancelled':
        return 'shadow-red-500/50';
      default:
        return 'shadow-gray-500/50';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Your Bookings</h1>
        <p className="text-gray-300">View and manage your booked classes</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg flex items-center text-red-500">
          <AlertCircle className="mr-2" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg flex items-center text-green-500">
          <CheckCircle className="mr-2" />
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-900 text-white border border-gray-700 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Search className="text-gray-400" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-400">Loading bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center text-gray-400">No bookings found</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBookings.map((booking) => (
            <GlassCard key={booking.id} className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {booking.class_name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-300">
                      <Calendar className="w-5 h-5 mr-2" />
                      <span>{new Date(booking.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Clock className="w-5 h-5 mr-2" />
                      <span>{booking.duration}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <User className="w-5 h-5 mr-2" />
                      <span>{booking.instructor}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <DollarSign className="w-5 h-5 mr-2" />
                      <span>${booking.payment_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end space-y-2">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${getStatusColor(
                      booking.status
                    )} shadow-lg ${getStatusGlow(booking.status)}`}
                  >
                    {booking.status === 'upcoming' && <Clock className="w-4 h-4 mr-1" />}
                    {booking.status === 'completed' && <CheckCircle className="w-4 h-4 mr-1" />}
                    {booking.status === 'cancelled' && <XCircle className="w-4 h-4 mr-1" />}
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}

                  </span>
                  {booking.status === 'upcoming' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="text-red-500 hover:text-red-400 text-sm font-medium"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

export default Classes;