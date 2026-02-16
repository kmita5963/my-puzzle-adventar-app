"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// 🖋️ 航海日誌：ここで文字を自由に変えられます
const MISSION = {
  title: "VOYAGE MANIFESTO 2026",
  content: `福澤諭吉先生の「独立自尊」を胸に。私たちは2026年、米国へと旅立ちます。\nこのカレンダーは365日の航海図。ピースを埋め、一つの星条旗を完成させましょう。`,
  author: "Founder: Keio SFC Student"
};

const NAVY = "#002e65"; const RED = "#cc0033"; const GOLD = "#c5a572";
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

export default function UltimateEvolutionPuzzle() {
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
    if (e) setEntries(e)
    if (c) setComments(c)
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
    if (!sel) return
    const payload = {
      user_name: form.name, 
      url: form.url, 
      icon_url: form.icon,
      edit_password: form.pass || sel.edit_password, 
      hashtags: form.tags.filter(t => t !== ''), 
      is_booked: true
    }
    await supabase.from('advent_calendar').update(payload).eq('id', sel.id)
    setSel(null); setMode(null); fetchAll()
  }

  const postComment = async () => {
    if (!newComment.name || !newComment.body) return
    await supabase.from('community_wall').insert([{ user_name: newComment.name, comment: newComment.body }])
    setNewComment({ name: '', body: '' }); fetchAll()
  }

  const year = 2026;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIdx = new Date(year, month, 1).getDay();
  const getOffset = (m: number) => {
    let c = 0; for(let i=0; i<m; i++) c += new Date(year, i+1, 0).getDate();
    return c;
  }
  const startId = (month === 0 ? 0 : getOffset(month)) + 1;
  const currentMonthEntries = entries.length > 0 ? entries.slice(startId - 1, startId - 1 + daysInMonth) : [];

  return (
    <div className="min-h-screen bg-[#fcfcfd] py-12 px-4 font-sans text-slate-900 selection:bg-[#002e65] selection:text-white">
      
      {/* 1. Header & Mission Box */}
      <header className="max-w-4xl mx-auto text-center mb-8">
        <h1 style={{ color: NAVY }} className="text-4xl font-black mb-2 tracking-tighter uppercase italic">Keio ⇄ USA Voyage 2026</h1>
        <p className="text-[10px] font-bold text-slate-400 tracking-[0.4em] mb-12 uppercase">Independence & Self-Respect</p>
        
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl rounded-full"></div>
            <h2 style={{ color: NAVY }} className="text-xs font-black mb-4 tracking-widest uppercase flex items-center gap-2">
                <span className="w-8 h-[1px] bg-red-600"></span> {MISSION.title}
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line mb-4 font-medium">{MISSION.content}</p>
            <p style={{ color: GOLD }} className="text-[10px] font-bold text-right italic uppercase tracking-widest">{MISSION.author}</p>
        </div>
      </header>

      {/* 2. Calendar Section */}
      <div className="max-w-4xl mx-auto flex flex-col items-center mb-20">
        <div className="flex overflow-x-auto gap-2 p-2 mb-8 bg-white/80 rounded-full shadow-inner max-w-md w-full no-scrollbar">
          {Array.from({length:12}).map((_, i) => (
            <button key={i} onClick={() => setMonth(i)} 
              className={`flex-shrink-0 w-10 py-2 rounded-full text-[10px] font-black transition-all ${month === i ? 'text-white shadow-lg' : 'text-slate-300'}`}
              style={{ backgroundColor: month === i ? NAVY : '' }}>{i+1}月</button>
          ))}
        </div>

        <div className="w-full max-w-[420px] bg-white rounded-[3rem] p-8 shadow-2xl border-b-[14px] relative" style={{ borderColor: RED }}>
          <div className="grid grid-cols-7 gap-1 mb-2 text-center italic">
            {WEEKDAYS.map(w => <div key={w} className="text-[9px] font-black text-slate-200">{w}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2 relative z-10">
            {/* 背景の星条旗 */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-center bg-cover rounded-2xl" 
                 style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg")' }}></div>
            
            {Array.from({length: firstDayIdx}).map((_, i) => <div key={i} />)}
            {currentMonthEntries.map((item, idx) => {
              const r = Math.floor((idx + firstDayIdx) / 7);
              const c = (idx + firstDayIdx) % 7;
              return (
                <div key={item.id} className="relative group">
                  <button onClick={() => { setSel(item); setMode(item.is_booked ? 'view' : 'reg'); setForm({name:item.user_name||'', url:item.url||'', icon:item.icon_url||'', pass:'', tags:item.hashtags||['','','']}) }}
                    className={`aspect-square w-full relative flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 group-hover:z-30
                      ${item.is_booked ? 'bg-white shadow-md' : 'bg-slate-100 opacity-40 hover:opacity-100 hover:bg-red-50'}`}
                    style={{ 
                      clipPath: 'polygon(20% 0%, 50% 15%, 80% 0%, 100% 20%, 85% 50%, 100% 80%, 80% 100%, 50% 85%, 20% 100%, 0% 80%, 15% 50%, 0% 20%)',
                      backgroundImage: item.is_booked ? 'url("https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg")' : '',
                      backgroundSize: '700% 600%', backgroundPosition: `${(c/6)*100}% ${(r/5)*100}%`
                    }}>
                    {item.is_booked ? <img src={item.icon_url} className="w-full h-full object-cover p-1" /> : <span className="text-[10px] font-bold text-slate-400">{idx+1}</span>}
                  </button>

                  {/* スマート・ホバー */}
                  {item.is_booked && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-44 bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl text-center hidden group-hover:block z-50 animate-in fade-in slide-in-from-bottom-2 shadow-2xl">
                      <p className="text-[10px] font-black mb-1.5 border-b border-white/10 pb-1">{item.user_name}</p>
                      <div className="flex flex-wrap justify-center gap-1">
                        {item.hashtags?.map((t: string, i: number) => <span key={i} className="text-[7px] bg-white/10 px-1.5 py-0.5 rounded-full">#{t}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 3. Community Wall (Bottom & Smaller) */}
      <section className="max-w-2xl mx-auto mt-12 bg-white p-8 rounded-[2rem] shadow-xl border-t-8" style={{ borderColor: NAVY }}>
        <h2 style={{ color: NAVY }} className="text-sm font-black mb-6 uppercase tracking-widest text-center">Community Wall</h2>
        <div className="space-y-4 mb-8 max-h-48 overflow-y-auto pr-2 no-scrollbar">
          {comments.map(c => (
            <div key={c.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p style={{ color: NAVY }} className="text-[9px] font-black mb-1">{c.user_name}</p>
              <p className="text-[11px] font-medium text-slate-600 leading-relaxed">{c.comment}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input placeholder="名前" className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold outline-none border-2 border-transparent focus:border-red-500 transition-all" value={newComment.name} onChange={e => setNewComment({...newComment, name: e.target.value})} />
            <div className="md:col-span-2">
                <input placeholder="メッセージ！" className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold outline-none border-2 border-transparent focus:border-red-500 transition-all" value={newComment.body} onChange={e => setNewComment({...newComment, body: e.target.value})} />
            </div>
          </div>
          <button onClick={postComment} style={{ backgroundColor: NAVY }} className="w-full py-3 text-white rounded-xl text-xs font-black shadow-lg hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest">Post to Wall</button>
        </div>
      </section>

      {/* Modal: 予約・閲覧 */}
      {sel && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 border-t-8" style={{ borderColor: NAVY }}>
            {mode === 'view' ? (
              <div className="text-center">
                <img src={sel.icon_url} className="w-24 h-24 mx-auto rounded-full mb-4 border-4 p-1 shadow-lg object-cover" style={{ borderColor: RED }} />
                <h2 className="text-2xl font-black mb-1" style={{ color: NAVY }}>{sel.user_name}</h2>
                <div className="flex justify-center gap-2 mb-6 flex-wrap">
                    {sel.hashtags?.map((t: string) => <span key={t} className="text-[8px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">#{t}</span>)}
                </div>
                <a href={sel.url} target="_blank" className="inline-block py-3 px-8 bg-blue-50 text-blue-600 font-black text-xs rounded-full mb-10 hover:bg-blue-100 transition-all uppercase tracking-widest">Visit Link ↗</a>
                <div className="flex gap-4 pt-4 border-t border-slate-100">
                  <button onClick={() => setSel(null)} className="flex-1 text-slate-400 font-bold text-xs">CLOSE</button>
                  <button onClick={() => setMode('edit')} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-600 text-xs uppercase tracking-widest">Edit</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-center mb-6" style={{ color: NAVY }}>RESERVE DAY {sel.date_day}</h2>
                
                {/* 1. 画像アップロード (FileReader) */}
                <label className="w-full py-6 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all group">
                    {form.icon ? <img src={form.icon} className="w-16 h-16 rounded-full mb-2 object-cover shadow-md ring-4 ring-white" /> : <span className="text-[10px] font-black text-slate-300 group-hover:text-red-500">アイコンをアップロード</span>}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>

                <input placeholder="名前 (Name)" className="w-full bg-slate-50 rounded-xl p-4 text-xs font-bold outline-none shadow-inner" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                
                {/* 2. ハッシュタグ入力 (最大3つ) */}
                <div className="grid grid-cols-3 gap-2">
                    {form.tags.map((t, i) => (
                        <input key={i} placeholder={`#タグ${i+1}`} className="bg-slate-50 rounded-lg p-2 text-[9px] font-bold outline-none focus:ring-1 focus:ring-red-500 shadow-inner" value={t} onChange={e => { let nt = [...form.tags]; nt[i] = e.target.value; setForm({...form, tags: nt}) }} />
                    ))}
                </div>

                <input placeholder="URL" className="w-full bg-slate-50 rounded-xl p-4 text-xs font-bold outline-none shadow-inner" value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
                <input type="password" placeholder="編集用パスワード" className="w-full bg-slate-50 rounded-xl p-4 text-xs font-bold outline-none shadow-inner" value={form.pass} onChange={e => setForm({...form, pass: e.target.value})} />
                
                <div className="flex gap-4 pt-6">
                  <button onClick={() => setSel(null)} className="flex-1 text-slate-400 font-bold text-[10px] uppercase">Cancel</button>
                  <button onClick={handleSave} style={{ backgroundColor: NAVY }} className="flex-1 py-4 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest">Save Piece</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
