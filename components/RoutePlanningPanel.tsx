import React, { useState } from 'react';
import { Map, Plus, Save, Trash2, Calendar } from 'lucide-react';
import { SalesManager, Store, RoutePlan, LanguageCode } from '../types';
import { TRANSLATIONS } from '../constants';
import { Card, Button, SearchableSelect } from './ui';
import { useToast } from './Toast';

interface RoutePlanningPanelProps {
  lang: LanguageCode;
  salesManagers: SalesManager[];
  stores: Store[];
  routePlans: RoutePlan[];
  onSaveRoutePlan: (plan: RoutePlan) => void;
}

const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
] as const;

export const RoutePlanningPanel: React.FC<RoutePlanningPanelProps> = ({
  lang, salesManagers, stores, routePlans, onSaveRoutePlan
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  const { addToast } = useToast();
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');
  const [currentPlan, setCurrentPlan] = useState<Record<string, string[]>>({
    monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
  });

  const managerOptions = salesManagers.map(sm => ({ value: sm.id, label: sm.name }));
  const storeOptions = stores.map(s => ({ value: s.id, label: s.name }));

  // Load existing plan when manager is selected
  const handleManagerSelect = (managerId: string) => {
    setSelectedManagerId(managerId);
    const existingPlan = routePlans.find(rp => rp.salesManagerId === managerId);
    
    if (existingPlan) {
      const planMap: Record<string, string[]> = {
        monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
      };
      existingPlan.days.forEach(d => {
        planMap[d.dayOfWeek] = d.storeIds;
      });
      setCurrentPlan(planMap);
    } else {
      // Reset if no plan exists
      setCurrentPlan({
        monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
      });
    }
  };

  const addStoreToDay = (day: string, storeId: string) => {
    if (!storeId) return;
    setCurrentPlan(prev => {
      const currentStores = prev[day];
      if (currentStores.includes(storeId)) return prev;
      return { ...prev, [day]: [...currentStores, storeId] };
    });
  };

  const removeStoreFromDay = (day: string, storeId: string) => {
    setCurrentPlan(prev => ({
      ...prev,
      [day]: prev[day].filter(id => id !== storeId)
    }));
  };

  const handleSave = () => {
    if (!selectedManagerId) {
      addToast({ type: 'warning', message: t.selectManagerFirst });
      return;
    }

    const plan: RoutePlan = {
      id: routePlans.find(rp => rp.salesManagerId === selectedManagerId)?.id || Math.random().toString(),
      salesManagerId: selectedManagerId,
      title: "Weekly Route",
      days: DAYS_OF_WEEK.map(day => ({
        dayOfWeek: day,
        storeIds: currentPlan[day]
      })).filter(d => d.storeIds.length > 0)
    };

    onSaveRoutePlan(plan);
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Map className="text-indigo-500" />
            {t.routePlanning}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t.routePlanningDesc}</p>
        </div>
        <div className="w-72">
            <SearchableSelect 
                placeholder={t.selectSalesManager}
                options={managerOptions}
                value={selectedManagerId}
                onChange={handleManagerSelect}
            />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {DAYS_OF_WEEK.map(day => (
          <Card key={day} className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-t-xl flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 dark:text-white capitalize flex items-center gap-2">
                <Calendar size={16} className="text-indigo-500" />
                {t[day]}
              </h3>
              <span className="text-xs font-medium bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">
                {currentPlan[day].length}
              </span>
            </div>
            
            <div className="p-4 flex-1 space-y-2 max-h-60 overflow-y-auto">
              {currentPlan[day].length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-sm italic">No stores assigned</div>
              ) : (
                currentPlan[day].map(storeId => {
                  const store = stores.find(s => s.id === storeId);
                  return (
                    <div key={storeId} className="flex justify-between items-center p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg shadow-sm group">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate pr-2">
                        {store?.name || 'Unknown Store'}
                      </span>
                      <button 
                        onClick={() => removeStoreFromDay(day, storeId)}
                        className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl">
               <div className="flex gap-2">
                   <div className="flex-1">
                       <SearchableSelect 
                            placeholder={t.addStoreToDay}
                            options={storeOptions.filter(opt => !currentPlan[day].includes(opt.value))} // Filter out already added
                            value=""
                            onChange={(val) => addStoreToDay(day, val)}
                       />
                   </div>
               </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} disabled={!selectedManagerId} className="w-full md:w-auto">
              <Save size={18} />
              {t.savePlan}
          </Button>
      </div>
    </div>
  );
};