
export enum Role {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

export enum Status {
  OPEN = 'Open',
  WIP = 'WIP',
  CLOSED = 'Closed',
  SALE_LOST = 'Sale Lost'
}

export enum ProductGroup {
  APPLE = 'Apple Devices',
  ANDROID = 'Android Devices',
  HOME_APPLIANCES = 'Home Appliances',
  KITCHEN_APPLIANCES = 'Kitchen Appliances',
  ENTERTAINMENT = 'Entertainment',
  COMPUTERS = 'Computers'
}

export type LeadOrigin = 'Manual' | 'Bulk';

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface Entry {
  id: string;
  date: string;
  employeeName: string;
  employeeId: string;
  customerName: string;
  mobileNumber: string;
  group: ProductGroup;
  description: string;
  productDescription: string;
  sku: string;
  skuDescription: string;
  status: Status;
  origin: LeadOrigin;
  billNumber?: string;
  reasonLost?: string;
  createdAt: number;
}

export interface FilterOptions {
  startDate: string;
  endDate: string;
  employeeName: string;
  group: string;
  status: string;
  search: string;
  origin?: LeadOrigin;
}
