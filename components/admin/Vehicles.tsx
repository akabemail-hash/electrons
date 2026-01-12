
import React, { useState } from 'react';
import { Truck, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { Vehicle, Warehouse, LanguageCode } from '../../types';
import { TRANSLATIONS } from '../../languages';
import { Card, Button, Input, Modal, Pagination, Badge } from '../ui';

interface VehiclesProps {
  lang: LanguageCode;
  vehicles: Vehicle[];
  warehouses: Warehouse[];
  onAdd: (v: Omit<Vehicle, 'id'>) => void;
  onEdit: (v: Vehicle) => void;
  onDelete: (id: string) => void;
}

export const Vehicles: React.FC<VehiclesProps> = ({ lang, vehicles, warehouses, onAdd, onEdit, onDelete }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({ plateNumber: '', model: '', warehouseId: '', status: 'active' as 'active' | 'inactive' });

  const openAdd = () => {
    setEditingItem(null);
    setForm({ plateNumber: '', model: '', warehouseId: warehouses[0]?.id || '', status: 'active' });
    setIsModalOpen(true);
  };

  const openEdit = (item: Vehicle) => {
    setEditingItem(item);
    setForm({ plateNumber: item.plateNumber, model: item.model, warehouseId: item.warehouseId, status: item.status });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) onEdit({ ...editingItem, ...form });
    else onAdd(form);
    setIsModalOpen(false);
  };

  const filteredItems = vehicles.filter(v => v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()));
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Truck className="text-primary-500" />
            {t.vehicles}
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
            <Button onClick={openAdd} className="whitespace-nowrap"><Plus size={18} /> {t.addVehicle || "Add Vehicle"}</Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">Plate</th>
                <th className="py-4 px-6 font-semibold">Model</th>
                <th className="py-4 px-6 font-semibold">{t.warehouses}</th>
                <th className="py-4 px-6 font-semibold">{t.status}</th>
                <th className="py-4 px-6 font-semibold text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">{item.plateNumber}</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{item.model}</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{warehouses.find(w => w.id === item.warehouseId)?.name || '-'}</td>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Vehicle' : 'Add Vehicle'}>
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Plate Number" value={form.plateNumber} onChange={e => setForm({...form, plateNumber: e.target.value})} required />
            <Input label="Model" value={form.model} onChange={e => setForm({...form, model: e.target.value})} required />
            
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.warehouses}</label>
                <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg outline-none" value={form.warehouseId} onChange={e => setForm({...form, warehouseId: e.target.value})}>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
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
