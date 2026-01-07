export type Vehicle = {
  id: string;
  name: string;
  type: 'Mobil' | 'Motor';
  price: number;
  status: 'Available' | 'On Rent' | 'Maintenance';
  img: string;
};

export type Booking = {
  id: string;
  vehicleId: string;
  vehicleName: string;
  status: 'Pending' | 'Approved' | 'Paid' | 'On Rent' | 'Finished';
  totalPrice: number;
};