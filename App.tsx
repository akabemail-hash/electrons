
import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Users, Shield, LogOut, Menu, Settings, ShoppingBag, Sun, Moon, ChevronDown, ChevronRight, Key, UserCheck, Warehouse, Tag, Layers, Package, Store as StoreIcon, Truck, Contact, ArrowRightLeft, IdCard, Bell, MessageSquare, FileText, Briefcase, Map, ShoppingCart, LocateFixed, BarChart, Footprints, TrendingUp, DollarSign, Activity, PackageCheck, AlertTriangle, Clock, CheckCircle, ClipboardList } from 'lucide-react';
import { User, Role, Permission, Customer, Warehouse as WarehouseType, Store, Vehicle, Driver, StockTransfer, Brand, Category, Product, LanguageCode, AppState, Merchandiser, Notification, SalesManager, RoutePlan, Visit, SystemSettings, Order, LiveLocation } from './types';
import { INITIAL_USERS, INITIAL_ROLES, PERMISSIONS, INITIAL_CUSTOMERS, INITIAL_WAREHOUSES, INITIAL_STORES, INITIAL_VEHICLES, INITIAL_DRIVERS, INITIAL_TRANSFERS, INITIAL_BRANDS, INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_MERCHANDISERS, INITIAL_NOTIFICATIONS, INITIAL_SALES_MANAGERS, INITIAL_ROUTE_PLANS, INITIAL_VISITS, INITIAL_SETTINGS, INITIAL_ORDERS, TRANSLATIONS } from './constants';
import { Login } from './components/Login';
import { AdminPanel } from './components/AdminPanel';
import { UserNotifications } from './components/UserNotifications';
import { DriverPanel } from './components/DriverPanel';
import { ReportsPanel, ReportType } from './components/ReportsPanel';
import { RoutePlanningPanel } from './components/RoutePlanningPanel';
import { SalesManagerPanel } from './components/SalesManagerPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { OrderManagementPanel } from './components/OrderManagementPanel';
import { OrderDispatchPanel } from './components/OrderDispatchPanel';
import { LiveTrackingMap } from './components/LiveTrackingMap';
import { Modal, Input, Button, Card, Badge } from './components/ui';
import { ToastProvider, useToast } from './components/Toast';

type PageType = 'dashboard' | 'users' | 'roles' | 'permissions' | 'customers' | 'warehouses' | 'stores' | 'vehicles' | 'drivers' | 'merchandisers' | 'salesManagers' | 'transfers' | 'brands' | 'categories' | 'products' | 'settings' | 'notifications-admin' | 'notifications-user' | 'driver-acceptance' | 'route-planning' | 'sales-manager-route' | 'orders-list' | 'orders-dispatch' | 'live-map' | 'report-loading' | 'report-orders' | 'report-products' | 'report-visits' | 'report-routes' | 'report-stock';

// Color Palettes for Dynamic Theming (50-900)
const COLOR_PALETTES: Record<string, Record<number, string>> = {
  indigo: {
    50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8',
    500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81'
  },
  blue: {
    50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
    500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a'
  },
  emerald: {
    50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
    500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b'
  },
  rose: {
    50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185',
    500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337'
  },
  amber: {
    50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24',
    500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f'
  }
};

