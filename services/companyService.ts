import { api } from './api'
import { mapEmployee } from './mappers'
import type { Company, Employee, Plan, PlanInfo } from '../types'

interface RegisterPayload {
  company_name: string
  cnpj?: string
  company_email: string
  phone?: string
  plan: Plan
  admin_name: string
  admin_email: string
  password: string
}

interface RegisterResponse {
  company: Company
  employee: unknown
  token: string
}

export const companyService = {
  async register(data: RegisterPayload): Promise<{ company: Company; employee: Employee; token: string }> {
    const res = await api.post<RegisterResponse>('/companies/register', data)
    api.setToken(res.token)
    return { company: res.company, employee: mapEmployee(res.employee), token: res.token }
  },

  async getInfo(): Promise<{ company: Company; planInfo: PlanInfo }> {
    const res = await api.get<{
      company: Company
      plan_info: { name: string; max_employees: number | null; price: number }
      employee_count: number
      can_add: boolean
    }>('/company')

    return {
      company: res.company,
      planInfo: {
        name: res.plan_info.name,
        maxEmployees: res.plan_info.max_employees,
        price: res.plan_info.price,
        employeeCount: res.employee_count,
        canAdd: res.can_add,
      },
    }
  },

  async changePlan(plan: Plan): Promise<Company> {
    const res = await api.patch<{ company: Company }>('/company/plan', { plan })
    return res.company
  },
}
