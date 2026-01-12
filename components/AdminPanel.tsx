
import React, { useState, useEffect } from 'react';
import { Users, Shield, Plus, Edit2, Trash2, Key, Bell, Search } from 'lucide-react';
import { User, Role, Permission, Customer, Warehouse as WarehouseType, Store, Vehicle, Driver, StockTransfer, Brand, Category, Product, LanguageCode, Merchandiser, Notification, SalesManager } from '../types';
import { TRANSLATIONS } from '../languages';
import { Card, Button, Input, Modal, Badge, Pagination, SearchableSelect } from './ui';
import { useToast } from './Toast';

// Sub-Components
import { Products } from './admin/Products';
import { Brands } from './admin/Brands';
import { Categories } from './admin/Categories';
import { Transfers } from './admin/Transfers';
import { Customers } from './admin/Customers';
import { Warehouses } from './admin/Warehouses';
import { Stores } from './admin/Stores';
import { Vehicles } from './admin/Vehicles';
import { Drivers } from './admin/Drivers';
import { Merchandisers } from './admin/Merchandisers';
import { SalesManagers } from './admin/SalesManagers';

interface AdminPanelProps {
  view: 'users' | 'roles' | 'permissions' | 'customers' | 'warehouses' | 'stores' | 'vehicles' | 'drivers' | 'merchandisers' | 'salesManagers' | 'transfers' | 'brands' | 'categories' | 'products' | 'notifications-admin';
  lang: LanguageCode;
  users: User[];
  roles: Role[];
  permissions: Permission[];
  customers: Customer[];
  warehouses: WarehouseType[];
  stores: Store[];
  vehicles: Vehicle[];
  drivers: Driver[];
  merchandisers: Merchandiser[];
  salesManagers?: SalesManager[];
  stockTransfers: StockTransfer[];
  brands: Brand[];
  categories: Category[];
  products: Product[];
  orders: any[];
  notifications?: Notification[];
  onAddUser: (u: Omit<User, 'id'>) => void;
  onEditUser: (u: User) => void;
  onDeleteUser: (id: string) => void;
  onAddRole: (r: Omit<Role, 'id'>) => void;
  onEditRole: (r: Role) => void;
  onDeleteRole: (id: string) => void;
  onAddPermission: (p: Omit<Permission, 'id'> & { id: string }) => void;
  onEditPermission: (p: Permission) => void;
  onDeletePermission: (id: string) => void;
  onAddCustomer: (c: Omit<Customer, 'id'>) => void;
  onEditCustomer: (c: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onAddWarehouse: (w: Omit<WarehouseType, 'id'>) => void;
  onEditWarehouse: (w: WarehouseType) => void;
  onDeleteWarehouse: (id: string) => void;
  onAddStore: (s: Omit<Store, 'id'>) => void;
  onEditStore: (s: Store) => void;
  onDeleteStore: (id: string) => void;
  onAddVehicle: (v: Omit<Vehicle, 'id'>) => void;
  onEditVehicle: (v: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
  onAddDriver: (d: Omit<Driver, 'id'>) => void;
  onEditDriver: (d: Driver) => void;
  onDeleteDriver: (id: string) => void;
  onAddMerchandiser: (m: Omit<Merchandiser, 'id'>) => void;
  onEditMerchandiser: (m: Merchandiser) => void;
  onDeleteMerchandiser: (id: string) => void;
  onAddSalesManager?: (sm: Omit<SalesManager, 'id'>) => void;
  onEditSalesManager?: (sm: SalesManager) => void;
  onDeleteSalesManager?: (id: string) => void;
  onAddTransfer: (t: Omit<StockTransfer, 'id'>) => void;
  onEditTransfer: (t: StockTransfer) => void;
  onDeleteTransfer: (id: string) => void;
  onAddBrand: (b: Omit<Brand, 'id'>) => void;
  onEditBrand: (b: Brand) => void;
  onDeleteBrand: (id: string) => void;
  onAddCategory: (c: Omit<Category, 'id'>) => void;
  onEditCategory: (c: Category) => void;
  onDeleteCategory: (id: string) => void;
  onAddProduct: (p: Omit<Product, 'id'>) => void;
  onEditProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onSendNotification?: (n: Omit<Notification, 'id' | 'createdAt' | 'readBy'>) => void;
}

const SearchInput = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder: string }) => (
    <div className="relative w-full md:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
            type="text" 
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all"
        />
    </div>
);

