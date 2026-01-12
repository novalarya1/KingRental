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
  status: 'Pending' | 'Approved' | 'Paid' | 'On Rent' | 'Finished';
  totalPrice: number;
  startDate?: string; 
  endDate?: string;
};