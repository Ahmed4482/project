export interface UserStats {
  id: string;
  user_id: string;
  total_workouts: number;
  calories_burned: number;
  active_days: number;
  current_streak: number;
  updated_at: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  image_url: string;
  is_popular: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  class_name: string;
  instructor: string;
  date: string;
  duration: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_amount: number;
  payment_method: string;
  notes: string;
  instructor_image_url: string;
  class_image_url: string;
  created_at: string;
}

export interface AvailableClass {
  id: string;
  name: string;
  description: string;
  instructor: string;
  instructor_image_url: string;
  class_image_url: string;
  schedule: string;
  duration: string;
  price: number;
  spots_available: number;
  max_capacity: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  is_active: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  is_ai: boolean;
  created_at: string;
}
