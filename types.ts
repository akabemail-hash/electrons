
export type LanguageCode = 'en' | 'az' | 'ru' | 'tr';

export interface Permission {
  id: string;
  name: string; // e.g., 'user.create', 'product.delete'
  description: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[]; // Array of Permission IDs
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Added password field
  roleId: string;
  userType: 'standard' | 'merchandiser' | 'driver' | 'sales_manager';
  linkedEntityId?: string; // Links to SalesManager, Merchandiser, or Driver ID
  avatar?: string;
  status: 'active' | 'inactive';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  phoneDetails: string;
  city: string;
  district: string;
  latitude: string;
  longitude: string;
  address?: string; // Added address
  status: 'active' | 'inactive';
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive';
}

export interface Store {
  id: string;
  name: string;
  location: string;
  warehouseId: string; // Links to Warehouse
  status: 'active' | 'inactive';
  latitude?: string;
  longitude?: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  warehouseId: string; // Links to Warehouse
  status: 'active' | 'inactive';
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  vehicleId: string; // Links to Vehicle
  status: 'active' | 'inactive';
}

export interface SalesManager {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  status: 'active' | 'inactive';
}

export interface Merchandiser {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  salesManagerId?: string; // Links to SalesManager
  status: 'active' | 'inactive';
}

export interface TransferItem {
  productId: string;
  quantity: number;
}

export interface StockTransfer {
  id: string;
  sourceId: string;
  sourceType: 'warehouse' | 'vehicle';
  targetId: string;
  targetType: 'warehouse' | 'vehicle';
  items: TransferItem[];
  date: string;
  driverConfirmationDate?: string; // New field for driver acceptance
  status: 'pending' | 'completed' | 'cancelled';
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface Category {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface Product {
  id: string;
  name: string;
  code: string;
  barcode: string;
  imei: string;
  serialNumber: string;
  brandId: string;
  categoryId: string;
  status: 'active' | 'inactive';
  price: number; // Added price
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  targetType: 'all' | 'role' | 'user' | 'driver' | 'merchandiser';
  targetId?: string; // ID of specific user or role
  createdAt: string;
  readBy: string[]; // Array of User IDs
}

export interface RoutePlan {
  id: string;
  salesManagerId: string; // The manager (or merchandiser) this route belongs to
  title: string;
  days: {
    dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    storeIds: string[];
  }[];
}

export interface Visit {
  id: string;
  storeId: string;
  salesManagerId: string;
  date: string;
  status: 'visited' | 'not_visited';
  notes?: string;
  visitReason?: string; // Why it was not visited
  location?: {
    latitude: number;
    longitude: number;
    distanceToStore: number;
  };
  imagesBefore: string[]; // Base64 or URLs
  imagesAfter: string[]; // Base64 or URLs
}

// --- ORDER SYSTEM TYPES ---

export type PaymentType = 'online' | 'cod_cash' | 'cod_card' | 'cod_mixed';
export type OrderStatus = 'pending_warehouse' | 'assigned_to_driver' | 'out_for_delivery' | 'delivered' | 'failed';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentType: PaymentType;
  orderDate: string;
  status: OrderStatus;
  
  // Assignment
  vehicleId?: string;
  driverId?: string; // Derived from vehicle usually, but good to store
  
  // Delivery Data (filled by driver)
  deliveryAttempt?: {
    date: string;
    success: boolean;
    failureReason?: string; // e.g. "Not Home", "Vehicle Breakdown"
    idPhoto?: string; // Base64
    signature?: string; // Base64
    notes?: string;
    collectedCash?: number;
    collectedCard?: number;
  };
}

// --- LIVE TRACKING TYPES ---
export interface LiveLocation {
    userId: string;
    userType: 'driver' | 'merchandiser';
    entityId: string; // driverId or merchandiserId
    name: string;
    latitude: number;
    longitude: number;
    timestamp: number;
    status: 'online' | 'offline';
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

export interface TranslationDictionary {
  [key: string]: {
    [key: string]: string;
  };
}

export type ColorTheme = 'indigo' | 'blue' | 'emerald' | 'rose' | 'amber';
export type FontSize = 'small' | 'medium' | 'large';

export interface ApiConfig {
  googleMapsKey: string;
  paymentGatewayKey: string;
  smsProviderKey: string;
}

export interface SystemSettings {
  primaryColor: ColorTheme;
  fontSize: FontSize;
  currency: string;
  apiConfig: ApiConfig;
}

export interface AppState {
  users: User[];
  roles: Role[];
  permissions: Permission[];
  customers: Customer[];
  warehouses: Warehouse[];
  stores: Store[];
  vehicles: Vehicle[];
  drivers: Driver[];
  merchandisers: Merchandiser[];
  salesManagers: SalesManager[];
  stockTransfers: StockTransfer[];
  brands: Brand[];
  categories: Category[];
  products: Product[];
  notifications: Notification[];
  routePlans: RoutePlan[];
  visits: Visit[];
  orders: Order[];
  liveLocations: LiveLocation[]; // New
  currentUser: User | null;
  language: LanguageCode;
  theme: 'light' | 'dark';
  settings: SystemSettings;
}
