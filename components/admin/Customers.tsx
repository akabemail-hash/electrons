
import React, { useState } from 'react';
import { UserCheck, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { Customer, LanguageCode } from '../../types';
import { TRANSLATIONS } from '../../languages';
import { Card, Button, Input, Modal, Pagination, Badge } from '../ui';

interface CustomersProps {
  lang: LanguageCode;
  customers: Customer[];
  onAdd: (c: Omit<Customer, 'id'>) => void;
  onEdit: (c: Customer) => void;
  onDelete: (id: string) => void;
}

export const Customers: React.FC<CustomersProps> = ({ lang, customers, onAdd, onEdit, onDelete }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', phoneDetails: '', city: '', district: '', address: '', latitude: '', longitude: '', status: 'active' as 'active' | 'inactive' });

  const openAdd = () => {
    setEditingItem(null);
    setForm({ name: '', phone: '', phoneDetails: '', city: '', district: '', address: '', latitude: '', longitude: '', status: 'active' });
    setIsModalOpen(true);
  };

  const openEdit = (item: Customer) => {
    setEditingItem(item);
    setForm({ 
        name: item.name, 
        phone: item.phone, 
        phoneDetails: item.phoneDetails, 
        city: item.city, 
        district: item.district, 
        address: item.address || '',
        latitude: item.latitude, 
        longitude: item.longitude, 
        status: item.status 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) onEdit({ ...editingItem, ...form });
    else onAdd(form);
    setIsModalOpen(false);
  };

  const filteredItems = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm));
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <UserCheck className="text-primary-500" />
            {t.customers}
          </h2>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder={t.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                />
            </div>
            <Button onClick={openAdd} className="whitespace-nowrap"><Plus size={18} /> {t.addUser}</Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">{t.name}</th>
                <th className="py-4 px-6 font-semibold">Phone</th>
                <th className="py-4 px-6 font-semibold">{t.location}</th>
                <th className="py-4 px-6 font-semibold">{t.status}</th>
                <th className="py-4 px-6 font-semibold text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">{item.name}</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{item.phone}</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{item.city}, {item.district}</td>
                  <td className="py-4 px-6"><Badge type={item.status === 'active' ? 'success' : 'warning'}>{item.status === 'active' ? t.active : t.inactive}</Badge></td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button onClick={() => openEdit(item)} className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 p-2"><Edit2 size={16} /></button>
                    <button onClick={() => onDelete(item.id)} className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-2"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={Math.ceil(filteredItems.length / itemsPerPage)} onPageChange={setCurrentPage} totalItems={filteredItems.length} itemsPerPage={itemsPerPage} />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Customer' : 'Add Customer'}>
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input label={t.name} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <Input label="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
            <div className="grid grid-cols-2 gap-4">
                <Input label="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                <Input label="District" value={form.district} onChange={e => setForm({...form, district: e.target.value})} />
            </div>
            <Input label="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
                <Input label="Latitude" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} />
                <Input label="Longitude" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} />
            </div>
            <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.status}</label>
                 <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg outline-none" value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}>
                    <option value="active">{t.active}</option>
                    <option value="inactive">{t.inactive}</option>
                </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>{t.cancel}</Button>
                <Button type="submit">{t.save}</Button>
            </div>
        </form>
      </Modal>
    </div>
  );
};
