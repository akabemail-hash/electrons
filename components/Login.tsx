import React, { useState, useRef, useEffect } from 'react';
import { Lock, Mail, ChevronDown, Check, Sun, Moon, ShoppingBag } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { LanguageCode } from '../types';
import { Button, Input } from './ui';

interface LoginProps {
  lang: LanguageCode;
  theme: 'light' | 'dark';
  onLogin: (coords?: {lat: number, lng: number}) => void;
  setLang: (l: LanguageCode) => void;
  toggleTheme: () => void;
}

export const Login: React.FC<LoginProps> = ({ lang, theme, onLogin, setLang, toggleTheme }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  const [loading, setLoading] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Attempt to get location before logging in
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLoading(false);
                onLogin({ lat: position.coords.latitude, lng: position.coords.longitude });
            },
            (error) => {
                console.warn("Location access denied or error:", error);
                setLoading(false);
                onLogin(); // Login anyway without location
            },
            { timeout: 5000 }
        );
    } else {
        setTimeout(() => {
            setLoading(false);
            onLogin();
        }, 800);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages: { code: LanguageCode; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  ];

  const currentLang = languages.find(l => l.code === lang);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      
      {/* Left Side - Hero / Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 items-center justify-center p-12">
         {/* Background Decoration */}
         <div className="absolute inset-0 z-0">
             <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-indigo-600/30 rounded-full blur-[120px]"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-teal-600/20 rounded-full blur-[100px]"></div>
         </div>
         
         <div className="relative z-10 text-center max-w-xl">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-8 transform -rotate-6">
                 <ShoppingBag className="text-white w-10 h-10" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">ElectroGlobal</h1>
            <p className="text-slate-300 text-lg leading-relaxed">
                {t.loginHeroDesc}
            </p>
         </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 relative">
         
         {/* Top Controls */}
         <div className="absolute top-6 right-6 flex items-center gap-3">
             <button 
                onClick={toggleTheme}
                className="p-2.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all"
             >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
             </button>

             <div className="relative" ref={langDropdownRef}>
                <button 
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                >
                    <span className="text-lg leading-none">{currentLang?.flag}</span>
                    <span className="text-sm">{currentLang?.label}</span>
                    <ChevronDown size={16} className={`ml-1 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>

                {isLangOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                        {languages.map((l) => (
                            <button
                                key={l.code}
                                onClick={() => {
                                    setLang(l.code);
                                    setIsLangOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <span className="text-xl">{l.flag}</span>
                                <span className={`text-sm font-medium flex-1 ${lang === l.code ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {l.label}
                                </span>
                                {lang === l.code && <Check size={16} className="text-indigo-600 dark:text-indigo-400" />}
                            </button>
                        ))}
                    </div>
                )}
             </div>
         </div>

         <div className="w-full max-w-md">
             <div className="mb-10 text-center lg:text-left">
                 <div className="lg:hidden w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-6">
                    <ShoppingBag className="text-white w-8 h-8" />
                 </div>
                 <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t.loginTitle}</h2>
                 <p className="text-slate-500 dark:text-slate-400">
                    {t.loginSubtitle || "Enter your credentials to access the dashboard."}
                 </p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">{t.email}</label>
                     <div className="relative group">
                        <Mail className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                            type="email" 
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                            placeholder="admin@electro.com"
                            required
                        />
                     </div>
                 </div>

                 <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">{t.password}</label>
                     <div className="relative group">
                        <Lock className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                            type="password" 
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                            placeholder="••••••••"
                            required
                        />
                     </div>
                 </div>

                 <Button type="submit" className="w-full py-3.5 text-lg shadow-lg shadow-indigo-500/20 dark:shadow-indigo-900/40 hover:shadow-indigo-500/30 mt-4 rounded-xl">
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Getting Location...
                        </span>
                    ) : t.loginBtn}
                 </Button>
             </form>
             
             <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-600">
                {t.copyright}
             </p>
         </div>
      </div>
    </div>
  );
};