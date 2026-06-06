import { api } from './api'
import { mapNotification } from './mappers'
import type { NotificationLog } from '../types'

export const notificationService = {
  async getAll(): Promise<NotificationLog[]> {
    const data = await api.get<unknown[]>('/notifications')
    return data.map(mapNotification)
  },

  async send(employeeIds: string[], message: string, type = 'alerta'): Promise<NotificationLog[]> {
    const data = await api.post<unknown[]>('/notifications/send', {
      employee_ids: employeeIds,
      message,
      type,
    })
    return data.map(mapNotification)
  },
}
