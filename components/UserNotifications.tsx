import React, { useState } from 'react';
import { Bell, Check, MailOpen } from 'lucide-react';
import { Notification, LanguageCode } from '../types';
import { TRANSLATIONS } from '../constants';
import { Card, Badge, Button } from './ui';

interface UserNotificationsProps {
  notifications: (Notification & { isRead: boolean })[];
  lang: LanguageCode;
  onMarkAsRead: (id: string) => void;
}

export const UserNotifications: React.FC<UserNotificationsProps> = ({ notifications, lang, onMarkAsRead }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Bell className="text-indigo-500" />
            {t.notifications}
          </h2>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setFilter('all')} 
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
                {t.allUsers}
            </button>
            <button 
                onClick={() => setFilter('unread')} 
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'unread' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
                {t.unread}
            </button>
            <button 
                onClick={() => setFilter('read')} 
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'read' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
                {t.read}
            </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <MailOpen size={48} className="mx-auto mb-4 opacity-50" />
                <p>{t.noNotifications}</p>
            </div>
        ) : (
            filteredNotifications.map(notification => (
                <Card key={notification.id} className={`p-5 flex gap-4 ${!notification.isRead ? 'border-l-4 border-l-indigo-500' : ''}`}>
                    <div className={`mt-1 p-2 rounded-full h-fit ${!notification.isRead ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                        <Bell size={20} />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className={`font-semibold ${!notification.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                {notification.title}
                            </h3>
                            <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                                {notification.createdAt}
                            </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                            {notification.message}
                        </p>
                        {!notification.isRead && (
                            <button 
                                onClick={() => onMarkAsRead(notification.id)}
                                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                            >
                                <Check size={14} />
                                {t.markAsRead}
                            </button>
                        )}
                    </div>
                </Card>
            ))
        )}
      </div>
    </div>
  );
};