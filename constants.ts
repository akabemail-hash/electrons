
import { AppState, Permission, Role, User, Customer, Warehouse, Store, Vehicle, Driver, StockTransfer, Brand, Category, Product, TranslationDictionary, Merchandiser, Notification, SalesManager, RoutePlan, Visit, SystemSettings, Order, LiveLocation } from './types';
import { TRANSLATIONS } from './languages';

export { TRANSLATIONS };

// --- DATA GENERATORS ---

const firstNames = ["Ali", "Vali", "Hasan", "Huseyn", "Mammad", "Leyla", "Aysel", "Gunel", "Nigar", "Sevda", "Ramil", "Elvin", "Vusal", "Orkhan", "Murad", "Tural", "Ilgar", "Rashad", "Samir", "Elnur"];
const lastNames = ["Aliyev", "Mammadov", "Huseynov", "Hasanov", "Guliyev", "Ismayilov", "Abdullayev", "Jafarov", "Mustafayev", "Karimov", "Safarov", "Quliyev", "Babayev", "Aslanov", "Mehdiyev"];
const cities = ["Bakı", "Gəncə", "Sumqayıt", "Xırdalan", "Şəki", "Lənkəran", "Mingəçevir", "Quba", "Qəbələ", "Şamaxı"];
const districts = ["Nəsimi", "Yasamal", "Nərimanov", "Xətai", "Səbail", "Binəqədi", "Sabunçu", "Nizami", "Suraxanı", "Qaradağ"];
const streetNames = ["H.Əliyev pr.", "Nizami küç.", "R.Behbudov küç.", "İstiqlaliyyət küç.", "Azadlıq pr.", "Təbriz küç.", "Bakıxanov küç.", "M.Hüseyn küç."];

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper for Baku coordinates (ensuring land mass roughly)
const getBakuLat = () => (40.36 + Math.random() * 0.09).toFixed(6);
const getBakuLng = () => (49.80 + Math.random() * 0.15).toFixed(6);

// 1. Brands (15)
const brandNames = ["Apple", "Samsung", "Xiaomi", "Sony", "LG", "Asus", "Dell", "HP", "Lenovo", "Acer", "Huawei", "Oppo", "Vivo", "Nokia", "Canon"];
export const INITIAL_BRANDS: Brand[] = brandNames.map((name, index) => ({
    id: (index + 1).toString(),
    name: name,
    description: `Official distributor of ${name} products.`,
    status: 'active'
}));

// 2. Categories (15)
const categoryNames = ["Smartphones", "Laptops", "Tablets", "Smartwatches", "Headphones", "Cameras", "Televisions", "Gaming Consoles", "Speakers", "Printers", "Monitors", "Accessories", "Home Appliances", "Networking", "Storage"];
export const INITIAL_CATEGORIES: Category[] = categoryNames.map((name, index) => ({
    id: (index + 1).toString(),
    name: name,
    description: `All kinds of ${name.toLowerCase()}`,
    status: 'active'
}));

// 3. Warehouses (5)
export const INITIAL_WAREHOUSES: Warehouse[] = [
    { id: '1', name: 'Mərkəzi Anbar - Binəqədi', location: 'Bakı, Binəqədi şossesi 4', status: 'active' },
    { id: '2', name: 'Sumqayıt Depo', location: 'Sumqayıt, Sülh prospekti', status: 'active' },
    { id: '3', name: 'Xırdalan Logistika', location: 'Xırdalan, H.Əliyev pr.', status: 'active' },
    { id: '4', name: 'Gəncə Filialı', location: 'Gəncə, Nizami Gəncəvi pr.', status: 'active' },
    { id: '5', name: 'Cənub Anbarı - Lənkəran', location: 'Lənkəran, Sütəmurdov', status: 'active' },
];

// 4. Stores (12)
export const INITIAL_STORES: Store[] = Array.from({ length: 12 }, (_, i) => ({
    id: (i + 1).toString(),
    name: `Electro ${getRandom(districts)} Branch ${i + 1}`,
    location: `${getRandom(cities)}, ${getRandom(streetNames)}`,
    warehouseId: getRandomInt(1, 5).toString(),
    status: 'active',
    latitude: getBakuLat(),
    longitude: getBakuLng()
}));

