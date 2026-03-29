import { useEffect, useState } from 'react'
import './App.css'
import AppNavigation from './components/AppNavigation'
import SceneHeader from './components/SceneHeader'
import { getRandomYokai, getRandomYokaiByCategory, yokaiList } from './constants/yokai'
import CalendarPage from './pages/CalendarPage'
import RegisterPage from './pages/RegisterPage'
import {
  createSavedEntry,
  getItemsByDate,
  getMonthlyEntries,
  getUpcomingEntry,
} from './utils/entries'
import { getInitialCalendarMonth, parseISODate, toISODate } from './utils/date'
import { loadSavedEntries, saveSavedEntries } from './utils/storage'
import { requestExpirationEstimate } from './api/estimateApi'

function App() {
  const [barcode, setBarcode] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(() => toISODate(new Date()))
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [headerYokai, setHeaderYokai] = useState(yokaiList[0])
  const [resultYokai, setResultYokai] = useState(yokaiList[0])
  const [activePage, setActivePage] = useState('register')
  const [calendarMonth, setCalendarMonth] = useState(getInitialCalendarMonth)
  const [savedEntries, setSavedEntries] = useState(loadSavedEntries)

  // ⭐ カテゴリ判定（簡易版）
  const getCategory = (name) => {
    if (!name) return "C"

    if (name.includes("ジュース") || name.includes("コーラ")) return "A"
    if (name.includes("パン") || name.includes("おにぎり")) return "B"

    return "C"
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setHeaderYokai((prev) => yokaiList[(yokaiList.indexOf(prev) + 1) % yokaiList.length])
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    saveSavedEntries(savedEntries)
  }, [savedEntries])

  const handleSubmit = async () => {
    setError('')
    setStatus('付喪神を召喚中… ')
    setResult(null)

    try {
      const estimate = await requestExpirationEstimate({ barcode, purchaseDate })

      //  商品名
      const itemName = estimate.product_name || ""

      //  カテゴリ決定
      const category = estimate.category || getCategory(itemName)

      //  カテゴリ別で妖怪選択
      const newYokai = getRandomYokaiByCategory(category)
      setResultYokai(newYokai)

      setResult(estimate)
      setSavedEntries((prev) => [
        createSavedEntry({ barcode, purchaseDate, estimate }),
        ...prev
      ])

      const expirationDate = parseISODate(estimate.suggested_expiration)
      setCalendarMonth(new Date(expirationDate.getFullYear(), expirationDate.getMonth(), 1))

      setStatus('交換期限推定完了。付喪神が現れました！')
    } catch (submissionError) {
      setError(submissionError.message || '取得失敗')
      setStatus('')
    }
  }

  const itemsByDate = getItemsByDate(savedEntries)
  const monthlyEntries = getMonthlyEntries(savedEntries, calendarMonth)
  const upcomingEntry = getUpcomingEntry(savedEntries)

  return (
    <div className="app">
      <SceneHeader />
      <div className="card">
        <AppNavigation activePage={activePage} onPageChange={setActivePage} />
        {activePage === 'register' ? (
          <RegisterPage
            barcode={barcode}
            purchaseDate={purchaseDate}
            status={status}
            error={error}
            result={result}
            headerYokai={headerYokai}
            resultYokai={resultYokai}
            savedEntries={savedEntries}
            upcomingEntry={upcomingEntry}
            onBarcodeChange={setBarcode}
            onPurchaseDateChange={setPurchaseDate}
            onSubmit={handleSubmit}
          />
        ) : (
          <CalendarPage
            calendarMonth={calendarMonth}
            itemsByDate={itemsByDate}
            monthlyEntries={monthlyEntries}
            savedEntries={savedEntries}
            onMoveMonth={(offset) => {
              setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1))
            }}
          />
        )}
      </div>
    </div>
  )
}

export default App