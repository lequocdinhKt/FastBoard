

import { useState, useMemo } from 'react';
import { Task, FilterState } from '../../types';


export const useSearchSystem = (tasks: Task[]) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    priority: 'ALL',
    assigneeId: 'ALL'
  });

  
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const searchMatch = 
        t.title.toLowerCase().includes(filters.search.toLowerCase()) || 
        t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));
      
      if (!searchMatch) return false;
      if (filters.priority !== 'ALL' && t.priority !== filters.priority) return false;
      if (filters.assigneeId !== 'ALL' && t.assigneeId !== filters.assigneeId) return false;

      return true;
    });
  }, [tasks, filters]);

  return {
    filters, setFilters,
    filteredTasks
  };
};
