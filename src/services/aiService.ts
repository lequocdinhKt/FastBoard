

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

/** Chuẩn hóa lỗi từ Edge Function với thông báo dự phòng. */
const functionError = (fallback: string, error?: string): Error =>
  new Error(error || fallback);

/** Gọi Edge Function để sinh các công việc con và kiểm tra kiểu dữ liệu trả về. */
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

/** Gọi Edge Function để đề xuất mức ưu tiên và xác thực giá trị trả về. */
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
