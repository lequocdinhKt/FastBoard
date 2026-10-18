

import {
  assertAuthenticated,
  callGroq,
  corsHeaders,
  handleFunctionError,
  HttpError,
  jsonResponse,
  readRequiredText,
} from '../_shared/groq.ts';

const priorities = ['LOW', 'MEDIUM', 'HIGH'] as const;

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
Analyze this software task and suggest its priority.
Return only one word: LOW, MEDIUM, or HIGH.
Use HIGH for urgent, blocking, security, or production-critical work.
Use LOW for cosmetic or non-urgent work. Otherwise use MEDIUM.

Task title: ${title}
Task description: ${description || '(not provided)'}
`);

    const candidate = text.trim().toUpperCase();
    const priority = priorities.find((value) => candidate.includes(value)) ?? 'MEDIUM';
    return jsonResponse({ priority });
  } catch (error) {
    return handleFunctionError(error);
  }
});
