

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-20b';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

export const assertAuthenticated = (request: Request): void => {
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    throw new HttpError(401, 'Authentication required');
  }
};

export const readRequiredText = (
  value: unknown,
  fieldName: string,
  maxLength: number,
): string => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, `${fieldName} is required`);
  }

  return value.trim().slice(0, maxLength);
};

export const callGroq = async (prompt: string): Promise<string> => {
  const apiKey = Deno.env.get('GROQ_API_KEY');
  if (!apiKey) {
    throw new HttpError(500, 'AI service is not configured');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    console.error('Groq request failed', response.status, await response.text());
    throw new HttpError(502, 'AI provider request failed');
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new HttpError(502, 'AI provider returned an empty response');
  }

  return content.trim();
};

export const handleFunctionError = (error: unknown): Response => {
  if (error instanceof HttpError) {
    return jsonResponse({ error: error.message }, error.status);
  }

  console.error('Unexpected AI function error', error);
  return jsonResponse({ error: 'Unexpected AI service error' }, 500);
};
