export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  skill: string;
  rating: number;
  preferredRole: string;
  available: boolean;
  isBlocked: boolean;
  locationName?: string;
  longitude?: number;
  latitude?: number;
  distance?: number;
  phone?: string;
  profilePicture?: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  name: string;
  username: string;
  email: string;
  role: string;
  skill: string;
  preferredRole: string;
  rating: number;
  profilePicture?: string;
}
