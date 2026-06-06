import { useState, useCallback } from 'react'
import type {
  Employee,
  TimeRecord,
  NotificationLog,
  CLTAlert,
  Convenio,
  NotificationConfig,
  AppView,
} from '../types'
import { storage } from '../utils/storage'
import { useToast } from '../hooks/useToast'
import { checkCLTViolations } from '../utils/cltUtils'
import { getWeekDates } from '../utils/dateUtils'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import EmployeePanel from '../pages/employee/EmployeePanel'
import AdminPanel from '../pages/admin/AdminPanel'
import ToastContainer from '../components/ui/Toast'

export default function App() {
  const [view, setView] = useState<AppView>('landing')
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null)

  const [employees, setEmployees] = useState<Employee[]>(() => storage.getEmployees())
  const [records, setRecords] = useState<TimeRecord[]>(() => storage.getRecords())
  const [notifications, setNotifications] = useState<NotificationLog[]>(() => storage.getNotifications())
  const [alerts, setAlerts] = useState<CLTAlert[]>(() => storage.getAlerts())
  const [convenios, setConvenios] = useState<Convenio[]>(() => storage.getConvenios())
  const [notifConfig, setNotifConfig] = useState<NotificationConfig>(() => storage.getNotifConfig())

  const { toasts, addToast, removeToast } = useToast()

  const handleLoginSuccess = useCallback((employee: Employee) => {
    setCurrentEmployee(employee)
    setView(employee.profile === 'admin' ? 'admin' : 'employee')
  }, [])

  const handleLogout = useCallback(() => {
    setCurrentEmployee(null)
    setView('landing')
  }, [])

  const updateRecords = useCallback(
    (newRecords: TimeRecord[]) => {
      setRecords(newRecords)
      storage.saveRecords(newRecords)

      newRecords.forEach((record) => {
        if (!record.saida) return
        const emp = employees.find((e) => e.id === record.employeeId)
        if (!emp) return

        const { start, end } = getWeekDates(record.date)
        const weekRecords = newRecords.filter(
          (r) => r.employeeId === record.employeeId && r.date >= start && r.date <= end
        )

        const newAlerts = checkCLTViolations(record, emp.id, emp.name, weekRecords)
        if (newAlerts.length > 0) {
          setAlerts((prev) => {
            const filtered = prev.filter((a) => !newAlerts.find((na) => na.id === a.id))
            const updated = [...filtered, ...newAlerts]
            storage.saveAlerts(updated)
            return updated
          })
        }
      })
    },
    [employees]
  )

  const updateEmployees = useCallback((newEmployees: Employee[]) => {
    setEmployees(newEmployees)
    storage.saveEmployees(newEmployees)
  }, [])

  const updateNotifications = useCallback((newNotifs: NotificationLog[]) => {
    setNotifications(newNotifs)
    storage.saveNotifications(newNotifs)
  }, [])

  const updateAlerts = useCallback((newAlerts: CLTAlert[]) => {
    setAlerts(newAlerts)
    storage.saveAlerts(newAlerts)
  }, [])

  const updateConvenios = useCallback((newConvenios: Convenio[]) => {
    setConvenios(newConvenios)
    storage.saveConvenios(newConvenios)
  }, [])

  const updateNotifConfig = useCallback((config: NotificationConfig) => {
    setNotifConfig(config)
    storage.saveNotifConfig(config)
  }, [])

  const sharedProps = {
    employees,
    records,
    notifications,
    alerts,
    convenios,
    notifConfig,
    onUpdateEmployees: updateEmployees,
    onUpdateRecords: updateRecords,
    onUpdateNotifications: updateNotifications,
    onUpdateAlerts: updateAlerts,
    onUpdateConvenios: updateConvenios,
    onUpdateNotifConfig: updateNotifConfig,
    onLogout: handleLogout,
    addToast,
  }

  const demoEmployee = employees.find((e) => e.profile === 'employee')
  const demoAdmin = employees.find((e) => e.profile === 'admin')

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

      {/* Navegador rápido para demonstração */}
      <div className="fixed bottom-4 left-4 z-50">
        <div className="glass-card px-3 py-2 flex gap-1 text-xs">
          {(
            [
              { label: 'landing', view: 'landing' as AppView, emp: null },
              { label: 'login', view: 'login' as AppView, emp: null },
              { label: 'funcionário', view: 'employee' as AppView, emp: demoEmployee ?? null },
              { label: 'admin', view: 'admin' as AppView, emp: demoAdmin ?? null },
            ] as const
          ).map(({ label, view: v, emp }) => (
            <button
              key={v}
              onClick={() => {
                if (emp) setCurrentEmployee(emp)
                setView(v)
              }}
              className={`px-2 py-1 rounded-lg transition-all duration-200 ${
                view === v
                  ? 'bg-[#1a7a4a] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
