
import React, { useState } from 'react';
import { Package, Search, Plus, Edit2, Trash2, Box } from 'lucide-react';
import { Product, Brand, Category, LanguageCode, StockTransfer, Order, Warehouse, Vehicle } from '../../types';
import { TRANSLATIONS } from '../../languages';
import { Card, Button, Input, Modal, Pagination, Badge } from '../ui';

interface ProductsProps {
  lang: LanguageCode;
  products: Product[];
  brands: Brand[];
  categories: Category[];
  transfers: StockTransfer[];
  orders: Order[];
  warehouses: Warehouse[];
  vehicles: Vehicle[];
  onAdd: (p: Omit<Product, 'id'>) => void;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
}

export const Products: React.FC<ProductsProps> = ({ lang, products, brands, categories, transfers, orders, warehouses, vehicles, onAdd, onEdit, onDelete }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', code: '', barcode: '', imei: '', serialNumber: '', brandId: '', categoryId: '', status: 'active' as 'active' | 'inactive', price: 0 });

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [viewingStockProduct, setViewingStockProduct] = useState<Product | null>(null);

  const openAdd = () => {
    setEditingItem(null);
    setForm({ name: '', code: '', barcode: '', imei: '', serialNumber: '', brandId: brands[0]?.id || '', categoryId: categories[0]?.id || '', status: 'active', price: 0 });
    setIsModalOpen(true);
  };

  const openEdit = (item: Product) => {
    setEditingItem(item);
    setForm({ name: item.name, code: item.code, barcode: item.barcode, imei: item.imei, serialNumber: item.serialNumber, brandId: item.brandId, categoryId: item.categoryId, status: item.status, price: item.price });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) onEdit({ ...editingItem, ...form });
    else onAdd(form);
    setIsModalOpen(false);
  };

  const calculateStock = (productId: string) => {
      // Initialize with base stock
      const stock: Record<string, { name: string, type: 'warehouse' | 'vehicle', qty: number }> = {};
      
      warehouses.forEach(w => stock[w.id] = { name: w.name, type: 'warehouse', qty: 500 }); // Mock Base 500
      vehicles.forEach(v => stock[v.id] = { name: v.plateNumber, type: 'vehicle', qty: 0 }); // Mock Base 0

      // Process Transfers
      transfers.forEach(tr => {
          if (tr.status === 'cancelled') return;
          tr.items.forEach(item => {
              if (item.productId === productId) {
                  if (stock[tr.sourceId]) stock[tr.sourceId].qty -= item.quantity;
                  if (tr.status === 'completed' && stock[tr.targetId]) stock[tr.targetId].qty += item.quantity;
              }
          });
      });

      // Process Orders (Deduct from assigned vehicle)
      orders.forEach(o => {
          if (o.status === 'delivered' || o.status === 'out_for_delivery') {
              const locId = o.vehicleId || '1'; // Default warehouse if unassigned (mock)
              o.items.forEach(item => {
                  if (item.productId === productId && stock[locId]) {
                      stock[locId].qty -= item.quantity;
                  }
              });
          }
      });

      return Object.values(stock);
  };

  const handleViewStock = (p: Product) => {
      setViewingStockProduct(p);
      setStockModalOpen(true);
  };

  const filteredItems = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Package className="text-primary-500" />
            {t.products}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t.productsDesc}</p>
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
            <Button onClick={openAdd} className="whitespace-nowrap"><Plus size={18} /> {t.addProduct}</Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">{t.name}</th>
                <th className="py-4 px-6 font-semibold">{t.code}</th>
                <th className="py-4 px-6 font-semibold">{t.brand}</th>
                <th className="py-4 px-6 font-semibold">{t.category}</th>
                <th className="py-4 px-6 font-semibold">{t.price}</th>
                <th className="py-4 px-6 font-semibold">{t.status}</th>
                <th className="py-4 px-6 font-semibold text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => handleViewStock(item)}>
                  <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">{item.name}</td>
                  <td className="py-4 px-6 text-sm font-mono text-slate-600 dark:text-slate-400">{item.code}</td>
                  <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{brands.find(b => b.id === item.brandId)?.name}</td>
                  <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{categories.find(c => c.id === item.categoryId)?.name}</td>
                  <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{item.price}</td>
                  <td className="py-4 px-6"><Badge type={item.status === 'active' ? 'success' : 'warning'}>{item.status === 'active' ? t.active : t.inactive}</Badge></td>
                  <td className="py-4 px-6 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? t.editProduct : t.addProduct}>
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input label={t.name} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <div className="grid grid-cols-2 gap-4">
                <Input label={t.code} value={form.code} onChange={e => setForm({...form, code: e.target.value})} required />
                <Input label={t.price} type="number" value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Input label={t.barcode} value={form.barcode} onChange={e => setForm({...form, barcode: e.target.value})} />
                <Input label={t.imei} value={form.imei} onChange={e => setForm({...form, imei: e.target.value})} />
            </div>
            <Input label={t.serialNumber} value={form.serialNumber} onChange={e => setForm({...form, serialNumber: e.target.value})} />
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.brand}</label>
                    <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg outline-none" value={form.brandId} onChange={e => setForm({...form, brandId: e.target.value})}>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.category}</label>
                    <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg outline-none" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
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

      <Modal isOpen={stockModalOpen} onClose={() => setStockModalOpen(false)} title={`Stock: ${viewingStockProduct?.name}`}>
          <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg mb-4 flex justify-between items-center">
                  <div>
                      <p className="text-sm text-slate-500">Total Stock</p>
                      <p className="text-2xl font-bold text-primary-600">
                          {viewingStockProduct && calculateStock(viewingStockProduct.id).reduce((acc, i) => acc + i.qty, 0)}
                      </p>
                  </div>
                  <Box className="text-slate-300" size={40} />
              </div>
              <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm text-left">
                      <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800">
                          <tr>
                              <th className="px-4 py-2">Location</th>
                              <th className="px-4 py-2">Type</th>
                              <th className="px-4 py-2 text-right">Quantity</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {viewingStockProduct && calculateStock(viewingStockProduct.id).sort((a,b) => b.qty - a.qty).map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                                  <td className="px-4 py-2 font-medium">{item.name}</td>
                                  <td className="px-4 py-2">
                                      <Badge type={item.type === 'warehouse' ? 'info' : 'warning'}>{item.type === 'warehouse' ? t.warehouses : t.vehicles}</Badge>
                                  </td>
                                  <td className={`px-4 py-2 text-right font-bold ${item.qty > 0 ? 'text-slate-700 dark:text-slate-200' : 'text-red-500'}`}>
                                      {item.qty}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      </Modal>
    </div>
  );
};
