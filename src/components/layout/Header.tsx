

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';

import { HeaderClock } from './header/HeaderClock';
import { HeaderLanguage } from './header/HeaderLanguage';
import { HeaderControls, SidebarToggle } from './header/HeaderControls';


export const Header: React.FC = () => {
    const { state, actions } = useApp();
    const { t } = state;

    return (
        <header className="h-16 px-4 md:px-6 xl:px-8 flex items-center justify-between sticky top-0 z-30 bg-white dark:bg-dark-surface border-b border-slate-200 dark:border-dark-border transition-all">
            <div className="flex items-center gap-4">
                <SidebarToggle />
                <HeaderClock />
            </div>

            <div className="flex items-center gap-3 md:gap-4">
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

                <HeaderLanguage />
                <HeaderControls />

                <Button onClick={() => actions.openNewTaskModal()} className="hidden md:flex" icon={<Plus size={16} />}>
                    {t('newTask')}
                </Button>
            </div>
        </header>
    );
};
