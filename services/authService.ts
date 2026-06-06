import { api } from './api'
import { mapEmployee } from './mappers'
import type { Employee } from '../types'

interface LoginResponse {
  employee: unknown
  token: string
}

export const authService = {
  async login(email: string, password: string): Promise<{ employee: Employee; token: string }> {
    const data = await api.post<LoginResponse>('/login', { email, password })
    api.setToken(data.token)
    return { employee: mapEmployee(data.employee), token: data.token }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/logout')
    } finally {
      api.clearToken()
    }
  },

  async me(): Promise<Employee> {
    const data = await api.get<unknown>('/me')
    return mapEmployee(data)
  },
}
