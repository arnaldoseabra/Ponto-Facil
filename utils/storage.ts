import type { Employee, TimeRecord, NotificationLog, CLTAlert, Convenio, NotificationConfig } from '../types'
import {
  DEFAULT_EMPLOYEES,
  DEFAULT_RECORDS,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_ALERTS,
  DEFAULT_CONVENIOS,
  DEFAULT_NOTIFICATION_CONFIG,
} from './initialData'

const KEYS = {
  EMPLOYEES: 'pf_employees',
  RECORDS: 'pf_records',
  NOTIFICATIONS: 'pf_notifications',
  ALERTS: 'pf_alerts',
  CONVENIOS: 'pf_convenios',
  NOTIF_CONFIG: 'pf_notif_config',
} as const

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data))
}

export const storage = {
  getEmployees: () => load<Employee[]>(KEYS.EMPLOYEES, DEFAULT_EMPLOYEES),
  saveEmployees: (data: Employee[]) => save(KEYS.EMPLOYEES, data),

  getRecords: () => load<TimeRecord[]>(KEYS.RECORDS, DEFAULT_RECORDS),
  saveRecords: (data: TimeRecord[]) => save(KEYS.RECORDS, data),

  getNotifications: () => load<NotificationLog[]>(KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS),
  saveNotifications: (data: NotificationLog[]) => save(KEYS.NOTIFICATIONS, data),

  getAlerts: () => load<CLTAlert[]>(KEYS.ALERTS, DEFAULT_ALERTS),
  saveAlerts: (data: CLTAlert[]) => save(KEYS.ALERTS, data),

  getConvenios: () => load<Convenio[]>(KEYS.CONVENIOS, DEFAULT_CONVENIOS),
  saveConvenios: (data: Convenio[]) => save(KEYS.CONVENIOS, data),

  getNotifConfig: () => load<NotificationConfig>(KEYS.NOTIF_CONFIG, DEFAULT_NOTIFICATION_CONFIG),
  saveNotifConfig: (data: NotificationConfig) => save(KEYS.NOTIF_CONFIG, data),

  reset: () => Object.values(KEYS).forEach((k) => localStorage.removeItem(k)),
}
