"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// --- 🖋️ 航海日誌：VS Code 内で編集 ---
const MISSION = {
  title: "VOYAGE MANIFESTO 2026",
  content: `福澤諭吉先生の「独立自尊」を胸に。私たちは2026年、米国へと旅立ちます。\n一人ひとりのピースが重なり、一つの星条旗を完成させましょう。`,
  author: "Founder: Keio SFC Student"
};

const NAVY = "#002e65"; const RED = "#cc0033"; const GOLD = "#c5a572";
const ORANGE = "#ff8c00"; 
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

export default function PerfectFinalPuzzle() {
  const [entries, setEntries] = useState<any[]>([])
  const [month, setMonth] = useState(new Date().getMonth())
  const [sel, setSel] = useState<any>(null)
  const [mode, setMode] = useState<'view' | 'edit' | 'reg' | null>(null)
  // 初期状態で3つの空文字を持つ配列をセット
  const [form, setForm] = useState({ name: '', url: '', icon: '', pass: '', tags: ['', '', ''] })

  const fetchAll = useCallback(async () => {
    const { data } = await supabase.from('advent_calendar').select('*').order('date_day')
    if (data) setEntries(data)
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
      user_name: form.name, url: form.url, icon_url: form.icon,
      edit_password: form.pass || (sel.edit_password || ''), 
      hashtags: form.tags.filter(t => t.trim() !== ''), // 空文字を除去
      is_booked: true
    }
    await supabase.from('advent_calendar').update(payload).eq('id', sel.id)
    setSel(null); setMode(null); fetchAll()
  }

  const year = 2026;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIdx = new Date(year, month, 1).getDay();
  const getOffset = (m: number) => {
    let count = 0; for(let i=0; i<m; i++) count += new Date(year, i+1, 0).getDate();
    return count;
  }
  const startId = (month === 0 ? 0 : getOffset(month)) + 1;
  const monthEntries = entries.length > 0 ? entries.slice(startId - 1, startId - 1 + daysInMonth) : [];

  return (
    <main className="min-h-screen bg-[#fcfcfd] py-10 pb-40 px-4 font-sans text-slate-900 overflow-y-auto">
      <style>{`
        .puzzle-shape { clip-path: polygon(20% 0%, 50% 15%, 80% 0%, 100% 20%, 85% 50%, 100% 80%, 80% 100%, 50% 85%, 20% 100%, 0% 80%, 15% 50%, 0% 20%); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      
      <header className="max-w-4xl mx-auto text-center mb-8">
        <h1 style={{ color: NAVY }} className="text-3xl font-black mb-1 tracking-tighter uppercase italic">Keio ⇄ USA 2026</h1>
        <p className="text-[10px] font-bold text-slate-400 tracking-[0.4em] uppercase mb-6 italic">Independence & Self-Respect</p>
      </header>

      {/* カレンダーエリア */}
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <div className="flex overflow-x-auto gap-1.5 p-1.5 mb-8 bg-white rounded-full shadow-inner w-full no-scrollbar border border-slate-100 max-w-sm">
          {Array.from({length:12}).map((_, i) => (
            <button key={i} onClick={() => setMonth(i)} 
              className={`flex-shrink-0 w-9 py-1.5 rounded-full text-[10px] font-black transition-all ${month === i ? 'text-white bg-[#002e65] shadow-md' : 'text-slate-300'}`}>{i+1}月</button>
          ))}
        </div>

        <div className="w-full max-w-[420px] bg-white rounded-[3rem] p-8 shadow-2xl border-b-[12px] relative" style={{ borderColor: RED }}>
          <div className="grid grid-cols-7 gap-1.5 relative z-10">
            {WEEKDAYS.map(w => <div key={w} className="text-[8px] font-black text-slate-200 text-center mb-1 uppercase">{w}</div>)}
            {Array.from({length: firstDayIdx}).map((_, i) => <div key={i} />)}
            
            {monthEntries.map((item, idx) => {
              const r = Math.floor((idx + firstDayIdx) / 7);
              const c = (idx + firstDayIdx) % 7;
              return (
                <div key={item.id} className="relative group">
                  <button onClick={() => { 
                    setSel(item); 
                    setMode(item.is_booked ? 'view' : 'reg');
                    setForm({
                      name: item.user_name || '', 
                      url: item.url || '', 
                      icon: item.icon_url || '', 
                      pass: '', 
                      tags: item.hashtags && item.hashtags.length > 0 ? [...item.hashtags, '', '', ''].slice(0, 3) : ['', '', '']
                    })
                  }}
                    className={`aspect-square w-full puzzle-shape relative flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 group-hover:z-30
                      ${item.is_booked ? 'bg-white shadow-lg' : 'bg-slate-50 opacity-40 hover:opacity-100 hover:bg-red-50'}`}
                    style={{ 
                      backgroundImage: item.is_booked ? 'url("https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg")' : '',
                      backgroundSize: '700% 600%', backgroundPosition: `${(c/6)*100}% ${(r/5)*100}%`
                    }}>
                    {item.is_booked ? <img src={item.icon_url} className="w-full h-full object-cover p-1.5" /> : <span className="text-[10px] font-bold text-slate-400">{idx+1}</span>}
                  </button>

                  {item.is_booked && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 bg-[#ff8c00] p-3 rounded-2xl text-center hidden group-hover:block z-50 animate-in fade-in shadow-xl">
                      <p style={{ color: NAVY }} className="text-[10px] font-black mb-1 truncate">{item.user_name}</p>
                      <div className="flex flex-wrap justify-center gap-1">
                        {item.hashtags?.map((t: string, i: number) => (
                          <span key={i} className="text-[7px] bg-[#002e65]/10 text-[#002e65] px-1.5 py-0.5 rounded-md font-bold">#{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 🌟 修正：カレンダーの真上に被さるスクロール可能モーダル 🌟 */}
      {sel && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[100] overflow-hidden">
          {/* ボックス自体を最大高さを制限し、内部でスクロール可能に */}
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border-t-8 border-[#002e65] relative my-auto animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="overflow-y-auto pr-2 no-scrollbar">
              {mode === 'view' ? (
                <div className="text-center py-4">
                  <img src={sel.icon_url} className="w-20 h-20 mx-auto rounded-full mb-4 border-4 p-1 shadow-lg object-cover ring-4 ring-slate-50" style={{ borderColor: RED }} />
                  <h2 className="text-2xl font-black mb-1" style={{ color: NAVY }}>{sel.user_name}</h2>
                  <div className="flex justify-center gap-1.5 mb-8 flex-wrap">
                      {sel.hashtags?.map((t: string) => <span key={t} className="text-[8px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">#{t}</span>)}
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setSel(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl text-slate-400 font-bold text-[10px] uppercase">Close</button>
                    <button onClick={() => setMode('edit')} className="flex-1 py-4 bg-[#002e65] rounded-2xl text-white font-bold text-[10px] uppercase shadow-lg">Edit Info</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 py-4">
                  <h2 className="text-xl font-black text-center mb-2 uppercase tracking-tight" style={{ color: NAVY }}>Day {sel.date_day} Journey</h2>
                  
                  {/* 🌟 101px 固定プレビュー 🌟 */}
                  <div className="flex flex-col items-center">
                      <label 
                        style={{ width: '101px', height: '101px' }}
                        className="border-2 border-dashed border-slate-200 rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all overflow-hidden bg-slate-50 group">
                          {form.icon ? (
                              <img src={form.icon} className="w-full h-full object-cover" />
                          ) : (
                              <span className="text-[8px] font-black text-slate-300 text-center leading-tight uppercase">Upload<br/>Icon</span>
                          )}
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Basic Info</p>
                    <input placeholder="名前 (Name)" className="w-full bg-slate-50 rounded-xl p-3.5 text-xs font-bold outline-none shadow-inner border border-transparent focus:border-orange-500 transition-all" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    
                    {/* 🌟 復活：3つのハッシュタグ入力欄 🌟 */}
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Hashtags (Max 3)</p>
                    <div className="grid grid-cols-3 gap-2">
                      {form.tags.map((t, i) => (
                        <input key={i} placeholder={`#タグ${i+1}`} className="bg-slate-50 rounded-lg p-2 text-[9px] font-bold outline-none shadow-inner border border-transparent focus:border-orange-500 focus:bg-white transition-all" 
                          value={t} onChange={e => {
                            const nt = [...form.tags];
                            nt[i] = e.target.value;
                            setForm({...form, tags: nt});
                          }} />
                      ))}
                    </div>

                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Links & Security</p>
                    <input placeholder="自己紹介 URL" className="w-full bg-slate-50 rounded-xl p-3.5 text-xs font-bold outline-none shadow-inner focus:bg-white border border-transparent focus:border-orange-500" value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
                    <input type="password" placeholder="編集パスワード" className="w-full bg-slate-50 rounded-xl p-3.5 text-xs font-bold outline-none shadow-inner focus:bg-white border border-transparent focus:border-orange-500" value={form.pass} onChange={e => setForm({...form, pass: e.target.value})} />
                  </div>
                  
                  <div className="flex gap-4 pt-2">
                    <button onClick={() => setSel(null)} className="flex-1 text-slate-400 font-bold text-[10px] uppercase">Cancel</button>
                    <button onClick={handleSave} style={{ backgroundColor: NAVY }} className="flex-1 py-4 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest">Save Piece</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}