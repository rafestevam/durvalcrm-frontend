// Validadores para formulários

export const validators = {
  required: (value: any): boolean => {
    if (Array.isArray(value)) return value.length > 0
    return value !== null && value !== undefined && value !== ''
  },

  email: (value: string): boolean => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value)
  },

  cpf: (value: string): boolean => {
    const pattern = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
    return pattern.test(value)
  },

  phone: (value: string): boolean => {
    const pattern = /^\(\d{2}\) \d{4,5}-\d{4}$/
    return pattern.test(value)
  },

  minLength: (min: number) => (value: string): boolean => {
    return value.length >= min
  },

  maxLength: (max: number) => (value: string): boolean => {
    return value.length <= max
  },
}

export const validationMessages = {
  required: 'Este campo é obrigatório',
  email: 'Digite um e-mail válido',
  cpf: 'Digite um CPF válido (000.000.000-00)',
  phone: 'Digite um telefone válido ((00) 00000-0000)',
  minLength: (min: number) => `Mínimo de ${min} caracteres`,
  maxLength: (max: number) => `Máximo de ${max} caracteres`,
}
