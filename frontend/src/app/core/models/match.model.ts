export interface Match {
  id: string;
  createdBy: string;
  creatorName: string;
  locationName: string;
  latitude: number;
  longitude: number;
  dateTime: string;
  totalPlayers: number;
  costPerPlayer: number;
  skillLevel: string;
  matchType: string;
  description: string;
  sport: string;
  isTeamChallenge: boolean;
  teamAName?: string;
  teamBName?: string;
  teamACode?: string;
  teamBCode?: string;
  teamAPlayers: string[];
  teamBPlayers: string[];
  playersJoined: string[];
  playersJoinedCount: number;
  playersNeeded: number;
  status: string;
  distance?: number;
}

export interface CreateMatchRequest {
  locationName: string;
  latitude: number;
  longitude: number;
  dateTime: string;
  totalPlayers: number;
  costPerPlayer: number;
  skillLevel: string;
  matchType: string;
  description: string;
  sport: string;
  isTeamChallenge: boolean;
  teamAName?: string;
  teamBName?: string;
}
