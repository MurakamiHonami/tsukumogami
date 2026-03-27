import { useEffect, useState } from 'react'
import './App.css'
import AppNavigation from './components/AppNavigation'
import SceneHeader from './components/SceneHeader'
import AuthModal from './components/AuthModal'
import { getRandomYokai, yokaiList } from './constants/yokai'
import CalendarPage from './pages/CalendarPage'
import RegisterPage from './pages/RegisterPage'
import YokaiDexPage from './pages/YokaiDexPage'
import {
  createSavedEntry,
  getItemsByDate,
  getMonthlyEntries,
  getUpcomingEntry,
  getYokaiDex,
} from './utils/entries'
import { getInitialCalendarMonth, parseISODate, toISODate } from './utils/date'
import { requestExpirationEstimate } from './api/estimateApi'
import { completeTask, createTask, fetchTasks } from './api/tasksApi'
import { loginUser, registerUser } from './api/authApi'
import { loadCurrentUser, loadSavedEntries, saveCurrentUser, saveSavedEntries } from './utils/storage'

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
  const [calendarFocusDate, setCalendarFocusDate] = useState(null)
  const [currentUser, setCurrentUser] = useState(loadCurrentUser)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authSubmitting, setAuthSubmitting] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setHeaderYokai((prev) => yokaiList[(yokaiList.indexOf(prev) + 1) % yokaiList.length])
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadTasks = async () => {
      if (!currentUser) {
        if (isMounted) {
          setSavedEntries(loadSavedEntries())
        }
        return
      }

      try {
        const tasks = await fetchTasks(currentUser.id)
        if (isMounted) {
          setSavedEntries(tasks)
          setError('')
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || 'タスクの読み込みに失敗しました')
        }
      }
    }

    loadTasks()

    return () => {
      isMounted = false
    }
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) {
      saveSavedEntries(savedEntries)
    }
  }, [savedEntries, currentUser])

  useEffect(() => {
    setBarcode('')
    setStatus('')
    setResult(null)
    setError('')
    setResultYokai(yokaiList[0])
  }, [activePage])

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
    setAuthError('')
  }

  const handleRegister = async ({ username, password }) => {
    setAuthSubmitting(true)
    setAuthError('')

    try {
      const user = await registerUser({ username, password })
      saveCurrentUser(user)
      setCurrentUser(user)
      setStatus(`${user.username}で登録しました`) 
      setError('')
      closeAuthModal()
    } catch (registerError) {
      setAuthError(registerError.message || '登録に失敗しました')
    } finally {
      setAuthSubmitting(false)
    }
  }

  const handleLogin = async ({ username, password }) => {
    setAuthSubmitting(true)
    setAuthError('')

    try {
      const user = await loginUser({ username, password })
      saveCurrentUser(user)
      setCurrentUser(user)
      setStatus(`${user.username}でログインしました`) 
      setError('')
      closeAuthModal()
    } catch (loginError) {
      setAuthError(loginError.message || 'ログインに失敗しました')
    } finally {
      setAuthSubmitting(false)
    }
  }

  const handleLogout = () => {
    saveCurrentUser(null)
    setCurrentUser(null)
    setSavedEntries(loadSavedEntries())
    setStatus('ログアウトしました。ゲストモードで利用できます')
    setError('')
  }

  const handleSubmit = async () => {
    try {
      let permission = Notification.permission
      if (permission === 'default') {
        permission = await Notification.requestPermission()
      }

      if (permission === 'granted') {
        new Notification('付喪神登録完了', {
          body: '付喪神の登録が完了しました。交換期限が近づいたらお知らせします。',
        })
      }
    } catch (notificationError) {
      alert('通知の登録処理に失敗しました。交換期限が近いものは画面でお知らせします。')
      console.error('通知処理エラー', notificationError)
    }

    const newYokai = getRandomYokai()
    setResultYokai(newYokai)
    setError('')
    setStatus('交換期限を計算中...')
    setResult(null)

    try {
      const estimate = await requestExpirationEstimate({ barcode, purchaseDate })

      let newEntry
      if (currentUser) {
        newEntry = await createTask({
          barcode,
          purchaseDate,
          estimate,
          yokai: newYokai,
          userId: currentUser.id,
        })
      } else {
        newEntry = createSavedEntry({
          barcode,
          purchaseDate,
          estimate,
          yokai: newYokai,
        })
      }

      setResult(estimate)
      setSavedEntries((prev) => [newEntry, ...prev])
      setCalendarFocusDate(estimate.suggested_expiration)

      const expirationDate = parseISODate(estimate.suggested_expiration)
      setCalendarMonth(new Date(expirationDate.getFullYear(), expirationDate.getMonth(), 1))
      setStatus('交換期限を算出しました。結果が表示されました。')
    } catch (submissionError) {
      setError(submissionError.message || '解析に失敗しました')
      setStatus('')
    }
  }

  const handleEntryComplete = async (entryId) => {
    try {
      if (currentUser) {
        const completedTask = await completeTask(entryId, currentUser.id)
        setSavedEntries((prev) => prev.map((entry) => (entry.id === entryId ? completedTask : entry)))
        return
      }

      const completedAt = new Date().toISOString()
      setSavedEntries((prev) =>
        prev.map((entry) => (entry.id === entryId ? { ...entry, completed: true, completedAt } : entry)),
      )
    } catch (completionError) {
      setError(completionError.message || 'タスクの更新に失敗しました')
      throw completionError
    }
  }

  const itemsByDate = getItemsByDate(savedEntries)
  const monthlyEntries = getMonthlyEntries(savedEntries, calendarMonth)
  const upcomingEntry = getUpcomingEntry(savedEntries)
  const yokaiDex = getYokaiDex(savedEntries)

  const handleMoveToRegisteredDate = () => {
    if (!calendarFocusDate) {
      return
    }

    const focusDate = parseISODate(calendarFocusDate)
    setCalendarMonth(new Date(focusDate.getFullYear(), focusDate.getMonth(), 1))
    setActivePage('calendar')
  }

  return (
    <div className="app">
      <SceneHeader
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />
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
            onMoveToRegisteredDate={handleMoveToRegisteredDate}
            onBarcodeChange={setBarcode}
            onPurchaseDateChange={setPurchaseDate}
            onSubmit={handleSubmit}
          />
        ) : activePage === 'calendar' ? (
          <CalendarPage
            calendarMonth={calendarMonth}
            itemsByDate={itemsByDate}
            monthlyEntries={monthlyEntries}
            savedEntries={savedEntries}
            focusDate={calendarFocusDate}
            onEntryComplete={handleEntryComplete}
            onMoveMonth={(offset) => {
              setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1))
            }}
          />
        ) : (
          <YokaiDexPage yokaiDex={yokaiDex} />
        )}
      </div>
      <AuthModal
        key={isAuthModalOpen ? 'auth-open' : 'auth-closed'}
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onLogin={handleLogin}
        onRegister={handleRegister}
        submitting={authSubmitting}
        error={authError}
      />
    </div>
  )
}

export default App
