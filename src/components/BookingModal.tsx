import { useState } from 'react';
import { X, Calendar, Clock, DollarSign, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { GlassCard } from './GlassCard';
import { AvailableClass } from '../types';
import { bookingAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface BookingModalProps {
  classItem: AvailableClass;
  onClose: () => void;
  onSuccess: () => void;
}

function BookingModalContent({ classItem, onClose, onSuccess }: BookingModalProps) {
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time');
      return;
    }

    if (!user) {
      setError('You must be logged in to book a class');
      return;
    }

    if (paymentMethod === 'credit_card' && !stripe || !elements) {
      setError('Stripe not loaded');
      return;
    }

    setLoading(true);
    setPaymentProcessing(true);

    try {
      const bookingDate = new Date(`${selectedDate}T${selectedTime}`);

      if (paymentMethod === 'credit_card') {
        const cardElement = elements?.getElement(CardElement);
        if (!cardElement) {
          setError('Card element not found');
          return;
        }

        const token = localStorage.getItem('authToken');
        const paymentIntentRes = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/payments/create-payment-intent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              amount: classItem.price,
              currency: 'usd',
              description: `${classItem.name} - ${classItem.instructor}`,
            }),
          }
        );

        if (!paymentIntentRes.ok) {
          const errorData = await paymentIntentRes.json();
          throw new Error(errorData.error || 'Failed to create payment intent');
        }

        const { clientSecret } = await paymentIntentRes.json();

        const result = await stripe!.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {},
          },
        });

        if (result.error) {
          setError(result.error.message || 'Payment failed');
          return;
        }

        if (result.paymentIntent.status !== 'succeeded') {
          setError('Payment not completed');
          return;
        }
      }

      await bookingAPI.create({
        class_name: classItem.name,
        instructor: classItem.instructor,
        instructor_image_url: classItem.instructor_image_url,
        class_image_url: classItem.class_image_url,
        date: bookingDate.toISOString(),
        duration: classItem.duration,
        payment_amount: classItem.price,
        payment_method: paymentMethod,
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book class');
    } finally {
      setLoading(false);
      setPaymentProcessing(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <GlassCard className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <div className="relative h-48 rounded-t-2xl overflow-hidden">
            <img
              src={classItem.class_image_url}
              alt={classItem.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="absolute bottom-4 left-6 right-6">
              <h2 className="text-3xl font-bold text-white mb-2">{classItem.name}</h2>
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-lg bg-gradient-to-r ${getDifficultyColor(classItem.difficulty_level)} shadow-lg`}>
                  <span className="text-white text-sm font-bold uppercase">{classItem.difficulty_level}</span>
                </div>
                <span className="text-white/90">{classItem.duration}</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center space-x-4">
                <img
                  src={classItem.instructor_image_url}
                  alt={classItem.instructor}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-amber-500/30"
                />
                <div>
                  <p className="text-gray-400 text-sm">Instructor</p>
                  <p className="text-white font-bold">{classItem.instructor}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/50">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Price per session</p>
                  <p className="text-white font-bold text-xl">${classItem.price.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-amber-500/20">
              <p className="text-gray-300 text-sm leading-relaxed">{classItem.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-gray-400 text-sm">{classItem.schedule}</p>
                <p className="text-amber-400 font-medium text-sm">
                  {classItem.spots_available} spots left
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                    Select Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                    <input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={getMinDate()}
                      max={getMaxDate()}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-2">
                    Select Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                    <input
                      id="time"
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white outline-none transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Payment Method
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {[
                    { value: 'credit_card', label: 'Credit Card', icon: CreditCard },
                    { value: 'debit_card', label: 'Debit Card', icon: CreditCard },
                    { value: 'membership', label: 'Membership', icon: CheckCircle },
                  ].map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setPaymentMethod(method.value)}
                        className={`
                          p-4 rounded-xl border transition-all duration-300
                          ${paymentMethod === method.value
                            ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/60'
                            : 'bg-white/5 border-amber-500/20 hover:border-amber-500/40'
                          }
                        `}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === method.value ? 'text-amber-400' : 'text-gray-400'}`} />
                        <p className={`text-sm font-medium ${paymentMethod === method.value ? 'text-white' : 'text-gray-400'}`}>
                          {method.label}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {paymentMethod === 'credit_card' && (
                  <div className="p-4 rounded-xl bg-white/5 border border-amber-500/30">
                    <label className="block text-xs font-medium text-gray-400 mb-2">
                      Card Details (Test: 4242 4242 4242 4242)
                    </label>
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: '14px',
                            color: '#ffffff',
                            '::placeholder': {
                              color: '#9ca3af',
                            },
                          },
                          invalid: {
                            color: '#ef4444',
                          },
                        },
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Any special requirements or requests..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-amber-500/30 focus:border-amber-500/60 text-white placeholder-gray-500 outline-none transition-all duration-300 resize-none"
                />
              </div>

              <div className="flex space-x-4 pt-4 border-t border-amber-500/20">
                <button
                  type="submit"
                  disabled={loading || classItem.spots_available <= 0 || paymentProcessing}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold shadow-lg shadow-amber-500/50 hover:shadow-xl hover:shadow-amber-500/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentProcessing ? 'Processing Payment...' : loading ? 'Booking...' : `Book Now - $${classItem.price.toFixed(2)}`}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading || paymentProcessing}
                  className="flex-1 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-amber-500/30 hover:border-amber-500/60 text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

export function BookingModal({ classItem, onClose, onSuccess }: BookingModalProps) {
  return (
    <Elements stripe={stripePromise}>
      <BookingModalContent classItem={classItem} onClose={onClose} onSuccess={onSuccess} />
    </Elements>
  );
}
