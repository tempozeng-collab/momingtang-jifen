// Generate some helper responses
export function json(data: any, status = 200, extraHeaders: Record<string, string> = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...extraHeaders };
  return new Response(JSON.stringify(data), { status, headers });
}

export function error(message: string, code: string, status = 400) {
  return json({ error: message, code }, status);
}
