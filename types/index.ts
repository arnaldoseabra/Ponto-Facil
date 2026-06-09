export interface Employee {
  id: string;
  name: string;
  cpf: string;
  rg: string;
  birthDate: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  salary: number;
  weeklyHours: number;
  admissionDate: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  gpsLocation: {
    lat: number;
    lng: number;
    radius: number;
  };
  status: boolean;
  avatar: string;
  profile: 'employee' | 'admin';
}

export interface TimeRecord {
  id: string;
  employeeId: string;
  date: string;
  entrada?: string;
  inicioAlmoco?: string;
  retornoAlmoco?: string;
  saida?: string;
  gpsCoords?: { lat: number; lng: number };
  locationName?: string;
  status: 'normal' | 'extra' | 'atraso' | 'falta';
  extraHours: number;
  delayMinutes: number;
}

export interface NotificationLog {
  id: string;
  employeeName: string;
  phone: string;
  message: string;
  type: 'entrada' | 'almoco' | 'retorno' | 'saida' | 'alerta';
  timestamp: string;
  status: 'enviado' | 'lido' | 'falha';
}

export interface CLTAlert {
  id: string;
  employeeId: string;
  employeeName: string;
  level: 'warning' | 'danger';
  message: string;
  timestamp: string;
}

export interface Convenio {
  id: string;
  name: string;
  category: string;
  discount: string;
  description: string;
  phone?: string;
  website?: string;
  address?: string;
  code?: string;
}

export interface NotificationConfig {
  entrada: { enabled: boolean; time: string };
  almoco: { enabled: boolean; time: string };
  retorno: { enabled: boolean; time: string };
  saida: { enabled: boolean; time: string };
}

export type Plan = 'free' | 'basic' | 'premium' | 'enterprise';

export interface Company {
  id: string;
  name: string;
  cnpj?: string;
  email: string;
  phone?: string;
  plan: Plan;
  status: 'active' | 'inactive' | 'suspended';
}

export interface PlanInfo {
  name: string;
  maxEmployees: number | null;
  price: number;
  employeeCount: number;
  canAdd: boolean;
}

export type AppView = 'landing' | 'login' | 'register' | 'employee' | 'admin';
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
