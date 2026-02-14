"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const KEIO_NAVY = "#002e65"; const KEIO_RED = "#cc0033";
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
const PRESETS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=F',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=A',
  'https://api.dicebear.com/7.x/bottts/svg?seed=K',
  'https://api.dicebear.com/7.x/bottts/svg?seed=S'
]

export default function UltimateCalendar() {
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

  // 2026年カレンダー計算
  const year = 2026;
  const days = new Date(year, month + 1, 0).getDate();
  const firstIdx = new Date(year, month, 1).getDay();
  const getOffset = (m: number) => {
    let c = 0; for(let i=0; i<m; i++) c += new Date(year, i+1, 0).getDate();
    return c;
  }
  const startId = getOffset(month) + 1;
  const currentEntries = entries.slice(startId - 1, startId - 1 + days);

  const handleSave = async () => {
    if (mode === 'edit' && form.pass !== sel.edit_password) return alert("パスワード不一致");
    const payload = {
      user_name: form.name, url: form.url, icon_url: form.icon || `https://github.com/${form.name}.png`,
      edit_password: form.pass || sel.edit_password, is_booked: true
    }
    await supabase.from('advent_calendar').update(payload).eq('id', sel.id)
    setSel(null); setMode(null); fetch();
  }

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans antialiased">
      {/* 慶應×米国：洗練されたヘッダー */}
      <div className="text-center mb-8">
        <h1 style={{ color: KEIO_NAVY }} className="text-3xl font-black tracking-tighter mb-1">KEIO ⇄ USA 2026</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Independence & Self-Respect</p>
      </div>

      {/* カレンダー本体：固定サイズで「モノ」としての存在感を強調 */}
      <div className="w-full max-w-[400px] bg-white rounded-[2rem] shadow-2xl overflow-hidden border-b-[10px]" style={{ borderColor: KEIO_RED }}>
        {/* 月選択タブ */}
        <div className="bg-slate-50 p-4 flex overflow-x-auto gap-2 no-scrollbar border-b border-slate-100">
          {Array.from({length:12}).map((_, i) => (
            <button key={i} onClick={() => setMonth(i)} 
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-black transition-all ${month === i ? 'text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              style={{ backgroundColor: month === i ? KEIO_NAVY : '' }}>{i+1}月</button>
          ))}
        </div>

        {/* カレンダーグリッド：予約が埋まると星条旗が完成する仕掛け */}
        <div className="p-6 relative">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-center bg-cover" 
               style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg")' }}></div>
          
          <div className="grid grid-cols-7 gap-2 mb-4">
            {WEEKDAYS.map(w => <div key={w} className="text-[9px] font-black text-slate-300 text-center">{w}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-2 relative z-10">
            {Array.from({length: firstIdx}).map((_, i) => <div key={i} />)}
            {currentEntries.map((item, idx) => (
              <button key={item.id} onClick={() => {
                setSel(item);
                if(item.is_booked) { setMode('view'); setForm({name:item.user_name, url:item.url, icon:item.icon_url, pass:''})}
                else { setMode('reg'); setForm({name:'', url:'', icon:'', pass:''})}
              }}
              className={`aspect-square relative rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:z-20 border
                ${item.is_booked ? 'bg-white shadow-lg border-slate-100' : 'bg-slate-50/80 border-transparent hover:border-[#cc0033]'}`}
              style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)' }}>
                {item.is_booked ? (
                  <img src={item.icon_url} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-slate-300">{idx+1}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* モーダル：情報の透明性を確保するデザイン */}
      {sel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 border-t-8" style={{ borderColor: KEIO_NAVY }}>
            {mode === 'view' ? (
              <div className="text-center">
                <img src={sel.icon_url} className="w-24 h-24 mx-auto rounded-full mb-4 border-4 p-1" style={{ borderColor: KEIO_RED }} />
                <h2 className="text-2xl font-black mb-2" style={{ color: KEIO_NAVY }}>{sel.user_name}</h2>
                <a href={sel.url} target="_blank" className="inline-block py-2 px-6 bg-slate-100 rounded-full text-blue-600 font-bold text-sm mb-8 hover:bg-blue-50 transition-colors">
                  VIEW PROFILE ↗
                </a>
                <div className="flex gap-4">
                  <button onClick={() => setSel(null)} className="flex-1 text-slate-400 font-bold text-sm uppercase tracking-widest">Close</button>
                  <button onClick={() => setMode('edit')} className="flex-1 py-3 bg-slate-100 rounded-2xl font-bold text-slate-600 text-sm">EDIT</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-center mb-6" style={{ color: KEIO_NAVY }}>RESERVE {month+1}/{sel.date_day - startId + 1}</h2>
                
                {/* アイコン選択 */}
                <div className="flex justify-between p-3 bg-slate-50 rounded-2xl">
                  {PRESETS.map(i => (
                    <button key={i} onClick={() => setForm({...form, icon: i})} 
                      className={`w-10 h-10 rounded-full border-4 transition-all ${form.icon === i ? 'border-[#cc0033] scale-110 shadow-md' : 'border-transparent opacity-40'}`}>
                      <img src={i} className="rounded-full" />
                    </button>
                  ))}
                </div>

                <input placeholder="名前 (GitHub ID推奨)" className="w-full bg-slate-50 rounded-xl p-4 text-slate-900 font-bold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-[#cc0033]" 
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <input placeholder="自己紹介URL" className="w-full bg-slate-50 rounded-xl p-4 text-slate-900 font-bold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-[#cc0033]" 
                  value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
                <input type="password" placeholder="編集用パスワード" className="w-full bg-slate-50 rounded-xl p-4 text-slate-900 font-bold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-[#cc0033]" 
                  value={form.pass} onChange={e => setForm({...form, pass: e.target.value})} />
                
                <div className="flex gap-4 pt-6">
                  <button onClick={() => setSel(null)} className="flex-1 text-slate-400 font-bold uppercase tracking-widest">Cancel</button>
                  <button onClick={handleSave} style={{ backgroundColor: KEIO_NAVY }} className="flex-1 py-4 text-white font-black rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all">SAVE</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}