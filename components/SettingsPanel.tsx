import React, { useState } from 'react';
import { Settings, Sliders, Globe, CreditCard, Palette, Type, Database } from 'lucide-react';
import { SystemSettings, LanguageCode, ColorTheme, FontSize } from '../types';
import { TRANSLATIONS } from '../constants';
import { Card, Button, Input } from './ui';
import { useToast } from './Toast';

interface SettingsPanelProps {
  lang: LanguageCode;
  settings: SystemSettings;
  onSave: (settings: SystemSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ lang, settings, onSave }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'general' | 'api'>('general');
  const [localSettings, setLocalSettings] = useState<SystemSettings>(settings);

  const handleSave = () => {
    onSave(localSettings);
    addToast({ type: 'success', message: t.settingsSaved });
  };

  const colors: { value: ColorTheme; label: string; class: string }[] = [
    { value: 'indigo', label: t.indigo, class: 'bg-indigo-500' },
    { value: 'blue', label: t.blue, class: 'bg-blue-500' },
    { value: 'emerald', label: t.emerald, class: 'bg-emerald-500' },
    { value: 'rose', label: t.rose, class: 'bg-rose-500' },
    { value: 'amber', label: t.amber, class: 'bg-amber-500' },
  ];

  const fontSizes: { value: FontSize; label: string }[] = [
    { value: 'small', label: t.small },
    { value: 'medium', label: t.medium },
    { value: 'large', label: t.large },
  ];

  const currencies = ['USD', 'AZN', 'EUR', 'TRY', 'RUB'];

  return (
    <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="text-primary-500" />
          {t.settings}
        </h2>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'general'
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sliders size={18} />
            {t.generalSettings}
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'api'
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Database size={18} />
            {t.apiIntegration}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          <Card className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-8">
                {/* Appearance */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Palette size={20} className="text-primary-500" />
                    {t.appearance}
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{t.systemColor}</label>
                      <div className="flex gap-3 flex-wrap">
                        {colors.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setLocalSettings({ ...localSettings, primaryColor: color.value })}
                            className={`w-10 h-10 rounded-full ${color.class} flex items-center justify-center transition-transform hover:scale-110 focus:outline-none ring-offset-2 dark:ring-offset-slate-900 ${
                              localSettings.primaryColor === color.value ? 'ring-2 ring-slate-400 dark:ring-slate-500 scale-110' : ''
                            }`}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{t.fontSize}</label>
                      <div className="flex gap-2">
                        {fontSizes.map((size) => (
                          <button
                            key={size.value}
                            onClick={() => setLocalSettings({ ...localSettings, fontSize: size.value })}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                              localSettings.fontSize === size.value
                                ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-300'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                            }`}
                          >
                            {size.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Regional */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Globe size={20} className="text-primary-500" />
                    Regional
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.currency}</label>
                    <select
                      value={localSettings.currency}
                      onChange={(e) => setLocalSettings({ ...localSettings, currency: e.target.value })}
                      className="w-full md:w-48 px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <CreditCard size={20} className="text-primary-500" />
                    {t.apiIntegration}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Configure external services and API keys. These keys are stored locally for demonstration.
                  </p>
                  
                  <div className="space-y-4">
                    <Input 
                      label="Google Maps API Key" 
                      type="password"
                      placeholder="AIza..." 
                      value={localSettings.apiConfig.googleMapsKey}
                      onChange={(e) => setLocalSettings({ ...localSettings, apiConfig: { ...localSettings.apiConfig, googleMapsKey: e.target.value } })}
                    />
                    <Input 
                      label="Payment Gateway Key (Stripe/PayPal)" 
                      type="password"
                      placeholder="pk_test_..." 
                      value={localSettings.apiConfig.paymentGatewayKey}
                      onChange={(e) => setLocalSettings({ ...localSettings, apiConfig: { ...localSettings.apiConfig, paymentGatewayKey: e.target.value } })}
                    />
                    <Input 
                      label="SMS Provider Key" 
                      type="password"
                      placeholder="key_..." 
                      value={localSettings.apiConfig.smsProviderKey}
                      onChange={(e) => setLocalSettings({ ...localSettings, apiConfig: { ...localSettings.apiConfig, smsProviderKey: e.target.value } })}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
              <Button onClick={handleSave}>
                {t.saveSettings}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};