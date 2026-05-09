import { get } from '@vercel/edge-config';

const fallbackGreeting =
  process.env.WELCOME_GREETING || 'Welcome to KFUPM Marketplace';

export async function getWelcomeGreeting() {
  if (!process.env.EDGE_CONFIG) {
    return fallbackGreeting;
  }

  try {
    const greeting = await get('greeting');
    return greeting ?? fallbackGreeting;
  } catch (error) {
    console.error('Could not read greeting from Edge Config.', error);
    return fallbackGreeting;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed for this route.' });
  }

  const greeting = await getWelcomeGreeting();
  return res.status(200).json(greeting);
}
