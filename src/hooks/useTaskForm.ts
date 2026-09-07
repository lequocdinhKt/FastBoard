

import React, { useState, useEffect } from 'react';
import { Task, Priority, TaskStatus, Subtask, Comment, UseTaskFormProps } from '../types';
import { generateSubtasks, suggestPriority } from '../services/aiService';
import { useApp } from '../context/AppContext';


export const useTaskForm = ({
  isOpen, task, currentUser, projects, defaultStatus, onSave, onDelete
}: UseTaskFormProps) => {
  const { actions } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'subtasks' | 'comments'>('details');

  
  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setStatus(task.status);
        setPriority(task.priority);
        setProjectId(task.projectId);
        setAssigneeId(task.assigneeId || '');
        setDueDate(task.dueDate.split('T')[0]);
        setSubtasks(task.subtasks || []);
        setComments(task.comments || []);
      } else {
        setTitle('');
        setDescription('');
        setStatus(defaultStatus || TaskStatus.TODO);
        setPriority(Priority.MEDIUM);
        setProjectId(projects[0]?.id || '');
        setAssigneeId(currentUser.id);
        setDueDate(new Date().toISOString().split('T')[0]);
        setSubtasks([]);
        setComments([]);
      }
      setActiveTab('details');
      setNewComment('');
    }
  }, [isOpen, task, defaultStatus, projects, currentUser]);

  
  const handleSubmit = () => {
    const updatedTask: Task = {
      id: task?.id || Math.random().toString(36).substr(2, 9),
      title,
      description,
      status,
      priority,
      projectId,
      assigneeId,
      dueDate: new Date(dueDate).toISOString(),
      tags: [], 
      subtasks,
      comments,
      createdAt: task?.createdAt || new Date().toISOString(),
      completedAt: task?.completedAt
    };
    onSave(updatedTask);
  };

  
  const handleDelete = () => {
    if (task && onDelete && window.confirm("Are you sure you want to delete this task?")) {
      onDelete(task.id);
    }
  };

  
  const addSubtask = () => {
    setSubtasks([...subtasks, { id: Math.random().toString(), title: 'New Subtask', completed: false }]);
  };

  
  const updateSubtask = (id: string, updates: Partial<Subtask>) => {
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  
  const deleteSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  
  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Math.random().toString(),
      userId: currentUser.id,
      text: newComment,
      createdAt: new Date().toISOString()
    };
    setComments([...comments, comment]);
    setNewComment('');
  };

  
  const handleAISubtasks = async () => {
    if (!title.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const generated = await generateSubtasks(title, description);
      const suggestedSubtasks: Subtask[] = generated.map((subtaskTitle) => ({
        id: crypto.randomUUID(),
        title: subtaskTitle,
        completed: false,
      }));
      setSubtasks((current) => [...current, ...suggestedSubtasks]);
      setActiveTab('subtasks');
    } catch (error) {
      console.error('Failed to generate subtasks', error);
      actions.addToast('error', error instanceof Error ? error.message : 'Unable to generate subtasks');
    } finally {
      setIsGenerating(false);
    }
  };

  
  const handleAIPriority = async () => {
    if (!title.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      setPriority(await suggestPriority(title, description));
    } catch (error) {
      console.error('Failed to suggest priority', error);
      actions.addToast('error', error instanceof Error ? error.message : 'Unable to suggest priority');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    formState: {
      title, setTitle, description, setDescription, status, setStatus,
      priority, setPriority, projectId, setProjectId, assigneeId, setAssigneeId,
      dueDate, setDueDate, subtasks, comments, newComment, setNewComment
    },
    uiState: {
      isGenerating, activeTab, setActiveTab
    },
    handlers: {
      handleSubmit, handleDelete, addSubtask, updateSubtask, deleteSubtask,
      addComment, handleAISubtasks, handleAIPriority
    }
  };
};
