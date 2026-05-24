import type { VercelRequest, VercelResponse } from '@vercel/node';
import serverless from 'serverless-http';

type ServerlessHandler = ReturnType<typeof serverless>;

let handler: ServerlessHandler | null = null;

export default async function vercelHandler(req: VercelRequest, res: VercelResponse) {
  if (!handler) {
    process.env.VERCEL = '1';
    const { createApp } = await import('../server');
    const app = await createApp();
    handler = serverless(app, {
      binary: ['image/*', 'application/octet-stream', 'multipart/form-data'],
    });
  }
  return handler(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 60,
};
