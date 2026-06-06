import { api } from './api'
import { mapEmployee, employeeToApi } from './mappers'
import type { Employee } from '../types'

export const employeeService = {
  async getAll(): Promise<Employee[]> {
    const data = await api.get<unknown[]>('/employees')
    return data.map(mapEmployee)
  },

  async create(emp: Omit<Employee, 'id'>): Promise<Employee> {
    const data = await api.post<unknown>('/employees', employeeToApi(emp))
    return mapEmployee(data)
  },

  async update(id: string, emp: Partial<Employee>): Promise<Employee> {
    const data = await api.put<unknown>(`/employees/${id}`, employeeToApi(emp))
    return mapEmployee(data)
  },

  async toggleStatus(id: string): Promise<Employee> {
    const data = await api.patch<unknown>(`/employees/${id}/toggle-status`)
    return mapEmployee(data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/employees/${id}`)
  },
}
