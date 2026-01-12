
import React, { useState } from 'react';
import { ArrowRightLeft, Plus, Edit2, Trash2, Search, Trash } from 'lucide-react';
import { StockTransfer, Warehouse, Vehicle, Product, LanguageCode, TransferItem } from '../../types';
import { TRANSLATIONS } from '../../languages';
import { Card, Button, Input, Modal, Pagination, Badge } from '../ui';
import { useToast } from '../Toast';

interface TransfersProps {
  lang: LanguageCode;
  transfers: StockTransfer[];
  warehouses: Warehouse[];
  vehicles: Vehicle[];
  products: Product[];
  onAdd: (t: Omit<StockTransfer, 'id'>) => void;
  onEdit: (t: StockTransfer) => void;
  onDelete: (id: string) => void;
}

export const Transfers: React.FC<TransfersProps> = ({ lang, transfers, warehouses, vehicles, products, onAdd, onEdit, onDelete }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockTransfer | null>(null);
  
  const [form, setForm] = useState<{
      sourceValue: string;
      targetValue: string;
      date: string;
      status: 'pending' | 'completed' | 'cancelled';
      items: TransferItem[];
  }>({ 
      sourceValue: '', targetValue: '', date: '', status: 'pending', items: [] 
  });

  const getLocationName = (type: 'warehouse' | 'vehicle', id: string) => {
      if (type === 'warehouse') return warehouses.find(w => w.id === id)?.name || 'Unknown';
      if (type === 'vehicle') return vehicles.find(v => v.id === id)?.plateNumber || 'Unknown';
      return 'Unknown';
  };

  const locationOptions = [
      ...warehouses.map(w => ({ value: `warehouse|${w.id}`, label: `Warehouse: ${w.name}` })),
      ...vehicles.map(v => ({ value: `vehicle|${v.id}`, label: `Vehicle: ${v.plateNumber}` }))
  ];

  const openAdd = () => {
    setEditingItem(null);
    setForm({ 
        sourceValue: locationOptions[0]?.value || '', 
        targetValue: locationOptions[1]?.value || '', 
        items: [{ productId: products[0]?.id || '', quantity: 1 }], 
        date: new Date().toISOString().split('T')[0], 
        status: 'pending' 
    });
    setIsModalOpen(true);
  };

  const openEdit = (item: StockTransfer) => {
    setEditingItem(item);
    setForm({ 
        sourceValue: `${item.sourceType}|${item.sourceId}`, 
        targetValue: `${item.targetType}|${item.targetId}`, 
        items: [...item.items],
        date: item.date, 
        status: item.status 
    });
    setIsModalOpen(true);
  };

  const handleItemChange = (index: number, field: keyof TransferItem, value: any) => {
      const newItems = [...form.items];
      newItems[index] = { ...newItems[index], [field]: value };
      setForm({ ...form, items: newItems });
  };

  const addItem = () => {
      setForm({ ...form, items: [...form.items, { productId: products[0]?.id || '', quantity: 1 }] });
  };

  const removeItem = (index: number) => {
      if (form.items.length === 1) return;
      setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.sourceValue === form.targetValue) { 
        addToast({ type: 'error', message: 'Source and Target cannot be the same.' }); 
        return; 
    }
    const [sourceType, sourceId] = form.sourceValue.split('|') as ['warehouse' | 'vehicle', string];
    const [targetType, targetId] = form.targetValue.split('|') as ['warehouse' | 'vehicle', string];
    const payload = { sourceId, sourceType, targetId, targetType, items: form.items, date: form.date, status: form.status };
    
    if (editingItem) onEdit({ ...editingItem, ...payload });
    else onAdd(payload);
    setIsModalOpen(false);
  };

  const filteredItems = transfers.filter(tr => tr.id.toLowerCase().includes(searchTerm.toLowerCase()));
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ArrowRightLeft className="text-primary-500" />
            {t.transfers}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t.transfersDesc}</p>
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
            <Button onClick={openAdd} className="whitespace-nowrap"><Plus size={18} /> {t.addTransfer}</Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">ID</th>
                <th className="py-4 px-6 font-semibold">{t.date}</th>
                <th className="py-4 px-6 font-semibold">{t.source}</th>
                <th className="py-4 px-6 font-semibold">{t.target}</th>
                <th className="py-4 px-6 font-semibold">{t.items}</th>
                <th className="py-4 px-6 font-semibold">{t.status}</th>
                <th className="py-4 px-6 font-semibold text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-6 font-mono text-sm text-slate-500">{item.id}</td>
                  <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{item.date}</td>
                  <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{getLocationName(item.sourceType, item.sourceId)}</td>
                  <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{getLocationName(item.targetType, item.targetId)}</td>
                  <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{item.items.reduce((acc, i) => acc + i.quantity, 0)}</td>
                  <td className="py-4 px-6"><Badge type={item.status === 'completed' ? 'success' : (item.status === 'pending' ? 'warning' : 'neutral')}>{t[item.status] || item.status}</Badge></td>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? t.editTransfer : t.addTransfer}>
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input label={t.date} type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.source}</label>
                    <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg outline-none" value={form.sourceValue} onChange={e => setForm({...form, sourceValue: e.target.value})}>
                        {locationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.target}</label>
                    <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg outline-none" value={form.targetValue} onChange={e => setForm({...form, targetValue: e.target.value})}>
                        {locationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.items}</label>
                    <button type="button" onClick={addItem} className="text-xs text-primary-600 hover:underline flex items-center gap-1"><Plus size={12} /> {t.addItem}</button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {form.items.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                            <select 
                                className="flex-1 px-2 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-md text-sm outline-none"
                                value={item.productId}
                                onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                            >
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <input 
                                type="number" 
                                className="w-20 px-2 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-md text-sm outline-none"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value))}
                                min="1"
                            />
                            {form.items.length > 1 && (
                                <button type="button" onClick={() => removeItem(idx)} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash size={14} /></button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.status}</label>
                 <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg outline-none" value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}>
                    <option value="pending">{t.pending}</option>
                    <option value="completed">{t.completed}</option>
                    <option value="cancelled">Cancelled</option>
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
