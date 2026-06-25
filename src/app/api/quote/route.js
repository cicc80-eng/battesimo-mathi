import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const KV_KEY = 'battesimo_mathi_quote'

const DEFAULT_QUOTE = {
  pranzo_adulto: 35,
  pranzo_bambino: 18,
  bomboniera_adulto: 12,
  bomboniera_bambino: 8,
}

export async function GET() {
  try {
    const data = await redis.get(KV_KEY)
    return Response.json(data ?? DEFAULT_QUOTE)
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    await redis.set(KV_KEY, body)
    return Response.json({ ok: true })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
