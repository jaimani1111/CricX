export interface Sport {
  id: string;
  name: string;
  icon: string;
  active: boolean;
}

export const SUPPORTED_SPORTS: Sport[] = [
  { id: 'all', name: 'All', icon: 'apps', active: true },
  { id: 'cricket', name: 'Cricket', icon: 'sports_cricket', active: true },
  { id: 'football', name: 'Football', icon: 'sports_soccer', active: true },
  { id: 'tennis', name: 'Tennis', icon: 'sports_tennis', active: true },
  { id: 'basketball', name: 'Basketball', icon: 'sports_basketball', active: true },
  { id: 'table-tennis', name: 'Table Tennis', icon: 'sports_kabaddi', active: true }, // Using generic icons for some
  { id: 'pickleball', name: 'Pickleball', icon: 'sports_tennis', active: true }
];
