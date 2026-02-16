"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// --- 🖋️ 航海日誌：VS Code 内でここを編集 ---
const MISSION = {
  title: "VOYAGE MANIFESTO 2026",
  content: `福澤諭吉先生の「独立自尊」を胸に。私たちは2026年、米国へと旅立ちます。\n一人ひとりのピースが重なり、一つの星条旗を完成させましょう。\n「唱える大学を創る」——その第一歩を、ここから。`,
  author: "Founder: Keio SFC Student"
};

const NAVY = "#002e65"; const RED = "#cc0033"; const GOLD = "#c5a572";
const ORANGE = "#ff8c00"; // 視認性の高い橙色
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

export default function UltimateCalendarPuzzle() {
  const [entries, setEntries] = useState<any[]>([])
  const [month, setMonth] = useState(new Date().getMonth())
  const [sel, setSel] = useState<any>(null)
  const [mode, setMode] = useState<'view' | 'edit' | 'reg' | null>(null)
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
      hashtags: form.tags.filter(t => t !== ''), is_booked: true
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
    // pb-32 を追加して下までスクロールしやすく改善
    <main className="min-h-screen bg-[#fcfcfd] pt-10 pb-32 px-4 font-sans text-slate-900 overflow-y-auto">
      <style>{`
        .puzzle-shape { clip-path: polygon(20% 0%, 50% 15%, 80% 0%, 100% 20%, 85% 50%, 100% 80%, 80% 100%, 50% 85%, 20% 100%, 0% 80%, 15% 50%, 0% 20%); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      
      <header className="max-w-4xl mx-auto text-center mb-8">
        <h1 style={{ color: NAVY }} className="text-4xl font-black mb-2 tracking-tighter uppercase italic">Keio ⇄ USA 2026</h1>
        <p className="text-[10px] font-bold text-slate-400 tracking-[0.4em] uppercase mb-10">Independence & Self-Respect</p>
        
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 text-left relative overflow-hidden">
            <h2 style={{ color: NAVY }} className="text-xs font-black mb-4 tracking-widest uppercase flex items-center gap-2">
                <span className="w-8 h-[1px] bg-red-600"></span> {MISSION.title}
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line mb-4 font-medium">{MISSION.content}</p>
            <p style={{ color: GOLD }} className="text-[10px] font-bold text-right italic uppercase tracking-widest">{MISSION.author}</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* 月選択 */}
        <div className="flex overflow-x-auto gap-2 p-2 mb-8 bg-white rounded-full shadow-inner w-full no-scrollbar border border-slate-100 max-w-lg">
          {Array.from({length:12}).map((_, i) => (
            <button key={i} onClick={() => setMonth(i)} 
              className={`flex-shrink-0 w-11 py-2 rounded-full text-[11px] font-black transition-all ${month === i ? 'text-white bg-[#002e65] shadow-lg scale-110' : 'text-slate-300'}`}>{i+1}月</button>
          ))}
        </div>

        {/* パズルカレンダー */}
        <div className="w-full max-w-[480px] bg-white rounded-[3.5rem] p-10 shadow-2xl border-b-[16px] relative" style={{ borderColor: RED }}>
          <div className="grid grid-cols-7 gap-2 relative z-10">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-center bg-cover rounded-2xl" 
                 style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg")' }}></div>
            
            {WEEKDAYS.map(w => <div key={w} className="text-[9px] font-black text-slate-200 text-center mb-2">{w}</div>)}
            {Array.from({length: firstDayIdx}).map((_, i) => <div key={i} />)}
            
            {monthEntries.length > 0 ? monthEntries.map((item, idx) => {
              const r = Math.floor((idx + firstDayIdx) / 7);
              const c = (idx + firstDayIdx) % 7;
              return (
                <div key={item.id} className="relative group">
                  <button onClick={() => { setSel(item); setMode(item.is_booked ? 'view' : 'reg'); setForm({name:item.user_name||'', url:item.url||'', icon:item.icon_url||'', pass:'', tags:item.hashtags||['','','']}) }}
                    className={`aspect-square w-full puzzle-shape relative flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 group-hover:z-30
                      ${item.is_booked ? 'bg-white shadow-lg' : 'bg-slate-100 opacity-40 hover:opacity-100 hover:bg-red-50'}`}
                    style={{ 
                      backgroundImage: item.is_booked ? 'url("https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg")' : '',
                      backgroundSize: '700% 600%', backgroundPosition: `${(c/6)*100}% ${(r/5)*100}%`
                    }}>
                    {item.is_booked ? <img src={item.icon_url} className="w-full h-full object-cover p-1.5" /> : <span className="text-[10px] font-bold text-slate-400">{idx+1}</span>}
                  </button>

                  {/* 🌟 改善：橙色の情報ボックス（視認性向上） */}
                  {item.is_booked && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-44 bg-[#ff8c00] p-3 rounded-2xl text-center hidden group-hover:block z-50 animate-in fade-in shadow-2xl">
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#ff8c00] rotate-45"></div>
                      <p style={{ color: NAVY }} className="text-[11px] font-black mb-1.5 border-b border-[#002e65]/20 pb-1">{item.user_name}</p>
                      <div className="flex flex-wrap justify-center gap-1">
                        {item.hashtags?.map((t: string, i: number) => (
                          <span key={i} className="text-[7px] bg-[#002e65]/10 text-[#002e65] px-1.5 py-0.5 rounded-full font-bold">#{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            }) : <div className="col-span-7 py-20 text-center text-[10px] font-bold text-slate-200 uppercase tracking-widest italic">Connecting Journey...</div>}
          </div>
        </div>
      </div>

      {/* モーダル：予約 ＆ 詳細 */}
      {sel && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border-t-8 border-[#002e65] max-h-[90vh] overflow-y-auto no-scrollbar">
            {mode === 'view' ? (
              <div className="text-center">
                <img src={sel.icon_url} className="w-20 h-20 mx-auto rounded-full mb-4 border-4 p-1 shadow-lg object-cover ring-4 ring-slate-50" style={{ borderColor: RED }} />
                <h2 className="text-2xl font-black mb-1" style={{ color: NAVY }}>{sel.user_name}</h2>
                <div className="flex justify-center gap-2 mb-8 flex-wrap">
                    {sel.hashtags?.map((t: string) => <span key={t} className="text-[8px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">#{t}</span>)}
                </div>
                <a href={sel.url} target="_blank" rel="noopener noreferrer" className="inline-block py-3 px-8 bg-blue-50 text-blue-600 font-black text-xs rounded-full mb-10 hover:bg-blue-100 uppercase tracking-widest transition-all">Visit Link ↗</a>
                <button onClick={() => setSel(null)} className="w-full text-slate-400 font-bold text-[10px] uppercase tracking-tighter">Close Window</button>
              </div>
            ) : (
              <div className="space-y-5">
                <h2 className="text-xl font-black text-center mb-6 uppercase tracking-tight" style={{ color: NAVY }}>Day {sel.date_day} Journey</h2>
                
                {/* 🌟 改善：半径5文字分（約w-16: 64px）の円形プレビュー */}
                <div className="flex flex-col items-center gap-2">
                    <label className="w-16 h-16 border-2 border-dashed border-slate-200 rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all overflow-hidden bg-slate-50 group">
                        {form.icon ? (
                            <img src={form.icon} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[8px] font-black text-slate-300 text-center leading-tight">SELECT<br/>PHOTO</span>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Icon Preview</p>
                </div>

                <div className="space-y-3">
                  <input placeholder="名前 (Name)" className="w-full bg-slate-50 rounded-xl p-4 text-xs font-bold outline-none shadow-inner focus:bg-white" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  
                  {/* 🌟 修正：ハッシュタグ入力欄（最大3つ）を復活 */}
                  <div className="grid grid-cols-3 gap-2">
                    {form.tags.map((t, i) => (
                      <input key={i} placeholder={`#タグ${i+1}`} className="bg-slate-50 rounded-lg p-2 text-[9px] font-bold outline-none shadow-inner focus:ring-1 focus:ring-orange-500 focus:bg-white" 
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
                  <button onClick={() => setSel(null)} className="flex-1 text-slate-400 font-bold text-[10px] uppercase tracking-tighter">Cancel</button>
                  <button onClick={handleSave} style={{ backgroundColor: NAVY }} className="flex-1 py-4 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest">Save Piece</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}