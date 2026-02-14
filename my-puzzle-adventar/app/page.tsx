"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const KEIO_NAVY = "#002e65"
const KEIO_RED = "#cc0033"
const KEIO_GOLD = "#c5a572"
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
const PRESET_ICONS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jude',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mila',
  'https://api.dicebear.com/7.x/shapes/svg?seed=Keio',
  'https://api.dicebear.com/7.x/identicon/svg?seed=USA'
]

export default function TheKeioVoyageMap() {
  const [entries, setEntries] = useState<any[]>([])
  const [currentMonth, setCurrentMonth] = useState(0) // 0-11
  const [selectedDay, setSelectedDay] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'view' | 'edit' | 'reserve' | null>(null)
  const [formData, setFormData] = useState({ name: '', url: '', icon: '', password: '' })

  useEffect(() => { fetchEntries() }, [])

  async function fetchEntries() {
    const { data } = await supabase.from('advent_calendar').select('*').order('date_day', { ascending: true })
    if (data) setEntries(data)
  }

  const year = 2026
  const daysInMonth = new Date(year, currentMonth + 1, 0).getDate()
  const firstDayIdx = new Date(year, currentMonth, 1).getDay()
  const getStartDayOfYear = (m: number) => {
    let count = 0
    for(let i=0; i<m; i++) count += new Date(year, i+1, 0).getDate()
    return count + 1
  }
  const startDayId = getStartDayOfYear(currentMonth)
  const monthEntries = entries.slice(startDayId - 1, startDayId - 1 + daysInMonth)

  const handleSave = async () => {
    if (viewMode === 'edit' && formData.password !== selectedDay.edit_password) {
      alert("パスワードが一致しません。"); return
    }
    const payload = {
      user_name: formData.name,
      url: formData.url,
      icon_url: formData.icon || `https://github.com/${formData.name}.png`,
      edit_password: formData.password || selectedDay.edit_password,
      is_booked: true
    }
    await supabase.from('advent_calendar').update(payload).eq('id', selectedDay.id)
    setSelectedDay(null); setViewMode(null); fetchEntries()
  }

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Header: 羅針盤とエンブレム */}
      <div className="max-w-5xl mx-auto text-center mb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Keio_University_Emblem.svg/512px-Keio_University_Emblem.svg.png')] bg-contain bg-center bg-no-repeat opacity-10 blur-xl pointer-events-none"></div>
        <h1 style={{ color: KEIO_NAVY }} className="relative text-5xl font-black tracking-tight mb-4 drop-shadow-sm">
          THE KEIO ⇄ USA VOYAGE
        </h1>
        <div className="relative flex justify-center items-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#002e65] to-transparent"></div>
            <p style={{ color: KEIO_GOLD }} className="text-sm font-bold uppercase tracking-[0.3em] drop-shadow">2026 Journey Map</p>
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#cc0033] to-transparent"></div>
        </div>
        <p className="text-slate-600 max-w-xl mx-auto leading-relaxed font-medium relative z-10">
          独立自尊の志を胸に、新天地へ。365日の航路を、仲間たちの想いで繋ぐインタラクティブ・パズル。
        </p>
        
        {/* Month Selector: 直感的なタブナビゲーション */}
        <div className="mt-12 flex overflow-x-auto pb-4 hide-scrollbar justify-start md:justify-center gap-2 px-4">
          {Array.from({length: 12}).map((_, i) => (
            <button key={i} onClick={() => setCurrentMonth(i)} 
              className={`flex-shrink-0 px-5 py-2 rounded-lg text-sm font-black transition-all duration-300 transform hover:-translate-y-1
                ${currentMonth === i ? 'text-white shadow-[0_10px_20px_-10px_rgba(0,46,101,0.5)] ring-2 ring-[#c5a572] scale-105' : 'bg-white/80 text-slate-500 hover:bg-white hover:text-[#002e65] shadow-sm'}`}
              style={{ backgroundColor: currentMonth === i ? KEIO_NAVY : '' }}>
              {i+1}月 <span className="opacity-50 text-[10px] ml-1">{["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"][i]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Stage: 立体的なパズルグリッド */}
      <div className="max-w-5xl mx-auto glass rounded-[2rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,46,101,0.2)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#002e65] via-[#cc0033] to-[#002e65]"></div>
        <div className="grid grid-cols-7 gap-3 md:gap-4 relative z-10">
          {WEEKDAYS.map(w => <div key={w} style={{color: KEIO_NAVY}} className="text-center text-xs font-black opacity-60 pb-4 uppercase tracking-wider">{w}</div>)}
          
          {Array.from({length: firstDayIdx}).map((_, i) => <div key={i} className="aspect-square" />)}
          
          {monthEntries.map((item, idx) => {
            const dayNum = idx + 1;
            // アフォーダンス: 完璧な位置計算による星条旗の再構成
            const row = Math.floor((idx + firstDayIdx) / 7);
            const col = (idx + firstDayIdx) % 7;
            const bgX = (col / 6.1) * 100; // 微調整で継ぎ目を自然に
            const bgY = (row / 5.1) * 100;

            return (
              <button
                key={item.id}
                onClick={() => {
                    setSelectedDay(item);
                    if (item.is_booked) { setViewMode('view'); setFormData({name:item.user_name, url:item.url, icon:item.icon_url, password:''}); }
                    else { setViewMode('reserve'); setFormData({name:'', url:'', icon:'', password:''}); }
                }}
                // 物理的な質感の表現：多重シャドウとクリップパス
                className={`group relative aspect-square transition-all duration-500 transform hover:z-20
                  ${item.is_booked 
                    ? 'scale-100 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),_0_10px_20px_rgba(0,0,0,0.2)]' 
                    : 'scale-95 hover:scale-105 bg-gradient-to-br from-slate-100 to-slate-200 shadow-[inset_0_2px_5px_rgba(0,0,0,0.1),_0_5px_10px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_2px_5px_rgba(255,255,255,0.5),_0_15px_30px_rgba(0,46,101,0.2)]'}`}
                style={{
                  clipPath: 'polygon(20% 0%, 50% 15%, 80% 0%, 100% 20%, 85% 50%, 100% 80%, 80% 100%, 50% 85%, 20% 100%, 0% 80%, 15% 50%, 0% 20%)',
                  backgroundImage: item.is_booked ? 'url("https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg")' : 'none',
                  backgroundSize: '720% 620%', 
                  backgroundPosition: `${bgX}% ${bgY}%`
                }}
              >
                {item.is_booked ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#002e65]/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <img src={item.icon_url} className="w-10 h-10 rounded-full border-2 border-white shadow-lg mb-2 transform group-hover:scale-110 transition-transform" alt="" />
                    <span className="text-[8px] font-black text-white bg-[#002e65] px-2 py-1 rounded-full truncate max-w-[90%] uppercase tracking-wider shadow-sm">{item.user_name}</span>
                  </div>
                ) : (
                  <span style={{color: KEIO_NAVY}} className="text-xl font-black opacity-30 group-hover:opacity-100 transition-all duration-300">{dayNum}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Modern Glass Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-[#002e65]/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="glass rounded-[2rem] p-8 md:p-10 max-w-lg w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#002e65] to-[#cc0033]"></div>
            
            {viewMode === 'view' ? (
              <div className="text-center relative z-10">
                <div className="relative inline-block mb-8 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#002e65] to-[#cc0033] rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                    <img src={selectedDay.icon_url} className="relative w-32 h-32 rounded-full border-4 border-white shadow-xl mx-auto object-cover" />
                    <div style={{backgroundColor: KEIO_GOLD}} className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[#002e65] text-xs font-black px-4 py-1 rounded-full shadow-lg whitespace-nowrap">
                      {currentMonth+1}月{selectedDay.date_day - startDayId + 1}日
                    </div>
                </div>
                <h2 style={{ color: KEIO_NAVY }} className="text-3xl font-black mb-2">{selectedDay.user_name}</h2>
                <a href={selectedDay.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 py-3 px-6 bg-white/50 rounded-full text-[#002e65] font-black text-sm hover:bg-[#002e65] hover:text-white transition-all break-all mb-10 shadow-sm hover:shadow-md group">
                  <span>VISIT PAGE</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.5a.75.75 0 010 1.08l-5.5 5.5a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>
                </a>
                <div className="flex gap-4">
                  <button onClick={() => setSelectedDay(null)} className="flex-1 py-4 text-slate-500 font-black text-xs hover:text-[#002e65] transition-colors uppercase tracking-widest">CLOSE</button>
                  <button onClick={() => setViewMode('edit')} className="flex-1 py-4 bg-[#002e65]/10 rounded-xl font-black text-[#002e65] hover:bg-[#002e65] hover:text-white transition-all uppercase text-xs tracking-widest">EDIT INFO</button>
                </div>
              </div>
            ) : (
              <div className="space-y-8 relative z-10">
                <h2 style={{ color: KEIO_NAVY }} className="text-2xl font-black text-center">
                  {viewMode === 'edit' ? 'UPDATE ENTRY' : 'RESERVE A SPOT'}
                  <span className="block text-lg font-bold opacity-60 mt-1">{currentMonth+1}月{selectedDay.date_day - startDayId + 1}日</span>
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-black text-[#002e65] uppercase tracking-widest mb-3 block opacity-70">Choose Your Icon</label>
                    <div className="flex overflow-x-auto pb-2 gap-3 hide-scrollbar">
                        {PRESET_ICONS.map(url => (
                            <button key={url} onClick={() => setFormData({...formData, icon: url})} className={`flex-shrink-0 w-12 h-12 rounded-full border-4 transition-all transform hover:scale-110 ${formData.icon === url ? 'border-[#c5a572] shadow-lg scale-110' : 'border-white/50 opacity-70 hover:opacity-100'}`}>
                                <img src={url} className="rounded-full shadow-sm" alt="preset" />
                            </button>
                        ))}
                    </div>
                  </div>
                  
                  {/* Floating Label Inputs for Professional Feel */}
                  <div className="relative">
                    <input type="text" id="name" className="peer w-full bg-white/50 border-2 border-white/50 rounded-xl px-4 pt-5 pb-2 text-[#002e65] font-bold placeholder-transparent focus:ring-0 focus:border-[#002e65] transition-all outline-none shadow-sm" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    <label htmlFor="name" className="absolute left-4 top-1 text-[10px] font-black text-[#002e65] opacity-60 uppercase tracking-widest transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-[#002e65]">GitHub ID or Name</label>
                  </div>
                  <div className="relative">
                    <input type="url" id="url" className="peer w-full bg-white/50 border-2 border-white/50 rounded-xl px-4 pt-5 pb-2 text-[#002e65] font-bold placeholder-transparent focus:ring-0 focus:border-[#002e65] transition-all outline-none shadow-sm" placeholder="URL" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} />
                    <label htmlFor="url" className="absolute left-4 top-1 text-[10px] font-black text-[#002e65] opacity-60 uppercase tracking-widest transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-[#002e65]">Your Link (URL)</label>
                  </div>
                  <div className="relative">
                    <input type="password" id="password" className="peer w-full bg-white/50 border-2 border-white/50 rounded-xl px-4 pt-5 pb-2 text-[#002e65] font-bold placeholder-transparent focus:ring-0 focus:border-[#cc0033] transition-all outline-none shadow-sm" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                    <label htmlFor="password" className="absolute left-4 top-1 text-[10px] font-black text-[#cc0033] opacity-60 uppercase tracking-widest transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-[#cc0033]">Edit Password</label>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button onClick={() => setSelectedDay(null)} className="flex-1 text-slate-500 font-black text-xs uppercase tracking-widest hover:text-[#002e65] transition-colors">CANCEL</button>
                  <button onClick={handleSave} className="flex-1 py-4 bg-gradient-to-r from-[#002e65] to-[#003d82] text-white font-black rounded-2xl shadow-[0_10px_30px_rgba(0,46,101,0.4)] hover:shadow-[0_15px_40px_rgba(0,46,101,0.6)] hover:scale-105 active:scale-95 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                    {viewMode === 'edit' ? 'UPDATE VOYAGE' : 'CONFIRM RESERVATION'}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-9a.75.75 0 011.06-1.06l5.353 8.03 8.493-12.74a.75.75 0 011.04-.208z" clipRule="evenodd" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}