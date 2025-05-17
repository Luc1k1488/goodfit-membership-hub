
// Helper functions for validation and formatting

// Helper function to check if input is an email or phone number
export const isEmail = (input: string): boolean => {
  return input && typeof input === 'string' && input.includes('@');
};

// Функция для форматирования телефонного номера в формат E.164
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Удаляем все нецифровые символы
  const digits = phone.replace(/\D/g, '');
  
  // Проверяем начало номера и форматируем для России
  if (digits.startsWith('7') || digits.startsWith('8')) {
    return `+7${digits.substring(1)}`;
  } else if (!digits.startsWith('+')) {
    return `+7${digits}`;
  }
  
  return phone;
};
