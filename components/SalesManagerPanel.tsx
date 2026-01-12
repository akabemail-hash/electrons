import React, { useState, useEffect } from 'react';
import { Map, MapPin, Camera, X, CheckCircle, AlertTriangle, Navigation, Upload, Image as ImageIcon } from 'lucide-react';
import { SalesManager, Store, RoutePlan, Visit, LanguageCode, User } from '../types';
import { TRANSLATIONS } from '../constants';
import { Card, Button, Input, Modal, Badge } from './ui';
import { useToast } from './Toast';

interface SalesManagerPanelProps {
  lang: LanguageCode;
  user: User;
  salesManagers: SalesManager[];
  stores: Store[];
  routePlans: RoutePlan[];
  visits: Visit[];
  onSaveVisit: (visit: Visit) => void;
}

export const SalesManagerPanel: React.FC<SalesManagerPanelProps> = ({
  lang, user, salesManagers, stores, routePlans, visits, onSaveVisit
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  const { addToast } = useToast();
  
  // Find linked sales manager
  const currentSalesManager = salesManagers.find(sm => sm.id === user.linkedEntityId);
  const routePlan = routePlans.find(rp => rp.salesManagerId === currentSalesManager?.id);

  const [currentDay, setCurrentDay] = useState<string>('monday');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [visitType, setVisitType] = useState<'visit' | 'not_visited' | null>(null);
  const [myLocation, setMyLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  
  // Form States
  const [notes, setNotes] = useState('');
  const [visitReason, setVisitReason] = useState('');
  const [imagesBefore, setImagesBefore] = useState<string[]>([]);
  const [imagesAfter, setImagesAfter] = useState<string[]>([]);

  useEffect(() => {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayIndex = new Date().getDay();
      setCurrentDay(days[todayIndex]);
  }, []);

  const todayRoute = routePlan?.days.find(d => d.dayOfWeek === currentDay);
  const todayStores = todayRoute ? stores.filter(s => todayRoute.storeIds.includes(s.id)) : [];

  const handleOpenVisit = (store: Store, type: 'visit' | 'not_visited') => {
      setSelectedStore(store);
      setVisitType(type);
      setNotes('');
      setVisitReason('');
      setImagesBefore([]);
      setImagesAfter([]);
      setDistance(null);
      setMyLocation(null);
      
      if (type === 'visit') {
          getLocation(store);
      }
  };

  const getLocation = (store: Store) => {
      if (!navigator.geolocation) {
          addToast({ type: 'error', message: "Geolocation is not supported by this browser." });
          return;
      }
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
          (position) => {
              const myLat = position.coords.latitude;
              const myLng = position.coords.longitude;
              setMyLocation({ lat: myLat, lng: myLng });
              
              if (store.latitude && store.longitude) {
                  const dist = calculateDistance(myLat, myLng, parseFloat(store.latitude), parseFloat(store.longitude));
                  setDistance(dist);
              }
              setLocationLoading(false);
          },
          (error) => {
              console.error("Error getting location", error);
              addToast({ type: 'error', message: t.locationError });
              setLocationLoading(false);
          }
      );
  };

  // Haversine formula to calculate distance in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371e3; // metres
      const φ1 = lat1 * Math.PI/180; // φ, λ in radians
      const φ2 = lat2 * Math.PI/180;
      const Δφ = (lat2-lat1) * Math.PI/180;
      const Δλ = (lon2-lon1) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      return Math.round(R * c);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64String = reader.result as string;
              if (type === 'before') {
                  if (imagesBefore.length < 10) setImagesBefore([...imagesBefore, base64String]);
              } else {
                  if (imagesAfter.length < 10) setImagesAfter([...imagesAfter, base64String]);
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmit = () => {
      if (!selectedStore || !currentSalesManager) return;

      const newVisit: Visit = {
          id: Math.random().toString(36).substr(2, 9),
          storeId: selectedStore.id,
          salesManagerId: currentSalesManager.id,
          date: new Date().toISOString().split('T')[0],
          status: visitType === 'visit' ? 'visited' : 'not_visited',
          notes: visitType === 'visit' ? notes : undefined,
          visitReason: visitType === 'not_visited' ? visitReason : undefined,
          location: visitType === 'visit' && myLocation ? {
              latitude: myLocation.lat,
              longitude: myLocation.lng,
              distanceToStore: distance || 0
          } : undefined,
          imagesBefore,
          imagesAfter
      };

      onSaveVisit(newVisit);
      setSelectedStore(null);
      setVisitType(null);
  };

  if (!currentSalesManager) {
      return (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <AlertTriangle size={48} className="mb-2" />
              <p>User account not linked to a Sales Manager profile.</p>
          </div>
      );
  }

  return (
    <div className="animate-in fade-in duration-300 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Map className="text-indigo-500" />
          {t.todayRoute}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1 capitalize">{t[currentDay]}</p>
      </div>

      {todayStores.length === 0 ? (
          <Card className="p-8 text-center text-slate-500">
              <MapPin size={48} className="mx-auto mb-4 opacity-50" />
              <p>{t.noRouteToday}</p>
          </Card>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todayStores.map(store => {
                  const visit = visits.find(v => v.storeId === store.id && v.date === new Date().toISOString().split('T')[0]);
                  
                  return (
                      <Card key={store.id} className="flex flex-col h-full border-l-4 border-l-indigo-500">
                          <div className="p-5 flex-1">
                              <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-bold text-slate-800 dark:text-white">{store.name}</h3>
                                  {visit && (
                                      <Badge type={visit.status === 'visited' ? 'success' : 'warning'}>
                                          {visit.status === 'visited' ? t.visited : t.notVisited}
                                      </Badge>
                                  )}
                              </div>
                              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-4">
                                  <MapPin size={14} /> {store.location}
                              </p>
                              
                              {!visit ? (
                                  <div className="grid grid-cols-2 gap-2 mt-4">
                                      <Button onClick={() => handleOpenVisit(store, 'visit')} className="w-full text-xs" variant="primary">
                                          <CheckCircle size={14} /> {t.visitStore}
                                      </Button>
                                      <Button onClick={() => handleOpenVisit(store, 'not_visited')} className="w-full text-xs" variant="secondary">
                                          <X size={14} /> {t.notVisited}
                                      </Button>
                                  </div>
                              ) : (
                                  <div className="mt-4 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                                      {visit.status === 'visited' ? (
                                          <>
                                            <p className="font-semibold">{t.notes}:</p> 
                                            <p className="truncate">{visit.notes || '-'}</p>
                                          </>
                                      ) : (
                                          <>
                                            <p className="font-semibold">{t.visitReason}:</p>
                                            <p className="truncate">{visit.visitReason || '-'}</p>
                                          </>
                                      )}
                                  </div>
                              )}
                          </div>
                      </Card>
                  );
              })}
          </div>
      )}

      {/* Visit Modal */}
      <Modal isOpen={!!selectedStore && visitType === 'visit'} onClose={() => setSelectedStore(null)} title={`${t.visitStore}: ${selectedStore?.name}`}>
          <div className="space-y-6">
              {/* Location Check */}
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                      <Navigation size={16} className="text-indigo-500" />
                      {t.distance} Check
                  </h4>
                  <div className="flex flex-col gap-2 text-sm">
                      <div className="flex justify-between">
                          <span className="text-slate-500">{t.storeLocation}:</span>
                          <span className="font-mono">{selectedStore?.latitude}, {selectedStore?.longitude}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-slate-500">{t.myLocation}:</span>
                          {locationLoading ? (
                              <span className="animate-pulse">{t.calculating}</span>
                          ) : (
                              <span className="font-mono">{myLocation ? `${myLocation.lat.toFixed(4)}, ${myLocation.lng.toFixed(4)}` : '-'}</span>
                          )}
                      </div>
                      {distance !== null && (
                          <div className={`flex justify-between items-center mt-2 p-2 rounded ${distance < 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                              <span className="font-bold">{t.distance}: {distance}m</span>
                              <span className="text-xs font-bold uppercase">{distance < 100 ? t.withinRange : t.outOfRange}</span>
                          </div>
                      )}
                      {!myLocation && !locationLoading && (
                          <Button onClick={() => selectedStore && getLocation(selectedStore)} variant="secondary" className="mt-2 text-xs">
                              {t.getLocation}
                          </Button>
                      )}
                  </div>
              </div>

              {/* Notes */}
              <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.notes}</label>
                  <textarea 
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                  />
              </div>

              {/* Images */}
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.beforeImages}</label>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                          {imagesBefore.map((img, idx) => (
                              <img key={idx} src={img} className="w-full h-16 object-cover rounded bg-slate-200" alt="Before" />
                          ))}
                      </div>
                      <label className="cursor-pointer flex items-center justify-center w-full h-10 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors">
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'before')} disabled={imagesBefore.length >= 10} />
                          <Camera size={18} className="text-slate-400" />
                      </label>
                      <p className="text-[10px] text-slate-400 mt-1 text-center">{imagesBefore.length}/10</p>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.afterImages}</label>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                          {imagesAfter.map((img, idx) => (
                              <img key={idx} src={img} className="w-full h-16 object-cover rounded bg-slate-200" alt="After" />
                          ))}
                      </div>
                      <label className="cursor-pointer flex items-center justify-center w-full h-10 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors">
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'after')} disabled={imagesAfter.length >= 10} />
                          <Camera size={18} className="text-slate-400" />
                      </label>
                      <p className="text-[10px] text-slate-400 mt-1 text-center">{imagesAfter.length}/10</p>
                  </div>
              </div>

              <div className="flex justify-end pt-4">
                  <Button onClick={handleSubmit}>{t.submitVisit}</Button>
              </div>
          </div>
      </Modal>

      {/* Not Visited Modal */}
      <Modal isOpen={!!selectedStore && visitType === 'not_visited'} onClose={() => setSelectedStore(null)} title={`${t.notVisited}: ${selectedStore?.name}`}>
          <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.visitReason}</label>
                  <textarea 
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      rows={4}
                      value={visitReason}
                      onChange={(e) => setVisitReason(e.target.value)}
                      placeholder="e.g., Shop closed, Manager unavailable..."
                  />
              </div>
              <div className="flex justify-end pt-4">
                  <Button onClick={handleSubmit} variant="danger">{t.submitVisit}</Button>
              </div>
          </div>
      </Modal>
    </div>
  );
};