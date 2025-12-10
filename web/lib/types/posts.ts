export interface User {
  id: string;
  first_name: string;
  last_name: string;
  badges?: {
    comment: string | null;
    post: string | null;
  };
}

export interface Location {
  city: string;
}

export interface Vehicle {
  brand: string;
  model: string;
}

export interface PollOption {
  id: number;
  option_text: string;
  option_order: number;
  vote_count: number;
  percentage: number;
}

export interface Poll {
  id: string;
  question: string;
  created_at: string;
  options: PollOption[];
  total_votes: number;
  user_vote: number | null;
  has_voted: boolean;
}

export interface Post {
  id: string;
  category: string;
  content: string;
  created_at: string;
  images?: Array<{ url: string; public_id: string }>;
  comment_count?: number;
  user: User;
  location: Location;
  vehicle: Vehicle | null;
  poll?: Poll | null;
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  vehicle?: {
    brand: string;
    model: string;
  } | null;
  city?: {
    id: number;
    name: string;
  } | null;
}

export interface City {
  id: number;
  name: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface Model {
  id: number;
  name: string;
}

export interface TrendingBrand {
  id: number;
  name: string;
  post_count: number;
}

export interface TrendingCity {
  id: number;
  name: string;
  post_count: number;
}

export interface TrendingCategory {
  category: string;
  post_count: number;
}
