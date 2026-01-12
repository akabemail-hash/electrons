import React, { useEffect, useRef, useState } from 'react';
import { Map, Truck, User, ShoppingBag, List, Filter } from 'lucide-react';
import { LiveLocation, Store, Order, Visit, User as UserType, LanguageCode } from '../types';
import { TRANSLATIONS } from '../constants';
import { Card, Button, Badge, Modal } from './ui';

interface LiveTrackingMapProps {
  lang: LanguageCode;
  stores: Store[];
  liveLocations: LiveLocation[];
  orders: Order[];
  visits: Visit[];
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  lang, stores, liveLocations, orders, visits
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null); // Leaflet map instance
  const markersRef = useRef<any[]>([]); // Keep track of markers to update/remove
  const [filter, setFilter] = useState<'all' | 'driver' | 'merchandiser'>('all');
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'driver' | 'merchandiser', id: string, name: string } | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Default center (Baku)
    const centerLat = 40.4093;
    const centerLng = 49.8671;

    // @ts-ignore - Leaflet is loaded via script tag
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current).setView([centerLat, centerLng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    mapInstance.current = map;

    // FIX: Force a resize calculation shortly after render to prevent "gray tiles"
    // This handles cases where the map initializes before the layout is fully painted.
    setTimeout(() => {
        map.invalidateSize();
    }, 200);

    // FIX: Listen for container resize (e.g., sidebar toggle)
    const resizeObserver = new ResizeObserver(() => {
        if (mapInstance.current) {
            mapInstance.current.invalidateSize();
        }
    });
    resizeObserver.observe(mapRef.current);

    return () => {
      resizeObserver.disconnect();
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapInstance.current) return;
    // @ts-ignore
    const L = window.L;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // --- 1. Plot Stores (Static) ---
    const storeIcon = L.divIcon({
      className: 'bg-transparent', // Ensure no default styles interfere
      html: `<div style="background-color: #3b82f6; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
             </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    stores.forEach(store => {
      if (store.latitude && store.longitude) {
        const marker = L.marker([parseFloat(store.latitude), parseFloat(store.longitude)], { icon: storeIcon })
          .bindPopup(`<b>${store.name}</b><br>${store.location}`)
          .addTo(mapInstance.current);
        markersRef.current.push(marker);
      }
    });

    // --- 2. Plot Live Locations ---
    liveLocations.forEach(loc => {
      if (filter !== 'all' && loc.userType !== filter) return;

      const isDriver = loc.userType === 'driver';
      const color = isDriver ? '#10b981' : '#a855f7'; // Emerald vs Purple
      const iconHtml = isDriver 
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

      const userIcon = L.divIcon({
        className: 'bg-transparent',
        html: `<div style="background-color: ${color}; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); position: relative;">
                ${iconHtml}
                <div style="position: absolute; bottom: -5px; right: -5px; width: 12px; height: 12px; background-color: #22c55e; border: 2px solid white; border-radius: 50%;"></div>
               </div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker([loc.latitude, loc.longitude], { icon: userIcon }).addTo(mapInstance.current);
      
      // Popup Content Construction
      const container = document.createElement('div');
      container.className = 'p-2 min-w-[200px]';
      
      const title = document.createElement('h3');
      title.className = 'font-bold text-lg mb-1';
      title.innerText = loc.name;
      container.appendChild(title);

      const subtitle = document.createElement('p');
      subtitle.className = 'text-xs text-gray-500 mb-2 uppercase font-bold';
      subtitle.innerText = isDriver ? t.driver : t.merchandiser;
      container.appendChild(subtitle);

      // Dynamic Content based on role
      if (isDriver) {
          const todaysOrders = orders.filter(o => o.driverId === loc.entityId && o.orderDate === new Date().toISOString().split('T')[0]);
          const info = document.createElement('div');
          info.className = 'text-sm mb-2';
          info.innerHTML = `<strong>${todaysOrders.length}</strong> ${t.ordersForToday}`;
          container.appendChild(info);

          if (todaysOrders.length > 0) {
              const list = document.createElement('ul');
              list.className = 'text-xs text-gray-600 mb-2 list-disc pl-4';
              todaysOrders.slice(0, 2).forEach(o => {
                  const li = document.createElement('li');
                  li.innerText = `Order #${o.id} - ${o.totalAmount} ${t.currency}`;
                  list.appendChild(li);
              });
              container.appendChild(list);
          }

          const btn = document.createElement('button');
          btn.className = 'w-full bg-indigo-600 text-white text-xs py-1 px-2 rounded hover:bg-indigo-700 transition-colors';
          btn.innerText = t.viewOrders;
          btn.onclick = () => {
              setSelectedEntity({ type: 'driver', id: loc.entityId, name: loc.name });
              setIsDetailModalOpen(true);
          };
          container.appendChild(btn);
      } else {
          // Merchandiser Logic
          const info = document.createElement('div');
          info.className = 'text-sm mb-2';
          // Find visits
          const myVisits = visits.filter(v => v.salesManagerId === loc.entityId && v.date === new Date().toISOString().split('T')[0]); // Assuming Merch ID links to SalesManagerID for visits in this mock
          info.innerHTML = `<strong>${myVisits.length}</strong> ${t.storeVisitsForToday}`;
          container.appendChild(info);

          const btn = document.createElement('button');
          btn.className = 'w-full bg-purple-600 text-white text-xs py-1 px-2 rounded hover:bg-purple-700 transition-colors';
          btn.innerText = t.viewRoute;
          btn.onclick = () => {
              setSelectedEntity({ type: 'merchandiser', id: loc.entityId, name: loc.name });
              setIsDetailModalOpen(true);
          };
          container.appendChild(btn);
      }

      marker.bindPopup(container);
      markersRef.current.push(marker);
    });

  }, [liveLocations, filter, stores, lang, orders, visits]);

  const getDetailContent = () => {
      if (!selectedEntity) return null;

      if (selectedEntity.type === 'driver') {
          const driverOrders = orders.filter(o => o.driverId === selectedEntity.id);
          return (
              <div className="space-y-3">
                  {driverOrders.length === 0 ? <p className="text-slate-500">No orders found.</p> : driverOrders.map(o => (
                      <div key={o.id} className="p-3 border rounded-lg flex justify-between items-center bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          <div>
                              <p className="font-bold text-sm">#{o.id}</p>
                              <p className="text-xs text-slate-500">{o.orderDate}</p>
                          </div>
                          <Badge type={o.status === 'delivered' ? 'success' : 'warning'}>{o.status}</Badge>
                      </div>
                  ))}
              </div>
          );
      } else {
          // Merchandiser Details
          // In real app, fetch route plan. Here mock display.
          return (
              <div className="text-center py-8 text-slate-500">
                  <List size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Route details for {selectedEntity.name}</p>
              </div>
          )
      }
  };

  return (
    <div className="h-[calc(100vh-140px)] relative flex flex-col rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-300">
        {/* Map Container */}
        <div ref={mapRef} className="flex-1 w-full bg-slate-100 z-0 relative outline-none" />

        {/* Controls Overlay */}
        <div className="absolute top-4 right-4 z-[400] bg-white dark:bg-slate-900 p-2 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
            <button 
                onClick={() => setFilter('all')}
                className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${filter === 'all' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
                <Filter size={16} /> {t.showAll}
            </button>
            <button 
                onClick={() => setFilter('driver')}
                className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${filter === 'driver' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
                <Truck size={16} /> {t.driversOnly}
            </button>
            <button 
                onClick={() => setFilter('merchandiser')}
                className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${filter === 'merchandiser' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
                <User size={16} /> {t.merchandisersOnly}
            </button>
        </div>

        {/* Info Legend */}
        <div className="absolute bottom-4 left-4 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div> {t.stores}
            </div>
            <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div> {t.driver}
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div> {t.merchandiser}
            </div>
        </div>

        <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={selectedEntity?.name || ''}>
            {getDetailContent()}
        </Modal>
    </div>
  );
};