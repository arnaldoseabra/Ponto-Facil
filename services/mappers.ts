import type { Employee, TimeRecord, NotificationLog, CLTAlert, Convenio } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapEmployee(raw: any): Employee {
  return {
    id: String(raw.id),
    name: raw.name,
    cpf: raw.cpf ?? '',
    rg: raw.rg ?? '',
    birthDate: raw.birth_date ?? '',
    email: raw.email,
    phone: raw.phone ?? '',
    role: raw.role,
    department: raw.department,
    salary: Number(raw.salary),
    weeklyHours: raw.weekly_hours,
    admissionDate: raw.admission_date ?? '',
    emergencyContact: {
      name: raw.emergency_contact?.name ?? '',
      phone: raw.emergency_contact?.phone ?? '',
    },
    gpsLocation: {
      lat: Number(raw.gps_location?.lat ?? -23.5505),
      lng: Number(raw.gps_location?.lng ?? -46.6333),
      radius: Number(raw.gps_location?.radius ?? 500),
    },
    status: Boolean(raw.status),
    avatar: raw.avatar ?? `https://i.pravatar.cc/150?u=${raw.email}`,
    profile: raw.profile,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapTimeRecord(raw: any): TimeRecord {
  return {
    id: String(raw.id),
    employeeId: String(raw.employee_id),
    date: raw.date,
    entrada: raw.entrada ?? undefined,
    inicioAlmoco: raw.inicio_almoco ?? undefined,
    retornoAlmoco: raw.retorno_almoco ?? undefined,
    saida: raw.saida ?? undefined,
    gpsCoords: raw.gps_coords ?? undefined,
    locationName: raw.location_name ?? undefined,
    status: raw.status,
    extraHours: Number(raw.extra_hours),
    delayMinutes: Number(raw.delay_minutes),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapNotification(raw: any): NotificationLog {
  return {
    id: String(raw.id),
    employeeName: raw.employee_name,
    phone: raw.phone,
    message: raw.message,
    type: raw.type,
    timestamp: raw.created_at,
    status: raw.status,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCLTAlert(raw: any): CLTAlert {
  return {
    id: String(raw.id),
    employeeId: String(raw.employee_id),
    employeeName: raw.employee_name,
    level: raw.level,
    message: raw.message,
    timestamp: raw.created_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapConvenio(raw: any): Convenio {
  return {
    id: String(raw.id),
    name: raw.name,
    category: raw.category,
    discount: raw.discount,
    description: raw.description,
    phone: raw.phone ?? undefined,
    website: raw.website ?? undefined,
    address: raw.address ?? undefined,
    code: raw.code ?? undefined,
  }
}

export function employeeToApi(emp: Partial<Employee>): Record<string, unknown> {
  return {
    name: emp.name,
    cpf: emp.cpf,
    rg: emp.rg,
    birth_date: emp.birthDate,
    email: emp.email,
    phone: emp.phone,
    role: emp.role,
    department: emp.department,
    salary: emp.salary,
    weekly_hours: emp.weeklyHours,
    admission_date: emp.admissionDate,
    emergency_contact_name: emp.emergencyContact?.name,
    emergency_contact_phone: emp.emergencyContact?.phone,
    gps_lat: emp.gpsLocation?.lat,
    gps_lng: emp.gpsLocation?.lng,
    gps_radius: emp.gpsLocation?.radius,
    status: emp.status,
    avatar: emp.avatar,
    profile: emp.profile,
  }
}

export function timeRecordToApi(r: Partial<TimeRecord>): Record<string, unknown> {
  return {
    employee_id: r.employeeId,
    date: r.date,
    entrada: r.entrada,
    inicio_almoco: r.inicioAlmoco,
    retorno_almoco: r.retornoAlmoco,
    saida: r.saida,
    gps_lat: r.gpsCoords?.lat,
    gps_lng: r.gpsCoords?.lng,
    location_name: r.locationName,
    status: r.status,
    extra_hours: r.extraHours,
    delay_minutes: r.delayMinutes,
  }
}
