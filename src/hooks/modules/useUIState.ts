

import { useState, useEffect } from 'react';
import { ViewMode, ToastMessage, Language, TaskStatus, Task, Project, User } from '../../types';
import { translations } from '../../translations';


export const useUIState = () => {
  const [activeTab, setActiveTab] = useState<ViewMode>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('FASTBOARD-theme') === 'dark'; } catch { return false; }
  });
  
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('FASTBOARD-lang');
      if (stored === 'vi' || stored === 'en') return stored;
      return 'vi';
    } catch {
      return 'vi';
    }
  });

  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isMemberModalOpen, setMemberModalOpen] = useState(false); 
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>(TaskStatus.TODO);

  const [showNotifications, setShowNotifications] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  
  useEffect(() => {
    localStorage.setItem('FASTBOARD-theme', darkMode ? 'dark' : 'light');
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  
  useEffect(() => {
    localStorage.setItem('FASTBOARD-lang', language);
  }, [language]);

  
  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
  };

  
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  
  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || key;
  };

  return {
    state: {
      activeTab, isLoading, isSidebarOpen, isDesktopSidebarOpen, darkMode, language,
      isTaskModalOpen, isProfileModalOpen, isMemberModalOpen, isProjectModalOpen,
      selectedProject, selectedMember, editingTask, editingMember, editingProject,
      newTaskStatus, showNotifications, toasts, t
    },
    actions: {
      setActiveTab, setIsLoading, setIsSidebarOpen, setIsDesktopSidebarOpen, setDarkMode, setLanguage,
      setTaskModalOpen, setProfileModalOpen, setMemberModalOpen, setProjectModalOpen,
      setSelectedProject, setSelectedMember, setEditingTask, setEditingMember, setEditingProject,
      setNewTaskStatus, setShowNotifications, addToast, removeToast
    }
  };
};
