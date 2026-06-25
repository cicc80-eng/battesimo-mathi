'use client'
import { useState, useEffect, useCallback } from 'react'

const CAT_LABEL = { famiglia: 'Famiglia', amici: 'Amici', da_classificare: 'Da classificare' }
const CAT_COLOR = {
  famiglia:        'bg-yellow-50 border-yellow-200',
  amici:           'bg-green-50 border-green-200',
  da_classificare: 'bg-purple-50 border-purple-200',
}
const CAT_BADGE = {
  famiglia:        'bg-yellow-100 text-yellow-800',
  amici:           'bg-green-100 text-green-800',
  da_classificare: 'bg-purple-100 text-purple-700',
}

function fmt(n) { return '€ ' + Number(n).toFixed(2).replace('.', ',') }

export default function Home() {
  const [invitati, setInvitati]   = useState([])
  const [quote, setQuote]         = useState({ pranzo_adulto: 35, pranzo_bambino: 18, bomboniera_adulto: 12, bomboniera_bambino: 8 })
  const [loading, setLoading]     = useState(true)
  const [filtro, setFiltro]       = useState('tutti')   // tutti | famiglia | amici | da_classificare | bambini
  const [search, setSearch]       = useState('')
  const [showQuote, setShowQuote] = useState(false)
  const [showAdd, setShowAdd]     = useState(false)
  const [nuovoNome, setNuovoNome] = useState('')
  const [nuovoTipo, setNuovoTipo] = useState('adulto')
  const [nuovoCat, setNuovoCat]   = useState('da_classificare')
  const [saving, setSaving]       = useState(null)  // id in salvataggio
  const [tab, setTab]             = useState('lista') // lista | riepilogo

  // Carica dati
  const load = useCallback(async () => {
    const [ri, rq] = await Promise.all([
      fetch('/api/invitati').then(r => r.json()),
      fetch('/api/quote').then(r => r.json()),
    ])
    setInvitati(ri)
    setQuote(rq)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Auto-refresh ogni 15 secondi (per aggiornamenti da altri dispositivi)
  useEffect(() => {
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [load])

  // Aggiorna campo singolo
  async function update(id, field, value) {
    // Aggiorna UI subito (optimistic)
    setInvitati(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
    setSaving(id)
    await fetch('/api/invitati', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_field', id, field, value }),
    })
    setSaving(null)
  }

  async function elimina(id) {
    if (!confirm('Eliminare questo invitato?')) return
    setInvitati(prev => prev.filter(i => i.id !== id))
    await fetch('/api/invitati', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    })
  }

  async function aggiungi() {
    if (!nuovoNome.trim()) return
    const res = await fetch('/api/invitati', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', invitato: { nome: nuovoNome.trim(), tipo: nuovoTipo, categoria: nuovoCat } }),
    })
    const { data } = await res.json()
    setInvitati(data)
    setNuovoNome(''); setShowAdd(false)
  }

  async function salvaQuote() {
    await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote),
    })
    setShowQuote(false)
  }

  // Filtri
  const filtrati = invitati.filter(i => {
    const matchSearch = i.nome.toLowerCase().includes(search.toLowerCase())
    const matchFiltro =
      filtro === 'tutti'           ? true :
      filtro === 'bambini'         ? i.tipo === 'bambino' :
      filtro === 'bomboniere'      ? !i.bomboniera :
      i.categoria === filtro
    return matchSearch && matchFiltro
  })

  // Statistiche
  const totAdulti   = invitati.filter(i => i.tipo === 'adulto').length
  const totBambini  = invitati.filter(i => i.tipo === 'bambino').length
  const totOspiti   = invitati.length
  const consegnate  = invitati.filter(i => i.bomboniera).length
  const daConsegnare = invitati.filter(i => !i.bomboniera).length
  const totPranzo   = invitati.reduce((s, i) => s + (i.tipo === 'bambino' ? quote.pranzo_bambino : quote.pranzo_adulto), 0)
  const totBomb     = invitati.reduce((s, i) => s + (i.tipo === 'bambino' ? quote.bomboniera_bambino : quote.bomboniera_adulto), 0)

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-5xl mb-4">🍼</div>
        <p className="text-gray-500 text-lg">Caricamento...</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-3 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm rounded-b-2xl px-4 pt-4 pb-3 mb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-xl font-bold text-gray-800">🍼 Battesimo Mathi</h1>
            <p className="text-xs text-gray-400">18 Luglio 2025 · La Masseria</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowQuote(true)}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full font-medium text-gray-600">
              ⚙️ Quote
            </button>
            <button onClick={() => setShowAdd(true)}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full font-medium">
              + Aggiungi
            </button>
          </div>
        </div>

        {/* Mini stats */}
        <div className="flex gap-2 mt-2 text-xs overflow-x-auto">
          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full whitespace-nowrap">👥 {totOspiti} ospiti</span>
          <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full whitespace-nowrap">🎁 {consegnate}/{totOspiti} bomboniere</span>
          <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded-full whitespace-nowrap">👶 {totBambini} bambini</span>
        </div>

        {/* Tab */}
        <div className="flex mt-3 bg-gray-100 rounded-lg p-0.5">
          {[['lista','📋 Lista'],['riepilogo','📊 Riepilogo']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-all ${tab===k ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ── RIEPILOGO ── */}
      {tab === 'riepilogo' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-3">👥 Presenze</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-blue-50 rounded-xl p-3">
                <div className="text-2xl font-bold text-blue-700">{totOspiti}</div>
                <div className="text-xs text-blue-600 mt-1">Totale ospiti</div>
              </div>
              <div className="bg-green-50 rounded-xl p-3">
                <div className="text-2xl font-bold text-green-700">{totAdulti}</div>
                <div className="text-xs text-green-600 mt-1">Adulti</div>
              </div>
              <div className="bg-pink-50 rounded-xl p-3">
                <div className="text-2xl font-bold text-pink-700">{totBambini}</div>
                <div className="text-xs text-pink-600 mt-1">Bambini</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-3">🎁 Bomboniere</h2>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-green-50 rounded-xl p-3">
                <div className="text-2xl font-bold text-green-700">{consegnate}</div>
                <div className="text-xs text-green-600 mt-1">✔ Consegnate</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-3">
                <div className="text-2xl font-bold text-orange-700">{daConsegnare}</div>
                <div className="text-xs text-orange-600 mt-1">⏳ Da consegnare</div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-3 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${totOspiti ? (consegnate/totOspiti)*100 : 0}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">{totOspiti ? Math.round((consegnate/totOspiti)*100) : 0}% completato</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-3">💰 Costi</h2>
            <div className="space-y-2 text-sm">
              {[
                ['🍽 Pranzo adulti', `${totAdulti} × ${fmt(quote.pranzo_adulto)}`, totAdulti * quote.pranzo_adulto],
                ['🍽 Pranzo bambini', `${totBambini} × ${fmt(quote.pranzo_bambino)}`, totBambini * quote.pranzo_bambino],
                ['🎁 Bomboniere adulti', `${totAdulti} × ${fmt(quote.bomboniera_adulto)}`, totAdulti * quote.bomboniera_adulto],
                ['🎁 Bomboniere bambini', `${totBambini} × ${fmt(quote.bomboniera_bambino)}`, totBambini * quote.bomboniera_bambino],
              ].map(([label, detail, val]) => (
                <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <div>
                    <span className="text-gray-700">{label}</span>
                    <span className="text-gray-400 text-xs ml-2">{detail}</span>
                  </div>
                  <span className="font-medium text-gray-800">{fmt(val)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-gray-800">Totale pranzo</span>
                <span className="font-bold text-blue-700 text-lg">{fmt(totPranzo)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800">Totale bomboniere</span>
                <span className="font-bold text-purple-700 text-lg">{fmt(totBomb)}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3 mt-2">
                <span className="font-bold text-gray-800 text-base">💰 Totale generale</span>
                <span className="font-bold text-gray-900 text-xl">{fmt(totPranzo + totBomb)}</span>
              </div>
            </div>
          </div>

          {/* Da classificare */}
          {invitati.filter(i => i.categoria === 'da_classificare').length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
              <h2 className="font-bold text-purple-700 mb-2">⚠️ Da classificare ({invitati.filter(i => i.categoria === 'da_classificare').length})</h2>
              <p className="text-xs text-purple-600">Questi invitati non hanno ancora una categoria assegnata.</p>
            </div>
          )}
        </div>
      )}

      {/* ── LISTA ── */}
      {tab === 'lista' && (
        <>
          {/* Search + filtri */}
          <div className="mb-3 space-y-2">
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Cerca invitato..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            />
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                ['tutti',           'Tutti'],
                ['famiglia',        '👨‍👩‍👧 Famiglia'],
                ['amici',           '👫 Amici'],
                ['da_classificare', '❓ Da class.'],
                ['bambini',         '👶 Bambini'],
                ['bomboniere',      '🎁 Da consegnare'],
              ].map(([k, l]) => (
                <button key={k} onClick={() => setFiltro(k)}
                  className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-all ${
                    filtro === k ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-2 px-1">{filtrati.length} invitati</p>

          {/* Lista */}
          <div className="space-y-2">
            {filtrati.map((inv, idx) => (
              <div key={inv.id}
                className={`border rounded-2xl px-4 py-3 bg-white shadow-sm ${inv.tipo === 'bambino' ? 'border-pink-200' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  {/* Numero */}
                  <span className="text-xs text-gray-300 w-5 text-right shrink-0">{idx+1}</span>

                  {/* Nome editabile */}
                  <input
                    defaultValue={inv.nome}
                    onBlur={e => { if (e.target.value !== inv.nome) update(inv.id, 'nome', e.target.value) }}
                    className="flex-1 text-sm font-medium text-gray-800 bg-transparent border-none outline-none min-w-0"
                  />

                  {/* Badge tipo */}
                  <button onClick={() => update(inv.id, 'tipo', inv.tipo === 'adulto' ? 'bambino' : 'adulto')}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 transition-all ${
                      inv.tipo === 'bambino'
                        ? 'bg-pink-100 text-pink-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                    {inv.tipo === 'bambino' ? '👶 Bambino' : '🧑 Adulto'}
                  </button>

                  {/* Bomboniera toggle */}
                  <button onClick={() => update(inv.id, 'bomboniera', !inv.bomboniera)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 transition-all ${
                      inv.bomboniera
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-300'
                    }`}
                    title="Bomboniera consegnata">
                    🎁
                  </button>

                  {saving === inv.id && <span className="text-xs text-blue-400 shrink-0">💾</span>}
                </div>

                {/* Seconda riga: categoria + costo */}
                <div className="flex items-center justify-between mt-2 pl-8">
                  <select
                    value={inv.categoria}
                    onChange={e => update(inv.id, 'categoria', e.target.value)}
                    className={`text-xs px-2 py-0.5 rounded-full border-0 font-medium ${CAT_BADGE[inv.categoria]} outline-none cursor-pointer`}>
                    <option value="famiglia">👨‍👩‍👧 Famiglia</option>
                    <option value="amici">👫 Amici</option>
                    <option value="da_classificare">❓ Da classificare</option>
                  </select>
                  <div className="text-xs text-gray-400 flex gap-3">
                    <span>🍽 {fmt(inv.tipo==='bambino' ? quote.pranzo_bambino : quote.pranzo_adulto)}</span>
                    <span>🎁 {fmt(inv.tipo==='bambino' ? quote.bomboniera_bambino : quote.bomboniera_adulto)}</span>
                    {inv.bomboniera && <span className="text-green-500 font-medium">✔ consegnata</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── MODALE QUOTE ── */}
      {showQuote && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-3">
            <h2 className="font-bold text-gray-800 text-lg">⚙️ Impostazioni Quote</h2>
            {[
              ['pranzo_adulto',     '🍽 Pranzo adulto (€)'],
              ['pranzo_bambino',    '🍽 Pranzo bambino (€)'],
              ['bomboniera_adulto', '🎁 Bomboniera adulto (€)'],
              ['bomboniera_bambino','🎁 Bomboniera bambino (€)'],
            ].map(([k, l]) => (
              <div key={k} className="flex items-center justify-between">
                <label className="text-sm text-gray-700">{l}</label>
                <input type="number" value={quote[k]}
                  onChange={e => setQuote(q => ({ ...q, [k]: Number(e.target.value) }))}
                  className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowQuote(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600">Annulla</button>
              <button onClick={salvaQuote}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium">Salva</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALE AGGIUNGI ── */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-3">
            <h2 className="font-bold text-gray-800 text-lg">➕ Nuovo invitato</h2>
            <input value={nuovoNome} onChange={e => setNuovoNome(e.target.value)}
              placeholder="Nome..."
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              onKeyDown={e => e.key === 'Enter' && aggiungi()}
            />
            <div className="flex gap-2">
              <button onClick={() => setNuovoTipo('adulto')}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border ${nuovoTipo==='adulto' ? 'bg-gray-700 text-white border-gray-700' : 'border-gray-200 text-gray-600'}`}>
                🧑 Adulto
              </button>
              <button onClick={() => setNuovoTipo('bambino')}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border ${nuovoTipo==='bambino' ? 'bg-pink-500 text-white border-pink-500' : 'border-gray-200 text-gray-600'}`}>
                👶 Bambino
              </button>
            </div>
            <select value={nuovoCat} onChange={e => setNuovoCat(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
              <option value="famiglia">👨‍👩‍👧 Famiglia</option>
              <option value="amici">👫 Amici</option>
              <option value="da_classificare">❓ Da classificare</option>
            </select>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600">Annulla</button>
              <button onClick={aggiungi}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium">Aggiungi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
