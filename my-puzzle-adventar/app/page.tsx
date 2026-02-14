"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const NAVY = "#002e65"; const RED = "#cc0033";
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
const PRESETS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=A',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=B',
  'https://api.dicebear.com/7.x/bottts/svg?seed=C',
  'https://api.dicebear.com/7.x/bottts/svg?seed=D',
  'https://api.dicebear.com/7.x/notionists/svg?seed=E'
]

export default function UltimateFinalPuzzle() {
  const [entries, setEntries] = useState<any[]>([])
  const [month, setMonth] = useState(new Date().getMonth())
  const [sel, setSel] = useState<any>(null)
  const [mode, setMode] = useState<'view' | 'edit' | 'reg' | null>(null)
  const [form, setForm] = useState({ name: '', url: '', icon: '', pass: '' })

  useEffect(() => { fetch() }, [])
  async function fetch() {
    const { data } = await supabase.from('advent_calendar').select('*').order('date_day')
    if (data) setEntries(data)
  }

  const year = 2026;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIdx = new Date(year, month, 1).getDay();
  const getOffset = (m: number) => {
    let c = 0; for(let i=0; i<m; i++) c += new Date(year, i+1, 0).getDate();
    return c;
  }
  const startId = getOffset(month) + 1;
  const monthEntries = entries.slice(startId - 1, startId - 1 + daysInMonth);

  const handleSave = async () => {
    if (mode === 'edit' && form.pass !== sel.edit_password) return alert("パスワードが正しくありません")
    const payload = {
      user_name: form.name, url: form.url, icon_url: form.icon,
      edit_password: form.pass || sel.edit_password, is_booked: true
    }
    await supabase.from('advent_calendar').update(payload).eq('id', sel.id)
    setSel(null); setMode(null); fetch();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 font-sans antialiased">
      {/* 慶應×米国 ヘッダー */}
      <div className="text-center mb-6">
        <h1 style={{ color: NAVY }} className="text-4xl font-black mb-1 tracking-tighter">KEIO ⇄ USA 2026</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Independence & Self-Respect</p>
      </div>

      {/* 月選択：直感的なインターフェース */}
      <div className="w-full max-w-[420px] flex overflow-x-auto gap-2 p-2 mb-6 no-scrollbar bg-white/60 rounded-full shadow-inner border border-slate-100">
        {Array.from({length:12}).map((_, i) => (
          <button key={i} onClick={() => setMonth(i)} 
            className={`flex-shrink-0 w-12 py-2 rounded-full text-xs font-black transition-all ${month === i ? 'text-white shadow-lg scale-110' : 'text-slate-400 hover:text-slate-600'}`}
            style={{ backgroundColor: month === i ? NAVY : '' }}>{i+1}月</button>
        ))}
      </div>

      {/* パズルボード：固定サイズで設計された「空間」 */}
      <div className="w-full max-w-[420px] bg-white rounded-[3rem] p-8 shadow-2xl border-b-[14px] relative" style={{ borderColor: RED }}>
        <div className="grid grid-cols-7 gap-1 mb-4 text-center">
          {WEEKDAYS.map(w => <div key={w} className="text-[10px] font-black text-slate-200">{w}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-2 relative z-10">
          {/* 星条旗背景：埋まるほど鮮明に */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-center bg-cover rounded-2xl" 
               style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg")' }}></div>
          
          {Array.from({length: firstDayIdx}).map((_, i) => <div key={i} />)}
          
          {monthEntries.map((item, idx) => {
            const r = Math.floor((idx + firstDayIdx) / 7);
            const c = (idx + firstDayIdx) % 7;
            return (
              <button key={item.id} onClick={() => {
                setSel(item);
                if(item.is_booked) { setMode('view'); setForm({name:item.user_name, url:item.url, icon:item.icon_url, pass:''})}
                else { setMode('reg'); setForm({name:'', url:'', icon:PRESETS[0], pass:''})}
              }}
              // パズルの凹凸 (clip-path) と ホバー時のアフォーダンス
              className={`aspect-square relative flex items-center justify-center transition-all duration-300 transform hover:z-20
                ${item.is_booked ? 'bg-white shadow-xl scale-100 ring-2 ring-white/50' : 'bg-slate-200 opacity-50 hover:opacity-100 hover:scale-125 hover:bg-red-50'}`}
              style={{ 
                clipPath: 'polygon(20% 0%, 50% 15%, 80% 0%, 100% 20%, 85% 50%, 100% 80%, 80% 100%, 50% 85%, 20% 100%, 0% 80%, 15% 50%, 0% 20%)',
                backgroundImage: item.is_booked ? 'url("https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg")' : '',
                backgroundSize: '700% 600%',
                backgroundPosition: `${(c/6)*100}% ${(r/5)*100}%`
              }}>
                {item.is_booked ? (
                  <img src={item.icon_url} className="w-full h-full object-cover p-1.5" />
                ) : (
                  <span className="text-[10px] font-bold text-slate-400">{idx+1}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* モーダル：情報の透明性を追求 */}
      {sel && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[2rem] p-10 w-full max-w-sm shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border-t-[12px] animate-in zoom-in-95 duration-200" style={{ borderColor: NAVY }}>
            {mode === 'view' ? (
              <div className="text-center">
                <img src={sel.icon_url} className="w-24 h-24 mx-auto rounded-full mb-4 border-4 p-1 shadow-lg" style={{ borderColor: RED }} />
                <h2 className="text-3xl font-black mb-2" style={{ color: NAVY }}>{sel.user_name}</h2>
                <a href={sel.url} target="_blank" rel="noopener noreferrer" 
                   className="inline-flex items-center gap-2 py-3 px-8 bg-blue-50 text-blue-600 font-black text-sm mb-10 rounded-full hover:bg-blue-100 hover:scale-105 transition-all">
                  VISIT PROFILE ↗
                </a>
                <div className="flex gap-4">
                  <button onClick={() => setSel(null)} className="flex-1 text-slate-400 font-bold text-xs uppercase tracking-widest">Close</button>
                  <button onClick={() => setMode('edit')} className="flex-1 py-4 bg-slate-50 rounded-2xl font-bold text-slate-600 text-xs hover:bg-slate-100">EDIT INFO</button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-center" style={{ color: NAVY }}>RESERVE {month+1}/{sel.date_day - startId + 1}</h2>
                
                <div className="flex justify-between p-3 bg-slate-50 rounded-2xl shadow-inner">
                  {PRESETS.map(i => (
                    <button key={i} onClick={() => setForm({...form, icon: i})} 
                      className={`w-11 h-11 rounded-full border-4 transition-all ${form.icon === i ? 'border-red-600 scale-110 shadow-md' : 'border-transparent opacity-40 hover:opacity-100'}`}>
                      <img src={i} className="rounded-full" />
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <input placeholder="名前 (Name)" className="w-full bg-slate-50 border-2 border-transparent rounded-xl p-4 text-slate-900 font-black placeholder:text-slate-400 focus:border-red-600 focus:bg-white transition-all outline-none shadow-sm" 
                    value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  <input placeholder="URL (Profile Link)" className="w-full bg-slate-50 border-2 border-transparent rounded-xl p-4 text-slate-900 font-black placeholder:text-slate-400 focus:border-red-600 focus:bg-white transition-all outline-none shadow-sm" 
                    value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
                  <input type="password" placeholder="パスワード (Password)" className="w-full bg-slate-50 border-2 border-transparent rounded-xl p-4 text-slate-900 font-black placeholder:text-slate-400 focus:border-red-600 focus:bg-white transition-all outline-none shadow-sm" 
                    value={form.pass} onChange={e => setForm({...form, pass: e.target.value})} />
                </div>
                
                <div className="flex gap-4 pt-6">
                  <button onClick={() => setSel(null)} className="flex-1 text-slate-400 font-bold text-xs uppercase">Cancel</button>
                  <button onClick={handleSave} style={{ backgroundColor: NAVY }} className="flex-1 py-5 text-white font-black rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all text-sm uppercase">SAVE PIECE</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}