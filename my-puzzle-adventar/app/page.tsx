"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const KEIO_NAVY = "#002e65"; const KEIO_RED = "#cc0033";
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
const ICON_PRESETS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=A',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=B',
  'https://api.dicebear.com/7.x/bottts/svg?seed=C',
  'https://api.dicebear.com/7.x/bottts/svg?seed=D'
]

export default function UltimateKeioUSA() {
  const [entries, setEntries] = useState<any[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [selectedDay, setSelectedDay] = useState<any>(null)
  const [mode, setMode] = useState<'view' | 'edit' | 'reserve' | null>(null)
  const [form, setForm] = useState({ name: '', url: '', icon: '', pass: '' })

  useEffect(() => { fetchEntries() }, [])

  async function fetchEntries() {
    const { data } = await supabase.from('advent_calendar').select('*').order('date_day')
    if (data) setEntries(data)
  }

  // 2026年カレンダー計算ロジック
  const year = 2026;
  const daysInMonth = new Date(year, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, currentMonth, 1).getDay(); // 開始曜日
  
  // 1月1日からの通算日数を計算
  const getStartId = (m: number) => {
    let d = 0; for(let i=0; i<m; i++) d += new Date(year, i+1, 0).getDate();
    return d + 1;
  }
  const startId = getStartId(currentMonth);
  const currentMonthEntries = entries.slice(startId - 1, startId - 1 + daysInMonth);

  const handleSave = async () => {
    if (mode === 'edit' && form.pass !== selectedDay.edit_password) return alert("パスワードが違います")
    const payload = {
      user_name: form.name, url: form.url, icon_url: form.icon || `https://github.com/${form.name}.png`,
      edit_password: form.pass || selectedDay.edit_password, is_booked: true
    }
    await supabase.from('advent_calendar').update(payload).eq('id', selectedDay.id)
    setSelectedDay(null); setMode(null); fetchEntries()
  }

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4 antialiased">
      {/* 1. Header Section */}
      <div className="text-center mb-8">
        <h1 style={{ color: KEIO_NAVY }} className="text-3xl font-black tracking-tighter mb-1">KEIO ⇄ USA 2026</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Independence & Self-Respect</p>
      </div>

      {/* 2. Month Selector (Fixed Size & Scrollable) */}
      <div className="w-full max-w-md flex overflow-x-auto gap-2 p-2 no-scrollbar mb-4 bg-white/50 rounded-full shadow-inner">
        {Array.from({length: 12}).map((_, i) => (
          <button key={i} onClick={() => setCurrentMonth(i)} 
            className={`flex-shrink-0 w-12 py-2 rounded-full text-xs font-black transition-all ${currentMonth === i ? 'text-white shadow-md' : 'text-slate-400'}`}
            style={{ backgroundColor: currentMonth === i ? KEIO_NAVY : '' }}>{i+1}月</button>
        ))}
      </div>

      {/* 3. Calendar Container (Fixed Size) */}
      <div className="w-full max-w-[400px] bg-white rounded-[2.5rem] p-6 shadow-2xl border-b-[10px]" style={{ borderColor: KEIO_RED }}>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {WEEKDAYS.map(w => <div key={w} className="text-[9px] font-black text-slate-300 text-center">{w}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-2 relative">
          {/* US Flag Background (予約が埋まるとパズルが完成する) */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-center bg-cover rounded-xl" 
               style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg")' }}></div>
          
          {/* 前の月の余白 */}
          {Array.from({length: firstDayOfWeek}).map((_, i) => <div key={i} />)}
          
          {/* 当月のピース */}
          {currentMonthEntries.map((item, idx) => (
            <button key={item.id} 
              onClick={() => {
                setSelectedDay(item);
                if(item.is_booked) { setMode('view'); setForm({name:item.user_name, url:item.url, icon:item.icon_url, pass:''})}
                else { setMode('reserve'); setForm({name:'', url:'', icon:ICON_PRESETS[0], pass:''})}
              }}
              className={`aspect-square relative puzzle-piece flex items-center justify-center transition-all duration-300 hover:scale-110 hover:z-20
                ${item.is_booked ? 'bg-white shadow-lg border-slate-100 animate-snap' : 'bg-slate-200 border-transparent hover:bg-[#cc0033]/20'}`}>
              {item.is_booked ? (
                <img src={item.icon_url} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-slate-400">{idx+1}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Modal (View / Entry) */}
      {selectedDay && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 border-t-8" style={{ borderColor: KEIO_NAVY }}>
            {mode === 'view' ? (
              <div className="text-center">
                <img src={selectedDay.icon_url} className="w-24 h-24 mx-auto rounded-full mb-4 border-4 p-1 shadow-lg" style={{ borderColor: KEIO_RED }} />
                <h2 className="text-2xl font-black mb-1" style={{ color: KEIO_NAVY }}>{selectedDay.user_name}</h2>
                {/* リンクをタップ可能に */}
                <a href={selectedDay.url} target="_blank" rel="noopener noreferrer" className="inline-block py-2 px-6 bg-slate-50 text-blue-600 font-bold text-sm mb-8 rounded-full hover:bg-blue-50">
                  VIEW PROFILE ↗
                </a>
                <div className="flex gap-4">
                  <button onClick={() => setSelectedDay(null)} className="flex-1 text-slate-400 font-bold uppercase tracking-widest text-xs">Close</button>
                  <button onClick={() => setMode('edit')} className="flex-1 py-3 bg-slate-100 rounded-2xl font-bold text-slate-600 text-xs">EDIT INFO</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-center mb-6" style={{ color: KEIO_NAVY }}>
                  {currentMonth+1}月{selectedDay.date_day - startId + 1}日 予約
                </h2>
                
                {/* Icon Selection */}
                <div className="flex justify-between p-3 bg-slate-50 rounded-2xl">
                  {ICON_PRESETS.map(i => (
                    <button key={i} onClick={() => setForm({...form, icon: i})} 
                      className={`w-10 h-10 rounded-full border-4 transition-all ${form.icon === i ? 'border-[#cc0033] scale-110 shadow-md' : 'border-transparent opacity-40'}`}>
                      <img src={i} className="rounded-full" />
                    </button>
                  ))}
                </div>

                <input placeholder="お名前" className="w-full bg-slate-50 rounded-xl p-4 text-slate-900 font-bold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-[#cc0033]" 
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <input placeholder="自己紹介URL" className="w-full bg-slate-50 rounded-xl p-4 text-slate-900 font-bold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-[#cc0033]" 
                  value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
                <input type="password" placeholder="編集用パスワード" className="w-full bg-slate-50 rounded-xl p-4 text-slate-900 font-bold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-[#cc0033]" 
                  value={form.pass} onChange={e => setForm({...form, pass: e.target.value})} />
                
                <div className="flex gap-4 pt-6">
                  <button onClick={() => setSelectedDay(null)} className="flex-1 text-slate-400 font-bold uppercase tracking-widest text-xs">Cancel</button>
                  <button onClick={handleSave} style={{ backgroundColor: KEIO_NAVY }} className="flex-1 py-4 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all">SAVE PIECE</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}