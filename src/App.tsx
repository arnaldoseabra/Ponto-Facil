import { useState, useCallback, useEffect } from 'react'
import type {
  Employee, TimeRecord, NotificationLog, CLTAlert,
  Convenio, NotificationConfig, AppView,
} from '../types'
import { storage } from '../utils/storage'
import { useToast } from '../hooks/useToast'
import { api } from '../services/api'
import { authService } from '../services/authService'
import { employeeService } from '../services/employeeService'
import { timeRecordService } from '../services/timeRecordService'
import { notificationService } from '../services/notificationService'
import { alertService } from '../services/alertService'
import { convenioService } from '../services/convenioService'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import EmployeePanel from '../pages/employee/EmployeePanel'
import AdminPanel from '../pages/admin/AdminPanel'
import ToastContainer from '../components/ui/Toast'

// Modo de dados: 'api' usa o backend, 'local' usa localStorage (demo)
type DataMode = 'api' | 'local'

export default function App() {
  const [view, setView] = useState<AppView>('landing')
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null)
  const [dataMode, setDataMode] = useState<DataMode>('local')
  const [loading, setLoading] = useState(false)

  const [employees, setEmployees] = useState<Employee[]>(() => storage.getEmployees())
  const [records, setRecords] = useState<TimeRecord[]>(() => storage.getRecords())
  const [notifications, setNotifications] = useState<NotificationLog[]>(() => storage.getNotifications())
  const [alerts, setAlerts] = useState<CLTAlert[]>(() => storage.getAlerts())
  const [convenios, setConvenios] = useState<Convenio[]>(() => storage.getConvenios())
  const [notifConfig, setNotifConfig] = useState<NotificationConfig>(() => storage.getNotifConfig())

  const { toasts, addToast, removeToast } = useToast()

  // Ao iniciar, verificar se há token salvo e restaurar sessão
  useEffect(() => {
    const token = api.getToken()
    if (!token) return

    setLoading(true)
    authService.me()
      .then((emp) => {
        setCurrentEmployee(emp)
        setDataMode('api')
        setView(emp.profile === 'admin' ? 'admin' : 'employee')
        return loadAllFromApi()
      })
      .catch(() => {
        api.clearToken()
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadAllFromApi() {
    const [emps, recs, notifs, alts, convs] = await Promise.all([
      employeeService.getAll(),
      timeRecordService.getAll(),
      notificationService.getAll(),
      alertService.getAll(),
      convenioService.getAll(),
    ])
    setEmployees(emps)
    setRecords(recs)
    setNotifications(notifs)
    setAlerts(alts)
    setConvenios(convs)
  }

  // Login via API; se falhar, tenta modo local (demo)
  const handleLoginSuccess = useCallback(async (emp: Employee, fromApi = false) => {
    if (fromApi) {
      setDataMode('api')
      setLoading(true)
      try {
        await loadAllFromApi()
      } catch (e) {
        addToast('API conectada, mas não foi possível carregar todos os dados.', 'warning')
      } finally {
        setLoading(false)
      }
    } else {
      setDataMode('local')
    }
    setCurrentEmployee(emp)
    setView(emp.profile === 'admin' ? 'admin' : 'employee')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = useCallback(async () => {
    if (dataMode === 'api') {
      try { await authService.logout() } catch { /* silencioso */ }
    }
    setCurrentEmployee(null)
    setDataMode('local')
    setView('landing')
  }, [dataMode])

  // ── Employees ──────────────────────────────────────────────────
  const updateEmployees = useCallback(async (newEmployees: Employee[]) => {
    setEmployees(newEmployees)
    if (dataMode === 'local') storage.saveEmployees(newEmployees)
  }, [dataMode])

  const handleCreateEmployee = useCallback(async (emp: Omit<Employee, 'id'>): Promise<Employee> => {
    if (dataMode === 'api') {
      const created = await employeeService.create(emp)
      setEmployees(prev => [...prev, created])
      return created
    }
    const created: Employee = { ...emp, id: `emp-${Date.now()}`, avatar: emp.avatar || `https://i.pravatar.cc/150?u=${emp.email}` }
    setEmployees(prev => { const next = [...prev, created]; storage.saveEmployees(next); return next })
    return created
  }, [dataMode])

  const handleUpdateEmployee = useCallback(async (id: string, data: Partial<Employee>): Promise<Employee> => {
    if (dataMode === 'api') {
      const updated = await employeeService.update(id, data)
      setEmployees(prev => prev.map(e => e.id === id ? updated : e))
      return updated
    }
    const updated = { ...employees.find(e => e.id === id)!, ...data }
    setEmployees(prev => { const next = prev.map(e => e.id === id ? updated : e); storage.saveEmployees(next); return next })
    return updated
  }, [dataMode, employees])

  const handleToggleEmployee = useCallback(async (id: string) => {
    if (dataMode === 'api') {
      const updated = await employeeService.toggleStatus(id)
      setEmployees(prev => prev.map(e => e.id === id ? updated : e))
      return
    }
    setEmployees(prev => {
      const next = prev.map(e => e.id === id ? { ...e, status: !e.status } : e)
      storage.saveEmployees(next)
      return next
    })
  }, [dataMode])

  // ── Time Records ───────────────────────────────────────────────
  const updateRecords = useCallback(async (newRecords: TimeRecord[]) => {
    setRecords(newRecords)
    if (dataMode === 'local') storage.saveRecords(newRecords)
  }, [dataMode])

  const handlePunch = useCallback(async (
    employeeId: string,
    type: 'entrada' | 'inicioAlmoco' | 'retornoAlmoco' | 'saida',
    coords?: { lat: number; lng: number; locationName: string }
  ): Promise<TimeRecord> => {
    // Mapa frontend → API
    const typeMap: Record<string, 'entrada' | 'inicio_almoco' | 'retorno_almoco' | 'saida'> = {
      entrada: 'entrada',
      inicioAlmoco: 'inicio_almoco',
      retornoAlmoco: 'retorno_almoco',
      saida: 'saida',
    }

    if (dataMode === 'api') {
      const updated = await timeRecordService.punch(typeMap[type], coords)
      setRecords(prev => {
        const idx = prev.findIndex(r => r.id === updated.id)
        return idx >= 0 ? prev.map(r => r.id === updated.id ? updated : r) : [...prev, updated]
      })
      return updated
    }

    // Modo local (fallback)
    const now = new Date().toTimeString().split(' ')[0]
    const today = new Date().toISOString().split('T')[0]
    setRecords(prev => {
      const idx = prev.findIndex(r => r.employeeId === employeeId && r.date === today)
      let record: TimeRecord
      if (idx >= 0) {
        record = { ...prev[idx], [type]: now }
      } else {
        record = {
          id: `rec-${Date.now()}`, employeeId, date: today,
          [type]: now, status: 'normal', extraHours: 0, delayMinutes: 0,
          locationName: coords?.locationName,
          gpsCoords: coords ? { lat: coords.lat, lng: coords.lng } : undefined,
        }
      }
      const next = idx >= 0 ? prev.map((r, i) => i === idx ? record : r) : [...prev, record]
      storage.saveRecords(next)
      return next
    })
    return { id: `rec-${Date.now()}`, employeeId, date: today, [type]: now, status: 'normal', extraHours: 0, delayMinutes: 0 }
  }, [dataMode])

  // ── Notifications ──────────────────────────────────────────────
  const updateNotifications = useCallback(async (newNotifs: NotificationLog[]) => {
    setNotifications(newNotifs)
    if (dataMode === 'local') storage.saveNotifications(newNotifs)
  }, [dataMode])

  const handleSendNotification = useCallback(async (employeeIds: string[], message: string) => {
    if (dataMode === 'api') {
      const created = await notificationService.send(employeeIds, message)
      setNotifications(prev => [...created, ...prev])
      return
    }
    const newNotifs: NotificationLog[] = employeeIds.map(id => ({
      id: `notif-${Date.now()}-${id}`,
      employeeName: employees.find(e => e.id === id)?.name ?? '',
      phone: employees.find(e => e.id === id)?.phone ?? '',
      message,
      type: 'alerta' as const,
      timestamp: new Date().toISOString(),
      status: 'enviado' as const,
    }))
    setNotifications(prev => { const next = [...newNotifs, ...prev]; storage.saveNotifications(next); return next })
  }, [dataMode, employees])

  // ── Alerts ─────────────────────────────────────────────────────
  const updateAlerts = useCallback(async (newAlerts: CLTAlert[]) => {
    setAlerts(newAlerts)
    if (dataMode === 'local') storage.saveAlerts(newAlerts)
  }, [dataMode])

  // ── Convenios ──────────────────────────────────────────────────
  const updateConvenios = useCallback(async (newConvenios: Convenio[]) => {
    setConvenios(newConvenios)
    if (dataMode === 'local') storage.saveConvenios(newConvenios)
  }, [dataMode])

  // ── Notif Config ───────────────────────────────────────────────
  const updateNotifConfig = useCallback((config: NotificationConfig) => {
    setNotifConfig(config)
    storage.saveNotifConfig(config)
  }, [])

  const sharedProps = {
    employees, records, notifications, alerts, convenios, notifConfig,
    onUpdateEmployees: updateEmployees,
    onUpdateRecords: updateRecords,
    onUpdateNotifications: updateNotifications,
    onUpdateAlerts: updateAlerts,
    onUpdateConvenios: updateConvenios,
    onUpdateNotifConfig: updateNotifConfig,
    onCreateEmployee: handleCreateEmployee,
    onUpdateEmployee: handleUpdateEmployee,
    onToggleEmployee: handleToggleEmployee,
    onPunch: handlePunch,
    onSendNotification: handleSendNotification,
    onLogout: handleLogout,
    addToast,
    dataMode,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="w-10 h-10 border-2 border-white/30 border-t-[#4ade80] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {view === 'landing' && <LandingPage onLogin={() => setView('login')} />}

      {view === 'login' && (
        <LoginPage
          employees={employees}
          onLoginSuccess={handleLoginSuccess}
          onBack={() => setView('landing')}
        />
      )}

      {view === 'employee' && currentEmployee && (
        <EmployeePanel employee={currentEmployee} {...sharedProps} />
      )}

      {view === 'admin' && currentEmployee && (
        <AdminPanel currentAdmin={currentEmployee} {...sharedProps} />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
