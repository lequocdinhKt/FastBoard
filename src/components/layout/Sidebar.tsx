

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
    LayoutDashboard, Kanban, List, Users, LogOut, Folder
} from 'lucide-react';
import { NAV_CONFIG } from '../../constants';
import { ViewMode } from '../../types';


const ICON_MAP = {
    dashboard: LayoutDashboard,
    projects: Folder,
    folder: Folder,
    kanban: Kanban,
    list: List,
    team: Users,
};


const LogoIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
        <path d="M7 4H17M7 4V20M7 11H15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="round" />
    </svg>
);


export const Sidebar: React.FC = () => {
    const { state, actions } = useApp();
    const { activeTab, user, isSidebarOpen, isDesktopSidebarOpen, t } = state;
    const { setActiveTab, handleLogout, setIsSidebarOpen, setProfileModalOpen } = actions;

    return (
        <>
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside className={`
        fixed lg:static inset-y-0 left-0 bg-slate-50/50 dark:bg-dark-surface border-r border-slate-200 dark:border-dark-border z-50
        flex flex-col transition-all duration-300 ease-in-out overflow-hidden
        ${isSidebarOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full lg:translate-x-0'}
        ${isDesktopSidebarOpen ? 'lg:w-[260px]' : 'lg:w-0 lg:border-none'}
      `}>
                <div className="p-6 h-20 flex items-center min-w-[260px]">
                    <div className="flex items-center gap-3 text-primary-600 dark:text-primary-400">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                            <LogoIcon />
                        </div>
                        <span className="font-logo font-bold text-xl tracking-tight text-brand dark:text-brand-bright">
                            FASTBOARD
                        </span>
                    </div>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar min-w-[260px]">
                    <p className="px-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('mainMenu')}</p>
                    {NAV_CONFIG.map(item => {
                        const Icon = ICON_MAP[item.iconId as keyof typeof ICON_MAP] || Folder;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id as ViewMode); setIsSidebarOpen(false); }}
                                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group whitespace-nowrap
                  ${isActive
                                        ? 'bg-white dark:bg-white/10 text-primary-700 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-white/10'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                    }
                `}
                            >
                                <Icon size={18} className={isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} />
                                {t(item.id as any)}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 mt-auto min-w-[260px] border-t border-slate-200 dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex items-center gap-3 flex-1 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
                            onClick={() => setProfileModalOpen(true)}
                        >
                            <img src={user.avatar} alt="User" className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/10" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleLogout()}
                            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-all"
                            title={t('logout')}
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};
