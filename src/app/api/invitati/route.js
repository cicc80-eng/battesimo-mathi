import { Redis } from '@upstash/redis'
import { INVITATI_INIZIALI } from '../../../data/invitati'

const redis = Redis.fromEnv()
const KV_KEY = 'battesimo_mathi_invitati'

export async function GET() {
  try {
    let data = await redis.get(KV_KEY)
    if (!data) {
      const iniziali = INVITATI_INIZIALI.map(i => ({ ...i, bomboniera: false }))
      await redis.set(KV_KEY, iniziali)
      data = iniziali
    }
    return Response.json(data)
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { action, id, field, value, invitato } = body

    let data = await redis.get(KV_KEY)
    if (!data) {
      data = INVITATI_INIZIALI.map(i => ({ ...i, bomboniera: false }))
    }

    if (action === 'update_field') {
      data = data.map(inv => inv.id === id ? { ...inv, [field]: value } : inv)
    } else if (action === 'add') {
      const newId = Math.max(...data.map(i => i.id)) + 1
      data = [...data, { ...invitato, id: newId, bomboniera: false }]
    } else if (action === 'delete') {
      data = data.filter(inv => inv.id !== id)
    } else if (action === 'reset') {
      data = INVITATI_INIZIALI.map(i => ({ ...i, bomboniera: false }))
    }

    await redis.set(KV_KEY, data)
    return Response.json({ ok: true, data })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
