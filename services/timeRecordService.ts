import { api } from './api'
import { mapTimeRecord, timeRecordToApi } from './mappers'
import type { TimeRecord } from '../types'

export const timeRecordService = {
  async getAll(filters?: {
    employeeId?: string
    dateStart?: string
    dateEnd?: string
    status?: string
  }): Promise<TimeRecord[]> {
    const params = new URLSearchParams()
    if (filters?.employeeId) params.set('employee_id', filters.employeeId)
    if (filters?.dateStart) params.set('date_start', filters.dateStart)
    if (filters?.dateEnd) params.set('date_end', filters.dateEnd)
    if (filters?.status) params.set('status', filters.status)
    const query = params.toString() ? `?${params}` : ''
    const data = await api.get<unknown[]>(`/time-records${query}`)
    return data.map(mapTimeRecord)
  },

  async create(record: Omit<TimeRecord, 'id'>): Promise<TimeRecord> {
    const data = await api.post<unknown>('/time-records', timeRecordToApi(record))
    return mapTimeRecord(data)
  },

  async update(id: string, record: Partial<TimeRecord>): Promise<TimeRecord> {
    const data = await api.put<unknown>(`/time-records/${id}`, timeRecordToApi(record))
    return mapTimeRecord(data)
  },

  async punch(type: 'entrada' | 'inicio_almoco' | 'retorno_almoco' | 'saida', coords?: {
    lat: number; lng: number; locationName: string
  }): Promise<TimeRecord> {
    const data = await api.post<unknown>('/time-records/punch', {
      type,
      gps_lat: coords?.lat,
      gps_lng: coords?.lng,
      location_name: coords?.locationName,
    })
    return mapTimeRecord(data)
  },
}
