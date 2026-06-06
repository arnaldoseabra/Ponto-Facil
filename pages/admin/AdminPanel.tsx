import { useState, useMemo } from 'react'
import {
  LayoutDashboard, Users, Clock, Trophy, FileText, MessageCircle,
  Gift, Building2, LogOut, AlertCircle, AlertTriangle, CheckCircle,
  Plus, Edit2, Trash2, Eye, X, Search, Download, Send, Phone,
  MapPin, ChevronLeft, ChevronRight, Copy, ExternalLink, ToggleLeft, ToggleRight, Menu
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'
import type {
  Employee, TimeRecord, NotificationLog, CLTAlert, Convenio,
  NotificationConfig, ToastType
} from '../../types'
import Modal from '../../components/ui/Modal'
import {
  formatDate, formatTime, calculateWorkedMinutes, minutesToTime,
  getMonthName, isBirthday, getBirthdayDay, getCurrentDate
} from '../../utils/dateUtils'

type Tab = 'dashboard' | 'funcionarios' | 'horas' | 'rankings' | 'relatorio' | 'whatsapp' | 'aniversariantes' | 'convenios'

interface AdminPanelProps {
  currentAdmin: Employee
  employees: Employee[]
  records: TimeRecord[]
  notifications: NotificationLog[]
  alerts: CLTAlert[]
  convenios: Convenio[]
  notifConfig: NotificationConfig
  onUpdateEmployees: (employees: Employee[]) => void
  onUpdateRecords: (records: TimeRecord[]) => void
  onUpdateNotifications: (notifs: NotificationLog[]) => void
  onUpdateAlerts: (alerts: CLTAlert[]) => void
  onUpdateConvenios: (convenios: Convenio[]) => void
  onUpdateNotifConfig: (config: NotificationConfig) => void
  onLogout: () => void
  addToast: (message: string, type?: ToastType) => void
}

const STATUS_BADGE: Record<string, string> = {
  normal: 'badge-normal', extra: 'badge-success', atraso: 'badge-warning', falta: 'badge-danger',
}
const STATUS_LABELS: Record<string, string> = {
  normal: 'Normal', extra: 'Extra', atraso: 'Atraso', falta: 'Falta',
}
const NOTIF_STATUS_BADGE: Record<string, string> = {
  enviado: 'badge-info', lido: 'badge-success', falha: 'badge-danger',
}
const CATEGORIES = ['Todos', 'Fitness', 'Saúde & Bem-estar', 'Educação', 'Alimentação', 'Medicamentos & Farmácia', 'Outros']

const emptyEmployee: Omit<Employee, 'id'> = {
  name: '', cpf: '', rg: '', birthDate: '', email: '', phone: '',
  role: '', department: '', salary: 0, weeklyHours: 40, admissionDate: '',
  emergencyContact: { name: '', phone: '' },
  gpsLocation: { lat: -23.5505, lng: -46.6333, radius: 500 },
  status: true, avatar: '', profile: 'employee',
}

const emptyConvenio: Omit<Convenio, 'id'> = {
  name: '', category: 'Outros', discount: '', description: '',
  phone: '', website: '', address: '', code: '',
}

export default function AdminPanel({
  currentAdmin, employees, records, notifications, alerts, convenios, notifConfig,
  onUpdateEmployees, onUpdateRecords, onUpdateNotifications, onUpdateAlerts,
  onUpdateConvenios, onUpdateNotifConfig, onLogout, addToast,
}: AdminPanelProps) {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Employees tab
  const [empSearch, setEmpSearch] = useState('')
  const [empModal, setEmpModal] = useState(false)
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null)
  const [empForm, setEmpForm] = useState<Omit<Employee, 'id'>>(emptyEmployee)

  // Hours tab
  const [hoursEmpFilter, setHoursEmpFilter] = useState('')
  const [hoursDateStart, setHoursDateStart] = useState('2026-06-01')
  const [hoursDateEnd, setHoursDateEnd] = useState(getCurrentDate())
  const [hoursStatusFilter, setHoursStatusFilter] = useState('')

  // Rankings tab
  const [rankingTab, setRankingTab] = useState<'extras' | 'atrasos' | 'faltas'>('extras')

  // Report tab
  const [reportMonth, setReportMonth] = useState(6)
  const [reportYear, setReportYear] = useState(2026)
  const [reportEmpId, setReportEmpId] = useState('')

  // WhatsApp tab
  const [msgEmployee, setMsgEmployee] = useState<string[]>([])
  const [msgText, setMsgText] = useState('')

  // Aniversariantes tab
  const today = new Date()
  const [bdMonth, setBdMonth] = useState(today.getMonth() + 1)

  // Convênios tab
  const [convSearch, setConvSearch] = useState('')
  const [convCategory, setConvCategory] = useState('Todos')
  const [convModal, setConvModal] = useState(false)
  const [editingConv, setEditingConv] = useState<Convenio | null>(null)
  const [convForm, setConvForm] = useState<Omit<Convenio, 'id'>>(emptyConvenio)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const activeEmployees = employees.filter((e) => e.profile === 'employee' && e.status)

  // ===== DASHBOARD DATA =====
  const dashboardKpis = useMemo(() => {
    const thisMonth = records.filter((r) => r.date.startsWith('2026-06'))
    return {
      totalEmployees: activeEmployees.length,
      totalExtraHours: thisMonth.reduce((s, r) => s + r.extraHours, 0).toFixed(1),
      totalDelays: thisMonth.filter((r) => r.status === 'atraso').length,
      totalAbsences: thisMonth.filter((r) => r.status === 'falta').length,
    }
  }, [records, activeEmployees])

  const chartData = useMemo(() => {
    const days = ['01', '02', '03', '04', '05', '06']
    return days.map((d) => {
      const dayRecords = records.filter((r) => r.date === `2026-06-${d}`)
      const total = dayRecords.reduce(
        (s, r) => s + calculateWorkedMinutes(r.entrada, r.inicioAlmoco, r.retornoAlmoco, r.saida), 0
      )
      const extras = dayRecords.reduce((s, r) => s + r.extraHours, 0)
      return { day: `Jun/${d}`, horas: parseFloat((total / 60).toFixed(1)), extras: parseFloat(extras.toFixed(1)) }
    })
  }, [records])

  const recentRecords = useMemo(
    () => [...records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8),
    [records]
  )

  // ===== HOURS DATA =====
  const filteredHours = useMemo(() => {
    return records.filter((r) => {
      const matchEmp = !hoursEmpFilter || r.employeeId === hoursEmpFilter
      const matchDate = r.date >= hoursDateStart && r.date <= hoursDateEnd
      const matchStatus = !hoursStatusFilter || r.status === hoursStatusFilter
      return matchEmp && matchDate && matchStatus
    })
  }, [records, hoursEmpFilter, hoursDateStart, hoursDateEnd, hoursStatusFilter])

  const hoursTotals = useMemo(() => {
    const worked = filteredHours.reduce((s, r) => s + calculateWorkedMinutes(r.entrada, r.inicioAlmoco, r.retornoAlmoco, r.saida), 0)
    const extras = filteredHours.reduce((s, r) => s + r.extraHours, 0)
    return { worked: minutesToTime(worked), extras: extras.toFixed(1), count: filteredHours.length }
  }, [filteredHours])

  // ===== RANKINGS DATA =====
  const rankingsData = useMemo(() => {
    const empRecords = activeEmployees.map((emp) => {
      const empRecs = records.filter((r) => r.employeeId === emp.id)
      return {
        emp,
        extras: empRecs.reduce((s, r) => s + r.extraHours, 0),
        delays: empRecs.filter((r) => r.status === 'atraso').length,
        delayMin: empRecs.reduce((s, r) => s + r.delayMinutes, 0),
        absences: empRecs.filter((r) => r.status === 'falta').length,
        total: empRecs.length,
      }
    })
    return {
      extras: [...empRecords].sort((a, b) => b.extras - a.extras),
      delays: [...empRecords].sort((a, b) => b.delays - a.delays),
      absences: [...empRecords].sort((a, b) => b.absences - a.absences),
    }
  }, [activeEmployees, records])

  // ===== REPORT DATA =====
  const reportEmployee = employees.find((e) => e.id === reportEmpId)
  const reportRecords = useMemo(() => {
    return records.filter((r) => {
      const [y, m] = r.date.split('-').map(Number)
      return r.employeeId === reportEmpId && y === reportYear && m === reportMonth
    }).sort((a, b) => a.date.localeCompare(b.date))
  }, [records, reportEmpId, reportMonth, reportYear])

  const reportExtras = reportRecords.reduce((s, r) => s + r.extraHours, 0)
  const hourlyRate = reportEmployee
    ? reportEmployee.salary / (reportEmployee.weeklyHours * 52 / 12)
    : 0
  const extraValue = hourlyRate * reportExtras * 1.5
  const hasCLTViolations = reportExtras > 20 || reportRecords.some((r) => r.extraHours > 2)

  // ===== EMPLOYEE CRUD =====
  const openNewEmployee = () => {
    setEditingEmp(null)
    setEmpForm({ ...emptyEmployee })
    setEmpModal(true)
  }

  const openEditEmployee = (emp: Employee) => {
    setEditingEmp(emp)
    setEmpForm({ ...emp })
    setEmpModal(true)
  }

  const saveEmployee = () => {
    if (!empForm.name || !empForm.email) {
      addToast('Nome e e-mail são obrigatórios', 'error')
      return
    }
    if (editingEmp) {
      onUpdateEmployees(employees.map((e) => (e.id === editingEmp.id ? { ...empForm, id: editingEmp.id } : e)))
      addToast('Funcionário atualizado com sucesso', 'success')
    } else {
      const newEmp: Employee = {
        ...empForm,
        id: `emp-${Date.now()}`,
        avatar: empForm.avatar || `https://i.pravatar.cc/150?u=${empForm.email}`,
      }
      onUpdateEmployees([...employees, newEmp])
      addToast('Funcionário cadastrado com sucesso', 'success')
    }
    setEmpModal(false)
  }

  const toggleEmployeeStatus = (emp: Employee) => {
    onUpdateEmployees(employees.map((e) => e.id === emp.id ? { ...e, status: !e.status } : e))
    addToast(`${emp.name} ${emp.status ? 'desativado' : 'ativado'}`, 'info')
  }

  // ===== CONVENIOS CRUD =====
  const openNewConvenio = () => {
    setEditingConv(null)
    setConvForm({ ...emptyConvenio })
    setConvModal(true)
  }

  const openEditConvenio = (conv: Convenio) => {
    setEditingConv(conv)
    setConvForm({ ...conv })
    setConvModal(true)
  }

  const saveConvenio = () => {
    if (!convForm.name || !convForm.discount) {
      addToast('Nome e desconto são obrigatórios', 'error')
      return
    }
    if (editingConv) {
      onUpdateConvenios(convenios.map((c) => (c.id === editingConv.id ? { ...convForm, id: editingConv.id } : c)))
      addToast('Convênio atualizado', 'success')
    } else {
      onUpdateConvenios([...convenios, { ...convForm, id: `conv-${Date.now()}` }])
      addToast('Convênio criado com sucesso', 'success')
    }
    setConvModal(false)
  }

  const deleteConvenio = (id: string) => {
    onUpdateConvenios(convenios.filter((c) => c.id !== id))
    addToast('Convênio removido', 'info')
  }

  // ===== WHATSAPP =====
  const handleSendMessage = () => {
    if (!msgEmployee.length || !msgText.trim()) {
      addToast('Selecione ao menos um funcionário e escreva a mensagem', 'error')
      return
    }
    const newNotifs: NotificationLog[] = msgEmployee.map((empId) => {
      const emp = employees.find((e) => e.id === empId)
      return {
        id: `notif-${Date.now()}-${empId}`,
        employeeName: emp?.name ?? '',
        phone: emp?.phone ?? '',
        message: msgText,
        type: 'alerta',
        timestamp: new Date().toISOString(),
        status: 'enviado',
      }
    })
    onUpdateNotifications([...notifications, ...newNotifs])
    addToast(`Mensagem enviada para ${msgEmployee.length} funcionário(s)`, 'success')
    setMsgEmployee([])
    setMsgText('')
  }

  const handleCopyCode = (conv: Convenio) => {
    if (!conv.code) return
    navigator.clipboard.writeText(conv.code).then(() => {
      setCopiedId(conv.id)
      addToast(`Código ${conv.code} copiado!`, 'success')
      setTimeout(() => setCopiedId(null), 2000)
    }).catch(() => addToast('Não foi possível copiar o código', 'error'))
  }

  // ===== EXPORT =====
  const handleExportExcel = () => {
    addToast('Exportação iniciada — arquivo será baixado em breve', 'info')
  }

  const handleExportPDF = () => {
    addToast('Gerando PDF — aguarde um momento', 'info')
  }

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'funcionarios', label: 'Funcionários', icon: <Users className="w-5 h-5" /> },
    { id: 'horas', label: 'Horas Trabalhadas', icon: <Clock className="w-5 h-5" /> },
    { id: 'rankings', label: 'Rankings', icon: <Trophy className="w-5 h-5" /> },
    { id: 'relatorio', label: 'Relatório de Extras', icon: <FileText className="w-5 h-5" /> },
    { id: 'whatsapp', label: 'Central WhatsApp', icon: <MessageCircle className="w-5 h-5" /> },
    { id: 'aniversariantes', label: 'Aniversariantes', icon: <Gift className="w-5 h-5" /> },
    { id: 'convenios', label: 'Convênios', icon: <Building2 className="w-5 h-5" /> },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900/95 backdrop-blur-md border-r border-white/10 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1a7a4a] flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-white">Ponto <span className="text-[#4ade80]">Fácil</span></div>
              <div className="text-xs text-slate-500">Painel Administrativo</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                tab === item.id
                  ? 'bg-[#1a7a4a] text-white shadow-lg shadow-[#1a7a4a]/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Admin info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <img src={currentAdmin.avatar} alt={currentAdmin.name} className="w-9 h-9 rounded-full" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate">{currentAdmin.name}</div>
              <div className="text-xs text-slate-500 truncate">{currentAdmin.role}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors py-2 rounded-lg hover:bg-white/10"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar mobile */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-white/10 h-14 flex items-center justify-between px-4">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-white">Ponto <span className="text-[#4ade80]">Fácil</span></span>
          <div className="w-5" />
        </header>

        <main className="flex-1 pt-4 lg:pt-8 pb-8 px-4 lg:px-8 mt-14 lg:mt-0 space-y-6">

          {/* ===== DASHBOARD ===== */}
          {tab === 'dashboard' && (
            <div className="animate-fade-in space-y-6">
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>

              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Funcionários Ativos', value: dashboardKpis.totalEmployees, color: 'text-[#4ade80]', icon: <Users className="w-5 h-5" /> },
                  { label: 'Horas Extras (mês)', value: `${dashboardKpis.totalExtraHours}h`, color: 'text-yellow-400', icon: <Clock className="w-5 h-5" /> },
                  { label: 'Atrasos (mês)', value: dashboardKpis.totalDelays, color: 'text-orange-400', icon: <AlertTriangle className="w-5 h-5" /> },
                  { label: 'Faltas (mês)', value: dashboardKpis.totalAbsences, color: 'text-red-400', icon: <X className="w-5 h-5" /> },
                ].map((kpi) => (
                  <div key={kpi.label} className="glass-card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs text-slate-400">{kpi.label}</span>
                      <span className={kpi.color}>{kpi.icon}</span>
                    </div>
                    <div className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Gráfico horas */}
                <div className="glass-card p-5">
                  <h2 className="font-semibold text-white mb-4">Horas Trabalhadas (últimos 6 dias)</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                        labelStyle={{ color: '#94a3b8' }}
                      />
                      <Bar dataKey="horas" fill="#1a7a4a" radius={[4, 4, 0, 0]} name="Horas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico extras */}
                <div className="glass-card p-5">
                  <h2 className="font-semibold text-white mb-4">Tendência de Horas Extras</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                      />
                      <Line type="monotone" dataKey="extras" stroke="#facc15" strokeWidth={2} dot={{ fill: '#facc15', r: 4 }} name="Extras" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Alertas CLT */}
                <div className="glass-card p-5">
                  <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    Alertas CLT Ativos
                    {alerts.length > 0 && (
                      <span className="ml-auto badge-danger">{alerts.length}</span>
                    )}
                  </h2>
                  {alerts.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm">
                      <CheckCircle className="w-8 h-8 text-[#4ade80] mx-auto mb-2" />
                      Nenhuma violação detectada
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {alerts.slice(0, 6).map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-3 rounded-xl flex items-start gap-2 ${
                            alert.level === 'danger' ? 'bg-red-500/10 border border-red-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'
                          }`}
                        >
                          <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${alert.level === 'danger' ? 'text-red-400' : 'text-yellow-400'}`} />
                          <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Registros recentes */}
                <div className="glass-card p-5">
                  <h2 className="font-semibold text-white mb-4">Registros Recentes</h2>
                  <div className="space-y-2">
                    {recentRecords.map((r) => {
                      const emp = employees.find((e) => e.id === r.employeeId)
                      return (
                        <div key={r.id} className="flex items-center gap-3 py-2 border-b border-white/5">
                          <img
                            src={emp?.avatar ?? ''}
                            alt={emp?.name ?? ''}
                            className="w-7 h-7 rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white truncate">{emp?.name}</div>
                            <div className="text-xs text-slate-500">{formatDate(r.date)}</div>
                          </div>
                          <span className={`text-xs ${STATUS_BADGE[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== FUNCIONÁRIOS ===== */}
          {tab === 'funcionarios' && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Funcionários</h1>
                <button onClick={openNewEmployee} className="btn-primary text-sm py-2 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Funcionário
                </button>
              </div>

              <div className="glass-card p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, cargo, departamento..."
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                    className="input-glass pl-9"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 text-xs text-slate-400 uppercase">
                        <th className="px-4 py-3 text-left">Funcionário</th>
                        <th className="px-4 py-3 text-left hidden md:table-cell">CPF</th>
                        <th className="px-4 py-3 text-left hidden lg:table-cell">Cargo</th>
                        <th className="px-4 py-3 text-center hidden lg:table-cell">C.H.</th>
                        <th className="px-4 py-3 text-right hidden md:table-cell">Salário</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees
                        .filter(
                          (e) =>
                            e.profile === 'employee' &&
                            (e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
                              e.role.toLowerCase().includes(empSearch.toLowerCase()) ||
                              e.department.toLowerCase().includes(empSearch.toLowerCase()))
                        )
                        .map((emp) => (
                          <tr key={emp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full" />
                                <div>
                                  <div className="text-sm font-medium text-white">{emp.name}</div>
                                  <div className="text-xs text-slate-500">{emp.department}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-400 hidden md:table-cell">{emp.cpf}</td>
                            <td className="px-4 py-3 text-sm text-slate-300 hidden lg:table-cell">{emp.role}</td>
                            <td className="px-4 py-3 text-center text-sm text-slate-400 hidden lg:table-cell">{emp.weeklyHours}h</td>
                            <td className="px-4 py-3 text-right text-sm text-slate-300 hidden md:table-cell">
                              R$ {emp.salary.toLocaleString('pt-BR')}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={emp.status ? 'badge-success' : 'badge-danger'}>
                                {emp.status ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => openEditEmployee(emp)}
                                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                  title="Editar"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => { setReportEmpId(emp.id); setTab('relatorio') }}
                                  className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                                  title="Ver horas"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => toggleEmployeeStatus(emp)}
                                  className={`p-1.5 rounded-lg transition-all ${
                                    emp.status
                                      ? 'text-slate-400 hover:text-red-400 hover:bg-red-400/10'
                                      : 'text-slate-400 hover:text-green-400 hover:bg-green-400/10'
                                  }`}
                                  title={emp.status ? 'Desativar' : 'Ativar'}
                                >
                                  {emp.status ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== HORAS TRABALHADAS ===== */}
          {tab === 'horas' && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Horas Trabalhadas</h1>
                <div className="flex gap-2">
                  <button onClick={handleExportPDF} className="btn-secondary text-sm py-2 flex items-center gap-2">
                    <Download className="w-4 h-4" /> PDF
                  </button>
                  <button onClick={handleExportExcel} className="btn-secondary text-sm py-2 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Excel
                  </button>
                </div>
              </div>

              {/* Filtros */}
              <div className="glass-card p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="label-glass">Funcionário</label>
                  <select
                    value={hoursEmpFilter}
                    onChange={(e) => setHoursEmpFilter(e.target.value)}
                    className="input-glass"
                  >
                    <option value="">Todos</option>
                    {activeEmployees.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-glass">Data início</label>
                  <input type="date" value={hoursDateStart} onChange={(e) => setHoursDateStart(e.target.value)} className="input-glass" />
                </div>
                <div>
                  <label className="label-glass">Data fim</label>
                  <input type="date" value={hoursDateEnd} onChange={(e) => setHoursDateEnd(e.target.value)} className="input-glass" />
                </div>
                <div>
                  <label className="label-glass">Status</label>
                  <select value={hoursStatusFilter} onChange={(e) => setHoursStatusFilter(e.target.value)} className="input-glass">
                    <option value="">Todos</option>
                    <option value="normal">Normal</option>
                    <option value="extra">Extra</option>
                    <option value="atraso">Atraso</option>
                    <option value="falta">Falta</option>
                  </select>
                </div>
              </div>

              {/* Totais */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-[#4ade80]">{hoursTotals.count}</div>
                  <div className="text-xs text-slate-400 mt-1">Registros</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-white">{hoursTotals.worked}</div>
                  <div className="text-xs text-slate-400 mt-1">Total Trabalhado</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{hoursTotals.extras}h</div>
                  <div className="text-xs text-slate-400 mt-1">Horas Extras</div>
                </div>
              </div>

              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 text-xs text-slate-400 uppercase">
                        <th className="px-4 py-3 text-left">Funcionário</th>
                        <th className="px-4 py-3 text-left">Data</th>
                        <th className="px-4 py-3 text-center">Entrada</th>
                        <th className="px-4 py-3 text-center hidden md:table-cell">Almoço</th>
                        <th className="px-4 py-3 text-center hidden md:table-cell">Retorno</th>
                        <th className="px-4 py-3 text-center">Saída</th>
                        <th className="px-4 py-3 text-center">Total</th>
                        <th className="px-4 py-3 text-center">Extras</th>
                        <th className="px-4 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHours.map((r) => {
                        const emp = employees.find((e) => e.id === r.employeeId)
                        const worked = minutesToTime(calculateWorkedMinutes(r.entrada, r.inicioAlmoco, r.retornoAlmoco, r.saida))
                        return (
                          <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <img src={emp?.avatar} alt="" className="w-6 h-6 rounded-full" />
                                <span className="text-sm text-white">{emp?.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-300">{formatDate(r.date)}</td>
                            <td className="px-4 py-3 text-center font-mono text-sm text-slate-300">{formatTime(r.entrada)}</td>
                            <td className="px-4 py-3 text-center font-mono text-sm text-slate-300 hidden md:table-cell">{formatTime(r.inicioAlmoco)}</td>
                            <td className="px-4 py-3 text-center font-mono text-sm text-slate-300 hidden md:table-cell">{formatTime(r.retornoAlmoco)}</td>
                            <td className="px-4 py-3 text-center font-mono text-sm text-slate-300">{formatTime(r.saida)}</td>
                            <td className="px-4 py-3 text-center font-mono text-sm text-[#4ade80]">{worked}</td>
                            <td className="px-4 py-3 text-center text-sm text-yellow-400">
                              {r.extraHours > 0 ? `+${r.extraHours.toFixed(1)}h` : '—'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={STATUS_BADGE[r.status]}>{STATUS_LABELS[r.status]}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {filteredHours.length === 0 && (
                    <div className="text-center py-12 text-slate-400">Nenhum registro encontrado para os filtros aplicados.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===== RANKINGS ===== */}
          {tab === 'rankings' && (
            <div className="animate-fade-in space-y-6">
              <h1 className="text-2xl font-bold text-white">Rankings</h1>

              <div className="flex gap-2">
                {[
                  { id: 'extras' as const, label: 'Horas Extras' },
                  { id: 'atrasos' as const, label: 'Atrasos' },
                  { id: 'faltas' as const, label: 'Faltas' },
                ].map((rt) => (
                  <button
                    key={rt.id}
                    onClick={() => setRankingTab(rt.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      rankingTab === rt.id ? 'bg-[#1a7a4a] text-white' : 'btn-secondary text-sm'
                    }`}
                  >
                    {rt.label}
                  </button>
                ))}
              </div>

              {(() => {
                const data =
                  rankingTab === 'extras'
                    ? rankingsData.extras
                    : rankingTab === 'atrasos'
                    ? rankingsData.delays
                    : rankingsData.absences

                const getValue = (item: (typeof data)[0]) =>
                  rankingTab === 'extras'
                    ? `${item.extras.toFixed(1)}h`
                    : rankingTab === 'atrasos'
                    ? `${item.delays} atraso${item.delays !== 1 ? 's' : ''}`
                    : `${item.absences} falta${item.absences !== 1 ? 's' : ''}`

                const getMax = () =>
                  rankingTab === 'extras'
                    ? Math.max(...data.map((d) => d.extras), 1)
                    : rankingTab === 'atrasos'
                    ? Math.max(...data.map((d) => d.delays), 1)
                    : Math.max(...data.map((d) => d.absences), 1)

                const getRaw = (item: (typeof data)[0]) =>
                  rankingTab === 'extras' ? item.extras : rankingTab === 'atrasos' ? item.delays : item.absences

                const top3 = data.slice(0, 3)
                const rest = data.slice(3)
                const maxVal = getMax()
                const podiumColors = ['text-yellow-400', 'text-slate-300', 'text-orange-400']
                const podiumBgs = ['bg-yellow-400/10 border-yellow-400/30', 'bg-slate-400/10 border-slate-400/30', 'bg-orange-400/10 border-orange-400/30']
                const podiumEmoji = ['🥇', '🥈', '🥉']

                return (
                  <>
                    {/* Pódio */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      {top3.map((item, i) => (
                        <div key={item.emp.id} className={`glass-card border ${podiumBgs[i]} p-5 text-center`}>
                          <div className="text-3xl mb-2">{podiumEmoji[i]}</div>
                          <img src={item.emp.avatar} alt={item.emp.name} className="w-14 h-14 rounded-full mx-auto mb-2 border-2 border-white/20" />
                          <div className="font-semibold text-white text-sm">{item.emp.name}</div>
                          <div className="text-xs text-slate-500 mb-2">{item.emp.role}</div>
                          <div className={`text-2xl font-bold ${podiumColors[i]}`}>{getValue(item)}</div>
                        </div>
                      ))}
                    </div>

                    {/* Lista completa */}
                    <div className="glass-card p-5 space-y-3">
                      {data.map((item, i) => (
                        <div key={item.emp.id} className="flex items-center gap-3">
                          <span className="text-slate-500 text-sm w-6 text-center">{i + 1}</span>
                          <img src={item.emp.avatar} alt={item.emp.name} className="w-8 h-8 rounded-full" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-white truncate">{item.emp.name}</span>
                              <span className="text-sm font-mono text-slate-300 shrink-0 ml-2">{getValue(item)}</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#1a7a4a] rounded-full transition-all duration-500"
                                style={{ width: `${(getRaw(item) / maxVal) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {rankingTab === 'atrasos' && (
                      <div className="glass-card p-5">
                        <h3 className="font-semibold text-white mb-3 text-sm">Média de minutos por atraso</h3>
                        {rankingsData.delays.filter((d) => d.delays > 0).map((item) => (
                          <div key={item.emp.id} className="flex items-center justify-between py-1.5 border-b border-white/5">
                            <span className="text-sm text-white">{item.emp.name}</span>
                            <span className="text-sm text-orange-400 font-mono">
                              ~{item.delays > 0 ? (item.delayMin / item.delays).toFixed(0) : 0} min/atraso
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          )}

          {/* ===== RELATÓRIO ===== */}
          {tab === 'relatorio' && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Relatório de Horas Extras</h1>
                <button onClick={handleExportPDF} className="btn-secondary text-sm py-2 flex items-center gap-2">
                  <Download className="w-4 h-4" /> Exportar PDF
                </button>
              </div>

              {/* Filtros */}
              <div className="glass-card p-4 grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="label-glass">Funcionário</label>
                  <select value={reportEmpId} onChange={(e) => setReportEmpId(e.target.value)} className="input-glass">
                    <option value="">Selecionar...</option>
                    {activeEmployees.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-glass">Mês</label>
                  <select value={reportMonth} onChange={(e) => setReportMonth(Number(e.target.value))} className="input-glass">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>{getMonthName(m)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-glass">Ano</label>
                  <input type="number" value={reportYear} onChange={(e) => setReportYear(Number(e.target.value))} className="input-glass" min="2024" max="2030" />
                </div>
              </div>

              {reportEmpId && reportEmployee ? (
                <>
                  {hasCLTViolations && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-red-400 mb-1">Violação CLT Detectada</div>
                        <p className="text-sm text-red-300">
                          {reportEmployee.name} registrou horas extras acima do limite legal neste período. Verifique os detalhes abaixo.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Resumo */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Horas Extras', value: `${reportExtras.toFixed(1)}h`, color: 'text-yellow-400' },
                      { label: 'Valor a Pagar (50%)', value: `R$ ${extraValue.toFixed(2)}`, color: 'text-[#4ade80]' },
                      { label: 'Dias Trabalhados', value: reportRecords.filter((r) => r.status !== 'falta').length, color: 'text-white' },
                      { label: 'Dias com Extras', value: reportRecords.filter((r) => r.extraHours > 0).length, color: 'text-orange-400' },
                    ].map((kpi) => (
                      <div key={kpi.label} className="glass-card p-4 text-center">
                        <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
                        <div className="text-xs text-slate-400 mt-1">{kpi.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="glass-card overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                      <h2 className="font-semibold text-white">
                        Horas extras — {reportEmployee.name} — {getMonthName(reportMonth)} {reportYear}
                      </h2>
                    </div>
                    {reportRecords.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">Nenhum registro no período.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10 text-xs text-slate-400 uppercase">
                              <th className="px-4 py-3 text-left">Data</th>
                              <th className="px-4 py-3 text-center">Horas Normais</th>
                              <th className="px-4 py-3 text-center">Horas Extras</th>
                              <th className="px-4 py-3 text-center">Tipo</th>
                              <th className="px-4 py-3 text-right">Valor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportRecords.map((r) => {
                              const worked = calculateWorkedMinutes(r.entrada, r.inicioAlmoco, r.retornoAlmoco, r.saida)
                              const normalMin = Math.min(worked, 480)
                              const extraMin = Math.max(0, worked - 480)
                              const tipo = extraMin > 120 ? '100%' : extraMin > 0 ? '50%' : '—'
                              const mult = extraMin > 120 ? 2 : 1.5
                              const valor = (extraMin / 60) * hourlyRate * mult
                              return (
                                <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                                  <td className="px-4 py-3 text-sm text-white">{formatDate(r.date)}</td>
                                  <td className="px-4 py-3 text-center font-mono text-sm text-slate-300">{minutesToTime(normalMin)}</td>
                                  <td className={`px-4 py-3 text-center font-mono text-sm ${extraMin > 0 ? 'text-yellow-400' : 'text-slate-500'}`}>
                                    {extraMin > 0 ? `+${minutesToTime(extraMin)}` : '—'}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {tipo !== '—' ? (
                                      <span className="badge-warning">{tipo}</span>
                                    ) : (
                                      <span className="text-slate-500 text-xs">—</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right text-sm text-[#4ade80]">
                                    {extraMin > 0 ? `R$ ${valor.toFixed(2)}` : '—'}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="glass-card p-12 text-center text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                  Selecione um funcionário para gerar o relatório.
                </div>
              )}
            </div>
          )}

          {/* ===== WHATSAPP ===== */}
          {tab === 'whatsapp' && (
            <div className="animate-fade-in space-y-6">
              <h1 className="text-2xl font-bold text-white">Central de Comunicação</h1>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Envio manual */}
                <div className="glass-card p-5 space-y-4">
                  <h2 className="font-semibold text-white flex items-center gap-2">
                    <Send className="w-5 h-5 text-[#4ade80]" />
                    Enviar Mensagem
                  </h2>

                  <div>
                    <label className="label-glass">Funcionários</label>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {activeEmployees.map((emp) => (
                        <label key={emp.id} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1.5 rounded-lg">
                          <input
                            type="checkbox"
                            checked={msgEmployee.includes(emp.id)}
                            onChange={(e) => {
                              setMsgEmployee((prev) =>
                                e.target.checked ? [...prev, emp.id] : prev.filter((id) => id !== emp.id)
                              )
                            }}
                            className="rounded"
                          />
                          <img src={emp.avatar} alt="" className="w-6 h-6 rounded-full" />
                          <span className="text-sm text-white">{emp.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label-glass">Mensagem</label>
                    <textarea
                      value={msgText}
                      onChange={(e) => setMsgText(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      rows={4}
                      className="input-glass resize-none"
                    />
                  </div>

                  {msgEmployee.length > 0 && msgText && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <div className="text-xs text-slate-400 mb-1">Preview:</div>
                      <p className="text-sm text-white">{msgText}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Para: {msgEmployee.map((id) => employees.find((e) => e.id === id)?.name).join(', ')}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleSendMessage}
                    disabled={!msgEmployee.length || !msgText.trim()}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Enviar Mensagem
                  </button>
                </div>

                {/* Config notificações automáticas */}
                <div className="glass-card p-5 space-y-4">
                  <h2 className="font-semibold text-white">Notificações Automáticas</h2>
                  {(
                    [
                      { key: 'entrada' as const, label: 'Lembrete de Entrada' },
                      { key: 'almoco' as const, label: 'Saída para Almoço' },
                      { key: 'retorno' as const, label: 'Retorno do Almoço' },
                      { key: 'saida' as const, label: 'Lembrete de Saída' },
                    ]
                  ).map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                      <button
                        onClick={() => onUpdateNotifConfig({
                          ...notifConfig,
                          [key]: { ...notifConfig[key], enabled: !notifConfig[key].enabled }
                        })}
                        className={`shrink-0 transition-colors ${notifConfig[key].enabled ? 'text-[#4ade80]' : 'text-slate-500'}`}
                      >
                        {notifConfig[key].enabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                      </button>
                      <span className="flex-1 text-sm text-white">{label}</span>
                      <input
                        type="time"
                        value={notifConfig[key].time}
                        onChange={(e) => onUpdateNotifConfig({
                          ...notifConfig,
                          [key]: { ...notifConfig[key], time: e.target.value }
                        })}
                        disabled={!notifConfig[key].enabled}
                        className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm text-white disabled:opacity-40"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Histórico */}
              <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <h2 className="font-semibold text-white">Histórico de Notificações</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 text-xs text-slate-400 uppercase">
                        <th className="px-4 py-3 text-left">Funcionário</th>
                        <th className="px-4 py-3 text-left hidden md:table-cell">Mensagem</th>
                        <th className="px-4 py-3 text-center hidden md:table-cell">Tipo</th>
                        <th className="px-4 py-3 text-left">Data/Hora</th>
                        <th className="px-4 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...notifications].reverse().map((n) => (
                        <tr key={n.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3">
                            <div className="text-sm text-white">{n.employeeName}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />{n.phone}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-400 max-w-xs truncate hidden md:table-cell">{n.message}</td>
                          <td className="px-4 py-3 text-center hidden md:table-cell">
                            <span className="badge-info text-xs capitalize">{n.type}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-400">
                            {new Date(n.timestamp).toLocaleString('pt-BR', {
                              day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={NOTIF_STATUS_BADGE[n.status] ?? 'badge-info'}>{n.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== ANIVERSARIANTES ===== */}
          {tab === 'aniversariantes' && (
            <div className="animate-fade-in space-y-6">
              <h1 className="text-2xl font-bold text-white">Aniversariantes</h1>

              <div className="glass-card p-4 flex items-center gap-4">
                <button onClick={() => setBdMonth((m) => (m === 1 ? 12 : m - 1))} className="text-slate-400 hover:text-white transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 text-center">
                  <div className="font-semibold text-white">{getMonthName(bdMonth)}</div>
                </div>
                <button onClick={() => setBdMonth((m) => (m === 12 ? 1 : m + 1))} className="text-slate-400 hover:text-white transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {(() => {
                const birthdays = employees
                  .filter((e) => e.status && isBirthday(e.birthDate, bdMonth))
                  .sort((a, b) => getBirthdayDay(a.birthDate) - getBirthdayDay(b.birthDate))

                if (birthdays.length === 0) {
                  return (
                    <div className="glass-card p-12 text-center text-slate-400">
                      <Gift className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                      Nenhum aniversariante em {getMonthName(bdMonth)}.
                    </div>
                  )
                }

                return (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {birthdays.map((emp) => {
                      const isToday = getBirthdayDay(emp.birthDate) === today.getDate() && bdMonth === today.getMonth() + 1
                      return (
                        <div key={emp.id} className={`glass-card p-5 ${isToday ? 'border-[#1a7a4a]/50 bg-[#1a7a4a]/10' : ''}`}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="relative">
                              <img src={emp.avatar} alt={emp.name} className="w-12 h-12 rounded-full" />
                              {isToday && <div className="absolute -top-1 -right-1 text-base">🎂</div>}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{emp.name}</div>
                              <div className="text-xs text-slate-400">{emp.role}</div>
                              <div className="text-xs text-slate-500">{emp.department}</div>
                            </div>
                          </div>
                          <div className="text-sm text-[#4ade80]">
                            🎉 Dia {getBirthdayDay(emp.birthDate)} de {getMonthName(bdMonth)}
                          </div>
                          {isToday && (
                            <button
                              onClick={() => addToast(`Mensagem de parabéns enviada para ${emp.name}! 🎂`, 'success')}
                              className="mt-3 w-full text-xs btn-primary py-2"
                            >
                              Enviar parabéns via WhatsApp
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          )}

          {/* ===== CONVÊNIOS ===== */}
          {tab === 'convenios' && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Convênios</h1>
                <button onClick={openNewConvenio} className="btn-primary text-sm py-2 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Convênio
                </button>
              </div>

              <div className="glass-card p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar convênios..."
                    value={convSearch}
                    onChange={(e) => setConvSearch(e.target.value)}
                    className="input-glass pl-9"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setConvCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                        convCategory === cat ? 'bg-[#1a7a4a] text-white' : 'bg-white/10 text-slate-400 hover:text-white hover:bg-white/20'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {convenios
                  .filter((c) => {
                    const matchSearch = c.name.toLowerCase().includes(convSearch.toLowerCase()) || c.description.toLowerCase().includes(convSearch.toLowerCase())
                    const matchCategory = convCategory === 'Todos' || c.category === convCategory
                    return matchSearch && matchCategory
                  })
                  .map((conv) => (
                    <div key={conv.id} className="glass-card p-5 flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white">{conv.name}</h3>
                          <span className="badge-info text-xs mt-1 inline-block">{conv.category}</span>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEditConvenio(conv)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteConvenio(conv.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <span className="badge-success text-sm font-bold mb-2 self-start">{conv.discount}</span>
                      <p className="text-sm text-slate-400 leading-relaxed flex-1 mb-4">{conv.description}</p>
                      <div className="flex gap-2">
                        {conv.code && (
                          <button
                            onClick={() => handleCopyCode(conv)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                              copiedId === conv.id ? 'bg-[#1a7a4a] text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                          >
                            <Copy className="w-3 h-3" />
                            {copiedId === conv.id ? 'Copiado!' : conv.code}
                          </button>
                        )}
                        {conv.website && (
                          <a href={conv.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===== EMPLOYEE MODAL ===== */}
      <Modal isOpen={empModal} onClose={() => setEmpModal(false)} title={editingEmp ? 'Editar Funcionário' : 'Novo Funcionário'} size="xl">
        <div className="p-6 space-y-6">
          {/* Dados pessoais */}
          <div>
            <h3 className="text-sm font-semibold text-[#4ade80] uppercase tracking-wide mb-3">Dados Pessoais</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Nome completo *', key: 'name' as const, type: 'text' },
                { label: 'E-mail *', key: 'email' as const, type: 'email' },
                { label: 'CPF', key: 'cpf' as const, type: 'text' },
                { label: 'RG', key: 'rg' as const, type: 'text' },
                { label: 'Data de nascimento', key: 'birthDate' as const, type: 'date' },
                { label: 'Telefone', key: 'phone' as const, type: 'tel' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="label-glass">{label}</label>
                  <input
                    type={type}
                    value={String(empForm[key] ?? '')}
                    onChange={(e) => setEmpForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="input-glass"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Dados profissionais */}
          <div>
            <h3 className="text-sm font-semibold text-[#4ade80] uppercase tracking-wide mb-3">Dados Profissionais</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Cargo', key: 'role' as const, type: 'text' },
                { label: 'Departamento', key: 'department' as const, type: 'text' },
                { label: 'Data de admissão', key: 'admissionDate' as const, type: 'date' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="label-glass">{label}</label>
                  <input
                    type={type}
                    value={String(empForm[key] ?? '')}
                    onChange={(e) => setEmpForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="input-glass"
                  />
                </div>
              ))}
              <div>
                <label className="label-glass">Salário (R$)</label>
                <input
                  type="number"
                  value={empForm.salary}
                  onChange={(e) => setEmpForm((f) => ({ ...f, salary: Number(e.target.value) }))}
                  className="input-glass"
                  min="0"
                />
              </div>
              <div>
                <label className="label-glass">Carga horária semanal (h)</label>
                <input
                  type="number"
                  value={empForm.weeklyHours}
                  onChange={(e) => setEmpForm((f) => ({ ...f, weeklyHours: Number(e.target.value) }))}
                  className="input-glass"
                  min="1"
                  max="44"
                />
              </div>
              <div>
                <label className="label-glass">Perfil</label>
                <select
                  value={empForm.profile}
                  onChange={(e) => setEmpForm((f) => ({ ...f, profile: e.target.value as 'employee' | 'admin' }))}
                  className="input-glass"
                >
                  <option value="employee">Funcionário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contato emergência */}
          <div>
            <h3 className="text-sm font-semibold text-[#4ade80] uppercase tracking-wide mb-3">Contato de Emergência</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label-glass">Nome</label>
                <input
                  type="text"
                  value={empForm.emergencyContact.name}
                  onChange={(e) => setEmpForm((f) => ({ ...f, emergencyContact: { ...f.emergencyContact, name: e.target.value } }))}
                  className="input-glass"
                />
              </div>
              <div>
                <label className="label-glass">Telefone</label>
                <input
                  type="tel"
                  value={empForm.emergencyContact.phone}
                  onChange={(e) => setEmpForm((f) => ({ ...f, emergencyContact: { ...f.emergencyContact, phone: e.target.value } }))}
                  className="input-glass"
                />
              </div>
            </div>
          </div>

          {/* GPS */}
          <div>
            <h3 className="text-sm font-semibold text-[#4ade80] uppercase tracking-wide mb-3">Localização GPS Permitida</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label-glass">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={empForm.gpsLocation.lat}
                  onChange={(e) => setEmpForm((f) => ({ ...f, gpsLocation: { ...f.gpsLocation, lat: Number(e.target.value) } }))}
                  className="input-glass"
                />
              </div>
              <div>
                <label className="label-glass">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={empForm.gpsLocation.lng}
                  onChange={(e) => setEmpForm((f) => ({ ...f, gpsLocation: { ...f.gpsLocation, lng: Number(e.target.value) } }))}
                  className="input-glass"
                />
              </div>
              <div>
                <label className="label-glass">Raio (m)</label>
                <input
                  type="number"
                  value={empForm.gpsLocation.radius}
                  onChange={(e) => setEmpForm((f) => ({ ...f, gpsLocation: { ...f.gpsLocation, radius: Number(e.target.value) } }))}
                  className="input-glass"
                  min="50"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setEmpModal(false)} className="btn-secondary">Cancelar</button>
            <button onClick={saveEmployee} className="btn-primary">
              {editingEmp ? 'Salvar alterações' : 'Cadastrar funcionário'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ===== CONVENIO MODAL ===== */}
      <Modal isOpen={convModal} onClose={() => setConvModal(false)} title={editingConv ? 'Editar Convênio' : 'Novo Convênio'} size="lg">
        <div className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-glass">Nome *</label>
              <input type="text" value={convForm.name} onChange={(e) => setConvForm((f) => ({ ...f, name: e.target.value }))} className="input-glass" />
            </div>
            <div>
              <label className="label-glass">Categoria</label>
              <select value={convForm.category} onChange={(e) => setConvForm((f) => ({ ...f, category: e.target.value }))} className="input-glass">
                {CATEGORIES.filter((c) => c !== 'Todos').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-glass">Desconto *</label>
              <input type="text" placeholder="Ex: 30% de desconto" value={convForm.discount} onChange={(e) => setConvForm((f) => ({ ...f, discount: e.target.value }))} className="input-glass" />
            </div>
            <div>
              <label className="label-glass">Código do cupom</label>
              <input type="text" value={convForm.code ?? ''} onChange={(e) => setConvForm((f) => ({ ...f, code: e.target.value }))} className="input-glass" />
            </div>
            <div>
              <label className="label-glass">Telefone</label>
              <input type="tel" value={convForm.phone ?? ''} onChange={(e) => setConvForm((f) => ({ ...f, phone: e.target.value }))} className="input-glass" />
            </div>
            <div>
              <label className="label-glass">Website</label>
              <input type="url" value={convForm.website ?? ''} onChange={(e) => setConvForm((f) => ({ ...f, website: e.target.value }))} className="input-glass" />
            </div>
          </div>
          <div>
            <label className="label-glass">Endereço</label>
            <input type="text" value={convForm.address ?? ''} onChange={(e) => setConvForm((f) => ({ ...f, address: e.target.value }))} className="input-glass" />
          </div>
          <div>
            <label className="label-glass">Descrição *</label>
            <textarea rows={3} value={convForm.description} onChange={(e) => setConvForm((f) => ({ ...f, description: e.target.value }))} className="input-glass resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setConvModal(false)} className="btn-secondary">Cancelar</button>
            <button onClick={saveConvenio} className="btn-primary">
              {editingConv ? 'Salvar alterações' : 'Criar convênio'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