function AppContent() {
  const [state, setState] = useState<AppState>({
    users: INITIAL_USERS,
    roles: INITIAL_ROLES,
    permissions: PERMISSIONS,
    customers: INITIAL_CUSTOMERS,
    warehouses: INITIAL_WAREHOUSES,
    stores: INITIAL_STORES,
    vehicles: INITIAL_VEHICLES,
    drivers: INITIAL_DRIVERS,
    merchandisers: INITIAL_MERCHANDISERS,
    salesManagers: INITIAL_SALES_MANAGERS,
    stockTransfers: INITIAL_TRANSFERS,
    brands: INITIAL_BRANDS,
    categories: INITIAL_CATEGORIES,
    products: INITIAL_PRODUCTS,
    notifications: INITIAL_NOTIFICATIONS,
    routePlans: INITIAL_ROUTE_PLANS,
    visits: INITIAL_VISITS,
    orders: INITIAL_ORDERS,
    liveLocations: [], // Initial state empty
    currentUser: null,
    language: 'en',
    theme: 'light',
    settings: INITIAL_SETTINGS
  });

  const { addToast } = useToast();

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState<PageType>('dashboard');
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(true);
  const [isReportsMenuOpen, setIsReportsMenuOpen] = useState(false);
  
  // Header Dropdown States
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

  // Safety fallback for translations to prevent invisible text
  const t = TRANSLATIONS[state.language] || TRANSLATIONS['en'];

  // Helper to update specific parts of state
  const updateState = (updates: Partial<AppState>) => setState(prev => ({ ...prev, ...updates }));

  // Helper for RBAC
  const hasPermission = (permissionCode: string) => {
      if (!state.currentUser) return false;
      const role = state.roles.find(r => r.id === state.currentUser!.roleId);
      return role?.permissions.includes(permissionCode) || false;
  };

  // --- Effects ---

  // SIMULATE LIVE LOCATIONS
  useEffect(() => {
      // Only run if logged in and in a relevant role (or admin viewing map)
      if (!state.currentUser) return;

      const interval = setInterval(() => {
          setState(prev => {
              // Create mock live locations for some drivers/merchandisers if list is empty
              let newLocations = [...prev.liveLocations];
              
              if (newLocations.length === 0) {
                  // Initialize some random positions near Baku
                  prev.drivers.slice(0, 3).forEach(d => {
                      newLocations.push({
                          userId: d.id, // Mock mapping user to driver
                          userType: 'driver',
                          entityId: d.id,
                          name: d.name,
                          latitude: 40.4093 + (Math.random() - 0.5) * 0.1,
                          longitude: 49.8671 + (Math.random() - 0.5) * 0.1,
                          timestamp: Date.now(),
                          status: 'online'
                      });
                  });
                  prev.merchandisers.slice(0, 3).forEach(m => {
                      newLocations.push({
                          userId: m.id,
                          userType: 'merchandiser',
                          entityId: m.salesManagerId || m.id, // Using linked ID for filtering logic
                          name: m.name,
                          latitude: 40.4093 + (Math.random() - 0.5) * 0.1,
                          longitude: 49.8671 + (Math.random() - 0.5) * 0.1,
                          timestamp: Date.now(),
                          status: 'online'
                      });
                  });
              }

              // Jitter existing locations
              newLocations = newLocations.map(loc => ({
                  ...loc,
                  latitude: loc.latitude + (Math.random() - 0.5) * 0.001,
                  longitude: loc.longitude + (Math.random() - 0.5) * 0.001,
                  timestamp: Date.now()
              }));

              return { ...prev, liveLocations: newLocations };
          });
      }, 3000); // Update every 3 seconds

      return () => clearInterval(interval);
  }, [state.currentUser]);

  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth < 1024) {
            setSidebarOpen(false); 
        } else {
            setSidebarOpen(true);
        }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // Apply Font Size
  useEffect(() => {
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    document.documentElement.style.fontSize = fontSizeMap[state.settings.fontSize];
  }, [state.settings.fontSize]);

  // Apply Color Theme CSS Variables
  useEffect(() => {
    const palette = COLOR_PALETTES[state.settings.primaryColor] || COLOR_PALETTES['indigo'];
    const root = document.documentElement;
    Object.entries(palette).forEach(([shade, value]) => {
      root.style.setProperty(`--color-primary-${shade}`, value);
    });
  }, [state.settings.primaryColor]);

  // Click outside listener for dropdowns
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
              setIsProfileMenuOpen(false);
          }
          if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
              setIsNotificationMenuOpen(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Actions ---

  const handleNavClick = (page: PageType) => {
      setActivePage(page);
      if (window.innerWidth < 1024) {
          setSidebarOpen(false);
      }
  };

  const toggleTheme = () => {
    updateState({ theme: state.theme === 'light' ? 'dark' : 'light' });
  };

  const handleLogin = (coords?: {lat: number, lng: number}) => {
    const user = state.users[0]; // Simulating login
    let defaultPage: PageType = 'dashboard';
    
    // Auto-redirect based on role/type for better UX, but access control is permission-based
    const role = state.roles.find(r => r.id === user.roleId);
    if (role) {
        if (role.permissions.includes('driver.accept')) defaultPage = 'driver-acceptance';
        else if (role.permissions.includes('visits.view')) defaultPage = 'sales-manager-route';
        else defaultPage = 'dashboard';
    }

    // If we have coordinates, push this user to liveLocations immediately
    if (coords) {
        const newLiveLoc: LiveLocation = {
            userId: user.id,
            userType: user.userType === 'driver' ? 'driver' : 'merchandiser', // Simplification
            entityId: user.linkedEntityId || user.id,
            name: user.name,
            latitude: coords.lat,
            longitude: coords.lng,
            timestamp: Date.now(),
            status: 'online'
        };
        updateState({ 
            currentUser: user,
            liveLocations: [...state.liveLocations, newLiveLoc]
        });
    } else {
        updateState({ currentUser: user });
    }

    setActivePage(defaultPage);
    addToast({ type: 'success', message: t.welcome + ' ' + state.users[0].name });
    if (window.innerWidth >= 1024) setSidebarOpen(true);
  };

  const handleLogout = () => {
    updateState({ currentUser: null });
    setIsProfileMenuOpen(false);
    addToast({ type: 'info', message: t.logout });
  };

  // CRUD Operations (Existing)
  const addUser = (n: Omit<User, 'id'>) => { 
      const id = (Math.max(...state.users.map(u => parseInt(u.id)))+1).toString(); 
      updateState({ users: [...state.users, {...n, id}] });
      addToast({ type: 'success', message: t.itemCreated });
  };
  const editUser = (u: User) => {
      updateState({ users: state.users.map(x => x.id === u.id ? u : x) });
      addToast({ type: 'success', message: t.itemUpdated });
  };
  const deleteUser = (id: string) => { 
      if(confirm(t.deleteConfirm)) {
          updateState({ users: state.users.filter(x => x.id !== id) });
          addToast({ type: 'success', message: t.itemDeleted });
      }
  };
  // ... (Other CRUD operations omitted for brevity, they remain unchanged) ...
  const addRole = (n: Omit<Role, 'id'>) => { 
      const id = (Math.max(...state.roles.map(r => parseInt(r.id)))+1).toString(); 
      updateState({ roles: [...state.roles, {...n, id}] });
      addToast({ type: 'success', message: t.itemCreated });
  };
  const editRole = (r: Role) => {
      updateState({ roles: state.roles.map(x => x.id === r.id ? r : x) });
      addToast({ type: 'success', message: t.itemUpdated });
  };
  const deleteRole = (id: string) => { 
      if(confirm(t.deleteConfirm)) {
          updateState({ roles: state.roles.filter(x => x.id !== id) });
          addToast({ type: 'success', message: t.itemDeleted });
      }
  };
  
  const addPermission = (n: any) => {
      updateState({ permissions: [...state.permissions, n] });
      addToast({ type: 'success', message: t.itemCreated });
  };
  const editPermission = (p: Permission) => {
      updateState({ permissions: state.permissions.map(x => x.id === p.id ? p : x) });
      addToast({ type: 'success', message: t.itemUpdated });
  };
  const deletePermission = (id: string) => { 
      if(confirm(t.deleteConfirm)) {
          updateState({ permissions: state.permissions.filter(x => x.id !== id) });
          addToast({ type: 'success', message: t.itemDeleted });
      }
  };
  
  const addCustomer = (n: Omit<Customer, 'id'>) => { 
      const id = (Math.max(...state.customers.map(c => parseInt(c.id)))+1).toString(); 
      updateState({ customers: [...state.customers, {...n, id}] });
      addToast({ type: 'success', message: t.itemCreated });
  };
  const editCustomer = (c: Customer) => {
      updateState({ customers: state.customers.map(x => x.id === c.id ? c : x) });
      addToast({ type: 'success', message: t.itemUpdated });
  };
  const deleteCustomer = (id: string) => { 
      if(confirm(t.deleteConfirm)) {
          updateState({ customers: state.customers.filter(x => x.id !== id) });
          addToast({ type: 'success', message: t.itemDeleted });
      }
  };
  
  const addWarehouse = (n: Omit<WarehouseType, 'id'>) => { 
      const id = (Math.max(...state.warehouses.map(w => parseInt(w.id)))+1).toString(); 
      updateState({ warehouses: [...state.warehouses, {...n, id}] });
      addToast({ type: 'success', message: t.itemCreated });
  };
  const editWarehouse = (w: WarehouseType) => {
      updateState({ warehouses: state.warehouses.map(x => x.id === w.id ? w : x) });
      addToast({ type: 'success', message: t.itemUpdated });
  };
  const deleteWarehouse = (id: string) => { 
      if(confirm(t.deleteConfirm)) {
          updateState({ warehouses: state.warehouses.filter(x => x.id !== id) });
          addToast({ type: 'success', message: t.itemDeleted });
      }
  };
  
  const addStore = (n: Omit<Store, 'id'>) => { 
      const id = (Math.max(...state.stores.map(s => parseInt(s.id)))+1).toString(); 
      updateState({ stores: [...state.stores, {...n, id}] });
      addToast({ type: 'success', message: t.itemCreated });
  };
  const editStore = (s: Store) => {
      updateState({ stores: state.stores.map(x => x.id === s.id ? s : x) });
      addToast({ type: 'success', message: t.itemUpdated });
  };
  const deleteStore = (id: string) => { 
      if(confirm(t.deleteConfirm)) {
          updateState({ stores: state.stores.filter(x => x.id !== id) });
          addToast({ type: 'success', message: t.itemDeleted });
      }
  };
  
  const addVehicle = (n: Omit<Vehicle, 'id'>) => { 
      const id = (Math.max(...state.vehicles.map(v => parseInt(v.id)))+1).toString(); 
      updateState({ vehicles: [...state.vehicles, {...n, id}] });
      addToast({ type: 'success', message: t.itemCreated });
  };
  const editVehicle = (v: Vehicle) => {
      updateState({ vehicles: state.vehicles.map(x => x.id === v.id ? v : x) });
      addToast({ type: 'success', message: t.itemUpdated });
  };
  const deleteVehicle = (id: string) => { 
      if(confirm(t.deleteConfirm)) {
          updateState({ vehicles: state.vehicles.filter(x => x.id !== id) });
          addToast({ type: 'success', message: t.itemDeleted });
      }
  };
  
  const addDriver = (n: Omit<Driver, 'id'>) => { 
      const id = (Math.max(...state.drivers.map(d => parseInt(d.id)))+1).toString(); 
      updateState({ drivers: [...state.drivers, {...n, id}] });
      addToast({ type: 'success', message: t.itemCreated });
  };
  const editDriver = (d: Driver) => {
      updateState({ drivers: state.drivers.map(x => x.id === d.id ? d : x) });
      addToast({ type: 'success', message: t.itemUpdated });
  };
  const deleteDriver = (id: string) => { 
      if(confirm(t.deleteConfirm)) {
          updateState({ drivers: state.drivers.filter(x => x.id !== id) });
          addToast({ type: 'success', message: t.itemDeleted });
      }
  };
  
  const addMerchandiser = (n: Omit<Merchandiser, 'id'>) => { 
      const id = (Math.max(...state.merchandisers.map(m => parseInt(m.id)))+1).toString(); 
      updateState({ merchandisers: [...state.merchandisers, {...n, id}] });
      addToast({ type: 'success', message: t.itemCreated });
  };
  const editMerchandiser = (m: Merchandiser) => {
      updateState({ merchandisers: state.merchandisers.map(x => x.id === m.id ? m : x) });
      addToast({ type: 'success', message: t.itemUpdated });
  };
  const deleteMerchandiser = (id: string) => { 
      if(confirm(t.deleteConfirm)) {
          updateState({ merchandisers: state.merchandisers.filter(x => x.id !== id) });
          addToast({ type: 'success', message: t.itemDeleted });
      }
  };

  const addSalesManager = (n: Omit<SalesManager, 'id'>) => { 
      const id = (Math.max(0, ...state.salesManagers.map(m => parseInt(m.id)))+1).toString(); 
      updateState({ salesManagers: [...state.salesManagers, {...n, id}] });
      addToast({ type: 'success', message: t.itemCreated });
  };
  const editSalesManager = (sm: SalesManager) => {
      updateState({ salesManagers: state.salesManagers.map(x => x.id === sm.id ? sm : x) });
      addToast({ type: 'success', message: t.itemUpdated });
  };
  const deleteSalesManager = (id: string) => { 
      if(confirm(t.deleteConfirm)) {
          updateState({ salesManagers: state.salesManagers.filter(x => x.id !== id) });
          addToast({ type: 'success', message: t.itemDeleted });
      }
  };
  
  const addTransfer = (n: Omit<StockTransfer, 'id'>) => { 
      const id = (Math.max(...state.stockTransfers.map(t => parseInt(t.id)))+1).toString(); 
      updateState({ stockTransfers: [...state.stockTransfers, {...n, id}] });
      addToast({ type: 'success', message: t.itemCreated });
  };
  const editTransfer = (tr: StockTransfer) => {
      updateState({ stockTransfers: state.stockTransfers.map(x => x.id === tr.id ? tr : x) });
      addToast({ type: 'success', message: t.itemUpdated });
  };
  const deleteTransfer = (id: string) => { 
      if(confirm(t.deleteConfirm)) {
          updateState({ stockTransfers: state.stockTransfers.filter(x => x.id !== id) });
          addToast({ type: 'success', message: t.itemDeleted });
      }
  };
  
  const addBrand = (n: Omit<Brand, 'id'>) => { 
      const id = (Math.max(...state.brands.map(b => parseInt(b.id)))+1).toString(); 
      updateState({ brands: [...state.brands, {...n, id}] });
      addToast({ type: 'success', message: t.itemCreated });
  };
  const editBrand = (b: Brand) => {
      updateState({ brands: state.brands.map(x => x.id === b.id ? b : x) });
      addToast({ type: 'success', message: t.itemUpdated });
  };
  const deleteBrand = (id: string) => { 
      if(confirm(t.deleteConfirm)) {
          updateState({ brands: state.brands.filter(x => x.id !== id) });
          addToast({ type: 'success', message: t.itemDeleted });
      }
  };
  
  const addCategory = (n: Omit<Category, 'id'>) => { 
      const id = (Math.max(...state.categories.map(c => parseInt(c.id)))+1).toString(); 
      updateState({ categories: [...state.categories, {...n, id}] });
      addToast({ type: 'success', message: t.itemCreated });
  };
  const editCategory = (c: Category) => {
      updateState({ categories: state.categories.map(x => x.id === c.id ? c : x) });
      addToast({ type: 'success', message: t.itemUpdated });
  };
  const deleteCategory = (id: string) => { 
      if(confirm(t.deleteConfirm)) {
          updateState({ categories: state.categories.filter(x => x.id !== id) });
          addToast({ type: 'success', message: t.itemDeleted });
      }
  };
  
  const addProduct = (n: Omit<Product, 'id'>) => { 
      const id = (Math.max(...state.products.map(p => parseInt(p.id)))+1).toString(); 
      updateState({ products: [...state.products, {...n, id}] });
      addToast({ type: 'success', message: t.itemCreated });
  };
  const editProduct = (p: Product) => {
      updateState({ products: state.products.map(x => x.id === p.id ? p : x) });
      addToast({ type: 'success', message: t.itemUpdated });
  };
  const deleteProduct = (id: string) => { 
      if(confirm(t.deleteConfirm)) {
          updateState({ products: state.products.filter(x => x.id !== id) });
          addToast({ type: 'success', message: t.itemDeleted });
      }
  };

  const saveRoutePlan = (plan: RoutePlan) => {
      const existingIndex = state.routePlans.findIndex(p => p.salesManagerId === plan.salesManagerId);
      if (existingIndex >= 0) {
          const newPlans = [...state.routePlans];
          newPlans[existingIndex] = plan;
          updateState({ routePlans: newPlans });
      } else {
          updateState({ routePlans: [...state.routePlans, plan] });
      }
      addToast({ type: 'success', message: t.planSaved });
  };

  const saveSettings = (newSettings: SystemSettings) => {
      updateState({ settings: newSettings });
  };

  const sendNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'readBy'>) => {
      const id = (Math.max(0, ...state.notifications.map(n => parseInt(n.id))) + 1).toString();
      const newNotification: Notification = {
          ...notification,
          id,
          createdAt: new Date().toISOString().split('T')[0],
          readBy: []
      };
      updateState({ notifications: [newNotification, ...state.notifications] });
      addToast({ type: 'success', message: t.operationSuccess });
  };

  const markNotificationAsRead = (notificationId: string) => {
      if (!state.currentUser) return;
      updateState({
          notifications: state.notifications.map(n => {
              if (n.id === notificationId && !n.readBy.includes(state.currentUser!.id)) {
                  return { ...n, readBy: [...n.readBy, state.currentUser!.id] };
              }
              return n;
          })
      });
  };

  const acceptTransfer = (transferId: string) => {
      updateState({
          stockTransfers: state.stockTransfers.map(tr => {
              if (tr.id === transferId) {
                  return {
                      ...tr,
                      status: 'completed',
                      driverConfirmationDate: new Date().toISOString().split('T')[0]
                  };
              }
              return tr;
          })
      });
      addToast({ type: 'success', message: t.confirmedSuccessfully });
  };

  const handleSaveVisit = (visit: Visit) => {
      updateState({ visits: [...state.visits, visit] });
      addToast({ type: 'success', message: t.operationSuccess });
  };

  const assignOrder = (orderId: string, vehicleId: string) => {
      const driver = state.drivers.find(d => d.vehicleId === vehicleId);
      updateState({
          orders: state.orders.map(o => {
              if (o.id === orderId) {
                  return {
                      ...o,
                      status: 'assigned_to_driver',
                      vehicleId: vehicleId,
                      driverId: driver?.id
                  }
              }
              return o;
          })
      });
  };

  const updateOrder = (order: Order) => {
      updateState({
          orders: state.orders.map(o => o.id === order.id ? order : o)
      });
  };

  const getMyNotifications = () => {
      if (!state.currentUser) return [];
      return state.notifications.filter(n => {
          if (n.targetType === 'all') return true;
          if (n.targetType === 'user' && n.targetId === state.currentUser!.id) return true;
          if (n.targetType === 'role' && n.targetId === state.currentUser!.roleId) return true;
          if (n.targetType === 'driver' && state.currentUser!.userType === 'driver') return true;
          if (n.targetType === 'merchandiser' && state.currentUser!.userType === 'merchandiser') return true;
          return false;
      }).map(n => ({
          ...n,
          isRead: n.readBy.includes(state.currentUser!.id)
      }));
  };

  const handlePasswordChange = (e: React.FormEvent) => {
      e.preventDefault();
      addToast({ type: 'success', message: t.passwordChanged });
      setIsPasswordModalOpen(false);
  };

  const totalRevenue = state.orders
      .filter(o => o.status === 'delivered')
      .reduce((acc, o) => acc + o.totalAmount, 0);

  const pendingDispatchCount = state.orders.filter(o => o.status === 'pending_warehouse').length;
  const activeDriversCount = state.drivers.filter(d => d.status === 'active').length;
  const newOrdersToday = state.orders.filter(o => o.orderDate === new Date().toISOString().split('T')[0]).length;

  const deliveredCount = state.orders.filter(o => o.status === 'delivered').length;
  const failedCount = state.orders.filter(o => o.status === 'failed').length;
  const totalAttempted = deliveredCount + failedCount;
  const deliverySuccessRate = totalAttempted > 0 ? Math.round((deliveredCount / totalAttempted) * 100) : 100;

  if (!state.currentUser) {
    return (
      <Login 
        lang={state.language} 
        theme={state.theme}
        onLogin={handleLogin} 
        setLang={(l) => updateState({ language: l })} 
        toggleTheme={toggleTheme}
      />
    );
  }

  const myNotifications = getMyNotifications();
  const unreadCount = myNotifications.filter(n => !n.isRead).length;

  const getLinkStyle = (page: PageType) => 
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
        activePage === page 
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50' 
        : 'text-slate-300 hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white'
    }`;

  // Check permissions for specific sections
  const showAdminMenu = hasPermission('users.view') || hasPermission('roles.view') || hasPermission('products.view');
  const showReports = hasPermission('reports.view');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans transition-colors duration-300 text-base">
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside 
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-900 dark:bg-slate-950 text-white transition-transform duration-300 z-30 flex flex-col shadow-2xl border-r border-slate-800 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:opacity-0' 
        } ${isSidebarOpen && window.innerWidth >= 1024 ? 'lg:w-64 lg:opacity-100' : ''}`}
      >
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
           <ShoppingBag className="text-primary-400 shrink-0" />
           <span className="font-bold text-lg tracking-wide whitespace-nowrap overflow-hidden">
             ElectroGlobal
           </span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
            {/* Sales Manager Route */}
            {(hasPermission('visits.view') || hasPermission('routes.view')) && (
                <button onClick={() => handleNavClick('sales-manager-route')} className={getLinkStyle('sales-manager-route')}>
                    <Map size={20} className="shrink-0" />
                    <span>{t.routePlanning}</span>
                </button>
            )}

            {/* Dashboard */}
            {hasPermission('dashboard.view') && (
                <button onClick={() => handleNavClick('dashboard')} className={getLinkStyle('dashboard')}>
                    <LayoutDashboard size={20} className="shrink-0" />
                    <span>{t.dashboard || 'Dashboard'}</span>
                </button>
            )}

            {/* Driver Acceptance */}
            {hasPermission('driver.accept') && (
                <button onClick={() => handleNavClick('driver-acceptance')} className={getLinkStyle('driver-acceptance')}>
                    <Truck size={20} className="shrink-0" />
                    <span>{t.driverAcceptance || 'Driver Acceptance'}</span>
                </button>
            )}

            {/* Administration Group */}
            {showAdminMenu && (
                <>
                    <div className="pt-2">
                        <button 
                            onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 text-slate-300 hover:text-white transition-colors group"
                        >
                            <div className="flex items-center gap-3 font-semibold text-xs uppercase tracking-wider">
                                <Shield size={16} className="text-slate-500 group-hover:text-primary-400" />
                                {t.administration || 'Administration'}
                            </div>
                            {isAdminMenuOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                        
                        <div className={`space-y-1 mt-1 ml-4 border-l border-slate-800 pl-2 transition-all duration-300 overflow-hidden ${isAdminMenuOpen ? 'max-h-[60rem] opacity-100' : 'max-h-0 opacity-0'}`}>
                            {hasPermission('locations.view') && (
                                <button onClick={() => handleNavClick('live-map')} className={getLinkStyle('live-map')}>
                                    <LocateFixed size={18} className="shrink-0 opacity-70" /> <span>{t.liveMap || 'Live Map'}</span>
                                </button>
                            )}
                            {hasPermission('users.view') && (
                                <button onClick={() => handleNavClick('users')} className={getLinkStyle('users')}>
                                    <Users size={18} className="shrink-0 opacity-70" /> <span>{t.users || 'Users'}</span>
                                </button>
                            )}
                            {hasPermission('roles.view') && (
                                <button onClick={() => handleNavClick('roles')} className={getLinkStyle('roles')}>
                                    <Shield size={18} className="shrink-0 opacity-70" /> <span>{t.roles || 'Roles'}</span>
                                </button>
                            )}
                            {hasPermission('roles.view') && (
                                <button onClick={() => handleNavClick('permissions')} className={getLinkStyle('permissions')}>
                                    <Key size={18} className="shrink-0 opacity-70" /> <span>{t.permissions || 'Permissions'}</span>
                                </button>
                            )}
                            {hasPermission('orders.view') && (
                                <button onClick={() => handleNavClick('orders-list')} className={getLinkStyle('orders-list')}>
                                    <ShoppingCart size={18} className="shrink-0 opacity-70" /> <span>{t.orders || 'Orders'}</span>
                                </button>
                            )}
                            {hasPermission('orders.manage') && (
                                <button onClick={() => handleNavClick('orders-dispatch')} className={getLinkStyle('orders-dispatch')}>
                                    <Truck size={18} className="shrink-0 opacity-70" /> <span>{t.orderDispatch || 'Dispatch'}</span>
                                </button>
                            )}
                            {hasPermission('customers.view') && (
                                <button onClick={() => handleNavClick('customers')} className={getLinkStyle('customers')}>
                                    <UserCheck size={18} className="shrink-0 opacity-70" /> <span>{t.customers || 'Customers'}</span>
                                </button>
                            )}
                            {hasPermission('warehouses.view') && (
                                <button onClick={() => handleNavClick('warehouses')} className={getLinkStyle('warehouses')}>
                                    <Warehouse size={18} className="shrink-0 opacity-70" /> <span>{t.warehouses || 'Warehouses'}</span>
                                </button>
                            )}
                            {hasPermission('stores.view') && (
                                <button onClick={() => handleNavClick('stores')} className={getLinkStyle('stores')}>
                                    <StoreIcon size={18} className="shrink-0 opacity-70" /> <span>{t.stores || 'Stores'}</span>
                                </button>
                            )}
                            {hasPermission('vehicles.view') && (
                                <button onClick={() => handleNavClick('vehicles')} className={getLinkStyle('vehicles')}>
                                    <Truck size={18} className="shrink-0 opacity-70" /> <span>{t.vehicles || 'Vehicles'}</span>
                                </button>
                            )}
                            {hasPermission('drivers.view') && (
                                <button onClick={() => handleNavClick('drivers')} className={getLinkStyle('drivers')}>
                                    <Contact size={18} className="shrink-0 opacity-70" /> <span>{t.drivers || 'Drivers'}</span>
                                </button>
                            )}
                            {hasPermission('merchandisers.view') && (
                                <button onClick={() => handleNavClick('merchandisers')} className={getLinkStyle('merchandisers')}>
                                    <IdCard size={18} className="shrink-0 opacity-70" /> <span>{t.merchandisers || 'Merchandisers'}</span>
                                </button>
                            )}
                            {hasPermission('salesManagers.view') && (
                                <button onClick={() => handleNavClick('salesManagers')} className={getLinkStyle('salesManagers')}>
                                    <Briefcase size={18} className="shrink-0 opacity-70" /> <span>{t.salesManagers || 'Sales Managers'}</span>
                                </button>
                            )}
                            {hasPermission('routes.edit') && (
                                <button onClick={() => handleNavClick('route-planning')} className={getLinkStyle('route-planning')}>
                                    <Map size={18} className="shrink-0 opacity-70" /> <span>{t.routePlanning || 'Route Planning'}</span>
                                </button>
                            )}
                            {hasPermission('notifications.create') && (
                                <button onClick={() => handleNavClick('notifications-admin')} className={getLinkStyle('notifications-admin')}>
                                    <MessageSquare size={18} className="shrink-0 opacity-70" /> <span>{t.userNotifications || 'Notifications'}</span>
                                </button>
                            )}
                            {hasPermission('transfers.view') && (
                                <button onClick={() => handleNavClick('transfers')} className={getLinkStyle('transfers')}>
                                    <ArrowRightLeft size={18} className="shrink-0 opacity-70" /> <span>{t.transfers || 'Transfers'}</span>
                                </button>
                            )}
                            {hasPermission('brands.view') && (
                                <button onClick={() => handleNavClick('brands')} className={getLinkStyle('brands')}>
                                    <Tag size={18} className="shrink-0 opacity-70" /> <span>{t.brands || 'Brands'}</span>
                                </button>
                            )}
                            {hasPermission('categories.view') && (
                                <button onClick={() => handleNavClick('categories')} className={getLinkStyle('categories')}>
                                    <Layers size={18} className="shrink-0 opacity-70" /> <span>{t.categories || 'Categories'}</span>
                                </button>
                            )}
                            {hasPermission('products.view') && (
                                <button onClick={() => handleNavClick('products')} className={getLinkStyle('products')}>
                                    <Package size={18} className="shrink-0 opacity-70" /> <span>{t.products || 'Products'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Reports Group */}
            {showReports && (
                <div className="pt-2">
                    <button 
                        onClick={() => setIsReportsMenuOpen(!isReportsMenuOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 text-slate-300 hover:text-white transition-colors group"
                    >
                        <div className="flex items-center gap-3 font-semibold text-xs uppercase tracking-wider">
                            <FileText size={16} className="text-slate-500 group-hover:text-primary-400" />
                            {t.reports || 'Reports'}
                        </div>
                        {isReportsMenuOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    
                    <div className={`space-y-1 mt-1 ml-4 border-l border-slate-800 pl-2 transition-all duration-300 overflow-hidden ${isReportsMenuOpen ? 'max-h-[30rem] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <button onClick={() => handleNavClick('report-loading')} className={getLinkStyle('report-loading')}>
                            <Truck size={18} className="shrink-0 opacity-70" /> <span>{t.vehicleLoadingReports || 'Vehicle Reports'}</span>
                        </button>
                        <button onClick={() => handleNavClick('report-orders')} className={getLinkStyle('report-orders')}>
                            <ShoppingCart size={18} className="shrink-0 opacity-70" /> <span>{t.orderDeliveries}</span>
                        </button>
                        <button onClick={() => handleNavClick('report-products')} className={getLinkStyle('report-products')}>
                            <BarChart size={18} className="shrink-0 opacity-70" /> <span>{t.productAnalysis}</span>
                        </button>
                        <button onClick={() => handleNavClick('report-visits')} className={getLinkStyle('report-visits')}>
                            <Footprints size={18} className="shrink-0 opacity-70" /> <span>{t.visitReports}</span>
                        </button>
                        <button onClick={() => handleNavClick('report-routes')} className={getLinkStyle('report-routes')}>
                            <Map size={18} className="shrink-0 opacity-70" /> <span>{t.routeReports}</span>
                        </button>
                        <button onClick={() => handleNavClick('report-stock')} className={getLinkStyle('report-stock')}>
                            <ClipboardList size={18} className="shrink-0 opacity-70" /> <span>{t.stockReport || 'Stock Report'}</span>
                        </button>
                    </div>
                </div>
            )}

             <button onClick={() => handleNavClick('settings')} className={getLinkStyle('settings')}>
                <Settings size={20} className="shrink-0" />
                <span>{t.settings || 'Settings'}</span>
            </button>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors text-sm font-medium">
                <LogOut size={18} className="shrink-0" />
                <span>{t.logout || 'Logout'}</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto relative flex flex-col">
        {/* Header (same as before) */}
        <header className="bg-white dark:bg-slate-900 h-16 shadow-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 flex items-center justify-between px-4 md:px-8 transition-colors duration-300">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 lg:hidden">
                <Menu size={24} />
            </button>
            {/* ... Rest of header ... */}
            <div className="flex items-center gap-2 md:gap-4 ml-auto">
                <div className="relative" ref={notificationMenuRef}>
                    <button 
                        onClick={() => setIsNotificationMenuOpen(!isNotificationMenuOpen)}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
                        )}
                    </button>
                    
                    {isNotificationMenuOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                            <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="font-semibold text-sm">{t.notifications || 'Notifications'}</h3>
                                {unreadCount > 0 && <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">{unreadCount} new</span>}
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {myNotifications.slice(0, 5).map(n => (
                                    <div key={n.id} className={`p-3 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${!n.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{n.title}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{n.message}</p>
                                    </div>
                                ))}
                                {myNotifications.length === 0 && (
                                    <div className="p-4 text-center text-xs text-slate-500">{t.noNotifications || 'No notifications'}</div>
                                )}
                            </div>
                            <button 
                                onClick={() => { setActivePage('notifications-user'); setIsNotificationMenuOpen(false); }}
                                className="w-full py-2 text-center text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                {t.viewAll || 'View All'}
                            </button>
                        </div>
                    )}
                </div>

                <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    {state.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                <select 
                    value={state.language}
                    onChange={(e) => updateState({ language: e.target.value as LanguageCode })}
                    className="hidden md:block bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 py-1.5 px-3 rounded-md border-none focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer transition-colors"
                >
                    <option value="en">🇬🇧 EN</option>
                    <option value="az">🇦🇿 AZ</option>
                    <option value="tr">🇹🇷 TR</option>
                    <option value="ru">🇷🇺 RU</option>
                </select>

                <div className="relative ml-2" ref={profileMenuRef}>
                    <button 
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-1 pr-3 transition-colors"
                    >
                        <img src={state.currentUser.avatar} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover" alt="Profile" />
                        <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-200">{state.currentUser.name}</span>
                        <ChevronDown size={14} className="text-slate-400" />
                    </button>

                    {isProfileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{state.currentUser.name}</p>
                                <p className="text-xs text-slate-500 truncate">{state.currentUser.email}</p>
                            </div>
                            <button onClick={() => { setIsProfileMenuOpen(false); setIsPasswordModalOpen(true); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                                <Key size={14} /> {t.changePassword || 'Change Password'}
                            </button>
                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                <LogOut size={14} /> {t.logout || 'Logout'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full h-full">
             <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 h-full">
                {/* ... existing conditions for other pages ... */}
                {activePage === 'dashboard' && hasPermission('dashboard.view') && (
                     <div>
                        {/* ... Dashboard content ... */}
                        <div className="mb-8 flex justify-between items-end">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.dashboard || 'Dashboard'}</h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">{t.welcome || 'Welcome'}, {state.currentUser.name}</p>
                            </div>
                            <div className="text-sm text-slate-500 hidden md:flex items-center gap-2">
                                <Clock size={16} />
                                {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                        {/* ... KPI Cards etc from original file ... */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                             <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <DollarSign size={64} className="text-emerald-500" />
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                        <DollarSign size={20} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.revenue || 'Total Revenue'}</span>
                                </div>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                                    {totalRevenue.toLocaleString()} {state.settings.currency}
                                </h3>
                                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                    <TrendingUp size={12} /> +12.5% {t.fromLastMonth || 'from last month'}
                                </div>
                             </div>
                             <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <ShoppingCart size={64} className="text-blue-500" />
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                        <ShoppingCart size={20} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.ordersForToday || 'Orders Today'}</span>
                                </div>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                                    {newOrdersToday}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {state.orders.length} {t.totalOrdersSmall || 'total orders'}
                                </p>
                             </div>
                             <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Package size={64} className="text-amber-500" />
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                                        <Package size={20} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.pendingWarehouse || 'Pending Dispatch'}</span>
                                </div>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                                    {pendingDispatchCount}
                                </h3>
                                <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                                    <AlertTriangle size={12} /> {t.needsAttention || 'Needs attention'}
                                </div>
                             </div>
                             <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <PackageCheck size={64} className="text-indigo-500" />
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                        <Activity size={20} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.compliance || 'Delivery Rate'}</span>
                                </div>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                                    {deliverySuccessRate}%
                                </h3>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2">
                                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${deliverySuccessRate}%` }}></div>
                                </div>
                             </div>
                        </div>
                        {/* Middle Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">{t.weeklySales || 'Weekly Sales'}</h3>
                                    <button className="text-xs text-primary-600 font-medium hover:underline">{t.viewReport || 'View Report'}</button>
                                </div>
                                <div className="h-64 flex items-end justify-between gap-2">
                                    {[65, 40, 75, 55, 80, 95, 60].map((h, i) => (
                                        <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative h-full flex items-end overflow-hidden">
                                                <div 
                                                    className="w-full bg-primary-500 hover:bg-primary-600 transition-all duration-500 rounded-t-lg relative group-hover:shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                                    style={{ height: `${h}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">{t.recentActivity || 'Recent Activity'}</h3>
                                <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[300px]">
                                    {state.orders.slice(0, 5).map(order => (
                                        <div key={order.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                            <div className={`mt-1 p-1.5 rounded-full ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {order.status === 'delivered' ? <CheckCircle size={14} /> : <Truck size={14} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">Order #{order.id}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {state.customers.find(c => c.id === order.customerId)?.name} • {order.totalAmount} {state.settings.currency}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-1">{order.orderDate}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => handleNavClick('orders-list')} className="w-full mt-4 py-2 text-sm text-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700">
                                    {t.viewOrders || 'View All Orders'}
                                </button>
                            </div>
                        </div>
                        {/* Bottom Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-indigo-100 text-sm font-medium mb-1">{t.activeRoles || 'Active Roles'}</p>
                                    <h3 className="text-4xl font-bold">{state.roles.length}</h3>
                                    <p className="text-xs text-indigo-200 mt-2">{(t.managingPermissions || 'Managing {0} permissions').replace('{0}', state.permissions.length.toString())}</p>
                                </div>
                                <Shield className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-white opacity-10 rotate-12" />
                             </div>
                             <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-emerald-100 text-sm font-medium mb-1">{t.activeFleet || 'Active Fleet'}</p>
                                    <h3 className="text-4xl font-bold">{activeDriversCount}</h3>
                                    <p className="text-xs text-emerald-200 mt-2">{state.vehicles.length} {t.vehiclesTotal || 'vehicles total'}</p>
                                </div>
                                <Truck className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-white opacity-10 rotate-12" />
                             </div>
                             <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-slate-300 text-sm font-medium mb-1">{t.lowStockAlerts || 'Low Stock Alerts'}</p>
                                    <h3 className="text-4xl font-bold">{state.products.filter(p => p.status === 'inactive').length}</h3>
                                    <p className="text-xs text-slate-400 mt-2">{t.productsInactive || 'Products marked inactive'}</p>
                                </div>
                                <AlertTriangle className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-white opacity-10 rotate-12" />
                             </div>
                        </div>
                     </div>
                )}

                {/* ... other page types ... */}
                {activePage === 'live-map' && hasPermission('locations.view') && (
                    <LiveTrackingMap 
                        lang={state.language}
                        stores={state.stores}
                        liveLocations={state.liveLocations}
                        orders={state.orders}
                        visits={state.visits}
                    />
                )}

                {activePage === 'notifications-user' && (
                    <UserNotifications 
                        notifications={myNotifications}
                        lang={state.language}
                        onMarkAsRead={markNotificationAsRead}
                    />
                )}

                {activePage === 'driver-acceptance' && hasPermission('driver.accept') && (
                    <DriverPanel 
                        lang={state.language}
                        transfers={state.stockTransfers}
                        orders={state.orders}
                        vehicles={state.vehicles}
                        warehouses={state.warehouses}
                        customers={state.customers}
                        products={state.products}
                        currentUserId={state.currentUser.id}
                        onAcceptTransfer={acceptTransfer}
                        onUpdateOrder={updateOrder}
                    />
                )}

                {/* Report Pages */}
                {activePage.startsWith('report-') && hasPermission('reports.view') && (
                    <ReportsPanel 
                        view={activePage.replace('report-', '') as ReportType}
                        lang={state.language}
                        transfers={state.stockTransfers}
                        orders={state.orders}
                        vehicles={state.vehicles}
                        drivers={state.drivers}
                        warehouses={state.warehouses}
                        products={state.products}
                        visits={state.visits}
                        stores={state.stores}
                        merchandisers={state.merchandisers}
                        routePlans={state.routePlans}
                        salesManagers={state.salesManagers}
                        customers={state.customers}
                    />
                )}

                {/* ... rest of the components ... */}
                {activePage === 'route-planning' && hasPermission('routes.edit') && (
                    <RoutePlanningPanel
                        lang={state.language}
                        salesManagers={state.salesManagers}
                        stores={state.stores}
                        routePlans={state.routePlans}
                        onSaveRoutePlan={saveRoutePlan}
                    />
                )}

                {activePage === 'sales-manager-route' && (hasPermission('routes.view') || hasPermission('visits.view')) && (
                    <SalesManagerPanel
                        lang={state.language}
                        user={state.currentUser}
                        salesManagers={state.salesManagers}
                        stores={state.stores}
                        routePlans={state.routePlans}
                        visits={state.visits}
                        onSaveVisit={handleSaveVisit}
                    />
                )}

                {activePage === 'orders-list' && hasPermission('orders.view') && (
                    <OrderManagementPanel 
                        lang={state.language}
                        orders={state.orders}
                        customers={state.customers}
                        products={state.products}
                        settings={state.settings}
                    />
                )}

                {activePage === 'orders-dispatch' && hasPermission('orders.manage') && (
                    <OrderDispatchPanel 
                        lang={state.language}
                        orders={state.orders}
                        vehicles={state.vehicles}
                        products={state.products}
                        stockTransfers={state.stockTransfers}
                        onAssignOrder={assignOrder}
                        onCreateTransfer={addTransfer}
                    />
                )}

                {(activePage === 'users' || activePage === 'roles' || activePage === 'permissions' || 
                  activePage === 'customers' || activePage === 'warehouses' || activePage === 'stores' || 
                  activePage === 'vehicles' || activePage === 'drivers' || activePage === 'merchandisers' || 
                  activePage === 'salesManagers' ||
                  activePage === 'transfers' || activePage === 'brands' || activePage === 'categories' || 
                  activePage === 'products' || activePage === 'notifications-admin') && showAdminMenu && (
                    <AdminPanel 
                        view={activePage}
                        lang={state.language}
                        users={state.users}
                        roles={state.roles}
                        permissions={state.permissions}
                        customers={state.customers}
                        warehouses={state.warehouses}
                        stores={state.stores}
                        vehicles={state.vehicles}
                        drivers={state.drivers}
                        merchandisers={state.merchandisers}
                        salesManagers={state.salesManagers}
                        stockTransfers={state.stockTransfers}
                        brands={state.brands}
                        categories={state.categories}
                        products={state.products}
                        orders={state.orders}
                        notifications={state.notifications}
                        onAddUser={addUser} onEditUser={editUser} onDeleteUser={deleteUser}
                        onAddRole={addRole} onEditRole={editRole} onDeleteRole={deleteRole}
                        onAddPermission={addPermission} onEditPermission={editPermission} onDeletePermission={deletePermission}
                        onAddCustomer={addCustomer} onEditCustomer={editCustomer} onDeleteCustomer={deleteCustomer}
                        onAddWarehouse={addWarehouse} onEditWarehouse={editWarehouse} onDeleteWarehouse={deleteWarehouse}
                        onAddStore={addStore} onEditStore={editStore} onDeleteStore={deleteStore}
                        onAddVehicle={addVehicle} onEditVehicle={editVehicle} onDeleteVehicle={deleteVehicle}
                        onAddDriver={addDriver} onEditDriver={editDriver} onDeleteDriver={deleteDriver}
                        onAddMerchandiser={addMerchandiser} onEditMerchandiser={editMerchandiser} onDeleteMerchandiser={deleteMerchandiser}
                        onAddSalesManager={addSalesManager} onEditSalesManager={editSalesManager} onDeleteSalesManager={deleteSalesManager}
                        onAddTransfer={addTransfer} onEditTransfer={editTransfer} onDeleteTransfer={deleteTransfer}
                        onAddBrand={addBrand} onEditBrand={editBrand} onDeleteBrand={deleteBrand}
                        onAddCategory={addCategory} onEditCategory={editCategory} onDeleteCategory={deleteCategory}
                        onAddProduct={addProduct} onEditProduct={editProduct} onDeleteProduct={deleteProduct}
                        onSendNotification={sendNotification}
                    />
                )}

                {activePage === 'settings' && (
                    <SettingsPanel
                      lang={state.language}
                      settings={state.settings}
                      onSave={saveSettings}
                    />
                )}
             </div>
        </div>

        <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title={t.changePassword || 'Change Password'}>
            <form onSubmit={handlePasswordChange} className="space-y-4">
                <Input label={t.newPassword || 'New Password'} type="password" required placeholder="••••••••" />
                <Input label={t.confirmPassword || 'Confirm Password'} type="password" required placeholder="••••••••" />
                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="ghost" onClick={() => setIsPasswordModalOpen(false)}>{t.cancel || 'Cancel'}</Button>
                    <Button type="submit">{t.save || 'Save'}</Button>
                </div>
            </form>
        </Modal>
      </main>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
