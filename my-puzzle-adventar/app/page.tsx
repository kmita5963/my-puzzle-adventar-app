"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const NAVY = "#002e65"; const RED = "#cc0033"; const GOLD = "#c5a572";
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
const PRESETS = ['https://api.dicebear.com/7.x/avataaars/svg?seed=A', 'https://api.dicebear.com/7.x/avataaars/svg?seed=B', 'https://api.dicebear.com/7.x/bottts/svg?seed=C', 'https://api.dicebear.com/7.x/bottts/svg?seed=D']

export default function JourneyDashboard() {
  const [entries, setEntries] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [month, setMonth] = useState(new Date().getMonth())
  const [sel, setSel] = useState<any>(null)
  const [mode, setMode] = useState<'view' | 'edit' | 'reg' | null>(null)
  const [form, setForm] = useState({ name: '', url: '', icon: '', pass: '' })
  const [newComment, setNewComment] = useState({ name: '', body: '' })

  useEffect(() => { fetchAll() }, [])
  async function fetchAll() {
    const { data: e } = await supabase.from('advent_calendar').select('*').order('date_day')
    const { data: c } = await supabase.from('comments').select('*').order('created_at', { ascending: false }).limit(10)
    if (e) setEntries(e); if (c) setComments(c)
  }

  const handleSave = async () => {
    if (mode === 'edit' && form.pass !== sel.edit_password) return alert("パスワード不一致")
    await supabase.from('advent_calendar').update({ user_name: form.name, url: form.url, icon_url: form.icon, edit_password: form.pass || sel.edit_password, is_booked: true }).eq('id', sel.id)
    setSel(null); setMode(null); fetchAll()
  }

  const postComment = async () => {
    if (!newComment.name || !newComment.body) return;
    await supabase.from('comments').insert([newComment])
    setNewComment({ name: '', body: '' }); fetchAll()
  }

  const year = 2026; const days = new Date(year, month + 1, 0).getDate(); const first = new Date(year, month, 1).getDay();
  const getOffset = (m: number) => { let c = 0; for(let i=0; i<m; i++) c += new Date(year, i+1, 0).getDate(); return c; }
  const startId = getOffset(month) + 1; const currentEntries = entries.slice(startId - 1, startId - 1 + days);

  return (
    <div className="min-h-screen bg-[#fcfcfd] py-12 px-4 font-sans text-slate-800">
      
      {/* 1. 説明書き（ストーリー）セクション */}
      <header className="max-w-3xl mx-auto text-center mb-16">
        <h1 style={{ color: NAVY }} className="text-4xl font-black mb-4 tracking-tighter uppercase">Keio ⇄ USA 2026 Voyage</h1>
        <div className="flex justify-center items-center gap-3 mb-8">
            <div className="h-px w-10 bg-[#002e65]"></div>
            <p className="text-xs font-bold text-slate-400 tracking-[0.3em]">INDEPENDENCE & SELF-RESPECT</p>
            <div className="h-px w-10 bg-[#cc0033]"></div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 text-left leading-relaxed">
            <p className="text-slate-600 mb-4 text-sm font-medium">
                福澤諭吉先生が説いた「独立自尊」の精神を胸に、私たちは2026年、太平洋を越えて米国へと旅立ちます。
            </p>
            <p className="text-slate-600 text-sm font-medium">
                このカレンダーは、365日の航海図。ピースを埋めることで、仲間たちの志が重なり、一つの星条旗が完成します。あなたの声をここに刻み、共に出発の準備をしましょう。
            </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* 2. カレンダーセクション (Left/Center) */}
        <section className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-[400px]">
            <div className="flex overflow-x-auto gap-2 p-2 mb-6 no-scrollbar">
              {Array.from({length:12}).map((_, i) => (
                <button key={i} onClick={() => setMonth(i)} 
                  className={`flex-shrink-0 w-10 py-2 rounded-full text-[10px] font-black transition-all ${month === i ? 'text-white' : 'text-slate-300'}`}
                  style={{ backgroundColor: month === i ? NAVY : '' }}>{i+1}月</button>
              ))}
            </div>
            <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl border-b-[12px] relative" style={{ borderColor: RED }}>
              <div className="grid grid-cols-7 gap-1.5 relative z-10">
                {Array.from({length: first}).map((_, i) => <div key={i} />)}
                {currentMonthEntries.map((item, idx) => (
                  <button key={item.id} onClick={() => { setSelectedDay(item); setMode(item.is_booked ? 'view' : 'reg'); setForm({name:item.user_name||'', url:item.url||'', icon:item.icon_url||PRESETS[0], pass:''}) }}
                    className={`aspect-square relative rounded-lg flex items-center justify-center transition-all ${item.is_booked ? 'bg-white shadow-sm' : 'bg-slate-50 opacity-40 hover:opacity-100'}`}
                    style={{ clipPath: 'polygon(20% 0%, 50% 15%, 80% 0%, 100% 20%, 85% 50%, 100% 80%, 80% 100%, 50% 85%, 20% 100%, 0% 80%, 15% 50%, 0% 20%)', backgroundImage: item.is_booked ? 'url("https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg")' : '', backgroundSize: '700% 600%', backgroundPosition: `${((idx + first)%7 / 6)*100}% ${Math.floor((idx + first)/7 / 5)*100}%` }}>
                    {item.is_booked ? <img src={item.icon_url} className="w-full h-full object-cover p-1" /> : <span className="text-[8px] font-bold text-slate-300">{idx+1}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. コメント欄セクション (Right) */}
        <section className="lg:col-span-5 space-y-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border-t-8" style={{ borderColor: NAVY }}>
            <h2 style={{ color: NAVY }} className="text-xl font-black mb-6 flex items-center gap-2">
                <span>COMMUNITY WALL</span>
                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-400">Voices of 2026</span>
            </h2>
            
            {/* 入力フォーム */}
            <div className="space-y-3 mb-8">
                <input placeholder="名前" className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold outline-none border-2 border-transparent focus:border-red-500 transition-all" value={newComment.name} onChange={e => setNewComment({...newComment, name: e.target.value})} />
                <textarea placeholder="メッセージをどうぞ..." className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold outline-none border-2 border-transparent focus:border-red-500 transition-all h-20" value={newComment.body} onChange={e => setNewComment({...newComment, body: e.target.value})} />
                <button onClick={postComment} style={{ backgroundColor: NAVY }} className="w-full py-3 text-white rounded-xl text-xs font-black shadow-lg hover:brightness-110 active:scale-95 transition-all">POST MESSAGE</button>
            </div>

            {/* コメント一覧 */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                {comments.map(c => (
                    <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                            <span style={{ color: NAVY }} className="text-[10px] font-black">{c.user_name}</span>
                            <span className="text-[8px] text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-600">{c.body}</p>
                    </div>
                ))}
            </div>
          </div>
        </section>
      </div>

      {/* Modal (予約・閲覧) */}
      {sel && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-xs shadow-2xl animate-in zoom-in-95 duration-200">
            {mode === 'view' ? (
              <div className="text-center">
                <img src={sel.icon_url} className="w-20 h-20 mx-auto rounded-full mb-4 border-4 p-1 shadow-lg" style={{ borderColor: RED }} />
                <h2 className="text-2xl font-black mb-4" style={{ color: NAVY }}>{sel.user_name}</h2>
                <a href={sel.url} target="_blank" className="text-blue-600 font-bold underline text-[10px] mb-8 block uppercase tracking-widest">Visit Profile ↗</a>
                <div className="flex gap-4">
                  <button onClick={() => setSel(null)} className="flex-1 text-slate-400 font-bold text-xs">CLOSE</button>
                  <button onClick={() => setMode('edit')} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-600 text-xs">EDIT</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-center mb-6" style={{ color: NAVY }}>RESERVE {month+1}/{sel.date_day - startId + 1}</h2>
                <div className="flex justify-between p-2 bg-slate-50 rounded-2xl">
                  {PRESETS.map(i => (
                    <button key={i} onClick={() => setForm({...form, icon: i})} className={`w-9 h-9 rounded-full border-4 transition-all ${form.icon === i ? 'border-red-500 scale-110' : 'border-transparent opacity-40'}`}>
                      <img src={i} className="rounded-full" />
                    </button>
                  ))}
                </div>
                <input placeholder="名前" className="w-full bg-slate-50 rounded-xl p-4 text-xs font-bold outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <input placeholder="URL" className="w-full bg-slate-50 rounded-xl p-4 text-xs font-bold outline-none" value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
                <input type="password" placeholder="パスワード" className="w-full bg-slate-50 rounded-xl p-4 text-xs font-bold outline-none" value={form.pass} onChange={e => setForm({...form, pass: e.target.value})} />
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setSel(null)} className="flex-1 text-slate-400 font-bold text-xs">CANCEL</button>
                  <button onClick={handleSave} style={{ backgroundColor: NAVY }} className="flex-1 py-4 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs">SAVE</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}