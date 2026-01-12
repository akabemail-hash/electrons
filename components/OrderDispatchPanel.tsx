import React, { useState } from 'react';
import { Truck, Package, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Order, Vehicle, Product, StockTransfer, LanguageCode } from '../types';
import { TRANSLATIONS } from '../constants';
import { Card, Button, Badge } from './ui';
import { useToast } from './Toast';

interface OrderDispatchPanelProps {
  lang: LanguageCode;
  orders: Order[];
  vehicles: Vehicle[];
  products: Product[];
  stockTransfers: StockTransfer[]; // To check inventory (mock logic)
  onAssignOrder: (orderId: string, vehicleId: string) => void;
  onCreateTransfer: (transfer: Omit<StockTransfer, 'id'>) => void;
}

export const OrderDispatchPanel: React.FC<OrderDispatchPanelProps> = ({
  lang, orders, vehicles, products, stockTransfers, onAssignOrder, onCreateTransfer
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  const { addToast } = useToast();
  
  const pendingOrders = orders.filter(o => o.status === 'pending_warehouse');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');

  const toggleOrderSelection = (id: string) => {
      setSelectedOrders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleAssign = () => {
      if (!selectedVehicle || selectedOrders.length === 0) return;

      // Mock logic: Check if vehicle has stock
      // In a real app, we'd sum up vehicle inventory. 
      // Here, we'll just simulate a check. 
      const needsTransfer = Math.random() > 0.5; // Randomly decide if stock is missing for demo

      if (needsTransfer) {
          if (confirm(`${t.stockMissing}. ${t.createTransfer}?`)) {
              // Create transfer
              const itemsToTransfer = selectedOrders.flatMap(oid => {
                  const order = orders.find(o => o.id === oid);
                  return order ? order.items.map(i => ({ productId: i.productId, quantity: i.quantity })) : [];
              });
              
              // Aggregate items
              const aggregatedItems = Object.values(itemsToTransfer.reduce((acc, item) => {
                  acc[item.productId] = acc[item.productId] || { productId: item.productId, quantity: 0 };
                  acc[item.productId].quantity += item.quantity;
                  return acc;
              }, {} as Record<string, { productId: string, quantity: number }>));

              onCreateTransfer({
                  sourceId: '1', // Default central warehouse
                  sourceType: 'warehouse',
                  targetId: selectedVehicle,
                  targetType: 'vehicle',
                  items: aggregatedItems,
                  date: new Date().toISOString().split('T')[0],
                  status: 'pending'
              });
              addToast({ type: 'success', message: t.transferCreated });
          }
      } else {
          addToast({ type: 'success', message: t.stockAvailable });
      }

      // Assign orders
      selectedOrders.forEach(oid => onAssignOrder(oid, selectedVehicle));
      setSelectedOrders([]);
      addToast({ type: 'success', message: t.operationSuccess });
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Truck className="text-primary-500" />
          {t.orderDispatch}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t.orderDispatchDesc}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unassigned Orders */}
          <div className="lg:col-span-2">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">{t.unassignedOrders}</h3>
              <div className="space-y-3">
                  {pendingOrders.map(order => (
                      <Card key={order.id} className={`p-4 cursor-pointer transition-all border-2 ${selectedOrders.includes(order.id) ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'}`} onClick={() => toggleOrderSelection(order.id)}>
                          <div className="flex justify-between items-center">
                              <div>
                                  <div className="font-medium text-slate-900 dark:text-white">{order.id}</div>
                                  <div className="text-xs text-slate-500">{order.items.length} items • {order.totalAmount}</div>
                              </div>
                              {selectedOrders.includes(order.id) && <CheckCircle className="text-primary-500" size={20} />}
                          </div>
                      </Card>
                  ))}
                  {pendingOrders.length === 0 && <p className="text-slate-500 text-sm italic">No pending orders.</p>}
              </div>
          </div>

          {/* Vehicle Selection */}
          <div>
              <Card className="p-5 sticky top-24">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">{t.assignToVehicle}</h3>
                  
                  <div className="space-y-2 mb-6">
                      {vehicles.map(v => (
                          <div 
                            key={v.id} 
                            onClick={() => setSelectedVehicle(v.id)}
                            className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between ${selectedVehicle === v.id ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                          >
                              <div className="flex items-center gap-2">
                                  <Truck size={18} />
                                  <span className="text-sm font-medium">{v.plateNumber}</span>
                              </div>
                              {selectedVehicle === v.id && <CheckCircle size={16} />}
                          </div>
                      ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-500">Selected Orders:</span>
                          <span className="font-medium">{selectedOrders.length}</span>
                      </div>
                      <Button 
                        className="w-full" 
                        disabled={!selectedVehicle || selectedOrders.length === 0}
                        onClick={handleAssign}
                      >
                          {t.checkStock} & Assign
                      </Button>
                  </div>
              </Card>
          </div>
      </div>
    </div>
  );
};