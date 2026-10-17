

import { supabase } from './supabaseClient';
import { Priority } from '../types';

interface GenerateSubtasksResponse {
  subtasks?: unknown;
  error?: string;
}

interface SuggestPriorityResponse {
  priority?: unknown;
  error?: string;
}

const functionError = (fallback: string, error?: string): Error =>
  new Error(error || fallback);

export const generateSubtasks = async (
  title: string,
  description: string,
): Promise<string[]> => {
  const { data, error } = await supabase.functions.invoke<GenerateSubtasksResponse>(
    'generate-subtasks',
    { body: { title, description } },
  );

  if (error) throw functionError('Unable to generate subtasks', error.message);
  if (data?.error) throw functionError('Unable to generate subtasks', data.error);
  if (!Array.isArray(data?.subtasks) || !data.subtasks.every((item) => typeof item === 'string')) {
    throw functionError('AI returned an invalid subtask list');
  }

  return data.subtasks;
};

export const suggestPriority = async (
  title: string,
  description: string,
): Promise<Priority> => {
  const { data, error } = await supabase.functions.invoke<SuggestPriorityResponse>(
    'suggest-priority',
    { body: { title, description } },
  );

  if (error) throw functionError('Unable to suggest priority', error.message);
  if (data?.error) throw functionError('Unable to suggest priority', data.error);
  if (!Object.values(Priority).includes(data?.priority as Priority)) {
    throw functionError('AI returned an invalid priority');
  }

  return data.priority as Priority;
};
