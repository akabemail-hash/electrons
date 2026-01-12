import React, { useState, useEffect } from 'react';
import { FileText, Filter, Calendar, Download, ShoppingCart, BarChart, Map, Footprints, X, Truck, Package } from 'lucide-react';
import { StockTransfer, Product, Vehicle, Driver, Warehouse, LanguageCode, Order, Visit, Store, Merchandiser, SalesManager, RoutePlan, Customer } from '../types';
import { TRANSLATIONS } from '../constants';
import { Card, Button, Input, Badge, Pagination, Modal } from './ui';

export type ReportType = 'loading' | 'orders' | 'products' | 'visits' | 'routes' | 'stock';

interface ReportsPanelProps {
  view: ReportType;
  lang: LanguageCode;
  transfers: StockTransfer[];
  orders?: Order[];
  vehicles: Vehicle[];
  drivers: Driver[];
  warehouses: Warehouse[];
  products: Product[];
  visits?: Visit[];
  stores?: Store[];
  merchandisers?: Merchandiser[];
  routePlans?: RoutePlan[];
  salesManagers?: SalesManager[];
  customers?: Customer[];
}

export const ReportsPanel: React.FC<ReportsPanelProps> = ({
  view, lang, transfers, orders = [], vehicles, drivers, warehouses, products,
  visits = [], stores = [], merchandisers = [], routePlans = [], salesManagers = [], customers = []
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedMerchandiserId, setSelectedMerchandiserId] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Stock Report Specific Filters
  const [stockLocationType, setStockLocationType] = useState<'all' | 'warehouse' | 'vehicle'>('all');
  const [selectedLocationId, setSelectedLocationId] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset pagination when view changes
  useEffect(() => {
      setCurrentPage(1);
      setStartDate('');
      setEndDate('');
      setSelectedDriverId('');
      setSelectedMerchandiserId('');
      setSelectedStatus('');
      setStockLocationType('all');
      setSelectedLocationId('');
  }, [view]);

  // Detail Modal State
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Order | null>(null);

  // --- Helpers ---
  const getEntityName = (type: 'driver' | 'merchandiser' | 'sales_manager', id: string) => {
      if (type === 'driver') return drivers.find(d => d.id === id)?.name || id;
      if (type === 'merchandiser') return merchandisers.find(m => m.id === id)?.name || id;
      if (type === 'sales_manager') return salesManagers.find(s => s.id === id)?.name || id;
      return id;
  };

  const getStoreName = (id: string) => stores.find(s => s.id === id)?.name || id;
  const getProductName = (id: string) => products.find(p => p.id === id)?.name || id;
  const getProductCode = (id: string) => products.find(p => p.id === id)?.code || '-';
  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'Unknown';

  // --- Data Filtering Logic ---

  // 1. Vehicle Loading Reports
  const loadingTransfers = transfers.filter(tr => tr.targetType === 'vehicle');
  const filteredTransfers = loadingTransfers.filter(tr => {
    if (startDate && tr.date < startDate) return false;
    if (endDate && tr.date > endDate) return false;
    if (selectedWarehouseId && tr.sourceId !== selectedWarehouseId) return false;
    if (selectedDriverId) {
        const driver = drivers.find(d => d.id === selectedDriverId);
        if (driver && driver.vehicleId !== tr.targetId) return false;
    }
    return true;
  });

  // 2. Order Reports
  const filteredOrders = orders.filter(ord => {
      if (startDate && ord.orderDate < startDate) return false;
      if (endDate && ord.orderDate > endDate) return false;
      if (selectedDriverId && ord.driverId !== selectedDriverId) return false;
      if (selectedStatus && ord.status !== selectedStatus) return false;
      return true;
  });

  // 3. Product Analysis (Aggregated from filteredOrders)
  // We use filteredOrders to respect the date range selected
  const productStats = filteredOrders.reduce((acc, order) => {
      order.items.forEach(item => {
          if (!acc[item.productId]) {
              acc[item.productId] = { quantity: 0, revenue: 0, count: 0 };
          }
          acc[item.productId].quantity += item.quantity;
          acc[item.productId].revenue += (item.price * item.quantity); // Assuming price is populated
          acc[item.productId].count += 1;
      });
      return acc;
  }, {} as Record<string, { quantity: number, revenue: number, count: number }>);

  const productAnalysisData = Object.entries(productStats)
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.quantity - a.quantity);

  // 4. Visit Reports
  const filteredVisits = visits.filter(v => {
      if (startDate && v.date < startDate) return false;
      if (endDate && v.date > endDate) return false;
      if (selectedMerchandiserId) {
          // Logic to link merch to sales manager would go here
          return true; 
      }
      return true;
  });

  // 5. Route Compliance
  const routeCompliance = routePlans.map(plan => {
      const manager = salesManagers.find(sm => sm.id === plan.salesManagerId);
      const uniqueStoreIds = new Set(plan.days.flatMap(d => d.storeIds));
      const managerVisits = filteredVisits.filter(v => v.salesManagerId === plan.salesManagerId);
      const visitedUnique = new Set(managerVisits.map(v => v.storeId));
      
      return {
          id: plan.id,
          name: manager?.name || 'Unknown',
          totalPlanned: uniqueStoreIds.size,
          visitedCount: visitedUnique.size,
          compliance: uniqueStoreIds.size > 0 ? Math.round((visitedUnique.size / uniqueStoreIds.size) * 100) : 0
      };
  });

  // 6. Stock Report Logic (Calculated on the fly)
  const calculateStock = () => {
      const stockMap: Record<string, Record<string, number>> = {}; // LocationID -> ProductID -> Qty

      // Initialize all locations
      warehouses.forEach(w => {
          stockMap[w.id] = {};
          products.forEach(p => stockMap[w.id][p.id] = 500); // Mock Base Stock for Warehouse
      });
      vehicles.forEach(v => {
          stockMap[v.id] = {};
          products.forEach(p => stockMap[v.id][p.id] = 0); // Base Stock for Vehicle
      });

      // Apply Transfers
      transfers.forEach(tr => {
          if (tr.status === 'cancelled') return;
          
          tr.items.forEach(item => {
              // Remove from source
              if (stockMap[tr.sourceId]) {
                  stockMap[tr.sourceId][item.productId] = (stockMap[tr.sourceId][item.productId] || 0) - item.quantity;
              }
              // Add to target (only if completed or pending for vehicle view mostly)
              // For accurate stock, usually only 'completed' moves stock officially, 
              // but for vehicle loading 'pending' might mean it's physically on the truck waiting acceptance.
              // Let's assume 'completed' for now.
              if (tr.status === 'completed' && stockMap[tr.targetId]) {
                  stockMap[tr.targetId][item.productId] = (stockMap[tr.targetId][item.productId] || 0) + item.quantity;
              }
          });
      });

      // Apply Orders (Remove from Vehicle/Warehouse)
      orders.forEach(ord => {
          if (ord.status === 'delivered' || ord.status === 'out_for_delivery') {
              const locId = ord.vehicleId || '1'; // Default to central warehouse if no vehicle
              if (stockMap[locId]) {
                  ord.items.forEach(item => {
                      stockMap[locId][item.productId] = (stockMap[locId][item.productId] || 0) - item.quantity;
                  });
              }
          }
      });

      // Flatten for table
      const flatList: any[] = [];
      
      const addToList = (id: string, name: string, type: 'warehouse' | 'vehicle') => {
          if (selectedLocationId && selectedLocationId !== id) return;
          if (stockLocationType !== 'all' && stockLocationType !== type) return;

          Object.entries(stockMap[id] || {}).forEach(([prodId, qty]) => {
              if (qty !== 0) { // Only show non-zero stock? Or show all. Let's show all.
                  const prod = products.find(p => p.id === prodId);
                  if (prod) {
                      flatList.push({
                          locationId: id,
                          locationName: name,
                          type: type,
                          productId: prod.id,
                          productName: prod.name,
                          sku: prod.code,
                          quantity: qty,
                          price: prod.price,
                          value: qty * prod.price
                      });
                  }
              }
          });
      };

      warehouses.forEach(w => addToList(w.id, w.name, 'warehouse'));
      vehicles.forEach(v => addToList(v.id, `${v.plateNumber} (${v.model})`, 'vehicle'));

      return flatList;
  };

  const stockData = view === 'stock' ? calculateStock() : [];


  // --- Pagination Logic ---
  const getCurrentData = () => {
      switch(view) {
          case 'loading': return filteredTransfers;
          case 'orders': return filteredOrders;
          case 'products': return productAnalysisData;
          case 'visits': return filteredVisits;
          case 'routes': return routeCompliance;
          case 'stock': return stockData;
          default: return [];
      }
  };
  
  const currentData = getCurrentData();
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const paginatedData = currentData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getTitle = () => {
      switch(view) {
          case 'loading': return t.vehicleLoadingReports;
          case 'orders': return t.orderDeliveries;
          case 'products': return t.productAnalysis;
          case 'visits': return t.visitReports;
          case 'routes': return t.routeReports;
          case 'stock': return t.stockReport;
          default: return t.reports;
      }
  };

  const getIcon = () => {
      switch(view) {
          case 'loading': return <Truck className="text-primary-500" />;
          case 'orders': return <ShoppingCart className="text-primary-500" />;
          case 'products': return <BarChart className="text-primary-500" />;
          case 'visits': return <Footprints className="text-primary-500" />;
          case 'routes': return <Map className="text-primary-500" />;
          case 'stock': return <Package className="text-primary-500" />;
          default: return <FileText className="text-primary-500" />;
      }
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </h2>
        </div>
      </div>

      <Card className="mb-6 p-5">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Filter size={16} /> {t.reportFilters}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {view !== 'stock' && (
                  <>
                    <Input 
                        type="date" 
                        label={t.startDate} 
                        value={startDate} 
                        onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }} 
                    />
                    <Input 
                        type="date" 
                        label={t.endDate} 
                        value={endDate} 
                        onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }} 
                    />
                  </>
              )}
              
              {/* Dynamic Filters based on Tab */}
              {(view === 'loading' || view === 'orders') && (
                  <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.selectDriver}</label>
                      <select 
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg outline-none text-sm"
                        value={selectedDriverId}
                        onChange={(e) => { setSelectedDriverId(e.target.value); setCurrentPage(1); }}
                      >
                          <option value="">{t.allDrivers}</option>
                          {drivers.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                      </select>
                  </div>
              )}

              {view === 'visits' && (
                  <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.merchandiser}</label>
                      <select 
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg outline-none text-sm"
                        value={selectedMerchandiserId}
                        onChange={(e) => { setSelectedMerchandiserId(e.target.value); setCurrentPage(1); }}
                      >
                          <option value="">{t.allMerchandisers}</option>
                          {merchandisers.map(m => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                      </select>
                  </div>
              )}

              {view === 'orders' && (
                  <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.status}</label>
                      <select 
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg outline-none text-sm"
                        value={selectedStatus}
                        onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                      >
                          <option value="">All Statuses</option>
                          <option value="delivered">{t.delivered}</option>
                          <option value="failed">{t.failed}</option>
                          <option value="out_for_delivery">{t.outForDelivery}</option>
                      </select>
                  </div>
              )}

              {view === 'stock' && (
                  <>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.locationType}</label>
                        <select 
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg outline-none text-sm"
                            value={stockLocationType}
                            onChange={(e) => { setStockLocationType(e.target.value as any); setCurrentPage(1); }}
                        >
                            <option value="all">All</option>
                            <option value="warehouse">{t.warehouses}</option>
                            <option value="vehicle">{t.vehicles}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.location}</label>
                        <select 
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg outline-none text-sm"
                            value={selectedLocationId}
                            onChange={(e) => { setSelectedLocationId(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="">All Locations</option>
                            {stockLocationType !== 'vehicle' && warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            {stockLocationType !== 'warehouse' && vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber}</option>)}
                        </select>
                    </div>
                  </>
              )}
          </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                {view === 'loading' && (
                    <>
                        <th className="py-4 px-6 font-semibold">{t.loadingDate}</th>
                        <th className="py-4 px-6 font-semibold">{t.sourceWarehouse}</th>
                        <th className="py-4 px-6 font-semibold">{t.targetVehicle}</th>
                        <th className="py-4 px-6 font-semibold">{t.driver}</th>
                        <th className="py-4 px-6 font-semibold">{t.productCount}</th>
                        <th className="py-4 px-6 font-semibold">{t.status}</th>
                    </>
                )}
                {view === 'orders' && (
                    <>
                        <th className="py-4 px-6 font-semibold">{t.orderId}</th>
                        <th className="py-4 px-6 font-semibold">{t.date}</th>
                        <th className="py-4 px-6 font-semibold">{t.driver}</th>
                        <th className="py-4 px-6 font-semibold">{t.totalAmount}</th>
                        <th className="py-4 px-6 font-semibold">{t.status}</th>
                        <th className="py-4 px-6 font-semibold text-right">{t.actions}</th>
                    </>
                )}
                {view === 'products' && (
                    <>
                        <th className="py-4 px-6 font-semibold">{t.products}</th>
                        <th className="py-4 px-6 font-semibold">{t.totalSold}</th>
                        <th className="py-4 px-6 font-semibold">{t.revenue}</th>
                        <th className="py-4 px-6 font-semibold w-1/3">{t.salesVolume}</th>
                    </>
                )}
                {view === 'visits' && (
                    <>
                        <th className="py-4 px-6 font-semibold">{t.date}</th>
                        <th className="py-4 px-6 font-semibold">{t.stores}</th>
                        <th className="py-4 px-6 font-semibold">{t.salesManager}</th>
                        <th className="py-4 px-6 font-semibold">{t.status}</th>
                        <th className="py-4 px-6 font-semibold">{t.notes}</th>
                    </>
                )}
                {view === 'routes' && (
                    <>
                        <th className="py-4 px-6 font-semibold">{t.salesManager}</th>
                        <th className="py-4 px-6 font-semibold">{t.planned}</th>
                        <th className="py-4 px-6 font-semibold">{t.actual}</th>
                        <th className="py-4 px-6 font-semibold">{t.compliance}</th>
                    </>
                )}
                {view === 'stock' && (
                    <>
                        <th className="py-4 px-6 font-semibold">{t.location}</th>
                        <th className="py-4 px-6 font-semibold">{t.locationType}</th>
                        <th className="py-4 px-6 font-semibold">{t.products}</th>
                        <th className="py-4 px-6 font-semibold">{t.code}</th>
                        <th className="py-4 px-6 font-semibold">{t.currentStock}</th>
                        <th className="py-4 px-6 font-semibold">{t.totalValue}</th>
                    </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {view === 'loading' && (paginatedData as StockTransfer[]).map(tr => {
                    const warehouse = warehouses.find(w => w.id === tr.sourceId);
                    const vehicle = vehicles.find(v => v.id === tr.targetId);
                    const driver = drivers.find(d => d.vehicleId === vehicle?.id);
                    const totalQty = tr.items.reduce((acc, item) => acc + item.quantity, 0);
                    return (
                        <tr key={tr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-mono text-sm">{tr.date}</td>
                            <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{warehouse?.name}</td>
                            <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{vehicle?.plateNumber}</td>
                            <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-medium">{driver?.name || '-'}</td>
                            <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{totalQty} items</td>
                            <td className="py-4 px-6"><Badge type={tr.status === 'completed' ? 'success' : 'warning'}>{tr.status}</Badge></td>
                        </tr>
                    );
                })}

                {view === 'orders' && (paginatedData as Order[]).map(ord => {
                    const driver = drivers.find(d => d.id === ord.driverId);
                    return (
                        <tr key={ord.id} onClick={() => setSelectedDetailOrder(ord)} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                            <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-mono text-sm group-hover:text-primary-600 underline-offset-4 group-hover:underline">{ord.id}</td>
                            <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{ord.orderDate}</td>
                            <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-medium">{driver?.name || '-'}</td>
                            <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{ord.totalAmount}</td>
                            <td className="py-4 px-6"><Badge type={ord.status === 'delivered' ? 'success' : (ord.status === 'failed' ? 'danger' : 'info')}>{t[ord.status] || ord.status}</Badge></td>
                            <td className="py-4 px-6 text-right"><Button variant="ghost" className="text-xs py-1 h-auto" onClick={() => setSelectedDetailOrder(ord)}>{t.viewOrders || 'Details'}</Button></td>
                        </tr>
                    )
                })}

                {view === 'products' && (paginatedData as any[]).map(prod => {
                    const maxQty = productAnalysisData[0]?.quantity || 1;
                    const percent = (prod.quantity / maxQty) * 100;
                    return (
                        <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-medium">{getProductName(prod.id)}</td>
                            <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-bold">{prod.quantity}</td>
                            <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{prod.revenue.toLocaleString()}</td>
                            <td className="py-4 px-6 align-middle">
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                    <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${percent}%` }}></div>
                                </div>
                            </td>
                        </tr>
                    )
                })}

                {view === 'visits' && (paginatedData as Visit[]).map(visit => {
                    return (
                        <tr key={visit.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-mono text-sm">{visit.date}</td>
                            <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{getStoreName(visit.storeId)}</td>
                            <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{getEntityName('sales_manager', visit.salesManagerId)}</td>
                            <td className="py-4 px-6"><Badge type={visit.status === 'visited' ? 'success' : 'danger'}>{visit.status}</Badge></td>
                            <td className="py-4 px-6 text-slate-500 text-sm max-w-xs truncate">{visit.notes || visit.visitReason || '-'}</td>
                        </tr>
                    )
                })}

                {view === 'routes' && (paginatedData as any[]).map(rt => {
                    let color = 'bg-red-500';
                    if (rt.compliance > 80) color = 'bg-emerald-500';
                    else if (rt.compliance > 50) color = 'bg-amber-500';
                    return (
                        <tr key={rt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-medium">{rt.name}</td>
                            <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{rt.totalPlanned} stores</td>
                            <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{rt.visitedCount} visited</td>
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold w-8 text-right">{rt.compliance}%</span>
                                    <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                        <div className={`${color} h-2 rounded-full`} style={{ width: `${rt.compliance}%` }}></div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )
                })}

                {view === 'stock' && (paginatedData as any[]).map((item, idx) => (
                    <tr key={`${item.locationId}-${item.productId}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-medium">{item.locationName}</td>
                        <td className="py-4 px-6"><Badge type={item.type === 'warehouse' ? 'info' : 'warning'}>{item.type === 'warehouse' ? t.warehouses : t.vehicles}</Badge></td>
                        <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{item.productName}</td>
                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-sm font-mono">{item.sku}</td>
                        <td className="py-4 px-6">
                            <span className={`font-bold ${item.quantity < 10 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                {item.quantity}
                            </span>
                            {item.quantity < 10 && <span className="ml-2 text-xs text-red-500">({t.lowStock})</span>}
                        </td>
                        <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-mono">{item.value.toLocaleString()}</td>
                    </tr>
                ))}

                {currentData.length === 0 && (
                    <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                            No records found matching filters.
                        </td>
                    </tr>
                )}
            </tbody>
          </table>
        </div>
        <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={currentData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
        />
      </Card>

      {/* Order Details Modal (Existing code...) */}
      <Modal isOpen={!!selectedDetailOrder} onClose={() => setSelectedDetailOrder(null)} title={`${t.orders} #${selectedDetailOrder?.id}`}>
          {selectedDetailOrder && (
              <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg flex justify-between items-start">
                      <div>
                          <h4 className="text-sm font-semibold text-slate-500 uppercase mb-1">{t.customer}</h4>
                          <p className="font-bold text-lg">{getCustomerName(selectedDetailOrder.customerId)}</p>
                          <p className="text-sm">{customers.find(c => c.id === selectedDetailOrder.customerId)?.address}</p>
                      </div>
                      <div className="text-right">
                          <h4 className="text-sm font-semibold text-slate-500 uppercase mb-1">{t.status}</h4>
                          <Badge type={selectedDetailOrder.status === 'delivered' ? 'success' : (selectedDetailOrder.status === 'failed' ? 'danger' : 'info')}>
                              {t[selectedDetailOrder.status] || selectedDetailOrder.status}
                          </Badge>
                          <p className="text-sm mt-1">{selectedDetailOrder.orderDate}</p>
                      </div>
                  </div>

                  <div>
                      <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3 border-b pb-2">{t.products}</h4>
                      <div className="space-y-3">
                          {selectedDetailOrder.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-slate-200 rounded flex items-center justify-center text-xs font-bold">{item.quantity}x</div>
                                      <div>
                                          <p className="font-medium">{getProductName(item.productId)}</p>
                                          <p className="text-xs text-slate-500">SKU: {getProductCode(item.productId)}</p>
                                      </div>
                                  </div>
                                  <div className="font-mono">{item.price * item.quantity}</div>
                              </div>
                          ))}
                          <div className="flex justify-between items-center pt-3 border-t font-bold">
                              <span>{t.totalAmount}</span>
                              <span>{selectedDetailOrder.totalAmount}</span>
                          </div>
                      </div>
                  </div>

                  {selectedDetailOrder.deliveryAttempt && (
                      <div>
                          <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3 border-b pb-2">{t.deliveryDate} Info</h4>
                          <div className="grid grid-cols-2 gap-4">
                              {selectedDetailOrder.deliveryAttempt.idPhoto && (
                                  <div>
                                      <p className="text-xs mb-1">{t.idPhoto}</p>
                                      <img src={selectedDetailOrder.deliveryAttempt.idPhoto} className="w-full h-24 object-cover rounded border" alt="ID" />
                                  </div>
                              )}
                              {selectedDetailOrder.deliveryAttempt.signature && (
                                  <div>
                                      <p className="text-xs mb-1">{t.signature}</p>
                                      <img src={selectedDetailOrder.deliveryAttempt.signature} className="w-full h-24 object-contain rounded border bg-white" alt="Sig" />
                                  </div>
                              )}
                          </div>
                          {selectedDetailOrder.deliveryAttempt.notes && (
                              <div className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded text-sm">
                                  <strong>Note:</strong> {selectedDetailOrder.deliveryAttempt.notes}
                              </div>
                          )}
                      </div>
                  )}
              </div>
          )}
      </Modal>
    </div>
  );
};