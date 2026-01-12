
import React, { useState, useRef, useEffect } from 'react';
import { Truck, CheckCircle, Calendar, Package, AlertCircle, MapPin, Camera, CreditCard, X, Map as MapIcon, List, Navigation } from 'lucide-react';
import { StockTransfer, Product, Vehicle, LanguageCode, Warehouse, Order, Customer } from '../types';
import { TRANSLATIONS } from '../constants';
import { Card, Button, Badge, Pagination, Modal, Input, SignaturePad } from './ui';
import { useToast } from './Toast';

interface DriverPanelProps {
  lang: LanguageCode;
  transfers: StockTransfer[];
  orders: Order[]; // Added orders
  vehicles: Vehicle[];
  warehouses: Warehouse[];
  customers: Customer[]; // Added customers
  products: Product[];
  currentUserId: string;
  onAcceptTransfer: (transferId: string) => void;
  onUpdateOrder: (order: Order) => void; // Added callback
}

export const DriverPanel: React.FC<DriverPanelProps> = ({ 
  lang, transfers, orders, vehicles, warehouses, customers, products, currentUserId, onAcceptTransfer, onUpdateOrder 
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'transfers' | 'deliveries'>('deliveries');
  
  // --- Transfer Logic ---
  const [transferFilter, setTransferFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [transferPage, setTransferPage] = useState(1);
  const itemsPerPage = 5;

  // Mock finding driver vehicle (in real app, use user.linkedEntityId -> Driver -> Vehicle)
  // For demo, assuming user sees all items targeted at 'vehicle'
  const myTransfers = transfers.filter(tr => tr.targetType === 'vehicle');
  const filteredTransfers = myTransfers.filter(tr => {
    if (transferFilter === 'pending') return tr.status === 'pending';
    if (transferFilter === 'completed') return tr.status === 'completed';
    return true;
  });
  const transferTotalPages = Math.ceil(filteredTransfers.length / itemsPerPage);
  const paginatedTransfers = filteredTransfers.slice((transferPage - 1) * itemsPerPage, transferPage * itemsPerPage);

  const handleAcceptTransfer = (id: string) => {
      if (confirm(t.confirmReceiptDesc)) {
          onAcceptTransfer(id);
      }
  }

  // --- Delivery Logic ---
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deliveryType, setDeliveryType] = useState<'success' | 'failure' | null>(null);
  const [sortAddress, setSortAddress] = useState(false);
  const [isMapView, setIsMapView] = useState(false); // Toggle List/Map
  const [previewMapOrder, setPreviewMapOrder] = useState<Order | null>(null);
  
  // Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const mapMarkersRef = useRef<any[]>([]);

  // Form State
  const [idPhoto, setIdPhoto] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [collectedCash, setCollectedCash] = useState<number>(0);
  const [collectedCard, setCollectedCard] = useState<number>(0);
  const [failureReason, setFailureReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Filter orders for this driver (mock logic: assigned_to_driver or out_for_delivery)
  let myOrders = orders.filter(o => (o.status === 'assigned_to_driver' || o.status === 'out_for_delivery' || o.status === 'delivered' || o.status === 'failed')); // In real app filter by driverId
  
  if (sortAddress) {
      myOrders.sort((a, b) => {
          const custA = customers.find(c => c.id === a.customerId);
          const custB = customers.find(c => c.id === b.customerId);
          return (custA?.address || '').localeCompare(custB?.address || '');
      });
  }

  // --- Map Effect ---
  useEffect(() => {
      if (activeTab === 'deliveries' && isMapView && mapContainerRef.current && !mapInstanceRef.current) {
          // @ts-ignore
          const L = window.L;
          if (!L) return;

          const map = L.map(mapContainerRef.current).setView([40.4093, 49.8671], 12);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);
          mapInstanceRef.current = map;
      }

      if (mapInstanceRef.current) {
          // Force resize
          setTimeout(() => mapInstanceRef.current.invalidateSize(), 200);

          // Clear markers
          mapMarkersRef.current.forEach(m => m.remove());
          mapMarkersRef.current = [];

          // @ts-ignore
          const L = window.L;
          
          // Plot Orders
          myOrders.forEach(order => {
              const customer = customers.find(c => c.id === order.customerId);
              if (customer && customer.latitude && customer.longitude) {
                  const isCompleted = order.status === 'delivered' || order.status === 'failed';
                  const color = order.status === 'delivered' ? '#10b981' : (order.status === 'failed' ? '#ef4444' : '#3b82f6');
                  
                  const icon = L.divIcon({
                      className: 'bg-transparent',
                      html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); color: white;">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                             </div>`,
                      iconSize: [30, 30],
                      iconAnchor: [15, 15]
                  });

                  const marker = L.marker([parseFloat(customer.latitude), parseFloat(customer.longitude)], { icon })
                      .addTo(mapInstanceRef.current);
                  
                  // On click, set preview instead of popup
                  marker.on('click', () => {
                      setPreviewMapOrder(order);
                  });

                  mapMarkersRef.current.push(marker);
              }
          });
      }
  }, [activeTab, isMapView, myOrders, customers]);


  const handleOpenDelivery = (order: Order, type: 'success' | 'failure') => {
      setSelectedOrder(order);
      setDeliveryType(type);
      // Reset form
      setIdPhoto('');
      setSignature('');
      setCollectedCash(0);
      setCollectedCard(0);
      setFailureReason('');
      setNotes('');
      
      // Auto-fill payment based on type
      if (order.paymentType === 'cod_cash') setCollectedCash(order.totalAmount);
      if (order.paymentType === 'cod_card') setCollectedCard(order.totalAmount);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onloadend = () => {
              setIdPhoto(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const submitDelivery = () => {
      if (!selectedOrder) return;

      const updatedOrder: Order = {
          ...selectedOrder,
          status: deliveryType === 'success' ? 'delivered' : 'failed',
          deliveryAttempt: {
              date: new Date().toISOString(),
              success: deliveryType === 'success',
              failureReason: deliveryType === 'failure' ? failureReason : undefined,
              idPhoto: deliveryType === 'success' ? idPhoto : undefined,
              signature: deliveryType === 'success' ? signature : undefined,
              notes,
              collectedCash,
              collectedCard
          }
      };

      onUpdateOrder(updatedOrder);
      setSelectedOrder(null);
      setDeliveryType(null);
      setPreviewMapOrder(null); // Close map card if open
      addToast({ type: 'success', message: t.operationSuccess });
  };

  const handleNavigate = (order: Order) => {
      const customer = customers.find(c => c.id === order.customerId);
      if (customer?.latitude && customer?.longitude) {
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${customer.latitude},${customer.longitude}`, '_blank');
      }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab('deliveries')}
            className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'deliveries' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
              {t.customerDeliveries}
          </button>
          <button 
            onClick={() => setActiveTab('transfers')}
            className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'transfers' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
              {t.transfers}
          </button>
      </div>

      {activeTab === 'deliveries' && (
          <div className="space-y-4">
              <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <Truck className="text-primary-500" />
                      {t.myLocation}
                  </h3>
                  <div className="flex gap-2">
                      {!isMapView && (
                          <Button variant="secondary" onClick={() => setSortAddress(!sortAddress)} className="text-xs">
                              {sortAddress ? 'Sorted by Address' : 'Sort by Address'}
                          </Button>
                      )}
                      <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex">
                          <button 
                              onClick={() => setIsMapView(false)}
                              className={`p-2 rounded-md transition-all ${!isMapView ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600' : 'text-slate-500'}`}
                              title={t.listView}
                          >
                              <List size={18} />
                          </button>
                          <button 
                              onClick={() => setIsMapView(true)}
                              className={`p-2 rounded-md transition-all ${isMapView ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600' : 'text-slate-500'}`}
                              title={t.mapView}
                          >
                              <MapIcon size={18} />
                          </button>
                      </div>
                  </div>
              </div>

              {!isMapView ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myOrders.map(order => {
                          const customer = customers.find(c => c.id === order.customerId);
                          let borderColor = 'border-l-amber-500'; // Pending
                          if (order.status === 'delivered') borderColor = 'border-l-emerald-500';
                          if (order.status === 'failed') borderColor = 'border-l-red-500';

                          return (
                              <Card key={order.id} className={`border-l-4 ${borderColor} p-4`}>
                                  <div className="flex justify-between items-start mb-2">
                                      <div>
                                          <h4 className="font-bold text-slate-900 dark:text-white">{customer?.name}</h4>
                                          <p className="text-sm text-slate-500 flex items-start gap-1">
                                              <MapPin size={14} className="mt-0.5 shrink-0" /> {customer?.address || `${customer?.city}, ${customer?.district}`}
                                          </p>
                                      </div>
                                      <Badge type={order.status === 'delivered' ? 'success' : (order.status === 'failed' ? 'danger' : 'warning')}>
                                          {t[order.status] || order.status}
                                      </Badge>
                                  </div>
                                  
                                  <div className="my-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                                      <div className="flex justify-between mb-1">
                                          <span>{t.totalAmount}:</span>
                                          <span className="font-bold">{order.totalAmount}</span>
                                      </div>
                                      <div className="flex justify-between">
                                          <span>{t.paymentType}:</span>
                                          <span>{t[order.paymentType]}</span>
                                      </div>
                                  </div>

                                  {(order.status === 'assigned_to_driver' || order.status === 'out_for_delivery') && (
                                      <div className="grid grid-cols-2 gap-2 mt-4">
                                          <Button className="w-full text-xs" onClick={() => handleOpenDelivery(order, 'success')}>
                                              <CheckCircle size={14} /> {t.visitStore}
                                          </Button>
                                          <Button variant="danger" className="w-full text-xs" onClick={() => handleOpenDelivery(order, 'failure')}>
                                              <X size={14} /> {t.failed}
                                          </Button>
                                      </div>
                                  )}
                              </Card>
                          );
                      })}
                      {myOrders.length === 0 && <p className="text-slate-500 italic">No orders assigned.</p>}
                  </div>
              ) : (
                  <div className="relative h-[calc(100vh-250px)] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                      <div ref={mapContainerRef} className="w-full h-full z-0" />
                      
                      {/* Floating Order Card */}
                      {previewMapOrder && (
                          <div className="absolute bottom-4 left-4 right-4 z-[400] animate-in slide-in-from-bottom-4 duration-300">
                              <Card className="p-4 shadow-xl border-t-4 border-t-primary-500">
                                  <div className="flex justify-between items-start">
                                      <div>
                                          <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                                              {customers.find(c => c.id === previewMapOrder.customerId)?.name}
                                          </h4>
                                          <p className="text-sm text-slate-500">
                                              {customers.find(c => c.id === previewMapOrder.customerId)?.address}
                                          </p>
                                          <p className="text-sm font-semibold mt-1">
                                              {previewMapOrder.totalAmount} {t.currency} • {t[previewMapOrder.paymentType]}
                                          </p>
                                      </div>
                                      <button onClick={() => setPreviewMapOrder(null)} className="text-slate-400 hover:text-slate-600">
                                          <X size={20} />
                                      </button>
                                  </div>
                                  
                                  {(previewMapOrder.status === 'assigned_to_driver' || previewMapOrder.status === 'out_for_delivery') && (
                                      <div className="grid grid-cols-2 gap-3 mt-4">
                                          <Button variant="secondary" onClick={() => handleNavigate(previewMapOrder)} className="flex items-center justify-center gap-2">
                                              <Navigation size={16} /> {t.navigate}
                                          </Button>
                                          <Button onClick={() => handleOpenDelivery(previewMapOrder, 'success')} className="flex items-center justify-center gap-2">
                                              <CheckCircle size={16} /> {t.visitStore}
                                          </Button>
                                      </div>
                                  )}
                              </Card>
                          </div>
                      )}
                  </div>
              )}
          </div>
      )}

      {activeTab === 'transfers' && (
          <div>
            {/* Filters */}
            <div className="flex gap-2 mb-6">
                <button 
                    onClick={() => { setTransferFilter('pending'); setTransferPage(1); }} 
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${transferFilter === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}
                >
                    {t.awaitingApproval}
                </button>
                <button 
                    onClick={() => { setTransferFilter('completed'); setTransferPage(1); }} 
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${transferFilter === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}
                >
                    {t.completed}
                </button>
            </div>

            <div className="space-y-6">
                {paginatedTransfers.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <Package size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-500 dark:text-slate-400">No transfers found.</p>
                    </div>
                ) : (
                    paginatedTransfers.map(tr => {
                        const sourceWarehouse = warehouses.find(w => w.id === tr.sourceId)?.name || 'Unknown Warehouse';
                        const itemCount = tr.items.reduce((acc, item) => acc + item.quantity, 0);

                        return (
                            <Card key={tr.id} className="overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge type={tr.status === 'completed' ? 'success' : 'warning'}>
                                                    {tr.status === 'completed' ? t.completed : t.pending}
                                                </Badge>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Calendar size={12} /> {tr.date}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                Transfer #{tr.id}
                                            </h3>
                                        </div>
                                        {tr.status === 'pending' && (
                                            <Button onClick={() => handleAcceptTransfer(tr.id)} className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200">
                                                <CheckCircle size={18} />
                                                {t.iHaveReceived}
                                            </Button>
                                        )}
                                    </div>

                                    <div className="text-sm text-slate-600 dark:text-slate-300">
                                        From: <strong>{sourceWarehouse}</strong> • Items: <strong>{itemCount}</strong>
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>
            
            <Pagination 
                currentPage={transferPage}
                totalPages={transferTotalPages}
                totalItems={filteredTransfers.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setTransferPage}
            />
          </div>
      )}

      {/* Delivery Success Modal */}
      <Modal isOpen={!!selectedOrder && deliveryType === 'success'} onClose={() => { setSelectedOrder(null); setDeliveryType(null); }} title={t.confirmReceipt}>
          <div className="space-y-4">
              {/* Product List with IMEIs */}
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  <h4 className="text-sm font-bold mb-2">{t.products}</h4>
                  <div className="space-y-2">
                      {selectedOrder?.items.map((item, idx) => {
                          const prod = products.find(p => p.id === item.productId);
                          return (
                              <div key={idx} className="flex justify-between text-sm">
                                  <span>{prod?.name} (x{item.quantity})</span>
                                  <span className="font-mono text-xs">{prod?.imei}</span>
                              </div>
                          )
                      })}
                  </div>
              </div>

              {/* ID Photo */}
              <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.idPhoto}</label>
                  {idPhoto ? (
                      <img src={idPhoto} alt="ID" className="w-full h-32 object-cover rounded-lg mb-2" />
                  ) : (
                      <label className="cursor-pointer flex items-center justify-center w-full h-20 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:border-primary-500 transition-colors">
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                          <Camera className="text-slate-400" />
                      </label>
                  )}
              </div>

              {/* Payment */}
              <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.totalAmount}: {selectedOrder?.totalAmount}</label>
                  <div className="grid grid-cols-2 gap-4">
                      <Input 
                        type="number" 
                        label={t.collectedCash} 
                        value={collectedCash} 
                        onChange={(e) => setCollectedCash(parseFloat(e.target.value) || 0)} 
                      />
                      <Input 
                        type="number" 
                        label={t.collectedCard} 
                        value={collectedCard} 
                        onChange={(e) => setCollectedCard(parseFloat(e.target.value) || 0)} 
                      />
                  </div>
              </div>

              {/* Signature */}
              <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.signature}</label>
                  {signature ? (
                      <div className="relative">
                          <img src={signature} alt="Sig" className="w-full h-24 border rounded bg-white" />
                          <button onClick={() => setSignature('')} className="absolute top-1 right-1 p-1 bg-slate-200 rounded-full"><X size={12}/></button>
                      </div>
                  ) : (
                      <SignaturePad onSave={setSignature} onClear={() => setSignature('')} />
                  )}
              </div>

              <div className="flex justify-end pt-2">
                  <Button onClick={submitDelivery} disabled={!idPhoto || !signature}>
                      {t.save}
                  </Button>
              </div>
          </div>
      </Modal>

      {/* Failure Modal */}
      <Modal isOpen={!!selectedOrder && deliveryType === 'failure'} onClose={() => { setSelectedOrder(null); setDeliveryType(null); }} title={t.failed}>
          <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.failureReason}</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg outline-none"
                    value={failureReason}
                    onChange={(e) => setFailureReason(e.target.value)}
                  >
                      <option value="">Select Reason...</option>
                      <option value="customer_not_home">{t.customerNotHome}</option>
                      <option value="vehicle_breakdown">{t.vehicleBreakdown}</option>
                      <option value="customer_refused">{t.customerRefused}</option>
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.notes}</label>
                  <textarea 
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg outline-none"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                  />
              </div>
              <div className="flex justify-end pt-2">
                  <Button variant="danger" onClick={submitDelivery} disabled={!failureReason}>
                      {t.save}
                  </Button>
              </div>
          </div>
      </Modal>
    </div>
  );
};
