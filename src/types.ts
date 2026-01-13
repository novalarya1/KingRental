export type Vehicle = {
  id: string;
  name: string;
  type: 'Car' | 'Motorcycle';
  price: number;
  status: 'Available' | 'On Rent' | 'Maintenance';
  img: string;
  seats: number;
  transmission: string;
};

export type Booking = {
  id: string;
  vehicleId: string;
  vehicleName: string;
  status: 'Pending' | 'Approved' | 'Paid' | 'Completed' | 'Returned' | 'Success';
  totalPrice: number;
  startDate: string; // Wajib ada
  endDate: string;   // Wajib ada
};

export interface Review {
  id: string;
  bookingId: string;
  userName: string;
  rating: number; 
  comment: string;
  date: string;
}