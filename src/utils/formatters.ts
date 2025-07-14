// Formatadores de dados

export const formatters = {
  // Formatar CPF
  cpf: (value: string): string => {
    const digits = value.replace(/\D/g, '')
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  },

  // Formatar telefone
  phone: (value: string): string => {
    const digits = value.replace(/\D/g, '')
    if (digits.length === 11) {
      return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (digits.length === 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return value
  },

  // Formatar moeda brasileira
  currency: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  },

  // Formatar data
  date: (value: string | Date): string => {
    const date = typeof value === 'string' ? new Date(value) : value
    return new Intl.DateTimeFormat('pt-BR').format(date)
  },

  // Formatar data e hora
  datetime: (value: string | Date): string => {
    const date = typeof value === 'string' ? new Date(value) : value
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  },
}

export const parsers = {
  // Remove formatação de CPF
  cpfToNumbers: (cpf: string): string => {
    return cpf.replace(/\D/g, '')
  },

  // Remove formatação de telefone
  phoneToNumbers: (phone: string): string => {
    return phone.replace(/\D/g, '')
  },

  // Converte string de moeda para número
  currencyToNumber: (currency: string): number => {
    return parseFloat(currency.replace(/[^\d,-]/g, '').replace(',', '.'))
  },
}
