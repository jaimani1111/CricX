export interface Event {
  id?: string;
  turfId?: string;
  ownerId?: string;
  title: string;
  description: string;
  category: 'T20_MATCH' | 'STADIUM_EVENT' | 'CHEERLEADER_SHOW' | 'TRAINING_CAMP' | 'TOURNAMENT' | 'OTHER';
  dateTime: string;
  endDateTime?: string;
  address?: string;
  ticketPrice: number;
  totalTickets: number;
  registeredUserIds?: string[];
  status?: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  bannerImageUrl?: string;
  tags?: string[];
}
