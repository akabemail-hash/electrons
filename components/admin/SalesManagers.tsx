
import React, { useState } from 'react';
import { Briefcase, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { SalesManager, LanguageCode } from '../../types';
import { TRANSLATIONS } from '../../languages';
import { Card, Button, Input, Modal, Pagination, Badge } from '../ui';

interface SalesManagersProps {
  lang: LanguageCode;
  salesManagers: SalesManager[];
  onAdd: (sm: Omit<SalesManager, 'id'>) => void;
  onEdit: (sm: SalesManager) => void;
  onDelete: (id: string) => void;
}

export const SalesManagers: React.FC<SalesManagersProps> = ({ lang, salesManagers, onAdd, onEdit, onDelete }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SalesManager | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', region: '', status: 'active' as 'active' | 'inactive' });

  const openAdd = () => {
    setEditingItem(null);
    setForm({ name: '', email: '', phone: '', region: '', status: 'active' });
    setIsModalOpen(true);
  };

  const openEdit = (item: SalesManager) => {
    setEditingItem(item);
    setForm({ name: item.name, email: item.email, phone: item.phone, region: item.region, status: item.status });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) onEdit({ ...editingItem, ...form });
    else onAdd(form);
    setIsModalOpen(false);
  };

  const filteredItems = salesManagers.filter(sm => sm.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Briefcase className="text-primary-500" />
            {t.salesManagers}
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
            <Button onClick={openAdd} className="whitespace-nowrap"><Plus size={18} /> {t.addSalesManager || "Add Sales Manager"}</Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">{t.name}</th>
                <th className="py-4 px-6 font-semibold">Email</th>
                <th className="py-4 px-6 font-semibold">Phone</th>
                <th className="py-4 px-6 font-semibold">Region</th>
                <th className="py-4 px-6 font-semibold">{t.status}</th>
                <th className="py-4 px-6 font-semibold text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">{item.name}</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{item.email}</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{item.phone}</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{item.region}</td>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Sales Manager' : 'Add Sales Manager'}>
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input label={t.name} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            <Input label="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
            <Input label="Region" value={form.region} onChange={e => setForm({...form, region: e.target.value})} />
            
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
