

import {
  assertAuthenticated,
  callGroq,
  corsHeaders,
  handleFunctionError,
  HttpError,
  jsonResponse,
  readRequiredText,
} from '../_shared/groq.ts';

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (request.method !== 'POST') {
      throw new HttpError(405, 'Method not allowed');
    }

    assertAuthenticated(request);
    const body = await request.json();
    const title = readRequiredText(body?.title, 'title', 300);
    const description = typeof body?.description === 'string'
      ? body.description.trim().slice(0, 4_000)
      : '';

    const text = await callGroq(`
Break down this software task into 3 to 5 concise, actionable subtasks.
Return only a raw JSON array of strings. Do not use markdown.

Task title: ${title}
Task description: ${description || '(not provided)'}
`);

    const cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) {
      throw new HttpError(502, 'AI provider returned an invalid subtask list');
    }

    const subtasks = parsed
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 5);

    if (subtasks.length === 0) {
      throw new HttpError(502, 'AI provider returned no valid subtasks');
    }

    return jsonResponse({ subtasks });
  } catch (error) {
    return handleFunctionError(error);
  }
});
