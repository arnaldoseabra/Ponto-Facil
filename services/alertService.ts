import { api } from './api'
import { mapCLTAlert } from './mappers'
import type { CLTAlert } from '../types'

export const alertService = {
  async getAll(): Promise<CLTAlert[]> {
    const data = await api.get<unknown[]>('/clt-alerts')
    return data.map(mapCLTAlert)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/clt-alerts/${id}`)
  },
}
