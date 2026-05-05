import { handleStoreRoute } from './store.js';

export default function handler(req, res) {
  return handleStoreRoute(req, res, 'reviews');
}
