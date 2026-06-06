import { useState, useEffect } from 'react'
import {
  Clock, MapPin, CheckCircle, LogOut, Gift, Building2,
  ChevronLeft, ChevronRight, Copy, ExternalLink, Phone, Search,
  AlertTriangle, AlertCircle, Calendar, TrendingUp
} from 'lucide-react'
import type { Employee, TimeRecord, CLTAlert, Convenio, ToastType } from '../../types'
import { useClock } from '../../hooks/useClock'
import { useGPS } from '../../hooks/useGPS'
import {
  formatDate, formatTime, getCurrentDate, getCurrentTime,
  calculateWorkedMinutes, minutesToTime, getMonthName,
  isBirthday, getBirthdayDay, getGreeting, calculateDistance,
} from '../../utils/dateUtils'

type Tab = 'ponto' | 'espelho' | 'aniversariantes' | 'convenios'

interface EmployeePanelProps {
  employee: Employee
  employees: Employee[]
  records: TimeRecord[]
  alerts: CLTAlert[]
  convenios: Convenio[]
  onUpdateRecords: (records: TimeRecord[]) => void
  onLogout: () => void
  addToast: (message: string, type?: ToastType) => void
  [key: string]: unknown
}

const STATUS_LABELS: Record<string, string> = {
  normal: 'Normal',
  extra: 'Extra',
  atraso: 'Atraso',
  falta: 'Falta',
}

const STATUS_BADGE: Record<string, string> = {
  normal: 'badge-normal',
  extra: 'badge-success',
  atraso: 'badge-warning',
  falta: 'badge-danger',
}

const CATEGORIES = ['Todos', 'Fitness', 'Saúde & Bem-estar', 'Educação', 'Alimentação', 'Medicamentos & Farmácia', 'Outros']

