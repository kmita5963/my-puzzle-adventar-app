"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const NAVY = "#002e65"; const RED = "#cc0033";
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

export default function EvolutionPuzzle() {
  const [entries, setEntries] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [month, setMonth] = useState(new Date().getMonth())
  const [sel, setSel] = useState<any>(null)
  const [mode, setMode] = useState<'view' | 'edit' | 'reg' | null>(null)
  const [form, setForm] = useState({ name: '', url: '', icon: '', pass: '', tags: ['', '', ''] })
  const [newComment, setNewComment] = useState({ name: '', body: '' })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const { data: e } = await supabase.from('advent_calendar').select('*').order('date_day')
    const { data: c } = await supabase.from('community_wall').select('*').order('created_at', { ascending: false }).limit(20)
    if (e) setEntries(e); if (c) setComments(c)
  }

  // 画像アップロード処理 (Base64変換)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setForm({ ...form, icon: reader.result as string })
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    const payload = {
      user_name: form.name, url: form.url, icon_url: form.icon,
      edit_password: form.pass || sel.edit_password, hashtags: form.tags.filter(t => t !== ''), is_booked: true
    }
    await supabase.from('advent_calendar').update(payload).eq('id', sel.id)
    setSel(null); setMode(null); fetchAll()
  }

  const postComment = async () => {
    if (!newComment.name || !newComment.body) return
    await supabase.from('community_wall').insert([{ user_name: newComment.name, comment: newComment.body }])
    setNewComment({ name: '', body: '' }); fetchAll()
  }

  const year = 2026; const days = new Date(year, month + 1, 0).getDate(); const first = new Date(year, month, 1).getDay();
  const getOffset = (m: number) => { let c = 0; for(let i=0; i<m; i++) c += new Date(year, i+1, 0).getDate(); return c; }
  const startId = getOffset(month) + 1; const currentMonthEntries = entries.slice(startId - 1, startId - 1 + days);

  return (
    <div className="min-h-screen bg-[#fcfcfd] py-12 px-4 font-sans text-slate-800">
      
      {/* 慶應 ⇄ 米国 ヘッダー */}
      <header className="max-w-4xl mx-auto text-center mb-12">
        <h1 style={{ color: NAVY }} className="text-4xl font-black mb-2 tracking-tighter uppercase italic">Keio ⇄ USA Voyage 2026</h1>
        <p className="text-[10px] font-bold text-slate-400 tracking-[0.4em] mb-8">INDEPENDENCE & SELF-RESPECT</p>
        
        {/* 月選択セレクター */}
        <div className="flex overflow-x-auto gap-2 p-2 no-scrollbar bg-white/80 rounded-full shadow-sm max-w-md mx-auto">
          {Array.from({length:12}).map((_, i) => (
            <button key={i} onClick={() => setMonth(i)} 
              className={`flex-shrink-0 w-10 py-2 rounded-full text-[10px] font-black transition-all ${month === i ? 'text-white' : 'text-slate-300'}`}
              style={{ backgroundColor: month === i ? NAVY : '' }}>{i+1}月</button>
          ))}
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* 左〜中央：パズルカレンダー */}
        <section className="lg:col-span-8 flex justify-center items-start">
          <div className="w-full max-w-[420px] bg-white rounded-[3rem] p-8 shadow-2xl border-b-[14px] relative" style={{ borderColor: RED }}>
            <div className="grid grid-cols-7 gap-2 mb-4 text-center">
              {WEEKDAYS.map(w => <div key={w} className="text-[9px] font-black text-slate-200">{w}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2 relative z-10">
              {Array.from({length: first}).map((_, i) => <div key={i} />)}
              {currentMonthEntries.map((item, idx) => (
                <div key={item.id} className="relative group">
                  <button onClick={() => { setSelectedDay(item); setMode(item.is_booked ? 'view' : 'reg'); setForm({name:item.user_name||'', url:item.url||'', icon:item.icon_url||'', pass:'', tags:item.hashtags||['','','']}) }}
                    className={`aspect-square w-full relative flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 group-hover:z-30
                      ${item.is_booked ? 'bg-white shadow-lg' : 'bg-slate-100 opacity-40 hover:opacity-100 hover:bg-red-50'}`}
                    style={{ clipPath: 'polygon(20% 0%, 50% 15%, 80% 0%, 100% 20%, 85% 50%, 100% 80%, 80% 100%, 50% 85%, 20% 100%, 0% 80%, 15% 50%, 0% 20%)', backgroundImage: item.is_booked ? 'url("https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg")' : '', backgroundSize: '700% 600%', backgroundPosition: `${((idx + first)%7 / 6)*100}% ${Math.floor((idx + first)/7 / 5)*100}%` }}>
                    {item.is_booked ? <img src={item.icon_url} className="w-full h-full object-cover p-1" /> : <span className="text-[10px] font-bold text-slate-400">{idx+1}</span>}
                  </button>

                  {/* ホバー時の情報表示（1.2 採用） */}
                  {item.is_booked && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-40 bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-2xl text-center hidden group-hover:block z-50 animate-in fade-in slide-in-from-bottom-2 shadow-2xl">
                      <p className="text-[10px] font-black mb-1">{item.user_name}</p>
                      <div className="flex flex-wrap justify-center gap-1">
                        {item.hashtags?.map((t: string, i: number) => (
                          <span key={i} className="text-[7px] bg-white/20 px-1.5 py-0.5 rounded-full">#{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 右サイド：コミュニティ・ウォール */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl border-t-8 h-[600px] flex flex-col" style={{ borderColor: NAVY }}>
            <h2 style={{ color: NAVY }} className="text-lg font-black mb-4 flex items-center justify-between">
              <span>COMMUNITY WALL</span>
              <span className="text-[8px] bg-slate-50 px-2 py-1 rounded text-slate-400">Live Feedback</span>
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-4 mb-4">
                {comments.map(c => (
                    <div key={c.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p style={{ color: NAVY }} className="text-[9px] font-black mb-1">{c.user_name}</p>
                        <p className="text-[11px] font-medium text-slate-600 leading-relaxed">{c.comment}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100">
                <input placeholder="名前" className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold outline-none border-2 border-transparent focus:border-red-500 transition-all" value={newComment.name} onChange={e => setNewComment({...newComment, name: e.target.value})} />
                <textarea placeholder="意気込みや応援をどうぞ！" className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold outline-none border-2 border-transparent focus:border-red-500 transition-all h-20" value={newComment.body} onChange={e => setNewComment({...newComment, body: e.target.value})} />
                <button onClick={postComment} style={{ backgroundColor: NAVY }} className="w-full py-3 text-white rounded-xl text-xs font-black shadow-lg hover:brightness-110 active:scale-95 transition-all">POST MESSAGE</button>
            </div>
          </div>
        </section>
      </div>

      {/* 予約・閲覧モーダル */}
      {sel && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 border-t-8" style={{ borderColor: NAVY }}>
            {mode === 'view' ? (
              <div className="text-center">
                <img src={sel.icon_url} className="w-24 h-24 mx-auto rounded-full mb-4 border-4 p-1 shadow-lg" style={{ borderColor: RED }} />
                <h2 className="text-2xl font-black mb-1" style={{ color: NAVY }}>{sel.user_name}</h2>
                <div className="flex justify-center gap-2 mb-6">
                    {sel.hashtags?.map((t: string) => <span key={t} className="text-[8px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">#{t}</span>)}
                </div>
                <a href={sel.url} target="_blank" className="text-blue-600 font-bold underline text-xs block mb-8 uppercase tracking-widest">Visit Link ↗</a>
                <div className="flex gap-4">
                  <button onClick={() => setSel(null)} className="flex-1 text-slate-400 font-bold text-xs">CLOSE</button>
                  <button onClick={() => setMode('edit')} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-600 text-xs">EDIT INFO</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-center" style={{ color: NAVY }}>RESERVE {month+1}/{sel.date_day - startId + 1}</h2>
                
                {/* 1.3 デバイスからアップロード */}
                <div className="flex flex-col items-center gap-2">
                    <label className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all">
                        {form.icon ? <img src={form.icon} className="w-12 h-12 rounded-full mb-1 object-cover" /> : <span className="text-[10px] font-black text-slate-300">画像をアップロード</span>}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                </div>

                <input placeholder="名前" className="w-full bg-slate-50 rounded-xl p-4 text-xs font-bold outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                
                {/* ハッシュタグ入力（最大3つ） */}
                <div className="grid grid-cols-3 gap-2">
                    {form.tags.map((t, i) => (
                        <input key={i} placeholder={`#タグ${i+1}`} className="bg-slate-50 rounded-lg p-2 text-[9px] font-bold outline-none focus:ring-1 focus:ring-red-500" value={t} onChange={e => { let nt = [...form.tags]; nt[i] = e.target.value; setForm({...form, tags: nt}) }} />
                    ))}
                </div>

                <input placeholder="URL" className="w-full bg-slate-50 rounded-xl p-4 text-xs font-bold outline-none" value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
                <input type="password" placeholder="パスワード" className="w-full bg-slate-50 rounded-xl p-4 text-xs font-bold outline-none" value={form.pass} onChange={e => setForm({...form, pass: e.target.value})} />
                
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setSel(null)} className="flex-1 text-slate-400 font-bold text-xs uppercase">Cancel</button>
                  <button onClick={handleSave} style={{ backgroundColor: NAVY }} className="flex-1 py-4 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest">Join Journey</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}