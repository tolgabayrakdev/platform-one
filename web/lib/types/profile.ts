export interface Badge {
  level: string;
  name: string;
  emoji: string;
  color: string;
  earned_at?: string;
}

export interface BadgeProgress {
  level: string;
  name: string;
  emoji: string;
  threshold: number;
  current: number;
  remaining: number;
  progress: number;
}

export interface BadgeData {
  stats: { commentCount: number; postCount: number };
  badges: { comment: Badge[]; post: Badge[] };
  highest: { comment: Badge | null; post: Badge | null };
  next: { comment: BadgeProgress | null; post: BadgeProgress | null };
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: {
    id: number;
    name: string;
  } | null;
  vehicle: {
    brand: { id: number; name: string };
    model: { id: number; name: string } | null;
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
