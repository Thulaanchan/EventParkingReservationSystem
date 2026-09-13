export enum VehicleType {
  ThreeWheeler = 1,
  Car = 2,
  Van = 3,
  Motorbike = 4
}

export type VehicleTypeName = 'ThreeWheeler' | 'Car' | 'Van' | 'Motorbike';

export const VEHICLE_TYPE_LABELS: Record<VehicleTypeName, string> = {
  ThreeWheeler: 'Three-Wheeler',
  Car: 'Car',
  Van: 'Van',
  Motorbike: 'Motorbike'
};
