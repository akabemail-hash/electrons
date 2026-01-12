import React, { useState } from 'react';
import { ShoppingCart, Search, Filter } from 'lucide-react';
import { Order, Customer, Product, LanguageCode, SystemSettings } from '../types';
import { TRANSLATIONS } from '../constants';
import { Card, Badge, Pagination } from './ui';

interface OrderManagementPanelProps {
  lang: LanguageCode;
  orders: Order[];
  customers: Customer[];
  products: Product[];
  settings: SystemSettings;
}

export const OrderManagementPanel: React.FC<OrderManagementPanelProps> = ({
  lang, orders, customers, products, settings
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredOrders = orders.filter(order => {
    const customer = customers.find(c => c.id === order.customerId);
    const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'pending_warehouse': return <Badge type="warning">{t.pendingWarehouse}</Badge>;
          case 'assigned_to_driver': return <Badge type="info">{t.assignedToDriver}</Badge>;
          case 'out_for_delivery': return <Badge type="info">{t.outForDelivery}</Badge>;
          case 'delivered': return <Badge type="success">{t.delivered}</Badge>;
          case 'failed': return <Badge type="danger">{t.failed}</Badge>;
          default: return <Badge type="neutral">{status}</Badge>;
      }
  };

  const getPaymentLabel = (type: string) => {
      return t[type] || type;
  }

  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ShoppingCart className="text-primary-500" />
            {t.orders}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t.ordersDesc}</p>
        </div>
      </div>

      <Card className="mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                      type="text" 
                      placeholder={t.search}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                  />
              </div>
              <select 
                  className="px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg text-sm outline-none text-slate-900 dark:text-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
              >
                  <option value="all">All Statuses</option>
                  <option value="pending_warehouse">{t.pendingWarehouse}</option>
                  <option value="assigned_to_driver">{t.assignedToDriver}</option>
                  <option value="delivered">{t.delivered}</option>
                  <option value="failed">{t.failed}</option>
              </select>
          </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">{t.orderId}</th>
                <th className="py-4 px-6 font-semibold">{t.customer}</th>
                <th className="py-4 px-6 font-semibold">{t.items}</th>
                <th className="py-4 px-6 font-semibold">{t.totalAmount}</th>
                <th className="py-4 px-6 font-semibold">{t.paymentType}</th>
                <th className="py-4 px-6 font-semibold">{t.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedOrders.map(order => {
                    const customer = customers.find(c => c.id === order.customerId);
                    return (
                        <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-4 px-6 text-sm font-mono text-slate-600 dark:text-slate-400">{order.id}</td>
                            <td className="py-4 px-6">
                                <div className="text-sm font-medium text-slate-900 dark:text-white">{customer?.name || 'Unknown'}</div>
                                <div className="text-xs text-slate-500">{customer?.city}</div>
                            </td>
                            <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                                {order.items.length} items
                            </td>
                            <td className="py-4 px-6 text-sm font-medium text-slate-900 dark:text-white">
                                {order.totalAmount} {settings.currency}
                            </td>
                            <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                                {getPaymentLabel(order.paymentType)}
                            </td>
                            <td className="py-4 px-6">
                                {getStatusBadge(order.status)}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={Math.ceil(filteredOrders.length / itemsPerPage)} onPageChange={setCurrentPage} totalItems={filteredOrders.length} itemsPerPage={itemsPerPage} />
      </Card>
    </div>
  );
};