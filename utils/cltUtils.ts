import type { TimeRecord, CLTAlert } from '../types'
import { calculateWorkedMinutes, timeToMinutes } from './dateUtils'

export function checkCLTViolations(
  record: TimeRecord,
  employeeId: string,
  employeeName: string,
  weeklyRecords: TimeRecord[]
): CLTAlert[] {
  const alerts: CLTAlert[] = []
  const now = new Date().toISOString()

  const workedMin = calculateWorkedMinutes(
    record.entrada,
    record.inicioAlmoco,
    record.retornoAlmoco,
    record.saida
  )
  const extraMin = Math.max(0, workedMin - 480)
  const extraHours = extraMin / 60

  if (extraHours > 2) {
    alerts.push({
      id: `${employeeId}-daily-${record.date}`,
      employeeId,
      employeeName,
      level: 'danger',
      message: `${employeeName} trabalhou ${extraHours.toFixed(1)}h extras em ${record.date} (máximo CLT: 2h/dia)`,
      timestamp: now,
    })
  } else if (extraHours > 1.5) {
    alerts.push({
      id: `${employeeId}-daily-warn-${record.date}`,
      employeeId,
      employeeName,
      level: 'warning',
      message: `${employeeName} está próximo do limite diário de horas extras (${extraHours.toFixed(1)}h de 2h permitidas)`,
      timestamp: now,
    })
  }

  if (record.inicioAlmoco && record.retornoAlmoco && workedMin > 360) {
    const lunchMin =
      timeToMinutes(record.retornoAlmoco) - timeToMinutes(record.inicioAlmoco)
    if (lunchMin < 60) {
      alerts.push({
        id: `${employeeId}-lunch-${record.date}`,
        employeeId,
        employeeName,
        level: 'danger',
        message: `${employeeName} teve intervalo de almoço inferior a 1h (${lunchMin}min) em ${record.date}`,
        timestamp: now,
      })
    }
  }

  const weeklyMinutes = weeklyRecords.reduce(
    (sum, r) =>
      sum +
      calculateWorkedMinutes(r.entrada, r.inicioAlmoco, r.retornoAlmoco, r.saida),
    0
  )
  if (weeklyMinutes / 60 > 44) {
    alerts.push({
      id: `${employeeId}-weekly-${record.date}`,
      employeeId,
      employeeName,
      level: 'danger',
      message: `${employeeName} ultrapassou 44h semanais (${(weeklyMinutes / 60).toFixed(1)}h registradas)`,
      timestamp: now,
    })
  }

  return alerts
}