// 5. Vehicles (10)
const carModels = ["Ford Transit", "Mercedes Sprinter", "Hyundai H-1", "Gazelle Next", "Fiat Ducato", "Volkswagen Crafter"];
export const INITIAL_VEHICLES: Vehicle[] = Array.from({ length: 10 }, (_, i) => ({
    id: (i + 1).toString(),
    plateNumber: `9${getRandomInt(0, 9)}-${getRandom(["AZ", "AA", "XX", "YY"])}-${getRandomInt(100, 999)}`,
    model: getRandom(carModels),
    warehouseId: '1',
    status: 'active'
}));

// 6. Drivers (10)
export const INITIAL_DRIVERS: Driver[] = Array.from({ length: 10 }, (_, i) => ({
    id: (i + 1).toString(),
    name: i === 0 ? 'Sürücü Həsən' : `${getRandom(firstNames)} ${getRandom(lastNames)}`,
    licenseNumber: `AZ${getRandomInt(100000, 999999)}`,
    phone: `+994 50 ${getRandomInt(200, 999)} ${getRandomInt(10, 99)} ${getRandomInt(10, 99)}`,
    vehicleId: (i + 1).toString(),
    status: 'active'
}));

// 11. Sales Managers (5)
export const INITIAL_SALES_MANAGERS: SalesManager[] = Array.from({ length: 5 }, (_, i) => ({
    id: (i + 1).toString(),
    name: i === 0 ? 'Baş Menecer Əli' : `${getRandom(firstNames)} ${getRandom(lastNames)}`,
    email: i === 0 ? 'ali.manager@electro.com' : `manager${i+1}@electro.com`,
    phone: `+994 50 ${getRandomInt(200, 999)} ${getRandomInt(10, 99)} ${getRandomInt(10, 99)}`,
    region: 'Bakı',
    status: 'active'
}));

// 12. Merchandisers (10)
export const INITIAL_MERCHANDISERS: Merchandiser[] = Array.from({ length: 10 }, (_, i) => ({
    id: (i + 1).toString(),
    name: `${getRandom(firstNames)} ${getRandom(lastNames)}`,
    email: `merch${i+1}@electro.com`,
    phone: `+994 55 ${getRandomInt(200, 999)} ${getRandomInt(10, 99)} ${getRandomInt(10, 99)}`,
    region: getRandom(districts),
    salesManagerId: '1',
    status: 'active'
}));

