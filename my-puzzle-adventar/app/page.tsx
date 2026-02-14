"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ProfessionalPuzzle() {
  const [entries, setEntries] = useState<any[]>([])
  const [selectedDay, setSelectedDay] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ name: '', url: '', icon: '', password: '' })

  useEffect(() => { fetchEntries() }, [])

  async function fetchEntries() {
    const { data } = await supabase.from('advent_calendar').select('*').order('date_day', { ascending: true })
    if (data) setEntries(data)
  }

  const handleOpen = (item: any) => {
    setSelectedDay(item)
    if (item.is_booked) {
      setIsEditing(true)
      setFormData({ name: item.user_name, url: item.url, icon: item.icon_url, password: '' })
    } else {
      setIsEditing(false)
      setFormData({ name: '', url: '', icon: '', password: '' })
    }
  }

  const handleSave = async () => {
    if (isEditing && formData.password !== selectedDay.edit_password) {
      alert("パスワードが違います！")
      return
    }

    const payload = {
      user_name: formData.name,
      url: formData.url,
      icon_url: formData.icon || `https://github.com/${formData.name}.png`,
      edit_password: formData.password,
      is_booked: true
    }

    await supabase.from('advent_calendar').update(payload).eq('id', selectedDay.id)
    setSelectedDay(null)
    fetchEntries()
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      {/* Header: Adventar風の洗練された説明書き */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          留学仲間 自己紹介パズル 🌏
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          これから世界へ飛び出す仲間たちの「想い」を繋ぐパズルです。<br />
          自分の誕生月やラッキーナンバーのピースを埋めて、仲間に自分を届けましょう。
        </p>
      </div>

      {/* Grid: スマホ3列、PC5列のレスポンシブ設計 */}
      <div className="max-w-4xl mx-auto grid grid-cols-3 md:grid-cols-5 gap-3 sm:gap-6">
        {entries.map((item) => (
          <button
            key={item.id}
            onClick={() => handleOpen(item)}
            className={`relative aspect-square rounded-xl shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex flex-col items-center justify-center p-2 border-2 
              ${item.is_booked ? 'bg-white border-indigo-100' : 'bg-slate-100 border-dashed border-slate-300 text-slate-400 hover:border-indigo-300'}`}
          >
            {item.is_booked ? (
              <>
                <img 
                  src={item.icon_url || `https://github.com/identicons/${item.user_name}.png`} 
                  className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 border-indigo-50 shadow-inner mb-2"
                  alt=""
                />
                <span className="text-[10px] sm:text-xs font-bold text-slate-700 truncate w-full text-center">
                  {item.user_name}
                </span>
              </>
            ) : (
              <span className="text-2xl font-light">{item.date_day}</span>
            )}
            <div className="absolute top-1 left-2 text-[10px] font-bold opacity-20 uppercase tracking-tighter">Day</div>
          </button>
        ))}
      </div>

      {/* Modal: 予約 & 編集フォーム */}
      {selectedDay && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl ring-1 ring-slate-200 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">
              {isEditing ? `${selectedDay.date_day}日の情報を修正` : `${selectedDay.date_day}日を予約する`}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">名前（GitHub IDだとアイコンが出ます）</label>
                <input 
                  type="text" 
                  className="w-full border-slate-200 rounded-lg p-3 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">自己紹介リンク (URL)</label>
                <input 
                  type="url" 
                  className="w-full border-slate-200 rounded-lg p-3 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none" 
                  value={formData.url}
                  placeholder="https://your-blog.com"
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">編集用パスワード（あとで直す時に必要）</label>
                <input 
                  type="password" 
                  className="w-full border-slate-200 rounded-lg p-3 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setSelectedDay(null)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-lg transition-colors">キャンセル</button>
              <button onClick={handleSave} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">
                {isEditing ? '更新する' : 'パズルを埋める'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}