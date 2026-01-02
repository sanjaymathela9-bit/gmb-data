
import { ProductGroup, Status } from './types';

export const GROUPS = Object.values(ProductGroup);
export const STATUSES = Object.values(Status);

export const LOST_REASONS = [
  'Price',
  'Stock not available',
  'Finance',
  'Delivery slot',
  'Planning to buy later'
];

export const ADMIN_AUTH = {
  id: '30530',
  password: '4321'
};

export const EMPLOYEE_AUTH = {
  id: '1234',
  password: '1234'
};
