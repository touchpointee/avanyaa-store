import { IProduct } from '@/models/Product';
import { IOrder } from '@/models/Order';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  stock: number;
}

export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface ProductWithId extends Omit<IProduct, '_id'> {
  _id: string;
}

export interface OrderWithId extends Omit<IOrder, '_id' | 'userId'> {
  _id: string;
  userId?: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  recentOrders: OrderWithId[];
  ordersLast7Days: Array<{
    date: string;
    count: number;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
