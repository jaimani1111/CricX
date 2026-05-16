export interface Challenge {
  id: string;
  sportId: string;
  createdBy: string;
  teamAName: string;
  teamAPlayers: string[];
  teamBName?: string;
  teamBPlayers?: string[];
  acceptedBy?: string;
  locationName: string;
  longitude: number;
  latitude: number;
  dateTime: string;
  format: string;
  status: string;
  description?: string;
  distance?: number;
  createdAt: string;
}

export interface CreateChallengeRequest {
  teamName: string;
  sportId: string;
  locationName: string;
  longitude: number;
  latitude: number;
  dateTime: string;
  format: string;
  description?: string;
}