export default function EmployeePanel({ employee, employees, records, alerts, convenios, onUpdateRecords, onLogout, addToast }: EmployeePanelProps) {
  const [tab, setTab] = useState<Tab>('ponto')
  const { formatted: clockTime } = useClock()
  const { lat, lng, locationName, loading: gpsLoading, getLocation } = useGPS()

  // Espelho state
  const today = new Date()
  const [mirrorMonth, setMirrorMonth] = useState(today.getMonth() + 1)
  const [mirrorYear, setMirrorYear] = useState(today.getFullYear())

  // Aniversariantes state
  const [bdMonth, setBdMonth] = useState(today.getMonth() + 1)

  // Convênios state
  const [convSearch, setConvSearch] = useState('')
  const [convCategory, setConvCategory] = useState('Todos')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => { getLocation() }, [getLocation])

  const todayStr = getCurrentDate()
  const todayRecord = records.find((r) => r.employeeId === employee.id && r.date === todayStr)
  const myAlerts = alerts.filter((a) => a.employeeId === employee.id)

  const isWithinGPS = lat !== null && lng !== null
    ? calculateDistance(lat, lng, employee.gpsLocation.lat, employee.gpsLocation.lng) <= employee.gpsLocation.radius
    : true // demo: always allow

  const canPunch = (type: 'entrada' | 'inicioAlmoco' | 'retornoAlmoco' | 'saida') => {
    if (!isWithinGPS) return false
    if (type === 'entrada') return !todayRecord?.entrada
    if (type === 'inicioAlmoco') return !!todayRecord?.entrada && !todayRecord?.inicioAlmoco
    if (type === 'retornoAlmoco') return !!todayRecord?.inicioAlmoco && !todayRecord?.retornoAlmoco
    if (type === 'saida') return !!todayRecord?.retornoAlmoco && !todayRecord?.saida
    return false
  }

  const isDone = (type: 'entrada' | 'inicioAlmoco' | 'retornoAlmoco' | 'saida') => {
    return !!todayRecord?.[type]
  }

  const handlePunch = (type: 'entrada' | 'inicioAlmoco' | 'retornoAlmoco' | 'saida') => {
    if (!canPunch(type)) return

    const now = getCurrentTime()
    const locationStr = locationName || 'Localização capturada'
    const coords = lat && lng ? { lat, lng } : undefined

    let updatedRecord: TimeRecord
    const existingIdx = records.findIndex((r) => r.employeeId === employee.id && r.date === todayStr)

    if (existingIdx >= 0) {
      updatedRecord = { ...records[existingIdx], [type]: now, gpsCoords: coords, locationName: locationStr }
    } else {
      updatedRecord = {
        id: `rec-${Date.now()}`,
        employeeId: employee.id,
        date: todayStr,
        [type]: now,
        gpsCoords: coords,
        locationName: locationStr,
        status: 'normal',
        extraHours: 0,
        delayMinutes: 0,
      }
    }

    // Calculate extra hours when clocking out
    if (type === 'saida' && updatedRecord.entrada) {
      const workedMin = calculateWorkedMinutes(
        updatedRecord.entrada, updatedRecord.inicioAlmoco,
        updatedRecord.retornoAlmoco, updatedRecord.saida
      )
      const extraMin = Math.max(0, workedMin - 480)
      updatedRecord.extraHours = extraMin / 60
      updatedRecord.status = extraMin > 0 ? 'extra' : 'normal'
    }

    // Check delay on entrada
    if (type === 'entrada') {
      const entradaMin = now.split(':').slice(0, 2).map(Number)
      const expectedMin = 8 * 60
      const actualMin = entradaMin[0] * 60 + entradaMin[1]
      if (actualMin > expectedMin + 5) {
        updatedRecord.delayMinutes = actualMin - expectedMin
        updatedRecord.status = 'atraso'
      }
    }

    const newRecords = existingIdx >= 0
      ? records.map((r, i) => (i === existingIdx ? updatedRecord : r))
      : [...records, updatedRecord]

    onUpdateRecords(newRecords)

    const labels: Record<string, string> = {
      entrada: 'Entrada', inicioAlmoco: 'Início do Almoço',
      retornoAlmoco: 'Retorno do Almoço', saida: 'Saída',
    }
    addToast(`${labels[type]} registrada às ${now.substring(0, 5)}`, 'success')
  }

  // Espelho data
  const mirrorRecords = records
    .filter((r) => {
      const [y, m] = r.date.split('-').map(Number)
      return r.employeeId === employee.id && y === mirrorYear && m === mirrorMonth
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  const totalWorkedMin = mirrorRecords.reduce(
    (sum, r) => sum + calculateWorkedMinutes(r.entrada, r.inicioAlmoco, r.retornoAlmoco, r.saida), 0
  )
  const totalExtraHours = mirrorRecords.reduce((sum, r) => sum + r.extraHours, 0)
  const totalAbsences = mirrorRecords.filter((r) => r.status === 'falta').length
  const totalDelays = mirrorRecords.filter((r) => r.status === 'atraso').length
  const maxExtraHoursMonth = 20
  const extraProgress = Math.min((totalExtraHours / maxExtraHoursMonth) * 100, 100)

  // Aniversariantes
  const birthdays = employees
    .filter((e) => e.status && isBirthday(e.birthDate, bdMonth))
    .sort((a, b) => getBirthdayDay(a.birthDate) - getBirthdayDay(b.birthDate))

  const todayBirthdays = birthdays.filter(
    (e) => getBirthdayDay(e.birthDate) === today.getDate() && bdMonth === today.getMonth() + 1
  )

  // Convênios
  const filteredConvenios = convenios.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(convSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(convSearch.toLowerCase())
    const matchCategory = convCategory === 'Todos' || c.category === convCategory
    return matchSearch && matchCategory
  })

  const handleCopyCode = (conv: Convenio) => {
    if (!conv.code) return
    navigator.clipboard.writeText(conv.code).then(() => {
      setCopiedId(conv.id)
      addToast(`Código ${conv.code} copiado!`, 'success')
      setTimeout(() => setCopiedId(null), 2000)
    }).catch(() => {
      addToast('Não foi possível copiar o código', 'error')
    })
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'ponto', label: 'Registro de Ponto', icon: <Clock className="w-4 h-4" /> },
    { id: 'espelho', label: 'Espelho de Horas', icon: <Calendar className="w-4 h-4" /> },
    { id: 'aniversariantes', label: 'Aniversariantes', icon: <Gift className="w-4 h-4" /> },
    { id: 'convenios', label: 'Convênios', icon: <Building2 className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1a7a4a] flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white hidden sm:block">
              Ponto <span className="text-[#4ade80]">Fácil</span>
            </span>
          </div>

          <nav className="flex items-center gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tab === t.id
                    ? 'bg-[#1a7a4a] text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {t.icon}
                <span className="hidden md:block">{t.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img src={employee.avatar} alt={employee.name} className="w-8 h-8 rounded-full border-2 border-[#1a7a4a]" />
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-white leading-none">{employee.name.split(' ')[0]}</div>
                <div className="text-xs text-slate-400">{employee.role}</div>
              </div>
            </div>
            <button onClick={onLogout} className="text-slate-400 hover:text-white transition-colors" title="Sair">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">

          {/* ===== REGISTRO DE PONTO ===== */}
          {tab === 'ponto' && (
            <div className="space-y-6 animate-fade-in">
              {/* Saudação */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-4">
                  <img src={employee.avatar} alt={employee.name} className="w-16 h-16 rounded-2xl border-2 border-[#1a7a4a]" />
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {getGreeting()}, {employee.name.split(' ')[0]}!
                    </h1>
                    <p className="text-slate-400 text-sm">{employee.role} · {employee.department}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {employee.weeklyHours}h semanais · Salário R$ {employee.salary.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* CLT Alerts */}
              {myAlerts.length > 0 && (
                <div className="space-y-2">
                  {myAlerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border ${
                        alert.level === 'danger'
                          ? 'bg-red-500/10 border-red-500/30'
                          : 'bg-yellow-500/10 border-yellow-500/30'
                      }`}
                    >
                      <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${alert.level === 'danger' ? 'text-red-400' : 'text-yellow-400'}`} />
                      <p className={`text-sm ${alert.level === 'danger' ? 'text-red-300' : 'text-yellow-300'}`}>{alert.message}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {/* Relógio */}
                <div className="glass-card p-6 text-center">
                  <div className="text-5xl font-mono font-bold text-[#4ade80] mb-2 tracking-wider">
                    {clockTime}
                  </div>
                  <div className="text-sm text-slate-400 capitalize">
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                  </div>
                </div>

                {/* GPS */}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-[#4ade80]" />
                    <span className="font-medium text-white">Localização</span>
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${isWithinGPS ? 'badge-success' : 'badge-danger'}`}>
                      {isWithinGPS ? 'Dentro da área' : 'Fora da área'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mb-4">{locationName}</p>
                  <button
                    onClick={getLocation}
                    disabled={gpsLoading}
                    className="btn-secondary w-full text-sm py-2"
                  >
                    {gpsLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Detectando...
                      </span>
                    ) : (
                      'Atualizar localização'
                    )}
                  </button>
                </div>
              </div>

              {/* Botões de ponto */}
              <div className="glass-card p-6">
                <h2 className="font-semibold text-white mb-4">Registrar Ponto</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(
                    [
                      { type: 'entrada' as const, label: 'Entrada', time: todayRecord?.entrada },
                      { type: 'inicioAlmoco' as const, label: 'Início Almoço', time: todayRecord?.inicioAlmoco },
                      { type: 'retornoAlmoco' as const, label: 'Retorno Almoço', time: todayRecord?.retornoAlmoco },
                      { type: 'saida' as const, label: 'Saída', time: todayRecord?.saida },
                    ]
                  ).map(({ type, label, time }) => {
                    const done = isDone(type)
                    const active = canPunch(type)
                    return (
                      <button
                        key={type}
                        onClick={() => handlePunch(type)}
                        disabled={!active && !done}
                        className={`p-4 rounded-xl border text-center transition-all duration-300 ${
                          done
                            ? 'bg-[#1a7a4a]/30 border-[#1a7a4a]/50 cursor-default'
                            : active
                            ? 'bg-[#1a7a4a] border-[#1a7a4a] hover:bg-[#15633c] cursor-pointer hover:scale-105 shadow-lg shadow-[#1a7a4a]/30'
                            : 'bg-white/5 border-white/10 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        {done && <CheckCircle className="w-5 h-5 text-[#4ade80] mx-auto mb-1" />}
                        <div className="text-sm font-medium text-white">{label}</div>
                        {time && <div className="text-xs text-[#4ade80] font-mono mt-1">{formatTime(time)}</div>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Resumo do dia */}
              {todayRecord && (
                <div className="glass-card p-6">
                  <h2 className="font-semibold text-white mb-4">Resumo de Hoje</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Entrada', value: formatTime(todayRecord.entrada), icon: '🟢' },
                      { label: 'Saída Almoço', value: formatTime(todayRecord.inicioAlmoco), icon: '🟡' },
                      { label: 'Retorno Almoço', value: formatTime(todayRecord.retornoAlmoco), icon: '🟠' },
                      { label: 'Saída', value: formatTime(todayRecord.saida), icon: '🔴' },
                    ].map((item) => (
                      <div key={item.label} className="text-center">
                        <div className="text-lg">{item.icon}</div>
                        <div className="text-lg font-mono font-bold text-white">{item.value}</div>
                        <div className="text-xs text-slate-400">{item.label}</div>
                      </div>
                    ))}
                  </div>

                  {todayRecord.entrada && (
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-sm text-slate-400">Horas trabalhadas hoje:</span>
                      <span className="font-mono font-bold text-[#4ade80]">
                        {minutesToTime(calculateWorkedMinutes(
                          todayRecord.entrada, todayRecord.inicioAlmoco,
                          todayRecord.retornoAlmoco, todayRecord.saida
                        ))}
                      </span>
                    </div>
                  )}
                  {todayRecord.extraHours > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Horas extras:</span>
                      <span className="font-mono font-bold text-yellow-400">
                        +{todayRecord.extraHours.toFixed(1)}h
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ===== ESPELHO DE HORAS ===== */}
          {tab === 'espelho' && (
            <div className="space-y-6 animate-fade-in">
              {/* Seletor */}
              <div className="glass-card p-4 flex items-center gap-4">
                <button
                  onClick={() => {
                    if (mirrorMonth === 1) { setMirrorMonth(12); setMirrorYear((y) => y - 1) }
                    else setMirrorMonth((m) => m - 1)
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="flex-1 text-center font-semibold text-white">
                  {getMonthName(mirrorMonth)} {mirrorYear}
                </span>
                <button
                  onClick={() => {
                    if (mirrorMonth === 12) { setMirrorMonth(1); setMirrorYear((y) => y + 1) }
                    else setMirrorMonth((m) => m + 1)
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Resumo */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Dias Trabalhados', value: mirrorRecords.filter((r) => r.status !== 'falta').length, color: 'text-[#4ade80]' },
                  { label: 'Horas Extras', value: `${totalExtraHours.toFixed(1)}h`, color: 'text-yellow-400' },
                  { label: 'Atrasos', value: totalDelays, color: 'text-orange-400' },
                  { label: 'Faltas', value: totalAbsences, color: 'text-red-400' },
                ].map((kpi) => (
                  <div key={kpi.label} className="glass-card p-4 text-center">
                    <div className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</div>
                    <div className="text-xs text-slate-400 mt-1">{kpi.label}</div>
                  </div>
                ))}
              </div>

              {/* Progress horas extras */}
              {totalExtraHours > 0 && (
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <TrendingUp className="w-4 h-4 text-yellow-400" />
                      Horas extras acumuladas
                    </div>
                    <span className="text-sm font-mono text-yellow-400">
                      {totalExtraHours.toFixed(1)}h / {maxExtraHoursMonth}h
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${extraProgress >= 80 ? 'bg-red-500' : 'bg-yellow-400'}`}
                      style={{ width: `${extraProgress}%` }}
                    />
                  </div>
                  {extraProgress >= 80 && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-red-400">
                      <AlertTriangle className="w-3 h-3" />
                      Próximo do limite mensal de horas extras
                    </div>
                  )}
                </div>
              )}

              {/* Tabela */}
              <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <h2 className="font-semibold text-white">Registros do período</h2>
                </div>
                {mirrorRecords.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    Nenhum registro encontrado para {getMonthName(mirrorMonth)} {mirrorYear}.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10 text-xs text-slate-400 uppercase">
                          <th className="px-4 py-3 text-left">Data</th>
                          <th className="px-4 py-3 text-center">Entrada</th>
                          <th className="px-4 py-3 text-center">Almoço</th>
                          <th className="px-4 py-3 text-center">Retorno</th>
                          <th className="px-4 py-3 text-center">Saída</th>
                          <th className="px-4 py-3 text-center">Total</th>
                          <th className="px-4 py-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mirrorRecords.map((r) => (
                          <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 text-sm text-white">{formatDate(r.date)}</td>
                            <td className="px-4 py-3 text-center font-mono text-sm text-slate-300">{formatTime(r.entrada)}</td>
                            <td className="px-4 py-3 text-center font-mono text-sm text-slate-300">{formatTime(r.inicioAlmoco)}</td>
                            <td className="px-4 py-3 text-center font-mono text-sm text-slate-300">{formatTime(r.retornoAlmoco)}</td>
                            <td className="px-4 py-3 text-center font-mono text-sm text-slate-300">{formatTime(r.saida)}</td>
                            <td className="px-4 py-3 text-center font-mono text-sm text-[#4ade80]">
                              {minutesToTime(calculateWorkedMinutes(r.entrada, r.inicioAlmoco, r.retornoAlmoco, r.saida))}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={STATUS_BADGE[r.status]}>{STATUS_LABELS[r.status]}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== ANIVERSARIANTES ===== */}
          {tab === 'aniversariantes' && (
            <div className="space-y-6 animate-fade-in">
              {/* Seletor de mês */}
              <div className="glass-card p-4 flex items-center gap-4">
                <button
                  onClick={() => setBdMonth((m) => (m === 1 ? 12 : m - 1))}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 text-center">
                  <div className="font-semibold text-white">{getMonthName(bdMonth)}</div>
                  <div className="text-xs text-slate-400">{birthdays.length} aniversariante{birthdays.length !== 1 ? 's' : ''}</div>
                </div>
                <button
                  onClick={() => setBdMonth((m) => (m === 12 ? 1 : m + 1))}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {todayBirthdays.length > 0 && (
                <div className="bg-[#1a7a4a]/20 border border-[#1a7a4a]/40 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-[#4ade80] font-semibold mb-1">
                    🎂 Aniversariante hoje!
                  </div>
                  {todayBirthdays.map((e) => (
                    <p key={e.id} className="text-white text-sm">{e.name} — Parabéns!</p>
                  ))}
                </div>
              )}

              {birthdays.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <Gift className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhum aniversariante em {getMonthName(bdMonth)}.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {birthdays.map((emp) => {
                    const isToday = getBirthdayDay(emp.birthDate) === today.getDate() && bdMonth === today.getMonth() + 1
                    return (
                      <div
                        key={emp.id}
                        className={`glass-card p-5 ${isToday ? 'border-[#1a7a4a]/50 bg-[#1a7a4a]/10' : ''}`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="relative">
                            <img src={emp.avatar} alt={emp.name} className="w-12 h-12 rounded-full" />
                            {isToday && (
                              <div className="absolute -top-1 -right-1 text-base">🎂</div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{emp.name}</div>
                            <div className="text-xs text-slate-400">{emp.role}</div>
                            <div className="text-xs text-slate-500">{emp.department}</div>
                          </div>
                        </div>
                        <div className="text-sm text-[#4ade80] font-medium">
                          🎉 Dia {getBirthdayDay(emp.birthDate)} de {getMonthName(bdMonth)}
                        </div>
                        {isToday && (
                          <button
                            onClick={() => addToast(`Mensagem de parabéns enviada para ${emp.name}! 🎂`, 'success')}
                            className="mt-3 w-full text-xs btn-primary py-2"
                          >
                            Enviar parabéns
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===== CONVÊNIOS ===== */}
          {tab === 'convenios' && (
            <div className="space-y-6 animate-fade-in">
              <div className="glass-card p-4">
                <h1 className="text-xl font-bold text-white mb-4">Vantagens Exclusivas</h1>
                {/* Busca */}
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
                {/* Filtro categorias */}
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setConvCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                        convCategory === cat
                          ? 'bg-[#1a7a4a] text-white'
                          : 'bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {filteredConvenios.length === 0 ? (
                <div className="glass-card p-12 text-center text-slate-400">
                  Nenhum convênio encontrado.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredConvenios.map((conv) => (
                    <div key={conv.id} className="glass-card p-5 flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white">{conv.name}</h3>
                          <span className="badge-info text-xs mt-1 inline-block">{conv.category}</span>
                        </div>
                        <span className="badge-success text-sm font-bold">{conv.discount}</span>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed flex-1 mb-4">{conv.description}</p>

                      <div className="space-y-1 mb-4">
                        {conv.address && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <MapPin className="w-3 h-3" />
                            {conv.address}
                          </div>
                        )}
                        {conv.phone && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Phone className="w-3 h-3" />
                            {conv.phone}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {conv.code && (
                          <button
                            onClick={() => handleCopyCode(conv)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                              copiedId === conv.id
                                ? 'bg-[#1a7a4a] text-white'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                          >
                            <Copy className="w-3 h-3" />
                            {copiedId === conv.id ? 'Copiado!' : conv.code}
                          </button>
                        )}
                        {conv.website && (
                          <a
                            href={conv.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-slate-400 hover:text-white transition-colors"
                            title="Abrir site"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
