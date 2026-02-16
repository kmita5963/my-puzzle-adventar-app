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
  content: `福澤諭吉先生の「独立自尊」を胸に。私たちは2026年、米国へと旅立ちます。\nこのカレンダーは365日の航海図。一人ひとりのピースが重なり、一つの星条旗を完成させましょう。`,
  author: "Founder: Keio SFC Student"
};

const NAVY = "#002e65"; const RED = "#cc0033"; const GOLD = "#c5a572";
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

export default function PerfectEvolutionPuzzle() {
  const [entries, setEntries] = useState<any[]>([])
  const [month, setMonth] = useState(new Date().getMonth())
  const [sel, setSel] = useState<any>(null)
  const [mode, setMode] = useState<'view' | 'edit' | 'reg' | null>(null)
  const [form, setForm] = useState({ name: '', url: '', icon: '', pass: '', tags: ['', '', ''] })

  const fetchEntries = useCallback(async () => {
    const { data } = await supabase.from('advent_calendar').select('*').order('date_day')
    if (data) setEntries(data)
  }, [])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  // デバイスからの画像読み込み（FileReader）
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setForm(prev => ({ ...prev, icon: reader.result as string }))
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (mode === 'edit' && form.pass !== sel.edit_password) return alert("パスワードが正しくありません")
    const payload = {
      user_name: form.name, 
      url: form.url, 
      icon_url: form.icon,
      edit_password: form.pass || (sel ? sel.edit_password : ''),
      hashtags: form.tags.filter(t => t.trim() !== ''),
      is_booked: true
    }
    await supabase.from('advent_calendar').update(payload).eq('id', sel.id)
    setSel(null); setMode(null); fetchEntries()
  }

  const year = 2026;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIdx = new Date(year, month, 1).getDay();
  const getOffset = (m: number) => {
    let c = 0; for(let i=0; i<m; i++) c += new Date(year, i+1, 0).getDate();
    return c;
  }
  const startId = (month === 0 ? 0 : getOffset(month)) + 1;
  const currentEntries = entries.length > 0 ? entries.slice(startId - 1, startId - 1 + daysInMonth) : [];

  return (
    <div className="min-h-screen bg-[#fcfcfd] py-12 px-4 font-sans antialiased text-slate-900">
      
      {/* 1. Header & Mission Box */}
      <header className="max-w-4xl mx-auto text-center mb-10">
        <h1 style={{ color: NAVY }} className="text-4xl font-black mb-2 tracking-tighter uppercase italic">Keio ⇄ USA 2026</h1>
        <p className="text-[10px] font-bold text-slate-400 tracking-[0.4em] mb-10 uppercase">Independence & Self-Respect</p>
        
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 text-left relative overflow-hidden">
            <h2 style={{ color: NAVY }} className="text-xs font-black mb-4 tracking-widest uppercase flex items-center gap-2">
                <span className="w-8 h-[1px] bg-red-600"></span> {MISSION.title}
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line mb-4 font-medium">{MISSION.content}</p>
            <p style={{ color: GOLD }} className="text-[10px] font-bold text-right italic uppercase tracking-widest">{MISSION.author}</p>
        </div>
      </header>

      {/* 2. Month Selector */}
      <div className="w-full max-w-[420px] mx-auto flex overflow-x-auto gap-2 p-2 mb-8 no-scrollbar bg-white rounded-full shadow-inner border border-slate-100">
        {Array.from({length:12}).map((_, i) => (
          <button key={i} onClick={() => setMonth(i)} 
            className={`flex-shrink-0 w-11 py-2 rounded-full text-[11px] font-black transition-all ${month === i ? 'text-white shadow-lg scale-110' : 'text-slate-300 hover:text-slate-600'}`}
            style={{ backgroundColor: month === i ? NAVY : '' }}>{i+1}月</button>
        ))}
      </div>

      {/* 3. Puzzle Board */}
      <div className="w-full max-w-[420px] mx-auto bg-white rounded-[3rem] p-8 shadow-2xl border-b-[14px] relative" style={{ borderColor: RED }}>
        <div className="grid grid-cols-7 gap-1.5 mb-4 text-center">
          {WEEKDAYS.map(w => <div key={w} className="text-[10px] font-black text-slate-200 uppercase">{w}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-2 relative z-10">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-center bg-cover rounded-2xl" 
               style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg")' }}></div>
          
          {Array.from({length: firstDayIdx}).map((_, i) => <div key={i} />)}
          
          {currentEntries.map((item, idx) => {
            const r = Math.floor((idx + firstDayIdx) / 7);
            const c = (idx + firstDayIdx) % 7;
            return (
              <div key={item.id} className="relative group">
                <button onClick={() => {
                  setSel(item);
                  if(item.is_booked) { setMode('view'); setForm({name:item.user_name, url:item.url, icon:item.icon_url, pass:'', tags: item.hashtags || ['', '', '']})}
                  else { setMode('reg'); setForm({name:'', url:'', icon:'', pass:'', tags: ['', '', '']})}
                }}
                className={`aspect-square w-full relative flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 group-hover:z-30
                  ${item.is_booked ? 'bg-white shadow-lg ring-1 ring-slate-100' : 'bg-slate-100 opacity-50 hover:opacity-100'}`}
                style={{ 
                  clipPath: 'polygon(20% 0%, 50% 15%, 80% 0%, 100% 20%, 85% 50%, 100% 80%, 80% 100%, 50% 85%, 20% 100%, 0% 80%, 15% 50%, 0% 20%)',
                  backgroundImage: item.is_booked ? 'url("https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg")' : '',
                  backgroundSize: '700% 600%', backgroundPosition: `${(c/6)*100}% ${(r/5)*100}%`
                }}>
                  {item.is_booked ? (
                    // アイコンサイズを調整：p-1.5 を入れて「ピースの中に収まる」ように
                    <img src={item.icon_url} className="w-full h-full object-cover p-1.5" />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">{idx+1}</span>
                  )}
                </button>

                {/* ホバー情報ボックス：視認性を高めたデザイン */}
                {item.is_booked && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-44 bg-slate-900 text-white p-3 rounded-2xl text-center hidden group-hover:block z-50 animate-in fade-in slide-in-from-bottom-2 shadow-2xl border border-white/10">
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45"></div>
                    <p className="text-[11px] font-black mb-1.5 tracking-tight border-b border-white/10 pb-1">{item.user_name}</p>
                    <div className="flex flex-wrap justify-center gap-1">
                      {item.hashtags?.map((tag: string, i: number) => (
                        <span key={i} className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded-md truncate max-w-full">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 4. Modal */}
      {sel && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border-t-8 animate-in zoom-in-95 duration-200" style={{ borderColor: NAVY }}>
            {mode === 'view' ? (
              <div className="text-center">
                <img src={sel.icon_url} className="w-20 h-20 mx-auto rounded-full mb-4 border-4 p-1 shadow-lg object-cover ring-4 ring-slate-50" style={{ borderColor: RED }} />
                <h2 className="text-2xl font-black mb-2" style={{ color: NAVY }}>{sel.user_name}</h2>
                <div className="flex justify-center gap-2 mb-8 flex-wrap">
                  {sel.hashtags?.map((tag: string) => (
                    <span key={tag} className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">#{tag}</span>
                  ))}
                </div>
                <a href={sel.url} target="_blank" className="inline-block py-3 px-8 bg-blue-50 text-blue-600 font-black text-xs rounded-full mb-8 hover:bg-blue-100 transition-all uppercase tracking-widest">Visit Link ↗</a>
                <div className="flex gap-4 pt-4 border-t border-slate-50">
                  <button onClick={() => setSel(null)} className="flex-1 text-slate-400 font-bold text-[10px] uppercase">Close</button>
                  <button onClick={() => setMode('edit')} className="flex-1 py-3 bg-slate-50 rounded-xl font-bold text-slate-600 text-[10px] uppercase">Edit</button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <h2 className="text-xl font-black text-center mb-4 uppercase tracking-tight" style={{ color: NAVY }}>Reserve Day {sel.date_day}</h2>
                
                <div className="flex flex-col items-center gap-3">
                  <label className="w-24 h-24 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-red-600 transition-all overflow-hidden bg-slate-50 group shadow-inner">
                    {form.icon ? (
                      <img src={form.icon} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-black text-slate-300 group-hover:text-red-600">UPLOAD PHOTO</span>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>

                <div className="space-y-3">
                  <input placeholder="名前 (Name)" className="w-full bg-slate-50 rounded-xl p-4 text-xs font-bold outline-none shadow-inner focus:bg-white" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  
                  <div className="grid grid-cols-3 gap-2">
                    {form.tags.map((t, i) => (
                      <input key={i} placeholder={`#タグ${i+1}`} className="bg-slate-50 rounded-lg p-2 text-[9px] font-bold outline-none shadow-inner focus:ring-1 focus:ring-red-500 focus:bg-white" 
                        value={t} onChange={e => {
                          const newTags = [...form.tags];
                          newTags[i] = e.target.value;
                          setForm({...form, tags: newTags});
                        }} />
                    ))}
                  </div>

                  <input placeholder="URL" className="w-full bg-slate-50 rounded-xl p-4 text-xs font-bold outline-none shadow-inner focus:bg-white" value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
                  <input type="password" placeholder="編集パスワード" className="w-full bg-slate-50 rounded-xl p-4 text-xs font-bold outline-none shadow-inner focus:bg-white" value={form.pass} onChange={e => setForm({...form, pass: e.target.value})} />
                </div>
                
                <div className="flex gap-4 pt-4">
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