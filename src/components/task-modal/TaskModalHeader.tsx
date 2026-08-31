

import React from 'react';
import { X } from 'lucide-react';
import { TaskModalHeaderProps } from '../../types';
import { useApp } from '../../context/AppContext';


export const TaskModalHeader: React.FC<TaskModalHeaderProps> = ({ task, onClose }) => {
  const { state } = useApp();
  const { t } = state;
  return (
    <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          {task ? t('edit') : t('newTask')}
        </h2>
        <div className="flex items-center gap-3">
           <p className="text-sm text-slate-500 dark:text-slate-400">
              {task ? `ID: ${task.id}` : t('newItemPlaceholder')}
           </p>
        </div>
      </div>
      <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
        <X size={20} />
      </button>
    </div>
  );
};
