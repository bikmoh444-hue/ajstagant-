import 'server-only';
import { createHash } from 'node:crypto';

const WINDOW_MS = 15 * 60 * 1000;
const LIMIT = 5;
const MAX_KEYS = 10_000;
interface Bucket { count: number; expires: number }
const buckets = new Map<string, Bucket>();

export function contactRateLimit(headers: Headers, now = Date.now()): { allowed: boolean; retryAfter: number } {
  // Ne faire confiance aux IP transmises que derrière un proxy maîtrisé.
  const source = process.env.CONTACT_TRUST_PROXY === 'true'
    ? headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'shared'
    : 'shared';
  const key = createHash('sha256').update(source).digest('hex');
  for (const [id, bucket] of buckets) if (bucket.expires <= now) buckets.delete(id);
  let bucket = buckets.get(key);
  if (!bucket) {
    // Refuser plutôt que supprimer un quota actif en cas de saturation.
    if (buckets.size >= MAX_KEYS) return { allowed: false, retryAfter: Math.ceil(WINDOW_MS / 1000) };
    bucket = { count: 0, expires: now + WINDOW_MS };
    buckets.set(key, bucket);
  }
  if (bucket.count >= LIMIT) return { allowed: false, retryAfter: Math.max(1, Math.ceil((bucket.expires - now) / 1000)) };
  bucket.count += 1;
  return { allowed: true, retryAfter: 0 };
}
