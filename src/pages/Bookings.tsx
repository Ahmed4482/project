import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Plus, DollarSign, CreditCard, AlertCircle, CheckCircle, XCircle, Filter, Search, X } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { BookingModal } from '../components/BookingModal';
import { bookingAPI, classAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Booking, AvailableClass } from '../types';

export function Bookings() {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableClasses, setAvailableClasses] = useState<AvailableClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<AvailableClass | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [classFormData, setClassFormData] = useState({
    name: '',
    description: '',
    instructor: '',
    instructor_image_url: '',
    class_image_url: '',
    schedule: '',
    duration: '',
    price: '',
    max_capacity: '',
    difficulty_level: 'beginner' as const
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [bookingsData, classesData] = await Promise.all([
        bookingAPI.getAll(),
        classAPI.getAll()
      ]);

      setBookings(bookingsData);
      setAvailableClasses(classesData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
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
    }
  };

  const handleBookClass = (classItem: AvailableClass) => {
    if (classItem.spots_available <= 0) {
      setError('Sorry, this class is fully booked');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setSelectedClass(classItem);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setSelectedClass(null);
    setSuccessMessage('Class booked successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
    loadData();
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!classFormData.name || !classFormData.description || !classFormData.instructor) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const newClass = {
        name: classFormData.name,
        description: classFormData.description,
        instructor: classFormData.instructor,
        instructor_image_url: classFormData.instructor_image_url,
        class_image_url: classFormData.class_image_url,
        schedule: classFormData.schedule,
        duration: classFormData.duration,
        price: parseFloat(classFormData.price),
        max_capacity: parseInt(classFormData.max_capacity),
        difficulty_level: classFormData.difficulty_level,
        spots_available: parseInt(classFormData.max_capacity),
        is_active: true,
        created_at: new Date().toISOString()
      };

      await classAPI.create(newClass);
      setSuccessMessage('Class created successfully!');
      setShowCreateClassModal(false);
      setClassFormData({
        name: '',
        description: '',
        instructor: '',
        instructor_image_url: '',
        class_image_url: '',
        schedule: '',
        duration: '',
        price: '',
        max_capacity: '',
        difficulty_level: 'beginner'
      });
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadData();
    } catch (err) {
      setError('Failed to create class');
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

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'failed':
      case 'refunded':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'from-green-500 to-emerald-500';
      case 'intermediate':
        return 'from-amber-500 to-orange-500';
      case 'advanced':
        return 'from-red-500 to-rose-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesSearch = searchTerm === '' ||
      booking.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredClasses = availableClasses.filter(cls =>
    searchTerm === '' ||
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 bg-clip-text text-transparent mb-2">
            Your Schedule
          </h1>
          <p className="text-gray-400">Manage your bookings and discover new classes</p>
        </div>
        {profile?.is_admin && (
          <button
            onClick={() => setShowCreateClassModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold shadow-lg shadow-amber-500/50 hover:shadow-xl hover:shadow-amber-500/60 transition-all duration-300 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Class</span>
          </button>
        )}
      </div>

      {successMessage && (
        <GlassCard>
          <div className="p-4 flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <p className="text-green-400 font-medium">{successMessage}</p>
          </div>
        </GlassCard>
      )}

      {error && (
        <GlassCard>
          <div className="p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search classes or instructors..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white placeholder-gray-500 outline-none transition-all duration-300"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white outline-none transition-all duration-300 appearance-none"
          >
            <option value="all" className="bg-gray-900">All Bookings</option>
            <option value="upcoming" className="bg-gray-900">Upcoming</option>
            <option value="completed" className="bg-gray-900">Completed</option>
            <option value="cancelled" className="bg-gray-900">Cancelled</option>
          </select>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Your Bookings</h2>
        {filteredBookings.length === 0 ? (
          <GlassCard>
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No bookings found</p>
              <p className="text-gray-500 text-sm">Book your first class below!</p>
            </div>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBookings.map((booking, index) => (
              <GlassCard key={booking.id} hover className="animate-float" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="relative">
                  {booking.class_image_url && (
                    <div className="relative h-32 rounded-t-2xl overflow-hidden">
                      <img
                        src={booking.class_image_url}
                        alt={booking.class_name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{booking.class_name}</h3>
                        <div className="flex items-center space-x-3 mb-3">
                          {booking.instructor_image_url ? (
                            <img
                              src={booking.instructor_image_url}
                              alt={booking.instructor}
                              className="w-8 h-8 rounded-lg object-cover border border-amber-500/30"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <span className="text-gray-300 text-sm">{booking.instructor}</span>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${getStatusColor(booking.status)} shadow-lg ${getStatusGlow(booking.status)}`}>
                        <span className="text-white text-xs font-bold uppercase">{booking.status}</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-3 text-gray-300">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Date</p>
                          <p className="font-medium">{formatDate(booking.date)}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-gray-300">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Time & Duration</p>
                          <p className="font-medium">{formatTime(booking.date)} - {booking.duration}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-gray-300">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                          {booking.payment_method === 'credit_card' || booking.payment_method === 'debit_card' ? (
                            <CreditCard className="w-5 h-5 text-amber-500" />
                          ) : (
                            <DollarSign className="w-5 h-5 text-amber-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-400">Payment</p>
                          <div className="flex items-center justify-between">
                            <p className="font-medium">${booking.payment_amount.toFixed(2)}</p>
                            <div className="flex items-center space-x-2">
                              {getPaymentStatusIcon(booking.payment_status)}
                              <span className="text-xs text-gray-400 capitalize">{booking.payment_status}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="p-3 rounded-lg bg-white/5 border border-amber-500/10">
                          <p className="text-xs text-gray-400 mb-1">Notes</p>
                          <p className="text-sm text-gray-300">{booking.notes}</p>
                        </div>
                      )}
                    </div>

                    {booking.status === 'upcoming' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="w-full py-3 rounded-lg bg-white/10 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 text-white font-medium transition-all duration-300"
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

      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls, index) => (
            <GlassCard key={cls.id} hover className="animate-float" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="relative">
                <div className="relative h-48 rounded-t-2xl overflow-hidden">
                  <img
                    src={cls.class_image_url}
                    alt={cls.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <div className={`px-3 py-1 rounded-lg bg-gradient-to-r ${getDifficultyColor(cls.difficulty_level)} shadow-lg`}>
                      <span className="text-white text-xs font-bold uppercase">{cls.difficulty_level}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1">{cls.name}</h3>
                    <p className="text-white/80 text-sm">{cls.duration}</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={cls.instructor_image_url}
                      alt={cls.instructor}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-amber-500/30"
                    />
                    <div>
                      <p className="text-gray-400 text-xs">Instructor</p>
                      <p className="text-white font-medium">{cls.instructor}</p>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{cls.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Schedule</span>
                      <span className="text-gray-300 text-xs">{cls.schedule}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Price</span>
                      <span className="text-amber-400 font-bold">${cls.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Availability</span>
                      <span className={`font-medium ${cls.spots_available > 5 ? 'text-green-400' : cls.spots_available > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                        {cls.spots_available} / {cls.max_capacity} spots
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBookClass(cls)}
                    disabled={cls.spots_available <= 0}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold shadow-lg shadow-amber-500/50 hover:shadow-xl hover:shadow-amber-500/60 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" />
                    <span>{cls.spots_available > 0 ? 'Book Now' : 'Fully Booked'}</span>
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {showBookingModal && selectedClass && (
        <BookingModal
          classItem={selectedClass}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedClass(null);
          }}
          onSuccess={handleBookingSuccess}
        />
      )}

      {showCreateClassModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard hover className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">Create New Class</h2>
                <button
                  onClick={() => setShowCreateClassModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Class Name *</label>
                    <input
                      type="text"
                      value={classFormData.name}
                      onChange={(e) => setClassFormData({ ...classFormData, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white placeholder-gray-500 outline-none transition-all duration-300"
                      placeholder="e.g., HIIT Power Hour"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Instructor *</label>
                    <input
                      type="text"
                      value={classFormData.instructor}
                      onChange={(e) => setClassFormData({ ...classFormData, instructor: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white placeholder-gray-500 outline-none transition-all duration-300"
                      placeholder="e.g., Sarah Johnson"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                  <textarea
                    value={classFormData.description}
                    onChange={(e) => setClassFormData({ ...classFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white placeholder-gray-500 outline-none transition-all duration-300 resize-none"
                    placeholder="Describe the class..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Schedule</label>
                    <input
                      type="text"
                      value={classFormData.schedule}
                      onChange={(e) => setClassFormData({ ...classFormData, schedule: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white placeholder-gray-500 outline-none transition-all duration-300"
                      placeholder="e.g., Mon, Wed, Fri - 6:00 AM"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                    <input
                      type="text"
                      value={classFormData.duration}
                      onChange={(e) => setClassFormData({ ...classFormData, duration: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white placeholder-gray-500 outline-none transition-all duration-300"
                      placeholder="e.g., 60 min"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={classFormData.price}
                      onChange={(e) => setClassFormData({ ...classFormData, price: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white placeholder-gray-500 outline-none transition-all duration-300"
                      placeholder="25.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Max Capacity</label>
                    <input
                      type="number"
                      value={classFormData.max_capacity}
                      onChange={(e) => setClassFormData({ ...classFormData, max_capacity: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white placeholder-gray-500 outline-none transition-all duration-300"
                      placeholder="15"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                    <select
                      value={classFormData.difficulty_level}
                      onChange={(e) => setClassFormData({ ...classFormData, difficulty_level: e.target.value as any })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white outline-none transition-all duration-300 appearance-none"
                    >
                      <option value="beginner" className="bg-gray-900">Beginner</option>
                      <option value="intermediate" className="bg-gray-900">Intermediate</option>
                      <option value="advanced" className="bg-gray-900">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Instructor Image URL</label>
                    <input
                      type="url"
                      value={classFormData.instructor_image_url}
                      onChange={(e) => setClassFormData({ ...classFormData, instructor_image_url: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white placeholder-gray-500 outline-none transition-all duration-300"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Class Image URL</label>
                    <input
                      type="url"
                      value={classFormData.class_image_url}
                      onChange={(e) => setClassFormData({ ...classFormData, class_image_url: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white placeholder-gray-500 outline-none transition-all duration-300"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowCreateClassModal(false)}
                    className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold shadow-lg shadow-amber-500/50 hover:shadow-xl hover:shadow-amber-500/60 transition-all duration-300"
                  >
                    Create Class
                  </button>
                </div>
              </form>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
