'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// .env.local から住所と鍵を読み込みます
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PuzzleCalendar() {
  const [entries, setEntries] = useState<any[]>([])

  const fetchEntries = async () => {
    // データベースから「誰がどこを予約しているか」を取得します
    const { data } = await supabase.from('advent_calendar').select('*').order('date_day', { ascending: true })
    if (data) setEntries(data)
  }

  useEffect(() => { fetchEntries() }, [])

  const handleRegister = async (day: number) => {
    const name = prompt("お名前（ニックネームでもOK）を教えてください")
    const url = prompt("自己紹介リンク（note, Notion, SNSなど）のURLを貼ってください")
    if (!name || !url) return

    // データベースを更新します
    await supabase
      .from('advent_calendar')
      .update({ user_name: name, url: url, is_booked: true })
      .eq('date_day', day)
    
    fetchEntries() // 画面を更新してパズルを「はまった」状態にします
  }

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center text-indigo-900">🧩 留学仲間 自己紹介パズル</h1>
        <p className="text-center text-gray-600 mb-8">空いているピースをクリックして、あなたの紹介をはめ込んでください！</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {entries.map((item) => (
            <div 
              key={item.id}
              onClick={() => !item.is_booked && handleRegister(item.date_day)}
              className={`
                relative h-32 cursor-pointer transition-all duration-500
                ${item.is_booked 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'bg-white border-2 border-dashed border-gray-300 text-gray-300 hover:border-indigo-400 hover:bg-indigo-50'}
              `}
              style={{
                // ピースが噛み合うような形（アフォーダンスの設計）
                clipPath: 'polygon(0% 15%, 15% 15%, 15% 0%, 85% 0%, 85% 15%, 100% 15%, 100% 85%, 85% 85%, 85% 100%, 15% 100%, 15% 85%, 0% 85%)'
              }}
            >
              <div className="flex flex-col items-center justify-center h-full p-2">
                <span className="text-xs font-black opacity-60 mb-1">{item.date_day}日</span>
                {item.is_booked ? (
                  <a 
                    href={item.url} 
                    target="_blank" 
                    className="text-sm font-bold underline decoration-yellow-400 decoration-2 hover:text-yellow-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    👤 {item.user_name}
                  </a>
                ) : (
                  <span className="text-3xl font-thin">+</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}