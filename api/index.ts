// Vercel Serverless Function entry point for /api routes
import { handleMockApiRequest } from '../src/lib/mockEngine.js';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const endpoint = (req.url || '').replace(/^\/api/, '');
  const method = req.method || 'GET';
  const body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;

  try {
    const result = handleMockApiRequest(endpoint, {
      method,
      headers: req.headers,
      body
    });

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Internal Server Error'
    });
  }
}
