"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// --- 航海日誌：VS Code 内で編集 ---
const MISSION_STATEMENT = {
  title: "VOYAGE MANIFESTO 2026",
  content: `福澤諭吉先生が説いた「独立自尊」を胸に、私たちは2026年、太平洋を越えて米国へと旅立ちます。\nこのカレンダーは、365日の航海図。一つひとつのピースには、仲間の志が刻まれています。`,
  author: "Founder: Keio SFC Student"
};

const NAVY = "#002e65"; const RED = "#cc0033";
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

export default function StableEvolutionPuzzle() {
  const [entries, setEntries] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [month, setMonth] = useState(new Date().getMonth())
  const [sel, setSel] = useState<any>(null)
  const [mode, setMode] = useState<'view' | 'edit' | 'reg' | null>(null)
  const [form, setForm] = useState({ name: '', url: '', icon: '', pass: '', tags: ['', '', ''] })
  const [newComment, setNewComment] = useState({ name: '', body: '' })

  const fetchAll = useCallback(async () => {
    const { data: e } = await supabase.from('advent_calendar').select('*').order('date_day')
    const { data: c } = await supabase.from('community_wall').select('*').order('created_at', { ascending: false }).limit(10)
    if (e) setEntries(e); if (c) setComments(c)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setForm(prev => ({ ...prev, icon: reader.result as string }))
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    const payload = {
      user_name: form.name, url: form.url, icon_url: form.icon,
      edit_password: form.pass || (sel ? sel.edit_password : ''), 
      hashtags: form.tags.filter(t => t !== ''), is_booked: true
    }
    await supabase.from('advent_calendar').update(payload).eq('id', sel.id)
    setSel(null); setMode(null); fetchAll()
  }

  const postComment = async () => {
    if (!newComment.name || !newComment.body) return
    await supabase.from('community_wall').insert([{ user_name: newComment.name, comment: newComment.body }])
    setNewComment({ name: '', body: '' }); fetchAll()
  }

  // カレンダーロジック
  const year = 2026;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIdx = new Date(year, month, 1).getDay();
  const getOffset = (m: number) => {
    let c = 0; for(let i=0; i<m; i++) c += new Date(year, i+1, 0).getDate();
    return c;
  }
  const startId = getOffset(month) + 1;
  const monthEntries = entries.length > 0 ? entries.slice(startId - 1, startId - 1 + daysInMonth) : [];

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 font-sans text-slate-900">
      <header className="max-w-4xl mx-auto text-center mb-10">
        <h1 style={{ color: NAVY }} className="text-3xl font-black mb-2 uppercase italic">Keio ⇄ USA 2026</h1>
        <p className="text-[10px] font-bold text-slate-400 tracking-[0.4em] uppercase">Independence & Self-Respect</p>
      </header>

      {/* 航海日誌セクション */}
      <section className="max-w-2xl mx-auto mb-12 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h2 style={{ color: NAVY }} className="text-xs font-black mb-4 tracking-widest uppercase">{MISSION_STATEMENT.title}</h2>
        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line mb-4">{MISSION_STATEMENT.content}</p>
        <p style={{ color: RED }} className="text-[10px] font-bold text-right italic">{MISSION_STATEMENT.author}</p>
      </section>

      {/* カレンダーエリア */}
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <div className="flex overflow-x-auto gap-2 p-2 mb-6 bg-white rounded-full shadow-inner max-w-md w-full">
          {Array.from({length:12}).map((_, i) => (
            <button key={i} onClick={() => setMonth(i)} 
              className={`flex-shrink-0 w-10 py-2 rounded-full text-[10px] font-black transition-all ${month === i ? 'text-white bg-[#002e65]' : 'text-slate-300'}`}>{i+1}月</button>
          ))}
        </div>

        <div className="w-full max-w-[400px] bg-white rounded-[2.5rem] p-6 shadow-2xl border-b-[10px] relative" style={{ borderColor: RED }}>
          <div className="grid grid-cols-7 gap-1 mb-4 text-center">
            {WEEKDAYS.map(w => <div key={w} className="text-[9px] font-black text-slate-200">{w}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({length: firstDayIdx}).map((_, i) => <div key={i} />)}
            {monthEntries.map((item, idx) => (
              <button key={item.id} onClick={() => { setSel(item); setMode(item.is_booked ? 'view' : 'reg'); setForm({name:item.user_name||'', url:item.url||'', icon:item.icon_url||'', pass:'', tags:item.hashtags||['','','']}) }}
                className={`aspect-square relative flex items-center justify-center rounded-lg transition-all ${item.is_booked ? 'bg-white shadow-md' : 'bg-slate-100 opacity-50 hover:opacity-100'}`}
                style={{ clipPath: 'polygon(20% 0%, 50% 15%, 80% 0%, 100% 20%, 85% 50%, 100% 80%, 80% 100%, 50% 85%, 20% 100%, 0% 80%, 15% 50%, 0% 20%)' }}>
                {item.is_booked ? <img src={item.icon_url} className="w-full h-full object-cover p-1" /> : <span className="text-[10px] font-bold text-slate-400">{idx+1}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* コミュニティ・ウォール */}
      <section className="max-w-2xl mx-auto mt-16 bg-white p-8 rounded-[2rem] shadow-xl border-t-8" style={{ borderColor: NAVY }}>
        <h2 style={{ color: NAVY }} className="text-sm font-black mb-6 uppercase">Community Wall</h2>
        <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2">
          {comments.map(c => (
            <div key={c.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p style={{ color: NAVY }} className="text-[9px] font-black">{c.user_name}</p>
              <p className="text-xs text-slate-600">{c.comment}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <input placeholder="名前" className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold outline-none" value={newComment.name} onChange={e => setNewComment({ ...newComment, name: e.target.value })} />
          <textarea placeholder="応援メッセージをどうぞ！" className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold outline-none h-20" value={newComment.body} onChange={e => setNewComment({ ...newComment, body: e.target.value })} />
          <button onClick={postComment} style={{ backgroundColor: NAVY }} className="w-full py-4 text-white rounded-xl text-xs font-black shadow-lg">POST MESSAGE</button>
        </div>
      </section>

      {/* モーダル */}
      {sel && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border-t-8" style={{ borderColor: NAVY }}>
            {mode === 'view' ? (
              <div className="text-center">
                <img src={sel.icon_url} className="w-20 h-20 mx-auto rounded-full mb-4 border-4 p-1 shadow-lg object-cover" style={{ borderColor: RED }} />
                <h2 className="text-2xl font-black mb-1" style={{ color: NAVY }}>{sel.user_name}</h2>
                <a href={sel.url} target="_blank" rel="noopener noreferrer" className="inline-block py-2 px-6 bg-blue-50 text-blue-600 font-bold text-[10px] mb-8 rounded-full uppercase">Visit Link ↗</a>
                <div className="flex gap-4">
                  <button onClick={() => setSel(null)} className="flex-1 text-slate-400 font-bold text-[10px]">CLOSE</button>
                  <button onClick={() => setMode('edit')} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-600 text-[10px]">EDIT</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-center" style={{ color: NAVY }}>Day {sel.date_day}</h2>
                <label className="w-full py-6 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50">
                  {form.icon ? <img src={form.icon} className="w-16 h-16 rounded-full mb-2 object-cover" /> : <span className="text-[10px] font-black text-slate-300">画像をアップロード</span>}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <input placeholder="名前" className="w-full bg-slate-50 rounded-xl p-4 text-xs font-bold outline-none" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <input placeholder="URL" className="w-full bg-slate-50 rounded-xl p-4 text-xs font-bold outline-none" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
                <input type="password" placeholder="編集パスワード" className="w-full bg-slate-50 rounded-xl p-4 text-xs font-bold outline-none" value={form.pass} onChange={e => setForm({ ...form, pass: e.target.value })} />
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setSel(null)} className="flex-1 text-slate-400 font-bold text-[10px]">CANCEL</button>
                  <button onClick={handleSave} style={{ backgroundColor: NAVY }} className="flex-1 py-4 text-white font-black rounded-2xl text-xs uppercase">Save</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}