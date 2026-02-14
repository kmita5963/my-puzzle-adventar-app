"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const NAVY = "#002e65"; const RED = "#cc0033";
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"]
const ICONS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jude',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa'
]

export default function FixedSizePuzzle() {
  const [entries, setEntries] = useState<any[]>([])
  const [month, setMonth] = useState(new Date().getMonth()) // 0=1月
  const [selected, setSelected] = useState<any>(null)
  const [mode, setMode] = useState<'view' | 'edit' | 'reserve' | null>(null)
  const [form, setForm] = useState({ name: '', url: '', icon: '', pass: '' })

  useEffect(() => { fetch() }, [])
  async function fetch() {
    const { data } = await supabase.from('advent_calendar').select('*').order('date_day')
    if (data) setEntries(data)
  }

  const daysInMonth = new Date(2026, month + 1, 0).getDate()
  const firstDay = new Date(2026, month, 1).getDay()
  const startId = entries.slice(0, entries.findIndex(e => {
    let d = 0; for(let i=0; i<month; i++) d += new Date(2026, i+1, 0).getDate();
    return e.date_day === d + 1
  })).length + 1

  const handleSave = async () => {
    if (mode === 'edit' && form.pass !== selected.edit_password) return alert("パスワードが違います")
    const payload = {
      user_name: form.name, url: form.url, icon_url: form.icon,
      edit_password: form.pass || selected.edit_password, is_booked: true
    }
    await supabase.from('advent_calendar').update(payload).eq('id', selected.id)
    setSelected(null); setMode(null); fetch()
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border-t-8" style={{borderColor: NAVY}}>
        
        {/* Header: 月選択 */}
        <div className="p-6 text-center border-b border-slate-100">
          <h1 className="text-xl font-black mb-4" style={{color: NAVY}}>2026 VOYAGE CALENDAR</h1>
          <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
            {Array.from({length:12}).map((_, i) => (
              <button key={i} onClick={() => setMonth(i)} 
                className={`flex-shrink-0 w-10 h-10 rounded-full text-xs font-bold transition-all ${month === i ? 'text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                style={{backgroundColor: month === i ? RED : ''}}>{i+1}</button>
            ))}
          </div>
        </div>

        {/* Calendar: 固定サイズのグリッド */}
        <div className="p-4 relative">
          {/* 星条旗背景 (予約が進むと見える) */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-center bg-cover" 
               style={{backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg")'}}></div>
          
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {WEEKDAYS.map(w => <div key={w} className="text-[10px] font-bold text-slate-300">{w}</div>)}
          </div>
          
          <div className="grid grid-cols-7 gap-1 relative z-10">
            {Array.from({length: firstDay}).map((_, i) => <div key={i} />)}
            {entries.filter(e => {
                let prev = 0; for(let i=0; i<month; i++) prev += new Date(2026, i+1, 0).getDate();
                return e.date_day > prev && e.date_day <= prev + daysInMonth;
            }).map((item, idx) => (
              <button key={item.id} onClick={() => {
                setSelected(item);
                if(item.is_booked) { setMode('view'); setForm({name:item.user_name, url:item.url, icon:item.icon_url, pass:''})}
                else { setMode('reserve'); setForm({name:'', url:'', icon:'', pass:''})}
              }}
              className={`aspect-square rounded-lg flex items-center justify-center transition-all border-2
                ${item.is_booked ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-transparent hover:border-[#cc0033]'}`}
              style={{ clipPath: 'polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%, 0 10%)' }}>
                {item.is_booked ? (
                  <img src={item.icon_url} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-xs font-bold text-slate-300">{idx+1}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: 情報入力・リンク閲覧 */}
      {selected && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl border-b-8" style={{borderColor: RED}}>
            {mode === 'view' ? (
              <div className="text-center">
                <img src={selected.icon_url} className="w-20 h-20 mx-auto rounded-full mb-4 border-4" style={{borderColor: NAVY}} />
                <h2 className="text-xl font-black mb-1" style={{color: NAVY}}>{selected.user_name}</h2>
                {/* リンクをタップ可能に */}
                <a href={selected.url} target="_blank" className="text-blue-600 font-bold underline text-sm break-all block mb-6 hover:text-red-600">
                  {selected.url} ↗
                </a>
                <div className="flex gap-2">
                  <button onClick={() => setSelected(null)} className="flex-1 text-slate-400 font-bold text-sm">CLOSE</button>
                  <button onClick={() => setMode('edit')} className="flex-1 py-2 bg-slate-100 rounded-xl font-bold text-slate-600 text-sm">EDIT</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="font-black text-lg" style={{color: NAVY}}>{month+1}/{selected.date_day - (entries.findIndex(e => e.id === selected.id) - (selected.date_day - 1))} 予約</h2>
                <div className="flex justify-between p-2 bg-slate-50 rounded-xl">
                  {ICONS.map(i => (
                    <button key={i} onClick={() => setForm({...form, icon: i})} className={`w-8 h-8 rounded-full border-2 ${form.icon === i ? 'border-red-500 scale-110' : 'border-transparent opacity-50'}`}>
                      <img src={i} className="rounded-full" />
                    </button>
                  ))}
                </div>
                <input placeholder="名前" className="w-full border-b-2 border-slate-200 p-2 outline-none focus:border-red-500 text-slate-900 font-bold placeholder:text-slate-300" 
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <input placeholder="URL" className="w-full border-b-2 border-slate-200 p-2 outline-none focus:border-red-600 text-slate-900 placeholder:text-slate-300" 
                  value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
                <input type="password" placeholder="パスワード" className="w-full border-b-2 border-slate-200 p-2 outline-none focus:border-red-600 text-slate-900 placeholder:text-slate-300" 
                  value={form.pass} onChange={e => setForm({...form, pass: e.target.value})} />
                <div className="flex gap-2 pt-4">
                  <button onClick={() => setSelected(null)} className="flex-1 text-slate-400 font-bold">CANCEL</button>
                  <button onClick={handleSave} className="flex-1 py-3 bg-[#002e65] text-white font-bold rounded-xl shadow-lg">SAVE</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}