export const AdminPanel: React.FC<AdminPanelProps> = ({
  view, lang, users, roles, permissions, customers, warehouses, stores, vehicles, drivers, merchandisers, salesManagers = [], stockTransfers, brands, categories, products, orders, notifications = [],
  onAddUser, onEditUser, onDeleteUser,
  onAddRole, onEditRole, onDeleteRole,
  onAddPermission, onEditPermission, onDeletePermission,
  onAddCustomer, onEditCustomer, onDeleteCustomer,
  onAddWarehouse, onEditWarehouse, onDeleteWarehouse,
  onAddStore, onEditStore, onDeleteStore,
  onAddVehicle, onEditVehicle, onDeleteVehicle,
  onAddDriver, onEditDriver, onDeleteDriver,
  onAddMerchandiser, onEditMerchandiser, onDeleteMerchandiser,
  onAddSalesManager, onEditSalesManager, onDeleteSalesManager,
  onAddTransfer, onEditTransfer, onDeleteTransfer,
  onAddBrand, onEditBrand, onDeleteBrand,
  onAddCategory, onEditCategory, onDeleteCategory,
  onAddProduct, onEditProduct, onDeleteProduct,
  onSendNotification
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  const { addToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
      setCurrentPage(1);
      setSearchTerm('');
  }, [view]);

  const paginate = <T,>(data: T[]) => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return data.slice(startIndex, startIndex + itemsPerPage);
  };
  
  // -- Core Admin Modals (Users, Roles, Permissions, Notifications) --
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<{name: string, email: string, password?: string, roleId: string, userType: 'standard' | 'merchandiser' | 'driver' | 'sales_manager', linkedEntityId: string, status: 'active' | 'inactive'}>({ name: '', email: '', password: '', roleId: '', userType: 'standard', linkedEntityId: '', status: 'active' });

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({ name: '', permissions: [] as string[] });

  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null);
  const [permForm, setPermForm] = useState({ id: '', name: '', description: '' });

  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationForm, setNotificationForm] = useState<{
      title: string;
      message: string;
      targetType: 'all' | 'role' | 'user' | 'driver' | 'merchandiser';
      targetId: string;
  }>({ title: '', message: '', targetType: 'all', targetId: '' });


  // -- Handlers for Core Admin Items --
  const openAddUser = () => {
    setEditingUser(null);
    setUserForm({ name: '', email: '', password: '', roleId: roles[0]?.id || '', userType: 'standard', linkedEntityId: '', status: 'active' });
    setIsUserModalOpen(true);
  };
  const openEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, password: '', roleId: user.roleId, userType: user.userType || 'standard', linkedEntityId: user.linkedEntityId || '', status: user.status });
    setIsUserModalOpen(true);
  };
  const submitUser = (e: React.FormEvent) => {
    e.preventDefault();
    const userData: any = { ...userForm };
    if (editingUser) {
        if (!userData.password) delete userData.password;
        onEditUser({ ...editingUser, ...userData });
    } else {
        if (!userData.password) userData.password = '123456'; 
        onAddUser({ ...userData, avatar: `https://ui-avatars.com/api/?name=${userData.name}` });
    }
    setIsUserModalOpen(false);
  };

  const openAddRole = () => {
    setEditingRole(null);
    setRoleForm({ name: '', permissions: [] });
    setIsRoleModalOpen(true);
  };
  const openEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({ name: role.name, permissions: role.permissions });
    setIsRoleModalOpen(true);
  };
  const togglePermission = (permId: string) => {
    setRoleForm(prev => {
      const hasPerm = prev.permissions.includes(permId);
      return { ...prev, permissions: hasPerm ? prev.permissions.filter(p => p !== permId) : [...prev.permissions, permId] };
    });
  };
  const submitRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRole) onEditRole({ ...editingRole, ...roleForm });
    else onAddRole(roleForm);
    setIsRoleModalOpen(false);
  };

  const openAddPerm = () => {
    setEditingPerm(null);
    setPermForm({ id: '', name: '', description: '' });
    setIsPermModalOpen(true);
  };
  const openEditPerm = (perm: Permission) => {
    setEditingPerm(perm);
    setPermForm({ id: perm.id, name: perm.name, description: perm.description });
    setIsPermModalOpen(true);
  };
  const submitPerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPerm) onEditPermission({ ...permForm });
    else onAddPermission({ ...permForm });
    setIsPermModalOpen(false);
  };

  const openAddNotification = () => {
      setNotificationForm({ title: '', message: '', targetType: 'all', targetId: '' });
      setIsNotificationModalOpen(true);
  };
  const submitNotification = (e: React.FormEvent) => {
      e.preventDefault();
      if (onSendNotification) { onSendNotification(notificationForm); }
      setIsNotificationModalOpen(false);
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
      const [resource, action] = perm.id.includes('.') ? perm.id.split('.') : ['other', perm.id];
      if (!acc[resource]) acc[resource] = [];
      acc[resource].push({ ...perm, action });
      return acc;
  }, {} as Record<string, (Permission & { action: string })[]>);

  // Options for Selects
  const salesManagerOptions = (salesManagers || []).map(sm => ({ value: sm.id, label: sm.name }));
  const merchandiserOptions = merchandisers.map(m => ({ value: m.id, label: m.name }));
  const driverOptions = drivers.map(d => ({ value: d.id, label: d.name }));

  const renderUsers = () => {
    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="text-primary-500" />
            {t.users}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t.usersDesc}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder={t.search} />
            <Button onClick={openAddUser} className="whitespace-nowrap"><Plus size={18} /> {t.addUser}</Button>
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">{t.name}</th>
                <th className="py-4 px-6 font-semibold">{t.role}</th>
                <th className="py-4 px-6 font-semibold">{t.userType}</th>
                <th className="py-4 px-6 font-semibold">{t.status}</th>
                <th className="py-4 px-6 font-semibold text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginate(filteredUsers).map(user => {
                const roleName = roles.find(r => r.id === user.roleId)?.name || 'Unknown';
                let userTypeLabel = t.standardUser;
                if (user.userType === 'merchandiser') userTypeLabel = t.merchandiser;
                if (user.userType === 'driver') userTypeLabel = t.driver;
                if (user.userType === 'sales_manager') userTypeLabel = t.salesManager;
                return (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 object-cover" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6"><Badge type="neutral">{roleName}</Badge></td>
                    <td className="py-4 px-6"><span className="text-sm font-medium text-slate-700 dark:text-slate-300">{userTypeLabel}</span></td>
                    <td className="py-4 px-6"><Badge type={user.status === 'active' ? 'success' : 'warning'}>{user.status === 'active' ? t.active : t.inactive}</Badge></td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button onClick={() => openEditUser(user)} className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"><Edit2 size={16} /></button>
                      <button onClick={() => onDeleteUser(user.id)} className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={Math.ceil(filteredUsers.length / itemsPerPage)} onPageChange={setCurrentPage} totalItems={filteredUsers.length} itemsPerPage={itemsPerPage} />
      </Card>
    </div>
  );
  };

  const renderRoles = () => {
    const filteredRoles = roles.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Shield className="text-primary-500" />
            {t.roles}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t.rolesDesc}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder={t.search} />
            <Button onClick={openAddRole} className="whitespace-nowrap"><Plus size={18} /> {t.addRole}</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginate(filteredRoles).map(role => (
          <Card key={role.id} className="p-5 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400">
                <Shield size={24} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditRole(role)} className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 p-1"><Edit2 size={16} /></button>
                {onDeleteRole && <button onClick={() => onDeleteRole(role.id)} className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1"><Trash2 size={16} /></button>}
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{role.name}</h3>
            <div className="flex-1">
               <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{role.permissions.length} permissions</p>
               <div className="flex flex-wrap gap-1">
                   {role.permissions.slice(0, 5).map(pId => (
                       <span key={pId} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">{permissions.find(p => p.id === pId)?.name || pId}</span>
                   ))}
                   {role.permissions.length > 5 && <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">+{role.permissions.length - 5}</span>}
               </div>
            </div>
          </Card>
        ))}
      </div>
      <Pagination currentPage={currentPage} totalPages={Math.ceil(filteredRoles.length / itemsPerPage)} onPageChange={setCurrentPage} totalItems={filteredRoles.length} itemsPerPage={itemsPerPage} />
    </div>
  );
  };

  const renderPermissions = () => {
    const filteredPerms = permissions.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Key className="text-primary-500" />
            {t.permissions}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t.permissionsDesc}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder={t.search} />
            <Button onClick={openAddPerm} className="whitespace-nowrap"><Plus size={18} /> {t.addPermission}</Button>
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">ID</th>
                <th className="py-4 px-6 font-semibold">{t.name}</th>
                <th className="py-4 px-6 font-semibold">{t.description}</th>
                <th className="py-4 px-6 font-semibold text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginate(filteredPerms).map(perm => (
                <tr key={perm.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs text-slate-500">{perm.id}</td>
                  <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">{perm.name}</td>
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">{perm.description}</td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button onClick={() => openEditPerm(perm)} className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"><Edit2 size={16} /></button>
                    {onDeletePermission && <button onClick={() => onDeletePermission(perm.id)} className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={16} /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={Math.ceil(filteredPerms.length / itemsPerPage)} onPageChange={setCurrentPage} totalItems={filteredPerms.length} itemsPerPage={itemsPerPage} />
      </Card>
    </div>
  );
  };

  const renderNotificationsAdmin = () => {
      const filteredNotifications = (notifications || []).filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return (
      <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><Bell className="text-primary-500" /> {t.notifications}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t.notificationsDesc}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder={t.search} />
            <Button onClick={openAddNotification} className="whitespace-nowrap"><Plus size={18} /> {t.sendNotification}</Button>
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">{t.title}</th>
                <th className="py-4 px-6 font-semibold">{t.message}</th>
                <th className="py-4 px-6 font-semibold">{t.targetType}</th>
                <th className="py-4 px-6 font-semibold">{t.readCount}</th>
                <th className="py-4 px-6 font-semibold">{t.date}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginate(filteredNotifications).map(n => (
                <tr key={n.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">{n.title}</td>
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">{n.message}</td>
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400 capitalize">{n.targetType}</td>
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">{n.readBy.length}</td>
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">{n.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={Math.ceil(filteredNotifications.length / itemsPerPage)} onPageChange={setCurrentPage} totalItems={filteredNotifications.length} itemsPerPage={itemsPerPage} />
      </Card>
    </div>
  );
  };

  // Delegate rendering to dedicated sub-components
  const renderDelegate = () => {
      switch (view) {
          case 'customers':
              return <Customers lang={lang} customers={customers} onAdd={onAddCustomer} onEdit={onEditCustomer} onDelete={onDeleteCustomer} />;
          case 'warehouses':
              return <Warehouses lang={lang} warehouses={warehouses} onAdd={onAddWarehouse} onEdit={onEditWarehouse} onDelete={onDeleteWarehouse} />;
          case 'stores':
              return <Stores lang={lang} stores={stores} warehouses={warehouses} onAdd={onAddStore} onEdit={onEditStore} onDelete={onDeleteStore} />;
          case 'vehicles':
              return <Vehicles lang={lang} vehicles={vehicles} warehouses={warehouses} onAdd={onAddVehicle} onEdit={onEditVehicle} onDelete={onDeleteVehicle} />;
          case 'drivers':
              return <Drivers lang={lang} drivers={drivers} vehicles={vehicles} onAdd={onAddDriver} onEdit={onEditDriver} onDelete={onDeleteDriver} />;
          case 'merchandisers':
              return <Merchandisers lang={lang} merchandisers={merchandisers} salesManagers={salesManagers} onAdd={onAddMerchandiser} onEdit={onEditMerchandiser} onDelete={onDeleteMerchandiser} />;
          case 'salesManagers':
              if (onAddSalesManager && onEditSalesManager && onDeleteSalesManager) {
                  return <SalesManagers lang={lang} salesManagers={salesManagers} onAdd={onAddSalesManager} onEdit={onEditSalesManager} onDelete={onDeleteSalesManager} />;
              }
              return null;
          case 'products':
              return <Products lang={lang} products={products} brands={brands} categories={categories} transfers={stockTransfers} orders={orders} warehouses={warehouses} vehicles={vehicles} onAdd={onAddProduct} onEdit={onEditProduct} onDelete={onDeleteProduct} />;
          case 'brands':
              return <Brands lang={lang} brands={brands} onAdd={onAddBrand} onEdit={onEditBrand} onDelete={onDeleteBrand} />;
          case 'categories':
              return <Categories lang={lang} categories={categories} onAdd={onAddCategory} onEdit={onEditCategory} onDelete={onDeleteCategory} />;
          case 'transfers':
              return <Transfers lang={lang} transfers={stockTransfers} warehouses={warehouses} vehicles={vehicles} products={products} onAdd={onAddTransfer} onEdit={onEditTransfer} onDelete={onDeleteTransfer} />;
          default:
              return null;
      }
  }

  return (
    <>
      {view === 'users' && renderUsers()}
      {view === 'roles' && renderRoles()}
      {view === 'permissions' && renderPermissions()}
      {view === 'notifications-admin' && renderNotificationsAdmin()}
      
      {/* Render delegated views */}
      {renderDelegate()}

      {/* User Modal */}
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title={editingUser ? t.editUser : t.addUser}>
        <form onSubmit={submitUser} className="space-y-4">
            <Input label={t.name} value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} required />
            <Input label={t.email} type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} required />
            
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t.userPassword || 'Password'} {editingUser && <span className="text-xs text-slate-500 font-normal">(Leave blank to keep current)</span>}
                </label>
                <input 
                    type="password" 
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-400"
                    value={userForm.password}
                    onChange={e => setUserForm({...userForm, password: e.target.value})}
                    placeholder={editingUser ? "••••••••" : "Required"}
                    required={!editingUser} 
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.role}</label>
                <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-primary-500" value={userForm.roleId} onChange={e => setUserForm({...userForm, roleId: e.target.value})}>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
            </div>
            <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.userType}</label>
                 <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-primary-500" value={userForm.userType} onChange={e => setUserForm({...userForm, userType: e.target.value as any, linkedEntityId: ''})}>
                    <option value="standard">{t.standardUser}</option>
                    <option value="merchandiser">{t.merchandiser}</option>
                    <option value="sales_manager">{t.salesManager}</option>
                    <option value="driver">{t.driver}</option>
                </select>
            </div>
            
            {userForm.userType === 'sales_manager' && (
                <SearchableSelect 
                    label={t.linkedEntity}
                    options={[{ value: '', label: t.noLink }, ...salesManagerOptions]}
                    value={userForm.linkedEntityId}
                    onChange={(val) => setUserForm({...userForm, linkedEntityId: val})}
                />
            )}
            {userForm.userType === 'merchandiser' && (
                <SearchableSelect 
                    label={t.linkedEntity}
                    options={[{ value: '', label: t.noLink }, ...merchandiserOptions]}
                    value={userForm.linkedEntityId}
                    onChange={(val) => setUserForm({...userForm, linkedEntityId: val})}
                />
            )}
            {userForm.userType === 'driver' && (
                <SearchableSelect 
                    label={t.linkedEntity}
                    options={[{ value: '', label: t.noLink }, ...driverOptions]}
                    value={userForm.linkedEntityId}
                    onChange={(val) => setUserForm({...userForm, linkedEntityId: val})}
                />
            )}

            <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.status}</label>
                 <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-primary-500" value={userForm.status} onChange={e => setUserForm({...userForm, status: e.target.value as any})}>
                    <option value="active">{t.active}</option>
                    <option value="inactive">{t.inactive}</option>
                </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
                <Button variant="ghost" onClick={() => setIsUserModalOpen(false)}>{t.cancel}</Button>
                <Button type="submit">{t.save}</Button>
            </div>
        </form>
      </Modal>

      <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} title={editingRole ? t.editRole : t.addRole}>
        <form onSubmit={submitRole} className="space-y-4">
            <Input label={t.name} value={roleForm.name} onChange={e => setRoleForm({...roleForm, name: e.target.value})} required />
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.permissions}</label>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                    {Object.entries(groupedPermissions).map(([resource, perms]) => (
                        <div key={resource} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                            <h4 className="font-semibold text-sm capitalize mb-2 text-slate-800 dark:text-slate-200">{resource}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {perms.map(p => (
                                    <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1 rounded">
                                        <input 
                                            type="checkbox" 
                                            checked={roleForm.permissions.includes(p.id)}
                                            onChange={() => togglePermission(p.id)}
                                            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="text-slate-600 dark:text-slate-400" title={p.description}>{p.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
                <Button variant="ghost" onClick={() => setIsRoleModalOpen(false)}>{t.cancel}</Button>
                <Button type="submit">{t.save}</Button>
            </div>
        </form>
      </Modal>

      {/* Permissions Modal */}
      <Modal isOpen={isPermModalOpen} onClose={() => setIsPermModalOpen(false)} title={editingPerm ? 'Edit Permission' : t.addPermission}>
        <form onSubmit={submitPerm} className="space-y-4">
            <Input label="ID" value={permForm.id} onChange={e => setPermForm({...permForm, id: e.target.value})} disabled={!!editingPerm} required />
            <Input label={t.name} value={permForm.name} onChange={e => setPermForm({...permForm, name: e.target.value})} required />
            <Input label={t.description} value={permForm.description} onChange={e => setPermForm({...permForm, description: e.target.value})} required />
            <div className="flex justify-end gap-2 mt-6">
                <Button variant="ghost" onClick={() => setIsPermModalOpen(false)}>{t.cancel}</Button>
                <Button type="submit">{t.save}</Button>
            </div>
        </form>
      </Modal>

      {/* Notification Modal */}
      <Modal isOpen={isNotificationModalOpen} onClose={() => setIsNotificationModalOpen(false)} title={t.sendNotification}>
        <form onSubmit={submitNotification} className="space-y-4">
            <Input label={t.title} value={notificationForm.title} onChange={e => setNotificationForm({...notificationForm, title: e.target.value})} required />
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.message}</label>
                <textarea 
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg outline-none"
                    rows={3}
                    value={notificationForm.message}
                    onChange={e => setNotificationForm({...notificationForm, message: e.target.value})}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.targetType}</label>
                <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg outline-none" value={notificationForm.targetType} onChange={e => setNotificationForm({...notificationForm, targetType: e.target.value as any})}>
                    <option value="all">All Users</option>
                    <option value="driver">Drivers</option>
                    <option value="merchandiser">Merchandisers</option>
                    <option value="role">Specific Role</option>
                    <option value="user">Specific User</option>
                </select>
            </div>
            {notificationForm.targetType === 'role' && (
                <SearchableSelect 
                    label="Select Role"
                    options={roles.map(r => ({ value: r.id, label: r.name }))}
                    value={notificationForm.targetId}
                    onChange={(val) => setNotificationForm({...notificationForm, targetId: val})}
                />
            )}
            {notificationForm.targetType === 'user' && (
                <SearchableSelect 
                    label="Select User"
                    options={users.map(u => ({ value: u.id, label: u.name }))}
                    value={notificationForm.targetId}
                    onChange={(val) => setNotificationForm({...notificationForm, targetId: val})}
                />
            )}
            <div className="flex justify-end gap-2 mt-6">
                <Button variant="ghost" onClick={() => setIsNotificationModalOpen(false)}>{t.cancel}</Button>
                <Button type="submit">{t.sendNotification}</Button>
            </div>
        </form>
      </Modal>
    </>
  );
};
