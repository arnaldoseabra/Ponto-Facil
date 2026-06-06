export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export function formatTime(timeStr?: string): string {
  return timeStr ? timeStr.substring(0, 5) : '--:--'
}

export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0]
}

export function getCurrentTime(): string {
  return new Date().toTimeString().split(' ')[0]
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(minutes: number): string {
  const abs = Math.abs(minutes)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  const sign = minutes < 0 ? '-' : ''
  return `${sign}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export function calculateWorkedMinutes(
  entrada?: string,
  inicioAlmoco?: string,
  retornoAlmoco?: string,
  saida?: string
): number {
  if (!entrada || !saida) return 0
  const total = timeToMinutes(saida) - timeToMinutes(entrada)
  const lunch =
    inicioAlmoco && retornoAlmoco
      ? timeToMinutes(retornoAlmoco) - timeToMinutes(inicioAlmoco)
      : 0
  return Math.max(0, total - lunch)
}

export function getMonthName(month: number): string {
  const names = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  return names[month - 1]
}

export function getWeekDates(date: string): { start: string; end: string } {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const start = new Date(d.setDate(diff))
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function isBirthday(birthDate: string, month: number): boolean {
  const bMonth = parseInt(birthDate.split('-')[1], 10)
  return bMonth === month
}

export function getBirthdayDay(birthDate: string): number {
  return parseInt(birthDate.split('-')[2], 10)
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}
