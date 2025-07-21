/**
 * Converte Date para string no formato ISO sem timezone (yyyy-MM-ddTHH:mm:ss)
 * Este formato é compatível com LocalDateTime do Java
 */
export function toLocalISOString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

/**
 * Converte string ISO para Date
 */
export function fromLocalISOString(dateString: string): Date {
  // Remove timezone se presente
  const cleanDateString = dateString.replace(/Z$/, '').replace(/[+-]\d{2}:\d{2}$/, '')
  return new Date(cleanDateString)
}