// 7. Users
export const INITIAL_USERS: User[] = [
    { id: '1', name: 'Admin İstifadəçi', email: 'admin@electro.com', password: '123', roleId: '1', userType: 'standard', status: 'active', avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff' },
    { id: '2', name: 'Lalə Məmmədova', email: 'lale@electro.com', password: '123', roleId: '2', userType: 'standard', status: 'active', avatar: 'https://ui-avatars.com/api/?name=Lale+Mammadova&background=10b981&color=fff' },
    
    // Linked Sales Manager User (Linked to Ali Manager)
    { id: '99', name: 'Baş Menecer Əli', email: 'ali.manager@electro.com', password: '123', roleId: '5', userType: 'sales_manager', linkedEntityId: '1', status: 'active', avatar: 'https://ui-avatars.com/api/?name=Ali+Manager&background=random' },
    
    // Linked Driver User (Linked to Hasan Driver)
    { id: '100', name: 'Sürücü Həsən', email: 'driver@electro.com', password: '123', roleId: '4', userType: 'driver', linkedEntityId: '1', status: 'active', avatar: 'https://ui-avatars.com/api/?name=Hasan+Driver&background=random' },
    
    ...Array.from({ length: 5 }, (_, i) => ({
        id: (i + 3).toString(),
        name: `${getRandom(firstNames)} ${getRandom(lastNames)}`,
        email: `user${i+3}@electro.com`,
        password: '123',
        roleId: '3',
        userType: 'standard',
        status: 'active',
        avatar: `https://ui-avatars.com/api/?name=User+${i}&background=random`
    } as User))
];

// 8. Customers (50)
export const INITIAL_CUSTOMERS: Customer[] = Array.from({ length: 50 }, (_, i) => ({
    id: (i + 1).toString(),
    name: `${getRandom(firstNames)} ${getRandom(lastNames)}`,
    phone: `+994 ${getRandom(["50", "51", "55", "70", "77"])} ${getRandomInt(200, 999)} ${getRandomInt(10, 99)} ${getRandomInt(10, 99)}`,
    phoneDetails: getRandom(['Mobil', 'Ev']),
    city: 'Bakı',
    district: getRandom(districts),
    latitude: getBakuLat(),
    longitude: getBakuLng(),
    address: `${getRandom(streetNames)} ${getRandomInt(1, 100)}`,
    status: 'active'
}));

// 9. Products (100)
export const INITIAL_PRODUCTS: Product[] = Array.from({ length: 100 }, (_, i) => {
    const brand = getRandom(INITIAL_BRANDS);
    const category = getRandom(INITIAL_CATEGORIES);
    return {
        id: (i + 1).toString(),
        name: `${brand.name} ${category.name} ${getRandom(['X', 'Pro', 'Ultra', 'Lite', 'S', 'Max'])}`,
        code: `${brand.name.substring(0, 2).toUpperCase()}-${getRandomInt(1000, 9999)}`,
        barcode: `880${getRandomInt(10000000, 99999999)}`,
        imei: `${getRandomInt(350000000000000, 359999999999999)}`,
        serialNumber: `${getRandom(['S', 'A', 'F', 'X'])}${getRandomInt(10000, 99999)}${getRandom(['Z', 'Y', 'X'])}`,
        brandId: brand.id,
        categoryId: category.id,
        status: 'active',
        price: getRandomInt(100, 3000)
    };
});

// 10. Transfers
export const INITIAL_TRANSFERS: StockTransfer[] = [
    { 
        id: 'TR-1001', 
        sourceId: '1', sourceType: 'warehouse',
        targetId: '2', targetType: 'warehouse',
        items: [{ productId: '1', quantity: 50 }, { productId: '3', quantity: 10 }], 
        date: '2025-05-20', 
        status: 'completed' 
    },
    { 
        id: 'TR-1002', 
        sourceId: '1', sourceType: 'warehouse',
        targetId: '1', targetType: 'vehicle', // Targeting Vehicle 1 (Hasan's)
        items: [{ productId: '5', quantity: 20 }, { productId: '12', quantity: 5 }], 
        date: new Date().toISOString().split('T')[0], 
        status: 'pending' 
    },
];

// 13. Notifications
export const INITIAL_NOTIFICATIONS: Notification[] = [
    { id: '1', title: 'System Maintenance', message: 'The system will be down for maintenance on Sunday at 02:00 AM.', targetType: 'all', createdAt: '2025-05-22', readBy: [] },
    { id: '2', title: 'Yeni Marşrut', message: 'Həftəlik satış marşrutunuz yeniləndi.', targetType: 'driver', targetId: '1', createdAt: new Date().toISOString().split('T')[0], readBy: [] }
];

export const INITIAL_ROUTE_PLANS: RoutePlan[] = [
    {
        id: '1',
        salesManagerId: '1', // Ali Manager
        title: 'Baki Route Plan',
        days: [
            { dayOfWeek: 'monday', storeIds: ['1', '2', '3'] },
            { dayOfWeek: 'tuesday', storeIds: ['4', '5'] },
            { dayOfWeek: 'wednesday', storeIds: ['6', '7', '8'] },
            { dayOfWeek: 'thursday', storeIds: ['9', '10'] },
            { dayOfWeek: 'friday', storeIds: ['11', '12'] },
            { dayOfWeek: 'saturday', storeIds: [] },
            { dayOfWeek: 'sunday', storeIds: [] },
        ]
    }
];

export const INITIAL_VISITS: Visit[] = [];

// Orders
export const INITIAL_ORDERS: Order[] = Array.from({ length: 15 }, (_, i) => ({
    id: `ORD-${2025000 + i}`,
    customerId: getRandomInt(1, 50).toString(),
    items: [
        { productId: getRandomInt(1, 100).toString(), quantity: getRandomInt(1, 2), price: getRandomInt(100, 500) },
        { productId: getRandomInt(1, 100).toString(), quantity: 1, price: getRandomInt(500, 2000) }
    ],
    totalAmount: getRandomInt(500, 5000),
    paymentType: getRandom(['online', 'cod_cash', 'cod_card', 'cod_mixed']),
    orderDate: new Date().toISOString().split('T')[0],
    status: i < 5 ? 'pending_warehouse' : (i < 10 ? 'assigned_to_driver' : 'delivered'),
    vehicleId: i >= 5 ? '1' : undefined, // Vehicle 1
    driverId: i >= 5 ? '1' : undefined // Driver 1
}));

export const INITIAL_SETTINGS: SystemSettings = {
    primaryColor: 'indigo',
    fontSize: 'medium',
    currency: 'AZN', 
    apiConfig: {
        googleMapsKey: '',
        paymentGatewayKey: '',
        smsProviderKey: ''
    }
};

export const INITIAL_ROLES: Role[] = [
  { 
    id: '1', 
    name: 'Super Admin', 
    permissions: [
      'dashboard.view', 'locations.view',
      'users.view', 'users.create', 'users.edit', 'users.delete',
      'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
      'customers.view', 'customers.create', 'customers.edit', 'customers.delete',
      'warehouses.view', 'warehouses.create', 'warehouses.edit', 'warehouses.delete',
      'stores.view', 'stores.create', 'stores.edit', 'stores.delete',
      'vehicles.view', 'vehicles.create', 'vehicles.edit', 'vehicles.delete',
      'drivers.view', 'drivers.create', 'drivers.edit', 'drivers.delete',
      'merchandisers.view', 'merchandisers.create', 'merchandisers.edit', 'merchandisers.delete',
      'salesManagers.view', 'salesManagers.create', 'salesManagers.edit', 'salesManagers.delete',
      'transfers.view', 'transfers.create', 'transfers.edit', 'transfers.delete',
      'brands.view', 'brands.create', 'brands.edit', 'brands.delete',
      'categories.view', 'categories.create', 'categories.edit', 'categories.delete',
      'products.view', 'products.create', 'products.edit', 'products.delete',
      'settings.view', 'settings.edit',
      'notifications.create',
      'reports.view',
      'driver.accept',
      'routes.view', 'routes.edit',
      'orders.view', 'orders.manage' 
    ] 
  },
  { 
    id: '2', 
    name: 'Menecer', 
    permissions: [
        'dashboard.view', 'locations.view',
        'users.view', 'users.create', 'users.edit', 
        'roles.view',
        'customers.view', 'customers.create', 'customers.edit',
        'warehouses.view', 'stores.view', 'stores.create', 'stores.edit',
        'vehicles.view', 'drivers.view', 'transfers.view', 'transfers.create',
        'brands.view', 'categories.view', 'products.view', 'products.create', 'products.edit',
        'merchandisers.view', 'merchandisers.create', 'salesManagers.view',
        'notifications.create', 'reports.view', 'routes.view', 'routes.edit',
        'orders.view', 'orders.manage'
    ] 
  },
  { 
    id: '3', 
    name: 'Satış Təmsilçisi', 
    permissions: ['users.view', 'customers.view', 'customers.create', 'brands.view', 'categories.view', 'products.view', 'stores.view', 'driver.accept', 'routes.view'] 
  },
  {
    id: '4',
    name: 'Sürücü',
    permissions: ['driver.accept', 'orders.view']
  },
  {
    id: '5',
    name: 'Satış Meneceri',
    permissions: ['routes.view', 'visits.view', 'customers.view']
  }
];

export const PERMISSIONS: Permission[] = [
  { id: 'dashboard.view', name: 'View Dashboard', description: 'Can access the main dashboard' },
  { id: 'locations.view', name: 'View Live Map', description: 'Can view live locations of staff' },
  { id: 'users.view', name: 'View Users', description: 'Can view user list' },
  { id: 'users.create', name: 'Create Users', description: 'Can add new users' },
  { id: 'users.edit', name: 'Edit Users', description: 'Can edit existing users' },
  { id: 'users.delete', name: 'Delete Users', description: 'Can remove users' },
  { id: 'roles.view', name: 'View Roles', description: 'Can view and manage roles and permissions' },
  { id: 'roles.create', name: 'Create Roles', description: 'Can create new roles' },
  { id: 'roles.edit', name: 'Edit Roles', description: 'Can edit existing roles' },
  { id: 'roles.delete', name: 'Delete Roles', description: 'Can delete roles' },
  { id: 'customers.view', name: 'View Customers', description: 'Can view customer list' },
  { id: 'customers.create', name: 'Create Customers', description: 'Can add new customers' },
  { id: 'customers.edit', name: 'Edit Customers', description: 'Can edit customer details' },
  { id: 'customers.delete', name: 'Delete Customers', description: 'Can remove customers' },
  { id: 'warehouses.view', name: 'View Warehouses', description: 'Can view warehouse list' },
  { id: 'warehouses.create', name: 'Create Warehouses', description: 'Can add new warehouses' },
  { id: 'warehouses.edit', name: 'Edit Warehouses', description: 'Can edit warehouse details' },
  { id: 'warehouses.delete', name: 'Delete Warehouses', description: 'Can remove warehouses' },
  { id: 'stores.view', name: 'View Stores', description: 'Can view store list' },
  { id: 'stores.create', name: 'Create Stores', description: 'Can add new stores' },
  { id: 'stores.edit', name: 'Edit Stores', description: 'Can edit store details' },
  { id: 'stores.delete', name: 'Delete Stores', description: 'Can remove stores' },
  { id: 'vehicles.view', name: 'View Vehicles', description: 'Can view vehicle list' },
  { id: 'vehicles.create', name: 'Create Vehicles', description: 'Can add new vehicles' },
  { id: 'vehicles.edit', name: 'Edit Vehicles', description: 'Can edit vehicle details' },
  { id: 'vehicles.delete', name: 'Delete Vehicles', description: 'Can remove vehicles' },
  { id: 'drivers.view', name: 'View Drivers', description: 'Can view driver list' },
  { id: 'drivers.create', name: 'Create Drivers', description: 'Can add new drivers' },
  { id: 'drivers.edit', name: 'Edit Drivers', description: 'Can edit driver details' },
  { id: 'drivers.delete', name: 'Delete Drivers', description: 'Can remove drivers' },
  { id: 'merchandisers.view', name: 'View Merchandisers', description: 'Can view merchandiser list' },
  { id: 'merchandisers.create', name: 'Create Merchandisers', description: 'Can add new merchandisers' },
  { id: 'merchandisers.edit', name: 'Edit Merchandisers', description: 'Can edit merchandiser details' },
  { id: 'merchandisers.delete', name: 'Delete Merchandisers', description: 'Can remove merchandisers' },
  { id: 'salesManagers.view', name: 'View Sales Managers', description: 'Can view sales manager list' },
  { id: 'salesManagers.create', name: 'Create Sales Managers', description: 'Can add new sales managers' },
  { id: 'salesManagers.edit', name: 'Edit Sales Managers', description: 'Can edit sales manager details' },
  { id: 'salesManagers.delete', name: 'Delete Sales Managers', description: 'Can remove sales managers' },
  { id: 'transfers.view', name: 'View Transfers', description: 'Can view stock transfers' },
  { id: 'transfers.create', name: 'Create Transfers', description: 'Can create new stock transfers' },
  { id: 'transfers.edit', name: 'Edit Transfers', description: 'Can edit stock transfers' },
  { id: 'transfers.delete', name: 'Delete Transfers', description: 'Can delete stock transfers' },
  { id: 'brands.view', name: 'View Brands', description: 'Can view product brands' },
  { id: 'brands.create', name: 'Create Brands', description: 'Can add new brands' },
  { id: 'brands.edit', name: 'Edit Brands', description: 'Can edit brand details' },
  { id: 'brands.delete', name: 'Delete Brands', description: 'Can remove brands' },
  { id: 'categories.view', name: 'View Categories', description: 'Can view product categories' },
  { id: 'categories.create', name: 'Create Categories', description: 'Can add new categories' },
  { id: 'categories.edit', name: 'Edit Categories', description: 'Can edit category details' },
  { id: 'categories.delete', name: 'Delete Categories', description: 'Can remove categories' },
  { id: 'products.view', name: 'View Products', description: 'Can view product list' },
  { id: 'products.create', name: 'Create Products', description: 'Can add new products' },
  { id: 'products.edit', name: 'Edit Products', description: 'Can edit product details' },
  { id: 'products.delete', name: 'Delete Products', description: 'Can remove products' },
  { id: 'settings.view', name: 'View Settings', description: 'Can view system settings' },
  { id: 'settings.edit', name: 'Edit Settings', description: 'Can change system settings' },
  { id: 'notifications.create', name: 'Create Notifications', description: 'Can send system notifications' },
  { id: 'reports.view', name: 'View Reports', description: 'Can view system reports' },
  { id: 'driver.accept', name: 'Driver Acceptance', description: 'Can accept stock transfers as a driver' },
  { id: 'routes.view', name: 'View Routes', description: 'Can view route plans' },
  { id: 'routes.edit', name: 'Edit Routes', description: 'Can create and edit route plans' },
  { id: 'visits.view', name: 'View Visits', description: 'Can perform store visits' },
  { id: 'orders.view', name: 'View Orders', description: 'Can view customer orders' },
  { id: 'orders.manage', name: 'Manage Orders', description: 'Can assign and manage orders' },
];
