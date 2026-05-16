export interface Turf {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  district: string;
  city: string;
  state: string;
  pincode: string;
  location: {
    type: string;
    coordinates: number[];
  };
  description: string;
  phone: string;
  website: string;
  photos: string[];
  availableSports: string[];
  facilities: string[];
  basePricePerHour: number;
  openingTime: string;
  closingTime: string;
  daysOpen: string[];
  pitchType: string;
  courtCount: number;
  isVerified: boolean;
  isActive: boolean;
  manuallyBlockedSlots: BlockedSlot[];
}

export interface BlockedSlot {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  reason: string;
}
