import { api } from './api'
import { mapConvenio } from './mappers'
import type { Convenio } from '../types'

export const convenioService = {
  async getAll(): Promise<Convenio[]> {
    const data = await api.get<unknown[]>('/convenios')
    return data.map(mapConvenio)
  },

  async create(conv: Omit<Convenio, 'id'>): Promise<Convenio> {
    const data = await api.post<unknown>('/convenios', conv)
    return mapConvenio(data)
  },

  async update(id: string, conv: Partial<Convenio>): Promise<Convenio> {
    const data = await api.put<unknown>(`/convenios/${id}`, conv)
    return mapConvenio(data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/convenios/${id}`)
  },
}
